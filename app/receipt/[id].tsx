import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Surface, Text, Button, Divider } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { getTransactionById } from '@/database/repositories/transactionRepo';
import { getStoreProfile } from '@/database/repositories/storeRepo';
import { StoreProfile } from '@/types';

export default function ReceiptScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<{ transaction: any; items: any[] } | null>(null);
  const [store, setStore] = useState<StoreProfile | null>(null);

  useEffect(() => {
    async function loadReceipt() {
      if (!id) return;
      const res = await getTransactionById(id);
      const st = await getStoreProfile();
      setData(res);
      setStore(st);
    }
    loadReceipt();
  }, [id]);

  if (!data || !store) {
    return (
      <View style={styles.center}>
        <Text>Memuat struk...</Text>
      </View>
    );
  }

  const { transaction, items } = data;

  const generateReceiptText = () => {
    let text = `${store.name}\n${store.address}\nTelp: ${store.phone}\n`;
    text += `================================\n`;
    text += `No: ${transaction.transaction_no}\n`;
    text += `Tgl: ${new Date(transaction.created_at).toLocaleString('id-ID')}\n`;
    text += `================================\n`;
    items.forEach((item) => {
      text += `${item.product_name}\n`;
      text += `${item.quantity} x Rp ${item.selling_price.toLocaleString('id-ID')} = Rp ${item.total_price.toLocaleString('id-ID')}\n`;
    });
    text += `================================\n`;
    text += `Subtotal: Rp ${transaction.subtotal.toLocaleString('id-ID')}\n`;
    if (transaction.discount_amount > 0) {
      text += `Diskon: -Rp ${transaction.discount_amount.toLocaleString('id-ID')}\n`;
    }
    if (transaction.tax_amount > 0) {
      text += `PPN: Rp ${transaction.tax_amount.toLocaleString('id-ID')}\n`;
    }
    text += `TOTAL: Rp ${transaction.grand_total.toLocaleString('id-ID')}\n`;
    text += `Bayar (${transaction.payment_method}): Rp ${transaction.paid_amount.toLocaleString('id-ID')}\n`;
    text += `Kembali: Rp ${transaction.change_amount.toLocaleString('id-ID')}\n`;
    text += `================================\n`;
    text += `Terima Kasih Atas Kunjungan Anda!\n`;
    return text;
  };

  async function handleShareReceipt() {
    try {
      const receiptText = generateReceiptText();
      const fileUri = `${FileSystem.cacheDirectory}struk_${transaction.transaction_no.replace(/\//g, '_')}.txt`;
      await FileSystem.writeAsStringAsync(fileUri, receiptText);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/plain',
          dialogTitle: 'Bagikan Struk Transaksi',
        });
      } else {
        Alert.alert('Berhasil', receiptText);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Gagal membagikan struk.');
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Surface style={styles.receiptCard} elevation={2}>
        <Text style={styles.storeName}>{store.name}</Text>
        <Text style={styles.storeAddress}>{store.address}</Text>
        <Text style={styles.storeAddress}>Telp: {store.phone}</Text>
        <Divider style={styles.divider} />

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>No: {transaction.transaction_no}</Text>
          <Text style={styles.metaText}>{new Date(transaction.created_at).toLocaleDateString('id-ID')}</Text>
        </View>
        <Divider style={styles.divider} />

        {items.map((item) => (
          <View key={item.id} style={styles.itemBlock}>
            <Text style={styles.itemName}>{item.product_name}</Text>
            <View style={styles.itemDetail}>
              <Text style={styles.itemQty}>{item.quantity} x Rp {item.selling_price.toLocaleString('id-ID')}</Text>
              <Text style={styles.itemTotal}>Rp {item.total_price.toLocaleString('id-ID')}</Text>
            </View>
          </View>
        ))}

        <Divider style={styles.divider} />

        <View style={styles.summaryRow}>
          <Text>Subtotal</Text>
          <Text>Rp {transaction.subtotal.toLocaleString('id-ID')}</Text>
        </View>
        {transaction.discount_amount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={{ color: '#EF4444' }}>Diskon</Text>
            <Text style={{ color: '#EF4444' }}>-Rp {transaction.discount_amount.toLocaleString('id-ID')}</Text>
          </View>
        )}
        {transaction.tax_amount > 0 && (
          <View style={styles.summaryRow}>
            <Text>PPN</Text>
            <Text>Rp {transaction.tax_amount.toLocaleString('id-ID')}</Text>
          </View>
        )}

        <Divider style={styles.divider} />

        <View style={styles.summaryRow}>
          <Text style={styles.grandLabel}>TOTAL</Text>
          <Text style={styles.grandValue}>Rp {transaction.grand_total.toLocaleString('id-ID')}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Bayar ({transaction.payment_method})</Text>
          <Text>Rp {transaction.paid_amount.toLocaleString('id-ID')}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Kembali</Text>
          <Text>Rp {transaction.change_amount.toLocaleString('id-ID')}</Text>
        </View>

        <Divider style={styles.divider} />
        <Text style={styles.footerText}>Terima Kasih Atas Kunjungan Anda!</Text>
      </Surface>

      <View style={styles.actionRow}>
        <Button mode="outlined" style={{ flex: 1, marginRight: 8 }} onPress={() => router.replace('/(tabs)/pos')}>
          Transaksi Baru
        </Button>
        <Button mode="contained" style={{ flex: 1, backgroundColor: '#4F46E5' }} onPress={handleShareReceipt}>
          Bagikan Struk
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  receiptCard: { padding: 20, borderRadius: 12, backgroundColor: '#FFFFFF' },
  storeName: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#1E293B' },
  storeAddress: { fontSize: 12, color: '#64748B', textAlign: 'center' },
  divider: { marginVertical: 12 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metaText: { fontSize: 12, color: '#64748B' },
  itemBlock: { marginBottom: 8 },
  itemName: { fontWeight: '600', color: '#1E293B' },
  itemDetail: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  itemQty: { fontSize: 12, color: '#64748B' },
  itemTotal: { fontSize: 12, fontWeight: 'bold' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 2 },
  grandLabel: { fontWeight: 'bold', fontSize: 16 },
  grandValue: { fontWeight: 'bold', fontSize: 16, color: '#4F46E5' },
  footerText: { textAlign: 'center', color: '#64748B', fontSize: 12, fontStyle: 'italic' },
  actionRow: { flexDirection: 'row', marginTop: 16 },
});
