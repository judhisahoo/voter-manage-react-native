import { FontAwesome } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { apiClient } from '../../services/secureAxios';

export default function ChangePasswordScreen() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const flashMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleChangePassword = async () => {
    setMessage({ type: '', text: '' });

    if (formData.newPassword !== formData.confirmPassword) {
      flashMessage('error', 'Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      flashMessage('error', 'Password must be at least 6 characters');
      return;
    }

    if (!formData.currentPassword) {
      flashMessage('error', 'Please enter your current password');
      return;
    }

    setLoading(true);

    try {
      await apiClient.put('/users/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      flashMessage('success', 'Password changed successfully!');
      
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Failed to change password';
      flashMessage('error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      className="flex-1 bg-[#F8FAFC]"
      contentContainerStyle={{ padding: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="mb-6">
        <Text className="text-3xl font-bold text-gray-800">Security</Text>
        <Text className="text-gray-500 mt-1">Update your password</Text>
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

      <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <View className="flex-row items-center mb-6">
          <FontAwesome name="lock" size={20} color="#4F46E5" />
          <Text className="text-xl font-bold text-gray-800 ml-2">Change Password</Text>
        </View>

        <View>
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Current Password</Text>
            <TextInput 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-800"
              value={formData.currentPassword}
              onChangeText={(text) => setFormData({...formData, currentPassword: text})}
              secureTextEntry
              placeholder="Enter current password"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">New Password</Text>
            <TextInput 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-800"
              value={formData.newPassword}
              onChangeText={(text) => setFormData({...formData, newPassword: text})}
              secureTextEntry
              placeholder="Enter new password"
            />
          </View>

          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">Confirm Password</Text>
            <TextInput 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-800"
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
              secureTextEntry
              placeholder="Confirm new password"
            />
          </View>

          <TouchableOpacity 
            onPress={handleChangePassword}
            disabled={loading}
            className="bg-indigo-600 py-3 rounded-lg flex-row justify-center items-center shadow-sm"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <FontAwesome name="lock" size={16} color="white" style={{ marginRight: 8 }} />
                <Text className="text-white font-semibold text-base">Update Password</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}