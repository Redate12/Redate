import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

// Screens
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import SwipeScreen from './src/screens/SwipeScreen';
import MatchesScreen from './src/screens/MatchesScreen';
import ChatScreen from './src/screens/ChatScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Constants
import {COLORS} from './src/constants/colors';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Onboarding"
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.background,
          },
          headerTintColor: COLORS.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="MainApp"
          component={MainTabs}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={({route}) => ({
            title: 'Chat',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Simple tab navigation for main app
function MainTabs({navigation}) {
  const [activeTab, setActiveTab] = React.useState('Swipe');

  const renderScreen = () => {
    switch (activeTab) {
      case 'Swipe':
        return <SwipeScreen navigation={navigation} />;
      case 'Matches':
        return <MatchesScreen navigation={navigation} />;
      case 'Profile':
        return <ProfileScreen navigation={navigation} />;
      default:
        return <SwipeScreen navigation={navigation} />;
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.background,
      }}>
      {renderScreen()}

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TabBarButton
          icon="💕"
          label="Swipe"
          active={activeTab === 'Swipe'}
          onPress={() => setActiveTab('Swipe')}
        />
        <TabBarButton
          icon="💬"
          label="Matches"
          active={activeTab === 'Matches'}
          onPress={() => setActiveTab('Matches')}
        />
        <TabBarButton
          icon="👤"
          label="Perfil"
          active={activeTab === 'Profile'}
          onPress={() => setActiveTab('Profile')}
        />
      </View>
    </View>
  );
}

function TabBarButton({icon, label, active, onPress}) {
  return (
    <TouchableOpacity
      style={styles.tabButton}
      onPress={onPress}
      activeOpacity={0.7}>
      <Text style={[styles.tabIcon, active && styles.tabIconActive]}>
        {icon}
      </Text>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = {
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingBottom: 20,
    paddingTop: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  tabIconActive: {
    transform: [{scale: 1.1}],
  },
  tabLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
};

export default App;