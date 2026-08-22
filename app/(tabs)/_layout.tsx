import React from 'react';
import { Tabs } from 'expo-router';
import { LayoutDashboard, ShoppingCart, Package, Receipt, Settings } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="pos"
        options={{
          title: 'POS Kasir',
          tabBarIcon: ({ color, size }) => <ShoppingCart color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Produk',
          tabBarIcon: ({ color, size }) => <Package color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Riwayat',
          tabBarIcon: ({ color, size }) => <Receipt color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Pengaturan',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tabs>
  );
      }
