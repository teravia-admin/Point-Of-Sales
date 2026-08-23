import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Surface, Text, IconButton, Button, Divider } from 'react-native-paper';
import { useCartStore } from '@/store/cartStore';
import { router } from 'expo-router';

interface CartBottomSheetProps {
  onClose: () => void;
}

export function CartBottomSheet({ onClose }: CartBottomSheetProps) {
  const { items, updateQuantity, getSubtotal, getDiscountAmount, clearCart } = useCartStore();
  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const grandTotal = subtotal - discount;

  return (
    <Surface style={styles.container} elevation={4}>
      <View style={styles.header}>
        <Text variant="titleMedium" style={styles.title}>Keranjang Belanja ({items.length})</Text>
        <IconButton icon="close" size={20} onPress={onClose} />
      </View>
      <Divider />

      <FlatList
        data={items}
        keyExtractor={(item) => item.product.id}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.product.name}</Text>
              <Text style={styles.itemPrice}>
                Rp {(item.product.selling_price * item.quantity).toLocaleString('id-ID')}
              </Text>
            </View>
            <View style={styles.qtyControls}>
              <IconButton
                icon="minus"
                size={16}
                onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
              />
              <Text style={styles.qtyText}>{item.quantity}</Text>
              <IconButton
                icon="plus"
                size={16}
                onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
              />
            </View>
          </View>
        )}
        style={styles.list}
      />

      <Divider />
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text>Subtotal</Text>
          <Text>Rp {subtotal.toLocaleString('id-ID')}</Text>
        </View>
        {discount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={{ color: '#EF4444' }}>Diskon</Text>
            <Text style={{ color: '#EF4444' }}>- Rp {discount.toLocaleString('id-ID')}</Text>
          </View>
        )}
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>Rp {grandTotal.toLocaleString('id-ID')}</Text>
        </View>

        <View style={styles.actions}>
          <Button mode="outlined" onPress={clearCart} style={{ flex: 1, marginRight: 8 }}>
            Kosongkan
          </Button>
          <Button
            mode="contained"
            style={{ flex: 2, backgroundColor: '#4F46E5' }}
            disabled={items.length === 0}
            onPress={() => {
              onClose();
              router.push('/checkout');
            }}
          >
            Bayar
          </Button>
        </View>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontWeight: 'bold' },
  list: { marginVertical: 8 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 4 },
  itemInfo: { flex: 1 },
  itemName: { fontWeight: '600', color: '#1E293B' },
  itemPrice: { color: '#64748B', fontSize: 12 },
  qtyControls: { flexDirection: 'row', alignItems: 'center' },
  qtyText: { fontWeight: 'bold', paddingHorizontal: 4 },
  summary: { marginTop: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 2 },
  totalLabel: { fontWeight: 'bold', fontSize: 16 },
  totalValue: { fontWeight: 'bold', fontSize: 16, color: '#4F46E5' },
  actions: { flexDirection: 'row', marginTop: 12 },
});
