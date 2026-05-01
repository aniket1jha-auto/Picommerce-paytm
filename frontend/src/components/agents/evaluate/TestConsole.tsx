import { useEffect, useMemo, useRef } from 'react';
import { Play, Square } from 'lucide-react';
import { pickScriptForUseCase } from '@/data/mock/testCallScripts';
import { useTestCallPlayer } from '@/hooks/useTestCallPlayer';
import { Button, Waveform } from '@/components/ui';
import { TranscriptTurn } from './test-console/TranscriptTurn';
import type { TestCallTurn } from '@/types/testCall';

interface Props {
  /** Used to pick a hand-curated script and seed the waveform. */
  useCase: string;
  /** Stable id so the waveform animation is consistent across mounts. */
  seed: string;
}

export function TestConsole({ useCase, seed }: Props) {
  const script = useMemo(() => pickScriptForUseCase(useCase), [useCase]);
  const player = useTestCallPlayer(script);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [player.revealedTurns.length, player.phase]);

  return (
    <div className="rounded-md border border-border-subtle bg-surface overflow-hidden">
      <div className="flex items-start justify-between gap-3 border-b border-border-subtle bg-surface-sunken px-4 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Waveform
            seed={seed}
            mode={player.phase === 'agent-speaking' ? 'live' : 'static'}
            bars={5}
            height={14}
          />
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-text-primary">Test Call</div>
            {player.status !== 'idle' && (
              <div className="text-[11px] text-text-secondary truncate">
                {player.status === 'running' ? 'In progress' : 'Ended'}
              </div>
            )}
          </div>
        </div>
        <TopActions player={player} />
      </div>

      {player.status === 'idle' && <IdleView onStart={player.start} />}
      {player.status !== 'idle' && (
        <Transcript
          revealedTurns={player.revealedTurns.map((r) => r.turn)}
          revealStartedAt={player.revealedTurns.map((r) => r.startedAt)}
          phase={player.phase}
          agentSeed={seed}
          isRunning={player.status === 'running'}
          transcriptRef={transcriptRef}
        />
      )}
    </div>
  );
}

function TopActions({ player }: { player: ReturnType<typeof useTestCallPlayer> }) {
  if (player.status === 'running') {
    return (
      <Button variant="danger" size="sm" iconLeft={<Square size={12} />} onClick={player.stop}>
        End call
      </Button>
    );
  }
  if (player.status === 'ended') {
    return (
      <Button variant="primary" size="sm" iconLeft={<Play size={12} />} onClick={player.start}>
        Run again
      </Button>
    );
  }
  return null;
}

function IdleView({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 px-6">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent"
        aria-hidden
      >
        <Play size={28} />
      </div>
      <div className="text-center max-w-md">
        <h3 className="text-[15px] font-semibold text-text-primary">Talk to the agent</h3>
        <p className="mt-1 text-[13px] text-text-secondary">
          Start a test call to hear how the agent responds turn by turn.
        </p>
      </div>
      <Button variant="primary" iconLeft={<Play size={14} />} onClick={onStart}>
        Start test call
      </Button>
    </div>
  );
}

interface TranscriptProps {
  revealedTurns: TestCallTurn[];
  revealStartedAt: number[];
  phase: ReturnType<typeof useTestCallPlayer>['phase'];
  agentSeed: string;
  isRunning: boolean;
  transcriptRef: React.RefObject<HTMLDivElement | null>;
}

function Transcript({
  revealedTurns,
  revealStartedAt,
  phase,
  agentSeed,
  isRunning,
  transcriptRef,
}: TranscriptProps) {
  return (
    <div
      ref={transcriptRef}
      className="max-h-[520px] overflow-y-auto px-4 py-4 flex flex-col gap-3"
    >
      {revealedTurns.length === 0 && (
        <div className="text-[12px] text-text-tertiary py-6 text-center">Connecting…</div>
      )}
      {revealedTurns.map((turn, i) => (
        <TranscriptTurn
          key={i}
          turn={turn}
          startedAt={revealStartedAt[i] ?? 0}
          agentSeed={agentSeed}
          live={
            isRunning && i === revealedTurns.length - 1 && phase === 'agent-speaking'
          }
        />
      ))}
      {isRunning && phase === 'user-typing' && <ThinkingIndicator label="User speaking" />}
      {isRunning && phase === 'agent-thinking' && <ThinkingIndicator label="Agent thinking" />}
    </div>
  );
}

function ThinkingIndicator({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-2 self-start text-[11px] text-text-tertiary">
      <span className="inline-flex gap-0.5">
        <Dot delay={0} />
        <Dot delay={150} />
        <Dot delay={300} />
      </span>
      {label}
    </div>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="h-1 w-1 rounded-full bg-text-tertiary"
      style={{ animation: `pi-pulse 1.4s ease-in-out ${delay}ms infinite` }}
    />
  );
}
