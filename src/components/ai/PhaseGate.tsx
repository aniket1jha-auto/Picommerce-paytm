import type { ReactNode } from 'react';
import type { Phase } from '@/types';
import { usePhaseData } from '@/hooks/usePhaseData';

interface PhaseGateProps {
  minPhase: Phase;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PhaseGate({ minPhase, children, fallback = null }: PhaseGateProps) {
  const { isAtLeast } = usePhaseData();

  if (isAtLeast(minPhase)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
