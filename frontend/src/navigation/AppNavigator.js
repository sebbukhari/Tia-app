import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import screens
import LoadingScreen from '../screens/LoadingScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import DonateScreen from '../screens/DonateScreen';
import EventsScreen from '../screens/EventsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import DonationHistoryScreen from '../screens/DonationHistoryScreen';

import { COLORS } from '../constants/config';
import authService from '../services/authService';
import { updateUserData } from '../store/slices/authSlice';
import { setOnboardingCompleted } from '../store/slices/appSlice';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: COLORS.background },
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        switch (route.name) {
          case 'Home':
            iconName = 'home';
            break;
          case 'Donate':
            iconName = 'favorite';
            break;
          case 'Events':
            iconName = 'event';
            break;
          case 'Profile':
            iconName = 'person';
            break;
          default:
            iconName = 'home';
        }

        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.textSecondary,
      tabBarStyle: {
        backgroundColor: COLORS.background,
        borderTopColor: COLORS.border,
        height: 60,
        paddingBottom: 8,
        paddingTop: 8,
      },
      headerStyle: {
        backgroundColor: COLORS.primary,
      },
      headerTintColor: COLORS.textLight,
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    })}
  >
    <Tab.Screen 
      name="Home" 
      component={HomeScreen} 
      options={{ title: 'Home' }}
    />
    <Tab.Screen 
      name="Donate" 
      component={DonateScreen} 
      options={{ title: 'Donate' }}
    />
    <Tab.Screen 
      name="Events" 
      component={EventsScreen} 
      options={{ title: 'Events' }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen} 
      options={{ title: 'Profile' }}
    />
  </Tab.Navigator>
);

const MainStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: COLORS.primary,
      },
      headerTintColor: COLORS.textLight,
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen 
      name="MainTabs" 
      component={MainTabs} 
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="EventDetail" 
      component={EventDetailScreen} 
      options={{ title: 'Event Details' }}
    />
    <Stack.Screen 
      name="DonationHistory" 
      component={DonationHistoryScreen} 
      options={{ title: 'Donation History' }}
    />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading } = useSelector(state => state.auth);
  const { isOnboardingCompleted } = useSelector(state => state.app);
  
  const [isInitializing, setIsInitializing] = React.useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if user is already authenticated
        const token = await authService.getStoredToken();
        const userData = await authService.getStoredUserData();
        
        if (token && userData) {
          // Verify token is still valid by getting current user data
          try {
            await authService.getMe();
            // If successful, update Redux state with stored data
            dispatch(updateUserData(userData));
          } catch (error) {
            // Token is invalid, clear storage
            await authService.logout();
          }
        }
      } catch (error) {
        console.log('Initialization error:', error);
        // Clear any invalid tokens
        await authService.logout();
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, [dispatch]);

  if (isInitializing || isLoading) {
    return <LoadingScreen />;
  }

  if (!isOnboardingCompleted) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      </Stack.Navigator>
    );
  }

  if (!isAuthenticated) {
    return <AuthStack />;
  }

  return <MainStack />;
};

export default AppNavigator;