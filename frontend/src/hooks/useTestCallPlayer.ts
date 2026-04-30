import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  TestCallScript,
  TestCallTurn,
  TestCallAgentTurn,
} from '@/types/testCall';
import { totalLatencyMs } from '@/types/testCall';

/**
 * useTestCallPlayer — Phase 2.11
 *
 * State machine + timing engine for a scripted test call. Walks through
 * `script.turns` with realistic delays, dispatching state updates so the UI
 * shows turns appearing one at a time with inline tool/retrieval annotations.
 *
 * Timing model per turn:
 *   user turn:
 *     [show typing dots] → after durationMs → [reveal text]
 *
 *   agent turn:
 *     [show "thinking" indicator + animate phase timeline] → after totalLatencyMs
 *     → [reveal text + tool/retrieval annotations] → animate "speaking" for speakingMs
 *     → [settle]
 *
 * The hook returns:
 *   - status:        'idle' | 'running' | 'ended'
 *   - revealedTurns: turns that have been added to the visible transcript
 *   - phase:         'idle' | 'user-typing' | 'agent-thinking' | 'agent-speaking'
 *   - currentAgentTurn: the agent turn currently being processed (for the
 *                       latency timeline + active tool/KB chips on the right pane)
 *   - elapsedMs:     wall time since Start
 *   - start, stop:   actions
 *
 * Cancellation: stop() clears all pending timeouts. Unmount also clears them.
 * Timing is best-effort — when the tab is backgrounded, JS timers can drift;
 * we don't try to compensate (this is a demo control, not real telephony).
 */

export type TestCallStatus = 'idle' | 'running' | 'ended';
export type TestCallPhase =
  | 'idle'
  | 'user-typing'
  | 'agent-thinking'
  | 'agent-speaking'
  | 'settled';

export interface RevealedTurn {
  index: number;                            // index in script.turns
  turn: TestCallTurn;
  /** What's visible on the timeline strip — accumulates from both turn kinds. */
  startedAt: number;                        // ms since playback start
}

export interface TestCallPlayerState {
  status: TestCallStatus;
  phase: TestCallPhase;
  revealedTurns: RevealedTurn[];
  currentAgentTurn: TestCallAgentTurn | null;
  elapsedMs: number;
}

export interface TestCallPlayerActions {
  start: () => void;
  stop: () => void;
}

export function useTestCallPlayer(
  script: TestCallScript,
): TestCallPlayerState & TestCallPlayerActions {
  const [status, setStatus] = useState<TestCallStatus>('idle');
  const [phase, setPhase] = useState<TestCallPhase>('idle');
  const [revealedTurns, setRevealedTurns] = useState<RevealedTurn[]>([]);
  const [currentAgentTurn, setCurrentAgentTurn] =
    useState<TestCallAgentTurn | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);

  // Cancellation handles — referenced by stop() and cleanup.
  const timeoutsRef = useRef<number[]>([]);
  const tickRef = useRef<number | null>(null);
  const startMsRef = useRef<number>(0);
  const aliveRef = useRef(true);

  const clearAllTimers = useCallback(() => {
    timeoutsRef.current.forEach((t) => window.clearTimeout(t));
    timeoutsRef.current = [];
    if (tickRef.current !== null) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      clearAllTimers();
    };
  }, [clearAllTimers]);

  const reset = useCallback(() => {
    setStatus('idle');
    setPhase('idle');
    setRevealedTurns([]);
    setCurrentAgentTurn(null);
    setElapsedMs(0);
  }, []);

  const stop = useCallback(() => {
    clearAllTimers();
    if (!aliveRef.current) return;
    setStatus('ended');
    setPhase('idle');
    setCurrentAgentTurn(null);
  }, [clearAllTimers]);

  const start = useCallback(() => {
    clearAllTimers();
    reset();
    setStatus('running');
    startMsRef.current = performance.now();

    // Tick elapsedMs at 10Hz for smooth call-duration UI.
    tickRef.current = window.setInterval(() => {
      if (!aliveRef.current) return;
      setElapsedMs(performance.now() - startMsRef.current);
    }, 100);

    // Schedule each turn relative to the playback start time. Using cumulative
    // offsets (rather than chained setTimeouts) keeps timing predictable.
    let cursor = 200; // small initial pause so the user sees the "starting…" state

    const schedule = (delayMs: number, fn: () => void) => {
      const id = window.setTimeout(() => {
        if (!aliveRef.current) return;
        fn();
      }, delayMs);
      timeoutsRef.current.push(id);
    };

    script.turns.forEach((turn, index) => {
      if (turn.kind === 'user') {
        schedule(cursor, () => {
          setPhase('user-typing');
          setCurrentAgentTurn(null);
        });
        cursor += turn.durationMs;
        schedule(cursor, () => {
          setRevealedTurns((prev) => [
            ...prev,
            {
              index,
              turn,
              startedAt: performance.now() - startMsRef.current,
            },
          ]);
          setPhase('settled');
        });
      } else {
        // agent turn
        schedule(cursor, () => {
          setPhase('agent-thinking');
          setCurrentAgentTurn(turn);
        });
        cursor += totalLatencyMs(turn.latency);
        schedule(cursor, () => {
          setRevealedTurns((prev) => [
            ...prev,
            {
              index,
              turn,
              startedAt: performance.now() - startMsRef.current,
            },
          ]);
          setPhase('agent-speaking');
        });
        cursor += turn.speakingMs;
        schedule(cursor, () => {
          setPhase('settled');
        });
      }
    });

    // Final settle → ended state.
    schedule(cursor + 400, () => {
      setStatus('ended');
      setPhase('idle');
      setCurrentAgentTurn(null);
      if (tickRef.current !== null) {
        window.clearInterval(tickRef.current);
        tickRef.current = null;
      }
    });
  }, [clearAllTimers, reset, script]);

  return {
    status,
    phase,
    revealedTurns,
    currentAgentTurn,
    elapsedMs,
    start,
    stop,
  };
}
