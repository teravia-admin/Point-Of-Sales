import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { initDatabase, getDatabase } from '@/database/client';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#4F46E5',
    secondary: '#10B981',
    background: '#F8FAFC',
    surface: '#FFFFFF',
  },
};

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    async function prepareApp() {
      try {
        await initDatabase();
        const db = await getDatabase();
        
        // Cek apakah profil toko sudah dibuat
        const store = await db.getFirstAsync<{ id: string }>('SELECT id FROM stores LIMIT 1');
        
        setIsReady(true);
        if (!store) {
          router.replace('/onboarding');
        }
      } catch (err) {
        console.error('Initialization error:', err);
        setDbError('Gagal memuat database lokal.');
      }
    }

    prepareApp();
  }, []);

  if (dbError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{dbError}</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Memuat KasirKita POS...</Text>
      </View>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
      </Stack>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: 'bold',
  },
});
