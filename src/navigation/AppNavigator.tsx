import React, { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ChallengesScreen } from '../screens/ChallengesScreen';
import { SessionsScreen } from '../screens/SessionsScreen';
import { DiscoveryScreen } from '../screens/DiscoveryScreen';
import { CalculatorScreen } from '../screens/CalculatorScreen';
import { BreaksScreen } from '../screens/BreaksScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { TabIcon } from '../components/UI';
import { useStorage } from '../storage/AppStorage';
import { colors, floatingTabBar, styles as s } from '../theme';
export type TabParams = {
  Challenges: undefined;
  Sessions: undefined;
  Discover: undefined;
  Calculator: undefined;
  Breaks: undefined;
};
type RootParams = { Onboarding: undefined; Main: undefined };
const Stack = createNativeStackNavigator<RootParams>();
const Tab = createBottomTabNavigator<TabParams>();
function Tabs() {
  return (
    <Tab.Navigator
      safeAreaInsets={{ bottom: 0 }}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarLabelPosition: 'below-icon',
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.faint,
        tabBarStyle: {
          position: 'absolute',
          bottom: floatingTabBar.bottom,
          left: floatingTabBar.horizontalInset,
          right: floatingTabBar.horizontalInset,
          height: floatingTabBar.height,
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
          borderTopWidth: 1,
          borderRadius: 24,
          paddingTop: 9,
          paddingBottom: 7,
          paddingHorizontal: 4,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 7 },
          shadowOpacity: 0.3,
          shadowRadius: 14,
          elevation: 12,
        },
        tabBarLabelStyle: { fontSize: 9, marginBottom: 3 },
        tabBarIcon: ({ color }) => <TabIcon name={route.name} color={color} />,
      })}
    >
      <Tab.Screen name="Challenges" component={ChallengesScreen} />
      <Tab.Screen name="Sessions" component={SessionsScreen} />
      <Tab.Screen name="Discover" component={DiscoveryScreen} />
      <Tab.Screen name="Calculator" component={CalculatorScreen} />
      <Tab.Screen name="Breaks" component={BreaksScreen} />
    </Tab.Navigator>
  );
}
export function AppNavigator() {
  const { state, ready, error, retry } = useStorage();
  const [loaded, setLoaded] = useState(false);
  if (!loaded) {
    return <SplashScreen onComplete={() => setLoaded(true)} />;
  }
  if (!ready) {
    return (
      <View style={[s.page, { justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }
  return (
    <View style={s.page}>
      {error && (
        <Pressable
          accessibilityRole="button"
          onPress={retry}
          style={{ padding: 14, backgroundColor: '#613034' }}
        >
          <Text style={{ color: 'white' }}>{error} Tap to retry.</Text>
        </Pressable>
      )}
      <NavigationContainer
        theme={{
          ...DarkTheme,
          colors: {
            ...DarkTheme.colors,
            background: colors.background,
            card: colors.background,
            primary: colors.gold,
            text: colors.text,
            border: colors.border,
          },
        }}
      >
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'fade',
          }}
        >
          {state.onboarded ? (
            <Stack.Screen name="Main" component={Tabs} />
          ) : (
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}
