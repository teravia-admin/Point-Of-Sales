import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pengaturan Aplikasi</Text>
      <Text style={styles.subtitle}>Profil toko, pajak, dan backup data.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
});
