import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function POSScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Layar Kasir / POS</Text>
      <Text style={styles.subtitle}>Katalog produk dan keranjang akan tampil di sini.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
});
