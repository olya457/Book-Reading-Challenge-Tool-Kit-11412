import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Text } from 'react-native';
import { StorageProvider, useStorage } from '../src/storage/AppStorage';
import { useTimer } from '../src/hooks/useTimer';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
}));
let storage: ReturnType<typeof useStorage>;
let timer: ReturnType<typeof useTimer>;
function Harness() {
  storage = useStorage();
  timer = useTimer('test');
  return <Text>{timer.remaining}</Text>;
}
let root: ReactTestRenderer.ReactTestRenderer;
beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-09-29T12:00:00Z'));
  jest.clearAllMocks();
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
});
afterEach(async () => {
  if (root) {
    await act(async () => root.unmount());
  }
  jest.useRealTimers();
});
async function mount() {
  await act(async () => {
    root = ReactTestRenderer.create(
      <StorageProvider>
        <Harness />
      </StorageProvider>,
    );
  });
}
test('starts empty and persists user changes', async () => {
  await mount();
  expect(storage.ready).toBe(true);
  expect(storage.state.history).toEqual([]);
  expect(storage.state.calculator.total).toBe('');
  await act(async () =>
    storage.update(value => ({ ...value, onboarded: true })),
  );
  expect(AsyncStorage.setItem).toHaveBeenLastCalledWith(
    '@folio/app/v1',
    expect.stringContaining('"onboarded":true'),
  );
});
test('pause freezes countdown and resume continues remaining time', async () => {
  await mount();
  await act(async () => timer.start(60));
  await act(async () => jest.advanceTimersByTime(10000));
  expect(timer.remaining).toBe(50);
  await act(async () => timer.pause());
  await act(async () => jest.advanceTimersByTime(20000));
  expect(timer.remaining).toBe(50);
  await act(async () => timer.resume());
  await act(async () => jest.advanceTimersByTime(50000));
  expect(timer.remaining).toBe(0);
});
test('recovers a running timer from a persisted deadline', async () => {
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
    JSON.stringify({
      timers: {
        test: {
          id: 'restored',
          duration: 60,
          remaining: 60,
          deadline: Date.now() + 12000,
        },
      },
    }),
  );
  await mount();
  expect(timer.remaining).toBe(12);
  await act(async () => jest.advanceTimersByTime(12000));
  expect(timer.remaining).toBe(0);
});
test('accounts for time while the app is in the background', async () => {
  let onChange: () => void = () => {};
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_, listener) => {
    onChange = () => listener('active');
    return { remove: jest.fn() };
  });
  await mount();
  await act(async () => timer.start(60));
  jest.setSystemTime(Date.now() + 45000);
  await act(async () => onChange());
  expect(timer.remaining).toBe(15);
  jest.restoreAllMocks();
});
test('records a completion only once', async () => {
  await mount();
  const entry = {
    id: 'one',
    kind: 'session' as const,
    title: 'Reading',
    seconds: 600,
    date: new Date().toISOString(),
  };
  await act(async () => {
    storage.complete(entry);
    storage.complete(entry);
  });
  expect(storage.state.history).toHaveLength(1);
});

test('does not overwrite unreadable storage and can retry loading', async () => {
  (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
    new Error('Unavailable'),
  );
  await mount();
  expect(storage.error).toContain('could not be loaded');
  expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
    JSON.stringify({ onboarded: true }),
  );
  await act(async () => storage.retry());
  expect(storage.state.onboarded).toBe(true);
  expect(storage.error).toBeNull();
});

test('keeps failed saves visible and retries the latest state', async () => {
  await mount();
  (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('Full'));
  await act(async () =>
    storage.update(value => ({ ...value, onboarded: true })),
  );
  expect(storage.error).toContain('could not be saved');
  await act(async () => storage.retry());
  expect(storage.error).toBeNull();
  expect(AsyncStorage.setItem).toHaveBeenLastCalledWith(
    '@folio/app/v1',
    expect.stringContaining('"onboarded":true'),
  );
});
