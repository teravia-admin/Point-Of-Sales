import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Surface, Text, Button, TextInput, SegmentedButtons, Divider } from 'react-native-paper';
import { router } from 'expo-router';
import { useCartStore } from '@/store/cartStore';
import { calculateTransaction } from '@/services/calculationService';
import { createTransaction } from '@/database/repositories/transactionRepo';
import { getStoreProfile } from '@/database/repositories/storeRepo';
import { PaymentMethod } from '@/types';

export default function CheckoutScreen() {
  const { items, discountType, discountValue, clearCart } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [paidAmountText, setPaidAmountText] = useState('');
  const [loading, setLoading] = useState(false);
  const [storeTaxEnabled, setStoreTaxEnabled] = useState(true);
  const [storeTaxRate, setStoreTaxRate] = useState(11);

  useEffect(() => {
    async function loadStoreConfig() {
      const store = await getStoreProfile();
      if (store) {
        setStoreTaxEnabled(store.tax_enabled);
        setStoreTaxRate(store.tax_rate);
      }
    }
    loadStoreConfig();
  }, []);

  const calculationItems = items.map((i) => ({
    price: i.product.selling_price,
    quantity: i.quantity,
  }));

  const calc = calculateTransaction(
    calculationItems,
    discountType,
    discountValue,
    storeTaxEnabled,
    storeTaxRate
  );

  const paidAmount = parseFloat(paidAmountText) || 0;
  const changeAmount = paidAmount - calc.grandTotal;

  async function handleProcessPayment() {
    if (paymentMethod === 'CASH' && paidAmount < calc.grandTotal) {
      Alert.alert('Uang Kurang', 'Jumlah pembayaran tunai kurang dari total tagihan.');
      return;
    }

    try {
      setLoading(true);
      // Untuk MVP: shiftId default dummy jika shift aktif belum diautentikasi
      const shiftId = 'shift_default';

      const trxId = await createTransaction({
        shiftId,
        subtotal: calc.subtotal,
        discountAmount: calc.discountAmount,
        taxAmount: calc.taxAmount,
        grandTotal: calc.grandTotal,
        paidAmount: paymentMethod === 'CASH' ? paidAmount : calc.grandTotal,
        changeAmount: paymentMethod === 'CASH' ? Math.max(0, changeAmount) : 0,
        paymentMethod,
        items,
      });

      clearCart();
      router.replace(`/receipt/${trxId}`);
    } catch (error) {
      console.error(error);
      Alert.alert('Gagal', 'Terjadi kesalahan saat menyimpan transaksi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Surface style={styles.card} elevation={1}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Ringkasan Pembayaran</Text>
        
        <View style={styles.row}>
          <Text style={styles.label}>Subtotal</Text>
          <Text style={styles.value}>Rp {calc.subtotal.toLocaleString('id-ID')}</Text>
        </View>

        {calc.discountAmount > 0 && (
          <View style={styles.row}>
            <Text style={[styles.label, { color: '#EF4444' }]}>Diskon</Text>
            <Text style={[styles.value, { color: '#EF4444' }]}>- Rp {calc.discountAmount.toLocaleString('id-ID')}</Text>
          </View>
        )}

        {calc.taxAmount > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>PPN ({storeTaxRate}%)</Text>
            <Text style={styles.value}>Rp {calc.taxAmount.toLocaleString('id-ID')}</Text>
          </View>
        )}

        <Divider style={{ marginVertical: 8 }} />

        <View style={styles.row}>
          <Text style={styles.totalLabel}>Grand Total</Text>
          <Text style={styles.totalValue}>Rp {calc.grandTotal.toLocaleString('id-ID')}</Text>
        </View>
      </Surface>

      <Surface style={[styles.card, { marginTop: 12 }]} elevation={1}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Metode Pembayaran</Text>
        
        <SegmentedButtons
          value={paymentMethod}
          onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}
          buttons={[
            { value: 'CASH', label: 'Cash' },
            { value: 'QRIS', label: 'QRIS' },
            { value: 'TRANSFER', label: 'Transfer' },
          ]}
          style={{ marginBottom: 12 }}
        />

        {paymentMethod === 'CASH' && (
          <>
            <TextInput
              label="Uang Dibayar (Rp) *"
              value={paidAmountText}
              onChangeText={setPaidAmountText}
              keyboardType="numeric"
              mode="outlined"
              style={{ marginBottom: 8 }}
            />

            <View style={styles.quickPayRow}>
              <Button mode="outlined" onPress={() => setPaidAmountText(calc.grandTotal.toString())} style={styles.quickBtn}>
                Uang Pas
              </Button>
              <Button mode="outlined" onPress={() => setPaidAmountText((Math.ceil(calc.grandTotal / 50000) * 50000).toString())} style={styles.quickBtn}>
                Pecahan Bulat
              </Button>
            </View>

            <View style={[styles.row, { marginTop: 12 }]}>
              <Text style={styles.totalLabel}>Kembalian</Text>
              <Text style={[styles.totalValue, { color: changeAmount < 0 ? '#EF4444' : '#10B981' }]}>
                Rp {Math.max(0, changeAmount).toLocaleString('id-ID')}
              </Text>
            </View>
          </>
        )}
      </Surface>

      <Button
        mode="contained"
        onPress={handleProcessPayment}
        loading={loading}
        disabled={loading}
        style={styles.payBtn}
        contentStyle={{ paddingVertical: 8 }}
      >
        Selesaikan Transaksi
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  card: { padding: 16, borderRadius: 12, backgroundColor: '#FFFFFF' },
  sectionTitle: { fontWeight: 'bold', marginBottom: 12, color: '#1E293B' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  label: { color: '#64748B' },
  value: { fontWeight: '600', color: '#1E293B' },
  totalLabel: { fontWeight: 'bold', fontSize: 16, color: '#1E293B' },
  totalValue: { fontWeight: 'bold', fontSize: 18, color: '#4F46E5' },
  quickPayRow: { flexDirection: 'row', justifyContent: 'space-between' },
  quickBtn: { flex: 1, marginHorizontal: 4 },
  payBtn: { marginTop: 16, backgroundColor: '#4F46E5', borderRadius: 8 },
});
