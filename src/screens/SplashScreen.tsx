import { ContentEntrance } from '../components/ContentEntrance';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import React, { useEffect, useRef } from 'react';
import { Image, Text, View, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { assets } from '../assets';
import { colors, serif, styles as s } from '../theme';
const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>*{box-sizing:border-box}html,body{margin:0;background:transparent;overflow:hidden;height:100%}.dots{display:flex;justify-content:center;gap:9px;padding:8px}.dots i{width:8px;height:8px;border-radius:50%;background:#79698f;animation:pulse 1s infinite}.dots i:nth-child(2){animation-delay:.2s}.dots i:nth-child(3){animation-delay:.4s}.shelf{position:absolute;bottom:5px;left:8%;right:8%;height:62px;display:flex;justify-content:center;align-items:flex-end;gap:3px;border-bottom:5px solid #251535;border-radius:4px}.shelf i{width:5%;border-radius:3px 3px 0 0;transform-origin:bottom;animation:rise 1s both;opacity:.55}@keyframes pulse{50%{background:#f6c629;transform:translateY(-4px)}}@keyframes rise{from{transform:scaleY(0)}to{transform:scaleY(1)}}</style></head><body><div class="dots"><i></i><i></i><i></i></div><div class="shelf">${[
  44, 37, 50, 32, 47, 41, 48, 34, 52, 40, 46, 35, 50, 38, 42, 52, 36,
]
  .map(
    (h, i) =>
      `<i style="height:${h}px;background:${
        ['#642394', '#8a253c', '#233b74', '#08765a', '#964812'][i % 5]
      };animation-delay:${i * 0.06}s"></i>`,
  )
  .join(
    '',
  )}</div><script>setTimeout(function(){window.ReactNativeWebView.postMessage('finished')},4000)</script></body></html>`;
export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const layout = useResponsiveLayout();
  const { width, height } = layout;
  const done = useRef(false);
  const fallback = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callback = useRef(onComplete);
  callback.current = onComplete;
  const finish = () => {
    if (!done.current) {
      done.current = true;
      callback.current();
    }
  };
  useEffect(
    () => () => {
      if (fallback.current) {
        clearTimeout(fallback.current);
      }
    },
    [],
  );
  return (
    <SafeAreaView style={s.page}>
      <View style={splash.background}>
        <LinearGradient
          pointerEvents="none"
          colors={['#0D0914', '#251334', '#151018', '#0D0914']}
          locations={[0, 0.28, 0.62, 1]}
          style={StyleSheet.absoluteFill}
        />
        <ContentEntrance
          style={[splash.content, { paddingHorizontal: layout.padding }]}
        >
          <View
            style={{
              flex: 1,
              minHeight: 0,
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: layout.compact ? 12 : height * 0.1,
            }}
          >
            <Image
              source={assets.logo}
              style={{
                width: Math.min(
                  Math.min(width, 560) - layout.padding * 2 - 24,
                  height * (layout.compact ? 0.34 : 0.4),
                  350,
                ),
                height: Math.min(
                  Math.min(width, 560) - layout.padding * 2 - 24,
                  height * (layout.compact ? 0.34 : 0.4),
                  350,
                ),
                borderRadius: 28,
              }}
              resizeMode="cover"
            />
          </View>
          <Text
            adjustsFontSizeToFit
            numberOfLines={1}
            style={{
              width: '100%',
              textAlign: 'center',
              flexShrink: 0,
              fontFamily: serif,
              fontWeight: '700',
              fontSize: layout.compact ? 32 : 43,
              letterSpacing: layout.compact ? 2 : 4,
              color: colors.gold,
              marginTop: layout.compact ? 12 : 25,
            }}
          >
            Book Reading
          </Text>
          <Text
            style={{
              width: '100%',
              textAlign: 'center',
              flexShrink: 0,
              fontSize: 12,
              letterSpacing: layout.compact ? 2 : 4,
              color: colors.muted,
              marginTop: 10,
              marginBottom: layout.compact ? 16 : 30,
            }}
          >
            Challenge Tool Kit
          </Text>
          <View
            style={{
              height: layout.compact ? 100 : 125,
              width: '100%',
              flexShrink: 0,
            }}
          >
            <WebView
              source={{ html }}
              originWhitelist={['about:blank']}
              onShouldStartLoadWithRequest={request =>
                request.url === 'about:blank'
              }
              scrollEnabled={false}
              style={{ backgroundColor: 'transparent' }}
              onMessage={event => {
                if (event.nativeEvent.data === 'finished') {
                  finish();
                }
              }}
              onLoadEnd={() => {
                if (!fallback.current) {
                  fallback.current = setTimeout(finish, 4500);
                }
              }}
              onError={() => {
                if (!fallback.current) {
                  fallback.current = setTimeout(finish, 4000);
                }
              }}
            />
          </View>
        </ContentEntrance>
      </View>
    </SafeAreaView>
  );
}

const splash = StyleSheet.create({
  background: { flex: 1 },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    alignItems: 'center',
  },
});
