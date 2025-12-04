import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
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
import { CreateUserDto, userService } from '../../services/userService';

export default function UserAddScreen() {
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<CreateUserDto>({
    name: '',
    email: '',
    password: '',
    role: 'support',
  });

  const isAdmin = currentUser?.role === 'admin';

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Validation Error', 'Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }
    if (!formData.password.trim()) {
      Alert.alert('Validation Error', 'Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await userService.createUser(formData);
      Alert.alert('Success', 'User created successfully', [
        {
          text: 'OK',
          onPress: () => router.replace('/(drawer)/user-manage'),
        },
      ]);
    } catch (error: any) {
      const errorMessage =
        error.message || error.response?.data?.message || 'Failed to create user';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
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
          Only administrators can create users.
        </Text>
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
        <Text className="text-2xl font-bold text-gray-800 mb-2">Add New User</Text>
        <Text className="text-gray-500">Fill in the details to create a new user account</Text>
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

        {/* Password Field */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Password *</Text>
          <View className="relative">
            <TextInput
              placeholder="Enter password (min 6 characters)"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry={!showPassword}
              className="border border-gray-300 rounded-lg px-4 py-3 pr-12 text-gray-800"
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3"
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>
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
            disabled={loading}
            className="flex-1 bg-[#007AFF] py-3 rounded-lg flex-row items-center justify-center"
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">Create User</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

