import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import StatCard from './StatCard';

interface Stat {
  label: string;
  value: string;
  iconName: string;
  color: string;
}

const ADMIN_STATS: Stat[] = [
  { label: 'Total Records', value: '12,458', iconName: 'users', color: 'bg-blue-500' },
  { label: 'Today Searches', value: '342', iconName: 'search', color: 'bg-green-500' },
  { label: 'Active Users', value: '28', iconName: 'user', color: 'bg-purple-500' },
  { label: 'API Calls', value: '1,247', iconName: 'shield', color: 'bg-orange-500' },
];

const SUPPORT_STATS: Stat[] = [
  { label: 'My Searches', value: '84', iconName: 'search', color: 'bg-blue-500' },
  { label: 'Records Found', value: '156', iconName: 'users', color: 'bg-green-500' },
];

export default function AnalyticsChart() {
  const { user } = useAuth();

  const stats = useMemo(() => {
    return user?.role === 'admin' ? ADMIN_STATS : SUPPORT_STATS;
  }, [user?.role]);

  const totalValue = useMemo(() => {
    return stats.reduce((sum, stat) => {
      const numValue = parseInt(stat.value.replace(/,/g, '')) || 0;
      return sum + numValue;
    }, 0);
  }, [stats]);

  if (!user) return null;

  return (
    <View className="mb-2">
      {/* Total Count Text */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-gray-500">
          Total: <Text className="text-gray-900 font-bold">{totalValue.toLocaleString()}</Text>
        </Text>
      </View>
      
      {/* Stat Cards Stack */}
      <View>
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            iconName={stat.iconName}
            colorClass={stat.color}
          />
        ))}
      </View>
    </View>
  );
}