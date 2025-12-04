import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/secureAxios';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const flashMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleUpdateProfile = async () => {
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      if (!formData.name.trim()) {
        flashMessage('error', 'Name is required');
        setLoading(false);
        return;
      }
      if (!formData.email.trim()) {
        flashMessage('error', 'Email is required');
        setLoading(false);
        return;
      }

      await apiClient.put('/users/profile', {
        name: formData.name,
        email: formData.email,
      });

      flashMessage('success', 'Profile updated successfully!');
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Failed to update profile';
      flashMessage('error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive", 
          onPress: () => {
            logout();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  return (
    <ScrollView 
      className="flex-1 bg-[#F8FAFC]"
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="mb-6">
        <Text className="text-3xl font-bold text-gray-800">My Profile</Text>
        <Text className="text-gray-500 mt-1">Manage your account information</Text>
      </View>

      {message.text ? (
        <View className={`px-4 py-3 rounded-lg mb-6 border ${
          message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <Text className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </Text>
        </View>
      ) : null}

      {/* Profile Information Card */}
      <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <View className="flex-row items-center mb-6">
          <FontAwesome name="user" size={20} color="#4F46E5" />
          <Text className="text-xl font-bold text-gray-800 ml-2">Profile Information</Text>
        </View>

        <View className="space-y-4">
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Full Name</Text>
            <TextInput 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-800"
              value={formData.name}
              onChangeText={(text) => setFormData({...formData, name: text})}
              placeholder="Enter your name"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Email Address</Text>
            <TextInput 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-800"
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Enter your email"
            />
          </View>

          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">Role</Text>
            <View className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
              <Text className="text-gray-600 capitalize">{user?.role}</Text>
            </View>
          </View>

          <TouchableOpacity 
            onPress={handleUpdateProfile}
            disabled={loading}
            className="bg-indigo-600 py-3 rounded-lg flex-row justify-center items-center shadow-sm"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <FontAwesome name="save" size={16} color="white" style={{ marginRight: 8 }} />
                <Text className="text-white font-semibold text-base">Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Danger Zone */}
      <View className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-l-red-500 border-gray-100">
        <Text className="text-xl font-bold text-gray-800 mb-4">Danger Zone</Text>
        <TouchableOpacity 
          onPress={handleLogout}
          className="bg-red-600 py-3 rounded-lg flex-row justify-center items-center shadow-sm"
        >
          <Text className="text-white font-semibold text-base">Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}