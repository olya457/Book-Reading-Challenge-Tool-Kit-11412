import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { TimerRecord, useStorage } from '../storage/AppStorage';

export function useTimer(key: string) {
  const { state, update } = useStorage();
  const timer = state.timers[key];
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const interval = timer?.deadline ? setInterval(tick, 250) : null;
    const subscription = AppState.addEventListener('change', tick);
    return () => {
      if (interval) {
        clearInterval(interval);
      }
      subscription.remove();
    };
  }, [timer?.deadline]);
  const remaining = timer
    ? timer.deadline
      ? Math.max(0, Math.ceil((timer.deadline - now) / 1000))
      : timer.remaining
    : 0;
  const set = useCallback(
    (value: TimerRecord | null) =>
      update(current => {
        const timers = { ...current.timers };
        if (value) {
          timers[key] = value;
        } else {
          delete timers[key];
        }
        return { ...current, timers };
      }),
    [key, update],
  );
  const start = useCallback(
    (seconds: number, phase?: string) => {
      setNow(Date.now());
      set({
        id: `${key}-${Date.now()}`,
        duration: seconds,
        remaining: seconds,
        deadline: Date.now() + seconds * 1000,
        phase,
      });
    },
    [key, set],
  );
  const pause = useCallback(() => {
    if (timer?.deadline) {
      set({
        ...timer,
        remaining: Math.max(0, Math.ceil((timer.deadline - Date.now()) / 1000)),
        deadline: null,
      });
    }
  }, [set, timer]);
  const resume = useCallback(() => {
    if (timer && !timer.deadline) {
      setNow(Date.now());
      set({ ...timer, deadline: Date.now() + timer.remaining * 1000 });
    }
  }, [set, timer]);
  return {
    timer,
    remaining,
    running: !!timer?.deadline,
    start,
    pause,
    resume,
    clear: () => set(null),
    set,
  };
}
