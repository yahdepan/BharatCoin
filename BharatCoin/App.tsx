import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/Ionicons';

import { AppProvider } from './src/context/AppContext';
import MineScreen from './src/screens/MineScreen';
import ChatScreen from './src/screens/ChatScreen';
import TransferScreen from './src/screens/TransferScreen';
import VideoScreen from './src/screens/VideoScreen';

const Tab = createBottomTabNavigator();

const C = {
  bg: '#F0F4FF',
  surface: '#FFFFFF',
  navy: '#0D1B4B',
  blue: '#1A56DB',
  accent: '#00C2FF',
  border: '#D6E0FF',
  muted: '#8A9BBF',
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <NavigationContainer>
            <Tab.Navigator
              screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                  const icons = {
                    Mine: focused ? 'hammer' : 'hammer-outline',
                    Chat: focused ? 'chatbubbles' : 'chatbubbles-outline',
                    Transfer: focused ? 'swap-horizontal' : 'swap-horizontal-outline',
                    Video: focused ? 'videocam' : 'videocam-outline',
                  };
                  return <Icon name={icons[route.name]} size={size} color={color} />;
                },
                tabBarActiveTintColor: C.blue,
                tabBarInactiveTintColor: C.muted,
                tabBarStyle: {
                  backgroundColor: C.surface,
                  borderTopColor: C.border,
                  height: 62,
                  paddingBottom: 8,
                  paddingTop: 4,
                },
                tabBarLabelStyle: {
                  fontSize: 11,
                  fontWeight: '600',
                },
                headerStyle: {
                  backgroundColor: C.surface,
                  borderBottomColor: C.border,
                  borderBottomWidth: 1,
                  elevation: 0,
                  shadowOpacity: 0,
                },
                headerTitleStyle: {
                  color: C.navy,
                  fontWeight: '700',
                  fontSize: 17,
                },
              })}
            >
              <Tab.Screen name="Mine" component={MineScreen} options={{ title: '⛏ Mine' }} />
              <Tab.Screen name="Chat" component={ChatScreen} options={{ title: '💬 Chat' }} />
              <Tab.Screen name="Transfer" component={TransferScreen} options={{ title: '⇄ Transfer' }} />
              <Tab.Screen name="Video" component={VideoScreen} options={{ title: '▶ Video' }} />
            </Tab.Navigator>
          </NavigationContainer>
          <Toast />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
