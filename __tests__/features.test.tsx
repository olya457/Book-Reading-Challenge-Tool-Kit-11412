import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Animated, TextInput } from 'react-native';
import { Wheel } from '../src/components/Wheel';
import { Button, Chip } from '../src/components/UI';
import { StorageProvider, useStorage } from '../src/storage/AppStorage';
import { ChallengesScreen } from '../src/screens/ChallengesScreen';
import { SessionsScreen } from '../src/screens/SessionsScreen';
import { DiscoveryScreen } from '../src/screens/DiscoveryScreen';
import { CalculatorScreen } from '../src/screens/CalculatorScreen';
import { BreaksScreen } from '../src/screens/BreaksScreen';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@react-navigation/native', () => ({ useFocusEffect: jest.fn() }));
jest.mock('react-native-linear-gradient', () => 'LinearGradient');
jest.mock('react-native-svg', () => ({
  __esModule: true,
  default: 'Svg',
  Circle: 'Circle',
  Defs: 'Defs',
  LinearGradient: 'SvgGradient',
  Stop: 'Stop',
  Path: 'Path',
  Rect: 'Rect',
  G: 'G',
  Text: 'SvgText',
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: 'SafeAreaView',
}));
jest.setTimeout(30000);
let storage: ReturnType<typeof useStorage>;
let root: Renderer.ReactTestRenderer;
function Observe() {
  storage = useStorage();
  return null;
}
async function mount(screen: React.ReactNode) {
  await act(async () => {
    root = Renderer.create(
      <StorageProvider>
        <Observe />
        {screen}
      </StorageProvider>,
    );
  });
}
async function button(title: string) {
  const target = root.root
    .findAllByType(Button)
    .find(item => item.props.title === title);
  expect(target).toBeDefined();
  await act(async () => target!.props.onPress());
}
beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-09-29T12:00:00Z'));
});
afterEach(async () => {
  await act(async () => root.unmount());
  jest.useRealTimers();
});

test('generates, starts and completes a page challenge', async () => {
  await mount(<ChallengesScreen />);
  await act(async () =>
    root.root
      .findAllByType(Chip)
      .find(item => item.props.title === 'Pages')!
      .props.onPress(),
  );
  await button('✦ Generate Challenge');
  await button('Start Challenge');
  expect(storage.state.activeChallenge).toMatch(/^Pages-/);
  await button('Complete Challenge ✓');
  expect(storage.state.history).toHaveLength(1);
  expect(storage.state.history[0].kind).toBe('challenge');
  expect(storage.state.activeChallenge).toBeNull();
});
test('reading session starts, pauses, resumes and records actual elapsed time', async () => {
  await mount(<SessionsScreen />);
  const quick = root.root.findAll(
    item =>
      item.props.accessibilityLabel === 'Quick Read, 10 minutes' &&
      typeof item.props.onPress === 'function',
  )[0];
  await act(async () => quick.props.onPress());
  await button('Start Reading');
  await act(async () => jest.advanceTimersByTime(30000));
  await button('Pause');
  await act(async () => jest.advanceTimersByTime(20000));
  await button('Continue Reading');
  await act(async () => jest.advanceTimersByTime(15000));
  await button('Finish Session');
  expect(storage.state.history[0].seconds).toBe(45);
  expect(storage.state.timers.session).toBeUndefined();
});
test('quick discovery saves complete criteria and supports genre changes', async () => {
  await mount(<DiscoveryScreen />);
  let finishSpin = () => {};
  const animation = jest
    .spyOn(Animated, 'timing')
    .mockImplementationOnce(() => ({
      start: callback => {
        finishSpin = () => callback?.({ finished: true });
      },
      stop: jest.fn(),
      reset: jest.fn(),
    }));
  await button('ϟ Quick Discovery');
  expect(storage.state.discovery).toBeNull();
  expect(
    root.root
      .findAllByType(Button)
      .find(item => item.props.title === 'Spinning…')?.props.disabled,
  ).toBe(true);
  expect(animation).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({ duration: 4400, useNativeDriver: true }),
  );
  await act(async () => finishSpin());
  expect(storage.state.discovery).toBeNull();
  await act(async () => jest.advanceTimersByTime(500));
  animation.mockRestore();
  expect(storage.state.discovery).toEqual({
    genre: expect.any(String),
    length: expect.any(String),
    era: expect.any(String),
    mood: expect.any(String),
    setting: expect.any(String),
  });
  await button('Change Genre');
  await act(async () =>
    root.root
      .findAllByType(Chip)
      .find(item => item.props.title === 'Mystery')!
      .props.onPress(),
  );
  await button('Add Random Criteria');
  expect(storage.state.discovery?.genre).toBe('Mystery');
});
test('calculator accepts user values, produces plan and resets inputs', async () => {
  await mount(<CalculatorScreen />);
  const inputs = root.root.findAllByType(TextInput);
  await act(async () => {
    inputs[0].props.onChangeText('67');
    inputs[1].props.onChangeText('7');
  });
  await button('View 3-Day Reading Plan');
  expect(
    root.root
      .findAllByType(Button)
      .some(item => item.props.title === 'Hide Reading Plan'),
  ).toBe(true);
  expect(storage.state.calculator.total).toBe('67');
  await button('New Calculation');
  expect(storage.state.calculator.total).toBe('');
  expect(storage.state.calculator.current).toBe('');
});
test('one-minute guided break advances automatically and completes', async () => {
  const navigation = { navigate: jest.fn() };
  await mount(
    <BreaksScreen
      {...({ navigation } as unknown as React.ComponentProps<
        typeof BreaksScreen
      >)}
    />,
  );
  const quick = root.root.findAll(
    item =>
      item.props.accessibilityLabel === '1 minute break' &&
      typeof item.props.onPress === 'function',
  )[0];
  await act(async () => quick.props.onPress());
  await act(async () => jest.advanceTimersByTime(60000));
  expect(storage.state.history[0].kind).toBe('break');
  expect(storage.state.history[0].seconds).toBe(60);
  await button('Start Reading Session');
  expect(navigation.navigate).toHaveBeenCalledWith('Sessions');
});

test('wheel blocks repeated spins and delivers the sector at the pointer after stopping', async () => {
  const onResult = jest.fn();
  const random = jest.spyOn(Math, 'random').mockReturnValue(0.3);
  await mount(
    <Wheel items={['Pages', 'Time', 'Genre', 'Classic']} onResult={onResult} />,
  );
  let finishSpin = () => {};
  const animation = jest
    .spyOn(Animated, 'timing')
    .mockImplementationOnce(() => ({
      start: callback => {
        finishSpin = () => callback?.({ finished: true });
      },
      stop: jest.fn(),
      reset: jest.fn(),
    }));
  const wheel = root.root.findAll(
    item =>
      item.props.accessibilityLabel === 'Spin wheel' &&
      typeof item.props.onPress === 'function',
  )[0];
  await act(async () => {
    wheel.props.onPress();
    wheel.props.onPress();
  });
  expect(animation).toHaveBeenCalledTimes(1);
  expect(animation).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({ toValue: 2385 }),
  );
  expect(onResult).not.toHaveBeenCalled();
  await act(async () => finishSpin());
  await act(async () => jest.advanceTimersByTime(499));
  expect(onResult).not.toHaveBeenCalled();
  await act(async () => jest.advanceTimersByTime(1));
  expect(onResult).toHaveBeenCalledTimes(1);
  expect(onResult).toHaveBeenCalledWith('Time');
  animation.mockRestore();
  random.mockRestore();
});
