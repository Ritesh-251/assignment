import React, { useRef, useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, BackHandler, Platform, ActivityIndicator, Alert, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';


const LOCALHOST = 'http://10.6.201.250:3000';

function BentoShell() {
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const insets = useSafeAreaInsets();


  useEffect(() => {
    const onBackPress = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [canGoBack]);

  const injectedJavaScript = `
    (function() {
      document.documentElement.style.setProperty('--bento-safe-top', '${insets.top}px');
      true;
    })();
  `;

  const handleMessage = (event) => {
    const data = event.nativeEvent.data;
    if (data === "Sync with Device") {
      Alert.alert(
        "Sync Requested",
        "The web app wants to sync with this device.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Sync",
            onPress: () => {
              const response = JSON.stringify({ deviceId: "BENTO-99", status: "Synced" });
              // postMessage can be flaky in some Expo Go versions.
              // We use injectJavaScript to directly call a global function on the web side.
              const triggerScript = `
                (function() {
                  const data = ${response};
                  if (window.onDeviceData) {
                    window.onDeviceData(data);
                  } else {
                    // Fallback to postMessage if the global handler isn't ready
                    window.postMessage(JSON.stringify(data), '*');
                  }
                })();
              `;

              if (webViewRef.current) {
                webViewRef.current.injectJavaScript(triggerScript);
              }
            }
          }
        ]
      );
    }
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setIsError(true);
  };

  const retry = () => {
    setIsError(false);
    setIsLoading(true);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load application.</Text>
        <TouchableOpacity onPress={retry} style={styles.retryButton}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <WebView
        ref={webViewRef}
        source={{ uri: LOCALHOST }}
        userAgent={Platform.OS === 'ios' ? "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1 BentoShell/1.0" : "Mozilla/5.0 (Linux; Android 10; Android SDK built for x86) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36 BentoShell/1.0"}
        injectedJavaScript={injectedJavaScript}
        onMessage={handleMessage}
        onNavigationStateChange={(navState) => {
          setCanGoBack(navState.canGoBack);
        }}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        style={{ flex: 1, backgroundColor: 'white' }}
      />

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <BentoShell />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
    color: 'red',
  },
  retryButton: {
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
  }
});
