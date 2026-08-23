import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, Surface, Switch, HelperText } from 'react-native-paper';
import { router } from 'expo-router';
import { createStoreAndOwner } from '@/database/repositories/storeRepo';

export default function OnboardingScreen() {
  const [storeName, setStoreName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [taxRate, setTaxRate] = useState('11');
  const [ownerName, setOwnerName] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const isPinValid = pin.length === 6 && /^\d+$/.test(pin);

  async function handleSubmit() {
    if (!storeName.trim()) {
      Alert.alert('Error', 'Nama Toko Wajib Diisi');
      return;
    }
    if (!ownerName.trim()) {
      Alert.alert('Error', 'Nama Pemilik Wajib Diisi');
      return;
    }
    if (!isPinValid) {
      Alert.alert('Error', 'PIN harus berupa 6 angka');
      return;
    }

    try {
      setLoading(true);
      await createStoreAndOwner({
        storeName: storeName.trim(),
        address: address.trim(),
        phone: phone.trim(),
        taxEnabled,
        taxRate: parseFloat(taxRate) || 0,
        ownerName: ownerName.trim(),
        pin,
      });

      router.replace('/(tabs)');
    } catch (error) {
      console.error(error);
      Alert.alert('Gagal', 'Terjadi kesalahan saat menyimpan data toko.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Surface style={styles.card} elevation={1}>
        <Text variant="headlineSmall" style={styles.title}>
          Setup Toko Pertama Anda
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Isi profil usaha untuk memulai sistem KasirKita POS.
        </Text>

        <TextInput
          label="Nama Toko / Usaha *"
          value={storeName}
          onChangeText={setStoreName}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Nama Pemilik (Owner) *"
          value={ownerName}
          onChangeText={setOwnerName}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Nomor Telepon"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Alamat Toko"
          value={address}
          onChangeText={setAddress}
          multiline
          numberOfLines={2}
          mode="outlined"
          style={styles.input}
        />

        <View style={styles.row}>
          <Text variant="titleMedium">Aktifkan PPN / Pajak</Text>
          <Switch value={taxEnabled} onValueChange={setTaxEnabled} color="#4F46E5" />
        </View>

        {taxEnabled && (
          <TextInput
            label="Tarif Pajak (%)"
            value={taxRate}
            onChangeText={setTaxRate}
            keyboardType="decimal-pad"
            mode="outlined"
            style={styles.input}
          />
        )}

        <TextInput
          label="PIN 6 Digit Owner *"
          value={pin}
          onChangeText={setPin}
          keyboardType="numeric"
          maxLength={6}
          secureTextEntry
          mode="outlined"
          style={styles.input}
        />
        <HelperText type="info" visible={true}>
          PIN ini digunakan untuk login dan mengakses fitur Owner.
        </HelperText>

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.button}
          contentStyle={{ paddingVertical: 6 }}
        >
          Simpan & Mulai Kasir
        </Button>
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    paddingTop: 48,
  },
  card: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  subtitle: {
    color: '#64748B',
    marginBottom: 20,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  button: {
    marginTop: 16,
    backgroundColor: '#4F46E5',
    borderRadius: 8,
  },
});
