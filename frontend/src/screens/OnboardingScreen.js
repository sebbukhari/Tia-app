import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useDispatch } from 'react-redux';
import AppIntroSlider from 'react-native-app-intro-slider';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { setOnboardingCompleted } from '../store/slices/appSlice';
import { COLORS, TYPOGRAPHY } from '../constants/config';

const { width } = Dimensions.get('window');

const slides = [
  {
    key: '1',
    title: 'Welcome to Tia Charity',
    text: 'Join our mission to make a positive impact in the world through charitable giving and community involvement.',
    icon: 'favorite',
    backgroundColor: COLORS.primary,
  },
  {
    key: '2',
    title: 'Easy Donations',
    text: 'Make secure donations with just a few taps. Track your giving history and see the impact you\'re making.',
    icon: 'payment',
    backgroundColor: COLORS.secondary,
  },
  {
    key: '3',
    title: 'Community Events',
    text: 'Discover and participate in local charity events. Volunteer your time and skills to help those in need.',
    icon: 'event',
    backgroundColor: COLORS.accent,
  },
  {
    key: '4',
    title: 'Get Started',
    text: 'Ready to make a difference? Create your account and start your journey of giving today.',
    icon: 'check-circle',
    backgroundColor: COLORS.primary,
  },
];

const OnboardingScreen = () => {
  const dispatch = useDispatch();

  const renderSlide = ({ item }) => {
    return (
      <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Icon name={item.icon} size={120} color={COLORS.textLight} />
          </View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.text}>{item.text}</Text>
        </View>
      </View>
    );
  };

  const renderNextButton = () => {
    return (
      <View style={styles.buttonContainer}>
        <Text style={styles.buttonText}>Next</Text>
      </View>
    );
  };

  const renderDoneButton = () => {
    return (
      <View style={styles.buttonContainer}>
        <Text style={styles.buttonText}>Get Started</Text>
      </View>
    );
  };

  const renderSkipButton = () => {
    return (
      <View style={styles.skipContainer}>
        <Text style={styles.skipText}>Skip</Text>
      </View>
    );
  };

  const onDone = () => {
    dispatch(setOnboardingCompleted(true));
  };

  const onSkip = () => {
    dispatch(setOnboardingCompleted(true));
  };

  return (
    <AppIntroSlider
      renderItem={renderSlide}
      data={slides}
      onDone={onDone}
      onSkip={onSkip}
      renderNextButton={renderNextButton}
      renderDoneButton={renderDoneButton}
      renderSkipButton={renderSkipButton}
      showSkipButton={true}
      dotStyle={styles.dot}
      activeDotStyle={styles.activeDot}
    />
  );
};

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: width * 0.8,
  },
  iconContainer: {
    width: width * 0.6,
    height: width * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 16,
  },
  text: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    backgroundColor: COLORS.textLight,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  buttonText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  skipContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  skipText: {
    color: COLORS.textLight,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  dot: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: COLORS.textLight,
    width: 12,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});

export default OnboardingScreen;