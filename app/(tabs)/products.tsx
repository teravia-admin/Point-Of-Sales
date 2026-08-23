import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert, ScrollView } from 'react-native';
import { Searchbar, FAB, Card, Text, Chip, Portal, Dialog, TextInput, Button, IconButton } from 'react-native-paper';
import { getAllCategories, addCategory } from '@/database/repositories/categoryRepo';
import { getProducts, saveProduct, deleteProduct } from '@/database/repositories/productRepo';
import { Product, Category } from '@/types';

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  // Dialog State Produk
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [stock, setStock] = useState('');
  const [sku, setSku] = useState('');

  // Dialog State Kategori
  const [catDialogVisible, setCatDialogVisible] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  useEffect(() => {
    loadData();
  }, [search, selectedCat]);

  async function loadData() {
    const cats = await getAllCategories();
    setCategories(cats);
    const prods = await getProducts(search, selectedCat);
    setProducts(prods);
  }

  function openForm(product?: Product) {
    if (product) {
      setEditingId(product.id);
      setName(product.name);
      setCostPrice(product.cost_price.toString());
      setSellingPrice(product.selling_price.toString());
      setStock(product.stock.toString());
      setSku(product.sku || '');
    } else {
      setEditingId(null);
      setName('');
      setCostPrice('');
      setSellingPrice('');
      setStock('0');
      setSku('');
    }
    setDialogVisible(true);
  }

  async function handleSaveProduct() {
    if (!name.trim() || !sellingPrice) {
      Alert.alert('Error', 'Nama dan Harga Jual wajib diisi');
      return;
    }

    const newProd: Product = {
      id: editingId || 'prod_' + Date.now(),
      category_id: selectedCat,
      name: name.trim(),
      sku: sku.trim() || null,
      barcode: null,
      cost_price: parseFloat(costPrice) || 0,
      selling_price: parseFloat(sellingPrice) || 0,
      stock: parseInt(stock, 10) || 0,
      min_stock: 5,
      unit: 'pcs',
      is_active: true,
    };

    await saveProduct(newProd);
    setDialogVisible(false);
    loadData();
  }

  async function handleDelete(id: string) {
    Alert.alert('Hapus Produk', 'Yakin ingin menghapus produk ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          await deleteProduct(id);
          loadData();
        },
      },
    ]);
  }

  async function handleAddCategory() {
    if (!newCatName.trim()) return;
    await addCategory(newCatName.trim());
    setNewCatName('');
    setCatDialogVisible(false);
    loadData();
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Cari produk / SKU..."
        onChangeText={setSearch}
        value={search}
        style={styles.searchbar}
      />

      <View style={styles.categoryHeader}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          <Chip
            selected={selectedCat === null}
            onPress={() => setSelectedCat(null)}
            style={styles.chip}
          >
            Semua
          </Chip>
          {categories.map((cat) => (
            <Chip
              key={cat.id}
              selected={selectedCat === cat.id}
              onPress={() => setSelectedCat(selectedCat === cat.id ? null : cat.id)}
              style={styles.chip}
            >
              {cat.name}
            </Chip>
          ))}
        </ScrollView>
        <IconButton icon="plus" size={20} onPress={() => setCatDialogVisible(true)} />
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card} onPress={() => openForm(item)}>
            <Card.Title
              title={item.name}
              subtitle={`Stok: ${item.stock} ${item.unit} | Rp ${item.selling_price.toLocaleString('id-ID')}`}
              right={(props) => (
                <IconButton {...props} icon="delete-outline" iconColor="#EF4444" onPress={() => handleDelete(item.id)} />
              )}
            />
          </Card>
        )}
        contentContainerStyle={styles.list}
      />

      <FAB icon="plus" style={styles.fab} onPress={() => openForm()} label="Produk Baru" />

      {/* Modal Product Form */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>{editingId ? 'Edit Produk' : 'Tambah Produk Baru'}</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Nama Produk *" value={name} onChangeText={setName} mode="outlined" style={styles.input} />
            <TextInput label="SKU / Kode" value={sku} onChangeText={setSku} mode="outlined" style={styles.input} />
            <TextInput label="Harga Modal (Rp)" value={costPrice} onChangeText={setCostPrice} keyboardType="numeric" mode="outlined" style={styles.input} />
            <TextInput label="Harga Jual (Rp) *" value={sellingPrice} onChangeText={setSellingPrice} keyboardType="numeric" mode="outlined" style={styles.input} />
            <TextInput label="Stok" value={stock} onChangeText={setStock} keyboardType="numeric" mode="outlined" style={styles.input} />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Batal</Button>
            <Button onPress={handleSaveProduct}>Simpan</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Modal Add Category */}
        <Dialog visible={catDialogVisible} onDismiss={() => setCatDialogVisible(false)}>
          <Dialog.Title>Tambah Kategori</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Nama Kategori" value={newCatName} onChangeText={setNewCatName} mode="outlined" />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCatDialogVisible(false)}>Batal</Button>
            <Button onPress={handleAddCategory}>Simpan</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  searchbar: { margin: 12, elevation: 1 },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', paddingLeft: 12, paddingRight: 4 },
  catScroll: { flex: 1 },
  chip: { marginRight: 8 },
  list: { padding: 12, paddingBottom: 80 },
  card: { marginBottom: 8, backgroundColor: '#FFFFFF' },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: '#4F46E5' },
  input: { marginBottom: 8 },
});
