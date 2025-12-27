import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { User, userService } from '../../services/userService';

export default function UserManageScreen() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Check if current user is admin
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  }, []);

  const filterUsers = () => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = users.filter(
      (u) =>
        u.name?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query) ||
        u.role?.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
  };

  const handleStatusChange = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    Alert.alert(
      'Change Status',
      `Are you sure you want to ${newStatus === 'active' ? 'activate' : 'deactivate'} this user?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(userId);
              await userService.updateUserStatus(userId, newStatus as 'active' | 'inactive');
              await loadUsers();
              Alert.alert('Success', `User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to update user status');
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const handleDelete = (userId: string, userName: string) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${userName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(userId);
              await userService.deleteUser(userId);
              await loadUsers();
              Alert.alert('Success', 'User deleted successfully');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete user');
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'support':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          Only administrators can access this page.
        </Text>
      </View>
    );
  }

  if (loading && users.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F8FAFC]">
        <ActivityIndicator size="large" color="#007AFF" />
        <Text className="text-gray-500 mt-4">Loading users...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      {/* Header with Add Button */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-bold text-gray-800">Manage Users</Text>
          <TouchableOpacity
            onPress={() => router.push('/user-add')}
            className="bg-[#007AFF] px-4 py-2 rounded-lg flex-row items-center"
          >
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white font-semibold ml-1">Add User</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Search by name, email, or role..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-2 text-gray-800"
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* User List */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredUsers.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <Ionicons name="people-outline" size={64} color="#9CA3AF" />
            <Text className="text-gray-500 mt-4 text-center">
              {searchQuery ? 'No users found matching your search' : 'No users found'}
            </Text>
          </View>
        ) : (
          filteredUsers.map((user) => (
            <View
              key={user._id || user.id}
              className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-200"
            >
              {/* User Info Row */}
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Text className="text-lg font-bold text-gray-800 mr-2">
                      {user.name}
                    </Text>
                    {user._id === currentUser?.id || user.id === currentUser?.id ? (
                      <View className="bg-blue-100 px-2 py-0.5 rounded">
                        <Text className="text-xs font-semibold text-blue-800">You</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text className="text-sm text-gray-600 mb-2">{user.email}</Text>
                  <View className="flex-row flex-wrap gap-2">
                    <View className={`px-2 py-1 rounded ${getRoleColor(user.role)}`}>
                      <Text className="text-xs font-semibold capitalize">
                        {user.role}
                      </Text>
                    </View>
                    <View className={`px-2 py-1 rounded ${getStatusColor(user.status)}`}>
                      <Text className="text-xs font-semibold capitalize">
                        {user.status || 'active'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-2 mt-2">
                <TouchableOpacity
                  onPress={() => router.push(`/user-edit?id=${user._id || user.id}`)}
                  className="flex-1 bg-blue-50 py-2 rounded-lg flex-row items-center justify-center"
                >
                  <Ionicons name="pencil-outline" size={18} color="#007AFF" />
                  <Text className="text-[#007AFF] font-semibold ml-1">Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleStatusChange(user._id || user.id || '', user.status || 'active')}
                  disabled={actionLoading === (user._id || user.id)}
                  className="flex-1 bg-orange-50 py-2 rounded-lg flex-row items-center justify-center"
                >
                  {actionLoading === (user._id || user.id) ? (
                    <ActivityIndicator size="small" color="#F97316" />
                  ) : (
                    <>
                      <Ionicons
                        name={user.status === 'active' ? 'pause-circle-outline' : 'play-circle-outline'}
                        size={18}
                        color="#F97316"
                      />
                      <Text className="text-orange-600 font-semibold ml-1">
                        {user.status === 'active' ? 'Deactivate' : 'Activate'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {user._id !== currentUser?.id && user.id !== currentUser?.id && (
                  <TouchableOpacity
                    onPress={() => handleDelete(user._id || user.id || '', user.name)}
                    disabled={actionLoading === (user._id || user.id)}
                    className="bg-red-50 px-4 py-2 rounded-lg flex-row items-center justify-center"
                  >
                    {actionLoading === (user._id || user.id) ? (
                      <ActivityIndicator size="small" color="#EF4444" />
                    ) : (
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

