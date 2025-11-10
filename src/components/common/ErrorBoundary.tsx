import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { logger } from '@/services/logger';

interface Props {
  children: ReactNode;
  fallback?: (_error: Error, _resetError: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error with full context to Sentry
    logger.fatal('ErrorBoundary caught an error', error, {
      componentStack: errorInfo.componentStack,
    });
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      return (
        <View style={styles.container}>
          <Text style={styles.icon}>⚠️</Text>
          <Text style={styles.title}>Algo salió mal</Text>
          <Text style={styles.message}>
            Ha ocurrido un error inesperado. Por favor, intenta de nuevo.
          </Text>

          {__DEV__ && (
            <View style={styles.errorDetails}>
              <Text style={styles.errorTitle}>Error Details (DEV only):</Text>
              <Text style={styles.errorText}>{this.state.error.message}</Text>
              <Text style={styles.errorStack}>
                {this.state.error.stack?.substring(0, 500)}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={this.resetError}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>🔄 Intentar de nuevo</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC'
  },
  icon: {
    fontSize: 64,
    marginBottom: 16
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center'
  },
  message: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center'
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  errorDetails: {
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
    width: '100%',
    maxHeight: 200
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 8
  },
  errorText: {
    fontSize: 12,
    color: '#7F1D1D',
    marginBottom: 8,
    fontFamily: 'monospace'
  },
  errorStack: {
    fontSize: 10,
    color: '#991B1B',
    fontFamily: 'monospace'
  }
});
