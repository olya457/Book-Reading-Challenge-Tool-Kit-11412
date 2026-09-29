import React, { useEffect, useRef } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleProp,
  ViewStyle,
} from 'react-native';

export function ContentEntrance({
  children,
  replayKey,
  style,
}: {
  children: React.ReactNode;
  replayKey?: string | number;
  style?: StyleProp<ViewStyle>;
}) {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let disposed = false;
    const reveal = (reduced: boolean) => {
      if (disposed) {
        return;
      }
      progress.stopAnimation();
      if (reduced) {
        progress.setValue(1);
        return;
      }
      progress.setValue(0);
      Animated.timing(progress, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
        isInteraction: false,
      }).start();
    };
    AccessibilityInfo.isReduceMotionEnabled()
      .then(reveal)
      .catch(() => reveal(false));
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      reveal,
    );
    return () => {
      disposed = true;
      subscription.remove();
      progress.stopAnimation();
    };
  }, [progress, replayKey]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [16, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
