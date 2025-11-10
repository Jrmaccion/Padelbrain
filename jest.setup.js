// Mock AsyncStorage
import '@testing-library/react-native';

// Mock expo-print
jest.mock('expo-print', () => ({
  printAsync: jest.fn(),
  printToFileAsync: jest.fn(),
}));

// Mock expo-sharing
jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn(),
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
}));

// Mock @react-native-voice/voice
jest.mock('@react-native-voice/voice', () => ({
  default: {
    start: jest.fn(),
    stop: jest.fn(),
    destroy: jest.fn(),
    removeAllListeners: jest.fn(),
    onSpeechResults: jest.fn(),
    onSpeechError: jest.fn(),
  },
}));

// Mock @sentry/react-native
jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setUser: jest.fn(),
  setContext: jest.fn(),
}));

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
