import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { Searchbar, Card, Text, Badge, FloatingAction, FAB, Portal, Dialog } from 'react-native-paper';
import { getProducts } from '@/database/repositories/productRepo';
import { getAllCategories } from '@/database/repositories/categoryRepo';
import { useCartStore } from '@/store/cartStore';
import { Product, Category } from '@/types';
import { CartBottomSheet } from '@/components/pos/CartBottomSheet';
import { POSCalculator } from '@/components/pos/POSCalculator';

export default function POSScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  
  const [cartVisible, setCartVisible] = useState(false);
  const [calcVisible, setCalcVisible] = useState(false);
  const [calcVal, setCalcVal] = useState('0');

  const { items, addItem, getSubtotal } = useCartStore();
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    loadData();
  }, [search, selectedCat]);

  async function loadData() {
    const prods = await getProducts(search, selectedCat);
    const cats = await getAllCategories();
    setProducts(prods);
    setCategories(cats);
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Cari item kasir..."
        onChangeText={setSearch}
        value={search}
        style={styles.searchbar}
      />

      <View style={styles.catContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.catChip, selectedCat === null && styles.catChipActive]}
            onPress={() => setSelectedCat(null)}
          >
            <Text style={[styles.catText, selectedCat === null && styles.catTextActive]}>Semua</Text>
          </TouchableOpacity>
          {categories.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.catChip, selectedCat === c.id && styles.catChipActive]}
              onPress={() => setSelectedCat(c.id)}
            >
              <Text style={[styles.catText, selectedCat === c.id && styles.catTextActive]}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.gridCol} onPress={() => addItem(item)}>
            <Card style={styles.productCard}>
              <Card.Content style={{ padding: 12 }}>
                <Text variant="titleSmall" numberOfLines={1} style={{ fontWeight: 'bold' }}>
                  {item.name}
                </Text>
                <Text variant="bodySmall" style={{ color: '#64748B', marginTop: 4 }}>
                  Rp {item.selling_price.toLocaleString('id-ID')}
                </Text>
                <Text variant="labelSmall" style={{ color: item.stock <= 5 ? '#EF4444' : '#10B981', marginTop: 2 }}>
                  Stok: {item.stock}
                </Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.gridList}
      />

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.calcTrigger} onPress={() => setCalcVisible(true)}>
          <Text style={{ fontSize: 18 }}>🧮</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cartBar}
          onPress={() => setCartVisible(true)}
          disabled={totalItemCount === 0}
        >
          <View style={styles.badgeWrapper}>
            <Text style={styles.cartBarText}>Keranjang</Text>
            {totalItemCount > 0 && <Badge style={styles.badge}>{totalItemCount}</Badge>}
          </View>
          <Text style={styles.cartBarTotal}>
            Rp {getSubtotal().toLocaleString('id-ID')}
          </Text>
        </TouchableOpacity>
      </View>

      {cartVisible && <CartBottomSheet onClose={() => setCartVisible(false)} />}

      <Portal>
        <Dialog visible={calcVisible} onDismiss={() => setCalcVisible(false)}>
          <Dialog.Title>Kalkulator Kasir</Dialog.Title>
          <Dialog.Content>
            <POSCalculator value={calcVal} onChange={setCalcVal} />
          </Dialog.Content>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  searchbar: { margin: 12, elevation: 1 },
  catContainer: { paddingHorizontal: 12, marginBottom: 8 },
  catChip: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, backgroundColor: '#E2E8F0', marginRight: 8 },
  catChipActive: { backgroundColor: '#4F46E5' },
  catText: { color: '#334155', fontSize: 12, fontWeight: '600' },
  catTextActive: { color: '#FFFFFF' },
  gridList: { paddingHorizontal: 6, paddingBottom: 80 },
  gridCol: { flex: 0.5, padding: 6 },
  productCard: { backgroundColor: '#FFFFFF' },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  calcTrigger: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  cartBar: {
    flex: 1,
    height: 48,
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  badgeWrapper: { flexDirection: 'row', alignItems: 'center' },
  cartBarText: { color: '#FFFFFF', fontWeight: 'bold', marginRight: 6 },
  badge: { backgroundColor: '#EF4444' },
  cartBarTotal: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
});
