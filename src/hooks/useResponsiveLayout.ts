import { useWindowDimensions } from 'react-native';

export function useResponsiveLayout() {
  const { width, height, fontScale } = useWindowDimensions();
  const compact = width < 375 || height < 700;
  const singleColumn = width < 350 || fontScale > 1.3;
  const padding = compact ? 14 : 20;
  return {
    width,
    height,
    compact,
    singleColumn,
    padding,
    gap: compact ? 12 : 16,
    contentWidth: Math.min(width, 560) - padding * 2,
    hostHeight: Math.min(330, height * (compact ? 0.31 : 0.43)),
    timerHeight: Math.min(360, height * (compact ? 0.38 : 0.45)),
    titleSize: compact ? 25 : 29,
  };
}
