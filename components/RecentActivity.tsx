import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

interface Activity {
  id: string;
  type: 'search' | 'user' | 'security' | 'data';
  description: string;
  timestamp: string;
}

// Icon Helper
const ActivityIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'search': return <FontAwesome name="search" size={14} color="#3B82F6" />;
    case 'user': return <FontAwesome name="user" size={14} color="#22C55E" />;
    case 'security': return <FontAwesome name="shield" size={14} color="#EAB308" />;
    case 'data': return <FontAwesome name="database" size={14} color="#A855F7" />;
    default: return <FontAwesome name="search" size={14} color="#6B7280" />;
  }
};

// Background Color Helper (Light Circles)
const getIconBgColor = (type: string) => {
  switch (type) {
    case 'search': return 'bg-blue-50';
    case 'user': return 'bg-green-50';
    case 'security': return 'bg-yellow-50';
    case 'data': return 'bg-purple-50';
    default: return 'bg-gray-50';
  }
};

export default function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulating API call
    const fetchActivities = async () => {
      setLoading(true);
      setTimeout(() => {
        setActivities([
          { id: '1', type: 'search', description: 'Searched for voters in Delhi', timestamp: new Date().toISOString() },
          { id: '2', type: 'user', description: 'Added new user: admin@example.com', timestamp: new Date(Date.now() - 3600000).toISOString() },
          { id: '3', type: 'security', description: 'Password changed', timestamp: new Date(Date.now() - 86400000).toISOString() },
          { id: '4', type: 'data', description: 'Updated voter database', timestamp: new Date(Date.now() - 172800000).toISOString() },
        ]);
        setLoading(false);
      }, 1000);
    };
    fetchActivities();
  }, []);

  const formattedActivities = useMemo(() => {
    return activities.map((activity) => ({
      ...activity,
      formattedTime: new Date(activity.timestamp).toLocaleString(),
    }));
  }, [activities]);

  if (loading) return <ActivityIndicator size="small" color="#4F46E5" />;

  return (
    // The Container Card
    <View className="bg-white rounded-2xl p-5 shadow-sm elevation-2 border border-gray-100 mt-2">
      <Text className="text-lg font-bold text-gray-800 mb-5">Recent Activity</Text>
      
      <View>
        {formattedActivities.map((activity, index) => (
          <View 
            key={activity.id} 
            className={`flex-row items-start pb-4 mb-4 ${
              index !== formattedActivities.length - 1 ? 'border-b border-gray-100' : ''
            }`}
          >
            {/* Icon Bubble (Circle) */}
            <View className={`h-8 w-8 rounded-full items-center justify-center mr-3 ${getIconBgColor(activity.type)}`}>
              <ActivityIcon type={activity.type} />
            </View>

            {/* Text Content */}
            <View className="flex-1">
              <Text className="text-sm font-semibold text-gray-800 leading-5">
                {activity.description}
              </Text>
              <Text className="text-xs text-gray-400 mt-1">
                {activity.formattedTime}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}