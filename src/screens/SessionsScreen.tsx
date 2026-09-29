import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { useScreenBack } from '../hooks/useScreenBack';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  Back,
  Button,
  Chip,
  Complete,
  Header,
  Host,
  Ring,
  Screen,
} from '../components/UI';
import { useTimer } from '../hooks/useTimer';
import { useStorage } from '../storage/AppStorage';
import { clock, localDay, pick } from '../utils/reading';
import { colors, styles as s } from '../theme';
const modes = [
  {
    minutes: 10,
    title: 'Quick Read',
    description: 'A short burst of focused reading',
    color: '#00795F',
  },
  {
    minutes: 20,
    title: 'Short Session',
    description: 'Standard short reading session',
    color: '#294D89',
  },
  {
    minutes: 30,
    title: 'Focus Reading',
    description: 'Uninterrupted focused reading',
    color: '#852AB3',
  },
  {
    minutes: 60,
    title: 'Deep Reading',
    description: 'Long session with an optional break',
    color: '#9D173D',
  },
];
export function SessionsScreen() {
  const layout = useResponsiveLayout();
  const { state, complete } = useStorage();
  const timer = useTimer('session');
  const breakTimer = useTimer('session-break');
  const [view, setView] = useState<'home' | 'ready' | 'timer' | 'complete'>(
    timer.timer ? 'timer' : 'home',
  );
  useScreenBack(view !== 'home', () => setView('home'));
  const [minutes, setMinutes] = useState(
    timer.timer ? timer.timer.duration / 60 : 10,
  );
  const [completedSeconds, setCompletedSeconds] = useState(0);
  const mode = modes.find(item => item.minutes === minutes) || {
    title: 'Surprise Session',
    description: 'A little time for an unexpected adventure',
    color: colors.purple,
  };
  const halfway = timer.timer?.phase === 'halfway';
  const finish = useCallback(() => {
    if (!timer.timer) {
      return;
    }
    const elapsed = timer.timer.duration - timer.remaining;
    setCompletedSeconds(elapsed);
    complete({
      id: timer.timer.id,
      kind: 'session',
      title: mode.title,
      seconds: elapsed,
      date: new Date().toISOString(),
    });
    timer.clear();
    breakTimer.clear();
    setView('complete');
  }, [timer, breakTimer, complete, mode.title]);
  useEffect(() => {
    if (view !== 'timer' || !timer.timer) {
      return;
    }
    if (timer.remaining === 0) {
      finish();
      return;
    }
    if (
      timer.timer.duration === 3600 &&
      timer.remaining <= 1800 &&
      !timer.timer.phase
    ) {
      timer.set({
        ...timer.timer,
        remaining: timer.remaining,
        deadline: null,
        phase: 'halfway',
      });
    }
  }, [view, timer, finish]);
  useEffect(() => {
    if (breakTimer.timer && breakTimer.remaining === 0 && timer.timer) {
      breakTimer.clear();
      timer.set({
        ...timer.timer,
        deadline: Date.now() + timer.remaining * 1000,
        phase: 'continued',
      });
    }
  }, [breakTimer, timer]);
  if (view === 'complete') {
    return (
      <Complete
        title={'Reading Session\nComplete!'}
        subtitle={`${Math.floor(completedSeconds / 60)} min ${
          completedSeconds % 60
        } sec of reading completed`}
        primary="Start Another Session"
        onPrimary={() => setView('home')}
        onBack={() => setView('home')}
        backTitle="Back to Sessions"
      />
    );
  }
  if (view === 'timer' && timer.timer) {
    return (
      <Screen transitionKey={view}>
        <Back title="Sessions" onPress={() => setView('home')} />
        <Text style={[s.label, { textAlign: 'center' }]}>
          {breakTimer.timer ? 'READING BREAK' : mode.title.toUpperCase()}
        </Text>
        <View
          style={{
            flex: 1,
            minHeight: layout.timerHeight,
            justifyContent: 'center',
            gap: 25,
          }}
        >
          <Ring
            progress={
              breakTimer.timer
                ? breakTimer.remaining / breakTimer.timer.duration
                : timer.remaining / timer.timer.duration
            }
            text={clock(
              breakTimer.timer ? breakTimer.remaining : timer.remaining,
            )}
            caption={
              breakTimer.timer
                ? 'Rest your eyes and relax'
                : `${Math.floor(
                    (timer.timer.duration - timer.remaining) / 60,
                  )} / ${minutes} minutes`
            }
          />
          {halfway && !breakTimer.timer && (
            <View style={s.card}>
              <Text style={s.heading}>Halfway Point</Text>
              <Text style={s.body}>Would you like a 2-minute break?</Text>
              <Button
                title="Take Break"
                onPress={() => {
                  timer.set({ ...timer.timer!, phase: 'break' });
                  breakTimer.start(120);
                }}
              />
              <Button
                title="Continue Reading"
                secondary
                onPress={() =>
                  timer.set({
                    ...timer.timer!,
                    phase: 'continued',
                    deadline: Date.now() + timer.remaining * 1000,
                  })
                }
              />
            </View>
          )}
        </View>
        {breakTimer.timer ? (
          <>
            <Button
              secondary
              title={breakTimer.running ? 'Pause Break' : 'Resume Break'}
              onPress={
                breakTimer.running ? breakTimer.pause : breakTimer.resume
              }
            />
            <Button
              title="Return to Reading"
              onPress={() => {
                breakTimer.clear();
                timer.set({
                  ...timer.timer!,
                  phase: 'continued',
                  deadline: Date.now() + timer.remaining * 1000,
                });
              }}
            />
          </>
        ) : (
          <>
            {!halfway && (
              <Button
                title={timer.running ? 'Pause' : 'Continue Reading'}
                secondary
                onPress={timer.running ? timer.pause : timer.resume}
              />
            )}
            <Button title="Finish Session" onPress={finish} />
          </>
        )}
      </Screen>
    );
  }
  if (view === 'ready') {
    return (
      <Screen transitionKey={view}>
        <Back title="Choose Another Time" onPress={() => setView('home')} />
        <View style={s.center}>
          <Chip title={`${minutes} MIN SESSION`} />
          <Text style={s.title}>{mode.title}</Text>
          <Text style={[s.body, { textAlign: 'center' }]}>
            {mode.description}
          </Text>
        </View>
        <Host pose="reading" height={265} />
        <View style={s.card}>
          <Text style={s.label}>GET READY</Text>
          {[
            '📵  Phone distractions off',
            '📖  Book ready',
            '🪑  Comfortable position',
            '💧  Water nearby',
          ].map(item => (
            <Text key={item} style={s.body}>
              {item}
            </Text>
          ))}
        </View>
        <Button
          title="Start Reading"
          onPress={() => {
            timer.start(minutes * 60);
            setView('timer');
          }}
        />
      </Screen>
    );
  }
  const today = state.history.filter(
    item =>
      item.kind === 'session' && localDay(new Date(item.date)) === localDay(),
  );
  return (
    <Screen transitionKey={view}>
      <Header
        title="Reading Session"
        subtitle="Choose your time and start focusing."
        pose="reading"
      />
      {timer.timer ? (
        <>
          <Button
            title="Resume Reading Session"
            onPress={() => setView('timer')}
          />
          <Text style={s.body}>
            Finish your current session before starting another.
          </Text>
        </>
      ) : (
        <>
          <View style={s.wrap}>
            {modes.map(item => (
              <Pressable
                key={item.minutes}
                accessibilityLabel={`${item.title}, ${item.minutes} minutes`}
                accessibilityRole="button"
                onPress={() => {
                  setMinutes(item.minutes);
                  setView('ready');
                }}
                style={[
                  s.card,
                  {
                    width: layout.singleColumn ? '100%' : '47%',
                    flexGrow: 1,
                    minHeight: 164,
                  },
                ]}
              >
                <Text style={{ color: item.color, fontSize: 28 }}>◷</Text>
                <Text
                  style={{
                    color: colors.gold,
                    fontSize: 23,
                    fontWeight: '800',
                  }}
                >
                  {item.minutes} min
                </Text>
                <Text style={{ color: colors.text, fontWeight: '700' }}>
                  {item.title}
                </Text>
                <Text
                  style={{ color: colors.faint, fontSize: 12, lineHeight: 17 }}
                >
                  {item.description}
                </Text>
              </Pressable>
            ))}
          </View>
          <Button
            title="🎲 Surprise Me"
            subtle
            onPress={() => {
              setMinutes(pick([10, 15, 20, 25, 30, 40, 45, 60]));
              setView('ready');
            }}
          />
        </>
      )}
      <View style={s.card}>
        <Text style={{ color: colors.gold, fontWeight: '700' }}>
          💡 Reading Tip
        </Text>
        <Text style={s.body}>
          Even 10 minutes of daily reading adds up to over 60 hours per year.
          Every session counts.
        </Text>
      </View>
      <View style={s.card}>
        <Text style={s.label}>YOUR READING SESSIONS TODAY</Text>
        <Text style={s.body}>
          {today.length} sessions ·{' '}
          {Math.floor(today.reduce((sum, item) => sum + item.seconds, 0) / 60)}{' '}
          minutes read
        </Text>
        {today
          .slice(-5)
          .reverse()
          .map(item => (
            <Text key={item.id} style={{ color: colors.faint, fontSize: 12 }}>
              {item.title} · {clock(item.seconds)}
            </Text>
          ))}
      </View>
    </Screen>
  );
}
