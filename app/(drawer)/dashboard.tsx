import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
// Import the components (Make sure these files exist in /components folder)
import AnalyticsChart from '../../components/AnalyticsChart';
import RecentActivity from '../../components/RecentActivity';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <ScrollView 
      className="flex-1 bg-[#F8FAFC]" 
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* --- Header Section --- */}
      <View className="mb-6 pt-2">
        <Text className="text-3xl font-bold text-gray-800">
          Welcome back,
        </Text>
        <Text className="text-2xl font-bold text-slate-700 mb-1">
          {user?.name || 'User'}
        </Text>
        <View className="flex-row items-center mt-1">
          <Text className="text-sm text-gray-500 font-medium mr-1">
            Role:
          </Text>
          <Text className="text-sm font-bold text-indigo-600 capitalize">
            {user?.role}
          </Text>
        </View>
      </View>

      {/* --- Analytics (Stat Cards) --- */}
      <AnalyticsChart />

      {/* --- Recent Activity List --- */}
      <RecentActivity />

    </ScrollView>
  );
}