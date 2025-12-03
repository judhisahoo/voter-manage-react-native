import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

interface StatCardProps {
  label: string;
  value: string;
  iconName: any;
  colorClass: string; // Expects something like "bg-blue-500"
}

export default function StatCard({ label, value, iconName, colorClass }: StatCardProps) {
  return (
    <View className="bg-white p-5 rounded-2xl mb-4 shadow-sm elevation-2 flex-row items-center justify-between border border-gray-100">
      
      {/* Left Side: Text */}
      <View>
        <Text className="text-gray-500 text-sm font-medium mb-1">
          {label}
        </Text>
        <Text className="text-3xl font-bold text-gray-900">
          {value}
        </Text>
      </View>
      
      {/* Right Side: Colored Icon Box */}
      {/* h-12 w-12 creates the square shape. rounded-lg curves the corners. */}
      <View className={`h-12 w-12 rounded-lg items-center justify-center ${colorClass}`}>
        <FontAwesome name={iconName} size={20} color="white" />
      </View>

    </View>
  );
}