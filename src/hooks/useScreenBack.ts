import { useCallback } from 'react';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
export function useScreenBack(enabled: boolean, back: () => void) {
  useFocusEffect(
    useCallback(() => {
      if (!enabled) {
        return;
      }
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          back();
          return true;
        },
      );
      return () => subscription.remove();
    }, [enabled, back]),
  );
}
