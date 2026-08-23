import React, { useState } from 'react';
import { View, StyleSheet, FlatList, ScrollView } from 'react-native';
import { Surface, Text, IconButton, Button, Divider, TextInput, SegmentedButtons, Portal, Dialog } from 'react-native-paper';
import { useCartStore } from '@/store/cartStore';
import { OrderType } from '@/types';
import { router } from 'expo-router';

interface CartBottomSheetProps {
  onClose: () => void;
}

export function CartBottomSheet({ onClose }: CartBottomSheetProps) {
  const {
    items,
    customerName,
    tableNumber,
    orderType,
    updateQuantity,
    updateItemNotes,
    setCustomerInfo,
    setOrderType,
    getSubtotal,
    getDiscountAmount,
    clearCart,
  } = useCartStore();

  const [noteDialogVisible, setNoteDialogVisible] = useState(false);
  const [selectedProdId, setSelectedProdId] = useState<string | null>(null);
  const [currentNoteText, setCurrentNoteText] = useState('');

  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const grandTotal = subtotal - discount;

  function openNoteModal(productId: string, existingNote?: string) {
    setSelectedProdId(productId);
    setCurrentNoteText(existingNote || '');
    setNoteDialogVisible(true);
  }

  function saveNote() {
    if (selectedProdId) {
      updateItemNotes(selectedProdId, currentNoteText);
    }
    setNoteDialogVisible(false);
  }

  return (
    <Surface style={styles.container} elevation={4}>
      <View style={styles.header}>
        <Text variant="titleMedium" style={styles.title}>Keranjang Belanja ({items.length})</Text>
        <IconButton icon="close" size={20} onPress={onClose} />
      </View>
      <Divider />

      <ScrollView style={{ maxHeight: 400 }}>
        {/* Detail Pelanggan & Meja */}
        <View style={styles.customerSection}>
          <SegmentedButtons
            value={orderType}
            onValueChange={(val) => setOrderType(val as OrderType)}
            buttons={[
              { value: 'DINE_IN', label: 'Dine In' },
              { value: 'TAKEAWAY', label: 'Takeaway' },
              { value: 'ONLINE', label: 'Online' },
            ]}
            style={styles.segmented}
          />

          <View style={styles.inputRow}>
            <TextInput
              label="A.n Pelanggan"
              value={customerName}
              onChangeText={(val) => setCustomerInfo(val, tableNumber)}
              mode="outlined"
              dense
              style={[styles.input, { flex: 2, marginRight: 6 }]}
            />
            {orderType === 'DINE_IN' && (
              <TextInput
                label="No. Meja"
                value={tableNumber}
                onChangeText={(val) => setCustomerInfo(customerName, val)}
                mode="outlined"
                dense
                style={[styles.input, { flex: 1 }]}
              />
            )}
          </View>
        </View>

        <Divider />

        {/* Daftar Items */}
        <FlatList
          data={items}
          scrollEnabled={false}
          keyExtractor={(item) => item.product.id}
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.product.name}</Text>
                <Text style={styles.itemPrice}>
                  Rp {(item.product.selling_price * item.quantity).toLocaleString('id-ID')}
                </Text>

                {item.notes ? (
                  <Text style={styles.noteText}>Catatan: "{item.notes}"</Text>
                ) : null}

                <Button
                  compact
                  mode="text"
                  onPress={() => openNoteModal(item.product.id, item.notes)}
                  contentStyle={{ height: 24 }}
                  labelStyle={{ fontSize: 10, color: '#4F46E5' }}
                >
                  {item.notes ? 'Edit Catatan' : '+ Catatan Menu'}
                </Button>
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
        />
      </ScrollView>

      <Divider />
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total Target</Text>
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
            Lanjut Bayar
          </Button>
        </View>
      </View>

      <Portal>
        <Dialog visible={noteDialogVisible} onDismiss={() => setNoteDialogVisible(false)}>
          <Dialog.Title>Catatan Pesanan</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Contoh: Pedas sedang, Tanpa es"
              value={currentNoteText}
              onChangeText={setCurrentNoteText}
              mode="outlined"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setNoteDialogVisible(false)}>Batal</Button>
            <Button onPress={saveNote}>Simpan</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontWeight: 'bold' },
  customerSection: { marginVertical: 8 },
  segmented: { marginBottom: 8 },
  inputRow: { flexDirection: 'row' },
  input: { backgroundColor: '#FFFFFF' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 6 },
  itemInfo: { flex: 1, alignItems: 'flex-start' },
  itemName: { fontWeight: '600', color: '#1E293B' },
  itemPrice: { color: '#64748B', fontSize: 12 },
  noteText: { fontSize: 11, fontStyle: 'italic', color: '#D97706', marginTop: 2 },
  qtyControls: { flexDirection: 'row', alignItems: 'center' },
  qtyText: { fontWeight: 'bold', paddingHorizontal: 4 },
  summary: { marginTop: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  totalLabel: { fontWeight: 'bold', fontSize: 16 },
  totalValue: { fontWeight: 'bold', fontSize: 16, color: '#4F46E5' },
  actions: { flexDirection: 'row', marginTop: 12 },
});
