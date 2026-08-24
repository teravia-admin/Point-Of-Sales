import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Surface, Text, Button, Card, Divider } from 'react-native-paper';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getSalesSummary, getBestSellerProducts, exportTransactionsCSV, SalesSummary, BestSellerProduct } from '@/database/repositories/reportRepo';

export default function ReportsScreen() {
  const [summary, setSummary] = useState<SalesSummary>({
    totalRevenue: 0,
    totalCost: 0,
    grossProfit: 0,
    transactionCount: 0,
  });
  const [bestSellers, setBestSellers] = useState<BestSellerProduct[]>([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    const sum = await getSalesSummary();
    const topProd = await getBestSellerProducts(5);
    setSummary(sum);
    setBestSellers(topProd);
  }

  async function handleExportCSV() {
    try {
      setExporting(true);
      const csvData = await exportTransactionsCSV();
      const fileUri = `${FileSystem.cacheDirectory}laporan_penjualan_${Date.now()}.csv`;
      await FileSystem.writeAsStringAsync(fileUri, csvData);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Laporan Penjualan (CSV)',
        });
      } else {
        Alert.alert('Export Berhasil', `File tersimpan di: ${fileUri}`);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Gagal', 'Terjadi kesalahan saat mengkespor laporan.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Surface style={styles.headerCard} elevation={1}>
        <Text variant="headlineSmall" style={styles.title}>Laporan Penjualan</Text>
        <Text variant="bodyMedium" style={{ color: '#64748B' }}>Ringkasan performa bisnis KasirKita</Text>
      </Surface>

      {/* Grid Status Ringkasan Omzet & Laba */}
      <View style={styles.grid}>
        <Surface style={styles.statCard} elevation={1}>
          <Text style={styles.statLabel}>Total Omzet</Text>
          <Text style={styles.statValue}>Rp {summary.totalRevenue.toLocaleString('id-ID')}</Text>
        </Surface>

        <Surface style={styles.statCard} elevation={1}>
          <Text style={styles.statLabel}>Laba Kotor</Text>
          <Text style={[styles.statValue, { color: '#10B981' }]}>
            Rp {summary.grossProfit.toLocaleString('id-ID')}
          </Text>
        </Surface>

        <Surface style={styles.statCard} elevation={1}>
          <Text style={styles.statLabel}>Modal (HPP)</Text>
          <Text style={styles.statValue}>Rp {summary.totalCost.toLocaleString('id-ID')}</Text>
        </Surface>

        <Surface style={styles.statCard} elevation={1}>
          <Text style={styles.statLabel}>Jumlah Transaksi</Text>
          <Text style={styles.statValue}>{summary.transactionCount} Trx</Text>
        </Surface>
      </View>

      {/* Daftar Produk Terlaris */}
      <Surface style={[styles.card, { marginTop: 16 }]} elevation={1}>
        <Text variant="titleMedium" style={styles.sectionTitle}>5 Produk Terlaris (Best Seller)</Text>
        <Divider style={{ marginBottom: 12 }} />

        {bestSellers.length === 0 ? (
          <Text style={{ color: '#94A3B8', fontStyle: 'italic' }}>Belum ada data penjualan.</Text>
        ) : (
          bestSellers.map((item, idx) => (
            <View key={item.productId} style={styles.topRow}>
              <Text style={styles.rankText}>#{idx + 1}</Text>
              <View style={{ flex: 1, paddingHorizontal: 8 }}>
                <Text style={{ fontWeight: '600', color: '#1E293B' }}>{item.productName}</Text>
                <Text style={{ fontSize: 12, color: '#64748B' }}>Terjual: {item.totalQty} item</Text>
              </View>
              <Text style={{ fontWeight: 'bold', color: '#4F46E5' }}>
                Rp {item.totalSales.toLocaleString('id-ID')}
              </Text>
            </View>
          ))
        )}
      </Surface>

      {/* Action Button Export */}
      <Button
        mode="contained"
        icon="file-export"
        onPress={handleExportCSV}
        loading={exporting}
        disabled={exporting}
        style={styles.exportBtn}
        contentStyle={{ paddingVertical: 8 }}
      >
        Export Laporan (.CSV)
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerCard: { padding: 16, borderRadius: 12, backgroundColor: '#FFFFFF', marginBottom: 16 },
  title: { fontWeight: 'bold', color: '#1E293B' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { width: '48%', padding: 16, borderRadius: 12, backgroundColor: '#FFFFFF', marginBottom: 12 },
  statLabel: { fontSize: 12, color: '#64748B', marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  card: { padding: 16, borderRadius: 12, backgroundColor: '#FFFFFF' },
  sectionTitle: { fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
  topRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  rankText: { fontWeight: 'bold', color: '#64748B', width: 24 },
  exportBtn: { marginTop: 24, marginBottom: 32, backgroundColor: '#4F46E5', borderRadius: 8 },
});
