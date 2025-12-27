import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
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
import { UpdateUserDto, User, userService } from '../../services/userService';

export default function UserEditScreen() {
  const { user: currentUser } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UpdateUserDto>({
    name: '',
    email: '',
    role: 'support',
  });

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    if (id && isAdmin) {
      loadUser();
    }
  }, [id, isAdmin]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const userData = await userService.getUserById(id);
      setUser(userData);
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        role: userData.role || 'support',
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load user', [
        { text: 'OK', onPress: () => router.replace('/user-manage') },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name?.trim()) {
      Alert.alert('Validation Error', 'Name is required');
      return false;
    }
    if (!formData.email?.trim()) {
      Alert.alert('Validation Error', 'Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !id) return;

    setSaving(true);
    try {
      await userService.updateUser(id, formData);
      Alert.alert('Success', 'User updated successfully', [
        {
          text: 'OK',
          onPress: () => router.replace('/user-manage'),
        },
      ]);
    } catch (error: any) {
      const errorMessage =
        error.message || error.response?.data?.message || 'Failed to update user';
      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-6">
        <Ionicons name="lock-closed-outline" size={64} color="#9CA3AF" />
        <Text className="text-xl font-bold text-gray-800 mt-4 text-center">
          Access Denied
        </Text>
        <Text className="text-gray-500 mt-2 text-center">
          Only administrators can edit users.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F8FAFC]">
        <ActivityIndicator size="large" color="#007AFF" />
        <Text className="text-gray-500 mt-4">Loading user details...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-6">
        <Ionicons name="person-outline" size={64} color="#9CA3AF" />
        <Text className="text-xl font-bold text-gray-800 mt-4 text-center">
          User Not Found
        </Text>
        <TouchableOpacity
          onPress={() => router.replace('/user-manage')}
          className="mt-4 bg-[#007AFF] px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-[#F8FAFC]"
      contentContainerStyle={{ padding: 20 }}
    >
      {/* Header */}
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-800 mb-2">Edit User</Text>
        <Text className="text-gray-500">Update user information</Text>
      </View>

      {/* User Status Info */}
      <View className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-sm text-gray-500">Current Status</Text>
            <View className="flex-row items-center mt-1">
              <View
                className={`px-3 py-1 rounded ${
                  user.status === 'active'
                    ? 'bg-green-100'
                    : user.status === 'blocked'
                    ? 'bg-red-100'
                    : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`text-xs font-semibold capitalize ${
                    user.status === 'active'
                      ? 'text-green-800'
                      : user.status === 'blocked'
                      ? 'text-red-800'
                      : 'text-gray-800'
                  }`}
                >
                  {user.status || 'active'}
                </Text>
              </View>
            </View>
          </View>
          {user.lastLogin && (
            <View>
              <Text className="text-sm text-gray-500">Last Login</Text>
              <Text className="text-xs text-gray-600 mt-1">
                {new Date(user.lastLogin).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Form */}
      <View className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
        {/* Name Field */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Full Name *</Text>
          <TextInput
            placeholder="Enter full name"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Email Field */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Email Address *</Text>
          <TextInput
            placeholder="user@example.com"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
            className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Role Field */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Role *</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setFormData({ ...formData, role: 'admin' })}
              className={`flex-1 py-3 rounded-lg border-2 ${
                formData.role === 'admin'
                  ? 'border-[#007AFF] bg-blue-50'
                  : 'border-gray-300 bg-white'
              }`}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={formData.role === 'admin' ? '#007AFF' : '#9CA3AF'}
                />
                <Text
                  className={`ml-2 font-semibold ${
                    formData.role === 'admin' ? 'text-[#007AFF]' : 'text-gray-600'
                  }`}
                >
                  Admin
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFormData({ ...formData, role: 'support' })}
              className={`flex-1 py-3 rounded-lg border-2 ${
                formData.role === 'support'
                  ? 'border-[#007AFF] bg-blue-50'
                  : 'border-gray-300 bg-white'
              }`}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons
                  name="people-outline"
                  size={20}
                  color={formData.role === 'support' ? '#007AFF' : '#9CA3AF'}
                />
                <Text
                  className={`ml-2 font-semibold ${
                    formData.role === 'support' ? 'text-[#007AFF]' : 'text-gray-600'
                  }`}
                >
                  Support
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-1 bg-gray-100 py-3 rounded-lg"
          >
            <Text className="text-center text-gray-700 font-semibold">Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={saving}
            className="flex-1 bg-[#007AFF] py-3 rounded-lg flex-row items-center justify-center"
          >
            {saving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

