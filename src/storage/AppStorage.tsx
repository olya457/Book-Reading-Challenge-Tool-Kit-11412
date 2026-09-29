import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type TimerRecord = {
  id: string;
  duration: number;
  remaining: number;
  deadline: number | null;
  phase?: string;
};
export type Completion = {
  id: string;
  kind: 'session' | 'challenge' | 'break';
  title: string;
  seconds: number;
  date: string;
};
export type CalculatorDraft = {
  total: string;
  current: string;
  mode: 'pages' | 'days';
  amount: string;
  speed: number;
};
type State = {
  onboarded: boolean;
  history: Completion[];
  timers: Record<string, TimerRecord>;
  calculator: CalculatorDraft;
  activeChallenge: string | null;
  discovery: {
    genre: string;
    length?: string;
    era?: string;
    mood?: string;
    setting?: string;
  } | null;
};
const defaults: State = {
  onboarded: false,
  history: [],
  timers: {},
  calculator: { total: '', current: '', mode: 'pages', amount: '20', speed: 2 },
  activeChallenge: null,
  discovery: null,
};
const KEY = '@folio/app/v1';
type Context = {
  state: State;
  ready: boolean;
  error: string | null;
  update: (fn: (state: State) => State) => void;
  complete: (entry: Completion) => void;
  retry: () => void;
};
const StorageContext = createContext<Context | null>(null);
export function StorageProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(defaults);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queue = useRef(Promise.resolve());
  const [dirty, setDirty] = useState(false);
  const [readFailed, setReadFailed] = useState(false);
  const hydrate = useCallback(() => {
    setReady(false);
    AsyncStorage.getItem(KEY)
      .then(raw => {
        if (raw) {
          const saved = JSON.parse(raw);
          setState({
            ...defaults,
            ...saved,
            calculator: { ...defaults.calculator, ...saved.calculator },
            history: Array.isArray(saved.history) ? saved.history : [],
            timers:
              saved.timers && typeof saved.timers === 'object'
                ? saved.timers
                : {},
          });
        }
        setReadFailed(false);
        setError(null);
      })
      .catch(() => {
        setReadFailed(true);
        setError('Saved data could not be loaded. Tap to retry.');
      })
      .finally(() => setReady(true));
  }, []);
  useEffect(hydrate, [hydrate]);
  const persist = useCallback((value: State) => {
    queue.current = queue.current
      .then(() => AsyncStorage.setItem(KEY, JSON.stringify(value)))
      .then(() => setError(null))
      .catch(() => setError('Changes could not be saved. Please try again.'));
  }, []);
  useEffect(() => {
    if (ready && dirty && !readFailed) {
      persist(state);
    }
  }, [state, ready, persist, dirty, readFailed]);
  const update = useCallback((fn: (value: State) => State) => {
    setDirty(true);
    setState(fn);
  }, []);
  const complete = useCallback(
    (entry: Completion) =>
      update(value =>
        value.history.some(item => item.id === entry.id)
          ? value
          : { ...value, history: [...value.history, entry] },
      ),
    [update],
  );
  return (
    <StorageContext.Provider
      value={{
        state,
        ready,
        error,
        update,
        complete,
        retry: () => (readFailed ? hydrate() : persist(state)),
      }}
    >
      {children}
    </StorageContext.Provider>
  );
}
export function useStorage() {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('StorageProvider is required');
  }
  return context;
}
