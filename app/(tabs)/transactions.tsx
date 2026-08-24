import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Searchbar, Card, Text, Chip, IconButton, Portal, Dialog, Button, Divider } from 'react-native-paper';
import { getTransactionsList, voidTransaction } from '@/database/repositories/reportRepo';
import { getTransactionById } from '@/database/repositories/transactionRepo';
import { Transaction } from '@/types';
import { router } from 'expo-router';

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [selectedTrx, setSelectedTrx] = useState<{ transaction: any; items: any[] } | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, [search]);

  async function loadTransactions() {
    const list = await getTransactionsList(search);
    setTransactions(list);
  }

  async function handleOpenDetail(id: string) {
    const res = await getTransactionById(id);
    if (res) {
      setSelectedTrx(res);
      setDetailVisible(true);
    }
  }

  function handleVoid(id: string, trxNo: string) {
    Alert.alert(
      'Pembatalan Transaksi (Void)',
      `Yakin ingin membatalkan transaksi ${trxNo}? Stok barang akan dikembalikan otomatis.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Void',
          style: 'destructive',
          onPress: async () => {
            await voidTransaction(id);
            setDetailVisible(false);
            loadTransactions();
            Alert.alert('Sukses', 'Transaksi berhasil dibatalkan.');
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Cari no. transaksi / pelanggan / meja..."
        onChangeText={setSearch}
        value={search}
        style={styles.searchbar}
      />

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isVoid = item.status === 'VOID';
          return (
            <Card style={styles.card} onPress={() => handleOpenDetail(item.id)}>
              <Card.Title
                title={item.transaction_no}
                subtitle={`${new Date(item.created_at).toLocaleString('id-ID')} | ${item.order_type}`}
                right={(props) => (
                  <View style={styles.rightBadge}>
                    <Text style={styles.priceText}>
                      Rp {item.grand_total.toLocaleString('id-ID')}
                    </Text>
                    <Chip
                      compact
                      style={[
                        styles.chipStatus,
                        { backgroundColor: isVoid ? '#FEE2E2' : '#D1FAE5' },
                      ]}
                      textStyle={{
                        fontSize: 10,
                        color: isVoid ? '#EF4444' : '#10B981',
                        fontWeight: 'bold',
                      }}
                    >
                      {item.status}
                    </Chip>
                  </View>
                )}
              />
            </Card>
          );
        }}
        contentContainerStyle={styles.list}
      />

      {/* Modal Detail & Action Void */}
      <Portal>
        <Dialog visible={detailVisible} onDismiss={() => setDetailVisible(false)}>
          {selectedTrx && (
            <>
              <Dialog.Title>Detail Transaksi</Dialog.Title>
              <Dialog.Content>
                <Text style={styles.dialogText}>No: {selectedTrx.transaction.transaction_no}</Text>
                <Text style={styles.dialogText}>
                  Status: <Text style={{ fontWeight: 'bold', color: selectedTrx.transaction.status === 'VOID' ? '#EF4444' : '#10B981' }}>{selectedTrx.transaction.status}</Text>
                </Text>
                <Text style={styles.dialogText}>Pelanggan: {selectedTrx.transaction.customer_name || '-'}</Text>
                <Text style={styles.dialogText}>Meja: {selectedTrx.transaction.table_number || '-'}</Text>
                
                <Divider style={{ marginVertical: 8 }} />
                
                <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Item Pesanan:</Text>
                {selectedTrx.items.map((i) => (
                  <Text key={i.id} style={{ fontSize: 12, color: '#334155' }}>
                    • {i.product_name} ({i.quantity}x) = Rp {i.total_price.toLocaleString('id-ID')}
                  </Text>
                ))}

                <Divider style={{ marginVertical: 8 }} />
                <Text style={{ fontWeight: 'bold', fontSize: 14 }}>
                  Total: Rp {selectedTrx.transaction.grand_total.toLocaleString('id-ID')}
                </Text>
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={() => setDetailVisible(false)}>Tutup</Button>
                <Button onPress={() => {
                  setDetailVisible(false);
                  router.push(`/receipt/${selectedTrx.transaction.id}`);
                }}>
                  Struk
                </Button>
                {selectedTrx.transaction.status === 'COMPLETED' && (
                  <Button
                    textColor="#EF4444"
                    onPress={() => handleVoid(selectedTrx.transaction.id, selectedTrx.transaction.transaction_no)}
                  >
                    Void (Batal)
                  </Button>
                )}
              </Dialog.Actions>
            </>
          )}
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  searchbar: { margin: 12, elevation: 1 },
  list: { padding: 12 },
  card: { marginBottom: 8, backgroundColor: '#FFFFFF' },
  rightBadge: { alignItems: 'flex-end', paddingRight: 12 },
  priceText: { fontWeight: 'bold', color: '#1E293B', marginBottom: 2 },
  chipStatus: { height: 24, justifyContent: 'center' },
  dialogText: { fontSize: 13, color: '#475569', marginBottom: 2 },
});
