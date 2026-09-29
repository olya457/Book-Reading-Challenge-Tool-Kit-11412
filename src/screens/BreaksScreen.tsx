import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { useScreenBack } from '../hooks/useScreenBack';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import {
  Back,
  Button,
  Complete,
  Dots,
  Header,
  Host,
  Ring,
  Screen,
  Tile,
} from '../components/UI';
import { Exercise, exercises, timedBreak } from '../data/breaks';
import { useTimer } from '../hooks/useTimer';
import { useStorage } from '../storage/AppStorage';
import { colors, styles as s } from '../theme';
import type { TabParams } from '../navigation/AppNavigator';
const findExercise = (id?: string): Exercise =>
  id?.startsWith('timed-')
    ? timedBreak(Number(id.split('-')[1]))
    : exercises.find(item => item.id === id) || exercises[0];
export function BreaksScreen({
  navigation,
}: BottomTabScreenProps<TabParams, 'Breaks'>) {
  const layout = useResponsiveLayout();
  const timer = useTimer('break');
  const { complete } = useStorage();
  const [view, setView] = useState<'home' | 'active' | 'complete'>(
    timer.timer ? 'active' : 'home',
  );
  useScreenBack(view !== 'home', () => setView('home'));
  const [exercise, setExercise] = useState(() =>
    findExercise(timer.timer?.phase),
  );
  const elapsed = timer.timer ? timer.timer.duration - timer.remaining : 0;
  let boundary = 0;
  const found = exercise.steps.findIndex(step => {
    boundary += step.seconds;
    return elapsed < boundary;
  });
  const index = found < 0 ? exercise.steps.length - 1 : found;
  const before = exercise.steps
    .slice(0, index)
    .reduce((sum, step) => sum + step.seconds, 0);
  const stepRemaining = Math.max(
    0,
    exercise.steps[index].seconds - (elapsed - before),
  );
  const finish = useCallback(() => {
    if (timer.timer) {
      complete({
        id: timer.timer.id,
        kind: 'break',
        title: exercise.title,
        seconds: elapsed,
        date: new Date().toISOString(),
      });
    }
    timer.clear();
    setView('complete');
  }, [timer, complete, exercise.title, elapsed]);
  useEffect(() => {
    if (view === 'active' && timer.timer && timer.remaining === 0) {
      finish();
    }
  }, [timer, view, finish]);
  const start = (value: Exercise) => {
    setExercise(value);
    timer.start(
      value.steps.reduce((sum, step) => sum + step.seconds, 0),
      value.id,
    );
    setView('active');
  };
  if (view === 'complete') {
    return (
      <Complete
        title="Break Complete"
        subtitle="Ready for another reading session?"
        primary="Start Reading Session"
        onPrimary={() => {
          setView('home');
          navigation.navigate('Sessions');
        }}
        onBack={() => setView('home')}
        backTitle="Back to Breaks"
      />
    );
  }
  if (view === 'active' && timer.timer) {
    return (
      <Screen transitionKey={`${view}-${exercise.id}`}>
        <Back
          title="End Break"
          onPress={() => {
            timer.clear();
            setView('home');
          }}
        />
        <View
          style={[
            s.row,
            layout.singleColumn && {
              flexDirection: 'column',
              alignItems: 'stretch',
            },
          ]}
        >
          <Text style={{ fontSize: 27 }}>{exercise.icon}</Text>
          <View>
            <Text style={s.heading}>{exercise.title}</Text>
            <Text style={s.body}>
              Step {index + 1} of {exercise.steps.length}
            </Text>
          </View>
        </View>
        <View style={{ height: 4, backgroundColor: colors.border }}>
          <View
            style={{
              height: 4,
              backgroundColor: colors.gold,
              width: `${(elapsed / timer.timer.duration) * 100}%`,
            }}
          />
        </View>
        <Host
          pose={
            exercise.id === 'guided' || exercise.id.startsWith('timed-')
              ? index % 3 === 1
                ? 'welcome'
                : 'rest'
              : 'rest'
          }
          height={280}
        />
        <View
          style={[
            s.card,
            { alignItems: 'center', minHeight: 160, justifyContent: 'center' },
          ]}
        >
          <Text
            accessibilityLiveRegion="polite"
            style={[s.heading, { textAlign: 'center', fontSize: 20 }]}
          >
            {exercise.steps[index].text}
          </Text>
          <Ring
            size={72}
            text={`${stepRemaining}`}
            progress={stepRemaining / exercise.steps[index].seconds}
          />
        </View>
        <Dots count={exercise.steps.length} index={index} />
        <View
          style={[
            s.row,
            layout.singleColumn && {
              flexDirection: 'column',
              alignItems: 'stretch',
            },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Button
              title={timer.running ? 'Pause' : 'Resume'}
              secondary
              onPress={timer.running ? timer.pause : timer.resume}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              title={
                index === exercise.steps.length - 1
                  ? 'Finish Break'
                  : 'Next Step →'
              }
              subtle
              onPress={() => {
                if (index === exercise.steps.length - 1) {
                  finish();
                } else {
                  const remaining = timer.remaining - stepRemaining;
                  timer.set({
                    ...timer.timer!,
                    remaining,
                    deadline: timer.running
                      ? Date.now() + remaining * 1000
                      : null,
                  });
                }
              }}
            />
          </View>
        </View>
      </Screen>
    );
  }
  return (
    <Screen transitionKey={`${view}-${exercise.id}`}>
      <Header
        title={'Reading Break\n& Eye Guide'}
        subtitle="Short guided breaks for better reading."
        pose="rest"
      />
      {timer.timer && (
        <Button title="Resume Break" onPress={() => setView('active')} />
      )}
      <Text style={s.label}>QUICK TIMED BREAK</Text>
      <View
        style={[
          s.row,
          layout.singleColumn && {
            flexDirection: 'column',
            alignItems: 'stretch',
          },
        ]}
      >
        {[1, 3, 5].map(minutes => (
          <Pressable
            key={minutes}
            accessibilityLabel={`${minutes} minute break`}
            accessibilityRole="button"
            disabled={!!timer.timer}
            style={[
              s.card,
              {
                flex: 1,
                padding: 12,
                minHeight: 90,
                opacity: timer.timer ? 0.5 : 1,
              },
            ]}
            onPress={() => start(timedBreak(minutes))}
          >
            <Text
              style={{ color: colors.gold, fontSize: 13, fontWeight: '700' }}
            >
              {minutes} {minutes === 1 ? 'minute' : 'minutes'}
            </Text>
            <Text style={{ color: colors.text, fontSize: 11 }}>
              {timedBreak(minutes).title}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={s.label}>GUIDED EXERCISES</Text>
      {exercises.map(item => (
        <Tile
          key={item.id}
          title={item.title}
          subtitle={item.description}
          icon={item.icon}
          detail={`${item.steps.length} steps · ${
            item.steps.reduce((sum, step) => sum + step.seconds, 0) / 60
          } min`}
          onPress={() => {
            if (timer.timer) {
              setView('active');
            } else {
              start(item);
            }
          }}
        />
      ))}
      <View style={s.card}>
        <Text style={{ color: colors.gold, fontWeight: '700' }}>
          💡 Reading Break Tip
        </Text>
        <Text style={s.body}>
          A short pause every 30–60 minutes can make reading more comfortable.
          Move gently within your comfort range.
        </Text>
        <Text style={{ fontSize: 11, lineHeight: 17, color: colors.faint }}>
          General relaxation reminders, not a medical program. Skip any movement
          that feels uncomfortable.
        </Text>
      </View>
    </Screen>
  );
}
