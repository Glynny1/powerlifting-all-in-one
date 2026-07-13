import { useCallback, useEffect, useRef, useState } from 'react';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'finished';

interface UseTimerOptions {
  durationSeconds: number;
  onFinish?: () => void;
}

interface UseTimerResult {
  status: TimerStatus;
  /** Whole seconds remaining (rounded up). */
  remaining: number;
  durationSeconds: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

/**
 * Countdown timer driven by wall-clock timestamps rather than an accumulating
 * interval counter. This keeps time accurate across background tabs, throttled
 * intervals, and device sleep. The interval only exists to refresh the display.
 */
export function useTimer({ durationSeconds, onFinish }: UseTimerOptions): UseTimerResult {
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [remaining, setRemaining] = useState(durationSeconds);

  // Absolute timestamp (ms) at which the countdown reaches zero, while running.
  const endTimeRef = useRef<number | null>(null);
  // Remaining ms captured while paused/idle.
  const remainingMsRef = useRef<number>(durationSeconds * 1000);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const clearTick = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Reset remaining when the configured duration changes and timer is idle.
  useEffect(() => {
    if (status === 'idle') {
      remainingMsRef.current = durationSeconds * 1000;
      setRemaining(durationSeconds);
    }
  }, [durationSeconds, status]);

  const finish = useCallback(() => {
    clearTick();
    endTimeRef.current = null;
    remainingMsRef.current = 0;
    setRemaining(0);
    setStatus('finished');
    onFinishRef.current?.();
  }, [clearTick]);

  const evaluate = useCallback(() => {
    if (endTimeRef.current === null) return;
    const msLeft = endTimeRef.current - Date.now();
    if (msLeft <= 0) {
      finish();
    } else {
      setRemaining(Math.ceil(msLeft / 1000));
    }
  }, [finish]);

  const startTicking = useCallback(() => {
    clearTick();
    // Refresh a few times per second so the display stays smooth without drift.
    intervalRef.current = setInterval(evaluate, 250);
  }, [clearTick, evaluate]);

  const start = useCallback(() => {
    remainingMsRef.current = durationSeconds * 1000;
    endTimeRef.current = Date.now() + remainingMsRef.current;
    setRemaining(durationSeconds);
    setStatus('running');
    startTicking();
  }, [durationSeconds, startTicking]);

  const pause = useCallback(() => {
    if (status !== 'running' || endTimeRef.current === null) return;
    remainingMsRef.current = Math.max(0, endTimeRef.current - Date.now());
    endTimeRef.current = null;
    clearTick();
    setRemaining(Math.ceil(remainingMsRef.current / 1000));
    setStatus('paused');
  }, [status, clearTick]);

  const resume = useCallback(() => {
    if (status !== 'paused') return;
    endTimeRef.current = Date.now() + remainingMsRef.current;
    setStatus('running');
    startTicking();
  }, [status, startTicking]);

  const reset = useCallback(() => {
    clearTick();
    endTimeRef.current = null;
    remainingMsRef.current = durationSeconds * 1000;
    setRemaining(durationSeconds);
    setStatus('idle');
  }, [clearTick, durationSeconds]);

  // Recompute immediately when the tab regains focus/visibility.
  useEffect(() => {
    const handler = () => {
      if (status === 'running') evaluate();
    };
    document.addEventListener('visibilitychange', handler);
    window.addEventListener('focus', handler);
    return () => {
      document.removeEventListener('visibilitychange', handler);
      window.removeEventListener('focus', handler);
    };
  }, [status, evaluate]);

  // Cleanup on unmount.
  useEffect(() => () => clearTick(), [clearTick]);

  return { status, remaining, durationSeconds, start, pause, resume, reset };
}
