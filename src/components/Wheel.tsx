import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';
import { colors } from '../theme';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
const palette = [
  '#7023A3',
  '#203F66',
  '#8E1A38',
  '#BC0B59',
  '#007E60',
  '#954206',
  '#2544A8',
  '#46413A',
];
export type WheelHandle = {
  spin: (onComplete?: (value: string) => void) => void;
};
type WheelProps = {
  items: string[];
  onResult: (value: string) => void;
  onSpinningChange?: (spinning: boolean) => void;
};
export const Wheel = forwardRef<WheelHandle, WheelProps>(function Wheel(
  { items, onResult, onSpinningChange },
  ref,
) {
  const rotation = useRef(new Animated.Value(0)).current;
  const position = useRef(0);
  const mounted = useRef(true);
  const resultDelay = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [landed, setLanded] = useState<number | null>(null);
  const busy = useRef(false);
  const [spinning, setSpinning] = useState(false);
  const layout = useResponsiveLayout();
  const size = Math.min(layout.contentWidth - 16, layout.compact ? 260 : 320);
  const slice = 360 / items.length;
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (resultDelay.current) {
        clearTimeout(resultDelay.current);
      }
      rotation.stopAnimation();
    };
  }, [rotation]);
  const spin = (onComplete?: (value: string) => void) => {
    if (busy.current || !items.length) {
      return;
    }
    busy.current = true;
    setSpinning(true);
    setLanded(null);
    onSpinningChange?.(true);
    const selected = Math.floor(Math.random() * items.length);
    const target = 360 - (selected * slice + slice / 2);
    position.current = Math.ceil(position.current / 360) * 360 + 2160 + target;
    Animated.timing(rotation, {
      toValue: position.current,
      duration: 4400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!mounted.current) {
        return;
      }
      if (!finished) {
        busy.current = false;
        setSpinning(false);
        onSpinningChange?.(false);
        return;
      }
      setLanded(selected);
      resultDelay.current = setTimeout(() => {
        if (!mounted.current) {
          return;
        }
        busy.current = false;
        setSpinning(false);
        onSpinningChange?.(false);
        (onComplete || onResult)(items[selected]);
      }, 500);
    });
  };
  useImperativeHandle(ref, () => ({ spin }));
  return (
    <View style={{ alignItems: 'center', gap: 20, paddingVertical: 12 }}>
      <View
        style={{
          width: 14,
          height: 18,
          backgroundColor: colors.gold,
          borderRadius: 4,
          marginBottom: -27,
          zIndex: 2,
          shadowColor: colors.gold,
          shadowRadius: 10,
          shadowOpacity: 0.8,
          shadowOffset: { width: 0, height: 0 },
        }}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Spin wheel"
        accessibilityState={{ disabled: spinning, busy: spinning }}
        disabled={spinning}
        onPress={() => spin()}
        style={{ width: size, height: size }}
      >
        <Animated.View
          collapsable={false}
          pointerEvents="none"
          style={{
            width: size,
            height: size,
            transform: [
              {
                rotate: rotation.interpolate({
                  inputRange: [0, 360],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
          }}
        >
          <Svg viewBox="0 0 320 320" width={size} height={size}>
            <Circle
              cx="160"
              cy="160"
              r="157"
              fill={colors.card}
              stroke={colors.border}
              strokeWidth="3"
            />
            {items.map((label, i) => {
              const a = ((i * slice - 90) * Math.PI) / 180;
              const b = (((i + 1) * slice - 90) * Math.PI) / 180;
              const angle = i * slice + slice / 2;
              return (
                <G key={label}>
                  <Path
                    d={`M160 160 L${160 + 148 * Math.cos(a)} ${
                      160 + 148 * Math.sin(a)
                    } A148 148 0 ${slice > 180 ? 1 : 0} 1 ${
                      160 + 148 * Math.cos(b)
                    } ${160 + 148 * Math.sin(b)} Z`}
                    fill={palette[i % palette.length]}
                    stroke={landed === i ? colors.gold : colors.background}
                    strokeWidth={landed === i ? 4 : 1.5}
                  />
                  <SvgText
                    x="160"
                    y="66"
                    fill="white"
                    fontWeight="700"
                    fontSize={items.length > 8 ? 8 : 11}
                    textAnchor="middle"
                    rotation={angle}
                    origin="160, 160"
                  >
                    {label}
                  </SvgText>
                </G>
              );
            })}
          </Svg>
        </Animated.View>
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: size / 2 - 31,
            left: size / 2 - 31,
            width: 62,
            height: 62,
            borderRadius: 31,
            borderWidth: 3,
            borderColor: colors.gold,
            backgroundColor: '#28133B',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: colors.gold, fontSize: 11, fontWeight: '800' }}>
            {landed !== null ? '✓' : spinning ? '•••' : 'SPIN'}
          </Text>
        </View>
      </Pressable>
      <Text style={{ fontSize: 12, color: colors.faint }}>
        {landed !== null
          ? items[landed]
          : spinning
          ? 'Spinning…'
          : 'Tap the wheel to spin'}
      </Text>
    </View>
  );
});
