import { ContentEntrance } from '../components/ContentEntrance';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import { Button, Dots, Host } from '../components/UI';
import { Pose } from '../assets';
import { useStorage } from '../storage/AppStorage';
import { colors, serif, styles as s } from '../theme';
const pages: {
  title: string;
  quote: string;
  description: string;
  pose: Pose;
  accent: string;
}[] = [
  {
    title: 'Reading Challenges',
    quote:
      '“I’ll give you fresh reading challenges whenever you want something new to try.”',
    description:
      'Get instant challenges — no manual goal-setting needed. Spin the wheel, pick a pack, or generate a random challenge in one tap.',
    pose: 'welcome',
    accent: '#DDB728',
  },
  {
    title: 'Focused Reading',
    quote:
      '“Choose a session, put distractions aside, and focus on your book.”',
    description:
      'Pick a 10, 20, 30, or 60-minute session. A clean countdown timer keeps you focused — no setup, just start reading.',
    pose: 'challenge',
    accent: '#A54AEC',
  },
  {
    title: 'Discover Something New',
    quote:
      '“Not sure what to read next? I’ll help you discover a new direction.”',
    description:
      'Spin the genre wheel and randomly generate your next book’s length, era, mood, and setting. Instant inspiration.',
    pose: 'reading',
    accent: '#9C49E1',
  },
  {
    title: 'Plan Your Finish',
    quote:
      '“Tell me where you are in your book, and I’ll calculate a comfortable plan to finish it.”',
    description:
      'Enter your total and current page. Folio calculates your daily reading target and builds a complete finish plan automatically.',
    pose: 'calculator',
    accent: '#D69814',
  },
  {
    title: 'Take Better Breaks',
    quote:
      '“When it’s time for a pause, I’ll guide you through a short reading break.”',
    description:
      'Guided eye breaks, posture resets, and relaxation sequences. Short, purposeful pauses that get you back to your book refreshed.',
    pose: 'rest',
    accent: '#078569',
  },
];
export function OnboardingScreen() {
  const [index, setIndex] = useState(0);
  const { update } = useStorage();
  const layout = useResponsiveLayout();
  const page = pages[index];
  const finish = () => update(state => ({ ...state, onboarded: true }));
  return (
    <SafeAreaView style={s.page}>
      <ScrollView
        key={index}
        style={{ flex: 1, minHeight: 0 }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <ContentEntrance
          replayKey={index}
          style={[
            s.content,
            {
              padding: layout.padding,
              paddingTop: 5,
              gap: layout.compact ? 8 : 16,
            },
          ]}
        >
          <View style={{ alignItems: 'flex-end', minHeight: 36 }}>
            {index < 4 && (
              <Pressable
                accessibilityRole="button"
                onPress={finish}
                hitSlop={12}
                style={{ padding: 8 }}
              >
                <Text style={{ color: colors.faint }}>Skip</Text>
              </Pressable>
            )}
          </View>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              minHeight: layout.hostHeight,
            }}
          >
            <Host pose={page.pose} height={layout.hostHeight} />
          </View>
          <View
            style={{
              gap: layout.compact ? 9 : 13,
              paddingVertical: layout.compact ? 4 : 12,
            }}
          >
            <Text
              style={[
                s.title,
                { textAlign: 'center', fontSize: layout.compact ? 24 : 27 },
              ]}
            >
              {page.title}
            </Text>
            <Text
              style={{
                fontFamily: serif,
                fontSize: layout.compact ? 14 : 16,
                lineHeight: layout.compact ? 21 : 23,
                fontStyle: 'italic',
                color: page.accent,
                textAlign: 'center',
              }}
            >
              {page.quote}
            </Text>
            <Text style={[s.body, { textAlign: 'center', lineHeight: 23 }]}>
              {page.description}
            </Text>
          </View>
        </ContentEntrance>
      </ScrollView>
      <View
        style={{
          flexShrink: 0,
          paddingTop: 8,
          paddingHorizontal: layout.padding,
          paddingBottom: layout.compact ? 10 : 16,
          gap: 8,
          width: '100%',
          maxWidth: 560,
          alignSelf: 'center',
        }}
      >
        <Dots count={5} index={index} />
        <Button
          title={index === 4 ? 'Start Reading' : 'Continue'}
          onPress={() => (index === 4 ? finish() : setIndex(index + 1))}
        />
      </View>
    </SafeAreaView>
  );
}
