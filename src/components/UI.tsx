import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ContentEntrance } from './ContentEntrance';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  Path,
  Rect,
} from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { assets, Pose } from '../assets';
import { colors, floatingTabBar, styles as s } from '../theme';

export function Screen({
  children,
  transitionKey = 'screen',
}: {
  children: React.ReactNode;
  transitionKey?: string | number;
}) {
  const layout = useResponsiveLayout();
  const scroll = useRef<ScrollView>(null);
  const [focusVersion, setFocusVersion] = useState(0);
  useFocusEffect(
    useCallback(() => {
      setFocusVersion(value => value + 1);
    }, []),
  );
  useEffect(() => {
    scroll.current?.scrollTo({ y: 0, animated: false });
  }, [transitionKey]);
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={s.page}>
      <KeyboardAvoidingView
        style={s.page}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scroll}
          contentContainerStyle={ui.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          scrollIndicatorInsets={{ bottom: floatingTabBar.contentInset }}
        >
          <ContentEntrance
            replayKey={`${transitionKey}-${focusVersion}`}
            style={[
              s.content,
              {
                padding: layout.padding,
                paddingBottom: floatingTabBar.contentInset,
                gap: layout.gap,
              },
            ]}
          >
            {children}
          </ContentEntrance>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
export function Host({
  pose = 'welcome',
  height = 280,
}: {
  pose?: Pose;
  height?: number;
}) {
  const { hostHeight } = useResponsiveLayout();
  return (
    <View style={{ alignItems: 'center' }}>
      <Image
        source={assets[pose]}
        resizeMode="contain"
        style={{ height: Math.min(height, hostHeight), width: '100%' }}
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}
export function Header({
  title,
  subtitle,
  pose,
}: {
  title: string;
  subtitle: string;
  pose: Pose;
}) {
  const layout = useResponsiveLayout();
  return (
    <View style={[ui.header, { minHeight: layout.compact ? 118 : 150 }]}>
      <View style={{ flex: 1, gap: 7 }}>
        <Text style={s.label}>FOLIO</Text>
        <Text style={[s.title, { fontSize: layout.titleSize }]}>{title}</Text>
        <Text style={[s.body, { fontSize: 12 }]}>{subtitle}</Text>
      </View>
      <Image
        source={assets[pose]}
        style={{
          width: layout.compact ? 58 : 76,
          height: layout.compact ? 118 : 150,
        }}
        resizeMode="contain"
      />
    </View>
  );
}
export function Button({
  title,
  onPress,
  secondary = false,
  subtle = false,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  subtle?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        { opacity: disabled ? 0.45 : pressed ? 0.78 : 1, flexShrink: 0 },
        !secondary && !subtle && ui.shadow,
      ]}
    >
      <View
        style={[
          ui.button,
          {
            borderColor: secondary
              ? '#51247B'
              : subtle
              ? '#66501C'
              : 'transparent',
          },
        ]}
      >
        <LinearGradient
          pointerEvents="none"
          colors={
            secondary
              ? ['#231335', '#1A102A']
              : subtle
              ? ['#262014', '#221C18']
              : ['#F7CC2A', '#DF8500']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Text
          style={{
            color: secondary ? '#D2B4ED' : subtle ? colors.gold : '#170E04',
            fontWeight: '700',
            textAlign: 'center',
            fontSize: 14,
            lineHeight: 20,
            flexShrink: 1,
          }}
        >
          {title}
        </Text>
      </View>
    </Pressable>
  );
}
export function Back({
  onPress,
  title = 'Back',
}: {
  onPress: () => void;
  title?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      hitSlop={10}
      style={{ paddingVertical: 8, alignSelf: 'flex-start' }}
    >
      <Text style={{ color: colors.gold, fontSize: 13 }}>‹ {title}</Text>
    </Pressable>
  );
}
export function CategoryRow({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      style={ui.categoryScroll}
      contentContainerStyle={ui.categoryContent}
    >
      {children}
    </ScrollView>
  );
}
export function Chip({
  title,
  selected = false,
  onPress,
}: {
  title: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        ui.chip,
        selected && { backgroundColor: colors.gold, borderColor: colors.gold },
      ]}
    >
      <Text
        style={{
          color: selected ? '#211609' : colors.muted,
          fontSize: 12,
          fontWeight: selected ? '700' : '400',
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
export function Tile({
  title,
  subtitle,
  icon,
  onPress,
  detail,
}: {
  title: string;
  subtitle: string;
  icon: string;
  onPress: () => void;
  detail?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        s.card,
        s.row,
        { backgroundColor: colors.raised, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={ui.icon}>
        <Text style={{ fontSize: 22 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700' }}>
          {title}
        </Text>
        <Text style={{ color: colors.faint, fontSize: 12, lineHeight: 17 }}>
          {subtitle}
        </Text>
        {detail && (
          <Text style={{ color: colors.purple, fontSize: 11 }}>{detail}</Text>
        )}
      </View>
      <Text style={{ color: colors.faint }}>›</Text>
    </Pressable>
  );
}
export function Ring({
  progress,
  text,
  caption,
  size = 220,
}: {
  progress: number;
  text: string;
  caption?: string;
  size?: number;
}) {
  const layout = useResponsiveLayout();
  const ringSize = Math.min(
    size,
    layout.contentWidth - 24,
    layout.compact ? 190 : size,
  );
  const radius = 89;
  const circumference = 2 * Math.PI * radius;
  return (
    <View
      style={{
        width: ringSize,
        height: ringSize,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Svg
        viewBox="0 0 200 200"
        width={ringSize}
        height={ringSize}
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <SvgGradient id="ring" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.gold} />
            <Stop offset="1" stopColor={colors.purple} />
          </SvgGradient>
        </Defs>
        <Circle
          cx="100"
          cy="100"
          r={radius}
          stroke={colors.raised}
          strokeWidth="8"
          fill="none"
        />
        <Circle
          cx="100"
          cy="100"
          r={radius}
          stroke="url(#ring)"
          strokeWidth="8"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={
            circumference * (1 - Math.max(0, Math.min(1, progress)))
          }
          rotation="-90"
          origin="100, 100"
          strokeLinecap="round"
        />
      </Svg>
      <Text
        style={{
          fontSize: ringSize < 100 ? 20 : ringSize < 210 ? 35 : 42,
          color: colors.text,
          fontWeight: '700',
          fontVariant: ['tabular-nums'],
        }}
      >
        {text}
      </Text>
      {caption && (
        <Text style={{ color: colors.faint, fontSize: 12, marginTop: 5 }}>
          {caption}
        </Text>
      )}
    </View>
  );
}
export function Dots({ count, index }: { count: number; index: number }) {
  return (
    <View style={[s.row, { justifyContent: 'center', padding: 6 }]}>
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          style={{
            height: 6,
            width: i === index ? 22 : 6,
            borderRadius: 4,
            backgroundColor: i === index ? colors.gold : '#3D3445',
          }}
        />
      ))}
    </View>
  );
}
export function Bookshelf() {
  return (
    <View
      style={{
        height: 65,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        borderBottomWidth: 5,
        borderBottomColor: colors.raised,
        borderRadius: 4,
      }}
    >
      {[44, 37, 52, 31, 49, 43, 58, 36, 49, 54, 40, 57, 33, 49, 45].map(
        (height, i) => (
          <View
            key={i}
            style={{
              height,
              flex: 1,
              maxWidth: 14,
              marginHorizontal: 2,
              borderRadius: 2,
              backgroundColor: [
                '#5E2288',
                '#752035',
                '#213760',
                '#076550',
                '#824111',
              ][i % 5],
            }}
          />
        ),
      )}
    </View>
  );
}
export function Complete({
  title,
  subtitle,
  primary,
  onPrimary,
  onBack,
  backTitle,
}: {
  title: string;
  subtitle: string;
  primary: string;
  onPrimary: () => void;
  onBack: () => void;
  backTitle: string;
}) {
  return (
    <Screen>
      <Host pose="rest" height={330} />
      <Text style={[s.title, { textAlign: 'center', color: colors.gold }]}>
        {title}
      </Text>
      <Text style={[s.body, { textAlign: 'center' }]}>{subtitle}</Text>
      <Button title={primary} onPress={onPrimary} />
      <Button title={backTitle} secondary onPress={onBack} />
    </Screen>
  );
}
export function TabIcon({ name, color }: { name: string; color: string }) {
  return (
    <Svg
      width={23}
      height={23}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.6}
    >
      {name === 'Challenges' ? (
        <>
          <Rect x="3" y="4" width="18" height="13" rx="3" />
          <Path d="M7 8h10M7 12h7M14 17l4 4v-4" />
        </>
      ) : name === 'Sessions' ? (
        <>
          <Circle cx="12" cy="12" r="9" />
          <Path d="M12 6v6l4 3" />
        </>
      ) : name === 'Discover' ? (
        <>
          <Circle cx="12" cy="12" r="9" />
          <Circle cx="12" cy="12" r="2" />
          <Path d="M12 3v7m0 4v7M3 12h7m4 0h7M6 6l4 4m4 4l4 4M6 18l4-4m4-4l4-4" />
        </>
      ) : name === 'Calculator' ? (
        <>
          <Rect x="5" y="2" width="14" height="20" rx="3" />
          <Path d="M8 6h8M8 11h2m4 0h2M8 15h2m4 0h2M8 18h2m4 0h2" />
        </>
      ) : (
        <>
          <Path d="M4 8h13v8a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Zm13 1h2a3 3 0 0 1 0 6h-2M6 2v3m5-3v3m5-3v3" />
        </>
      )}
    </Svg>
  );
}
const ui = StyleSheet.create({
  categoryScroll: { flexGrow: 0, flexShrink: 0 },
  categoryContent: { gap: 8, alignItems: 'center', paddingVertical: 2 },
  scrollContent: { flexGrow: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 150,
  },
  button: {
    overflow: 'hidden',
    flexShrink: 0,
    minHeight: 54,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 15,
  },
  shadow: {
    shadowColor: colors.gold,
    shadowOpacity: 0.2,
    shadowRadius: 13,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  chip: {
    maxWidth: '100%',
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: {
    height: 43,
    width: 43,
    borderRadius: 13,
    backgroundColor: '#3B2850',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
