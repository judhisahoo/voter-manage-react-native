import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { router } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuth } from '../../context/AuthContext';

// Custom Drawer Content Component
function CustomDrawerContent(props: any) {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
      
      {/* Header: User Profile */}
      <View className="bg-[#007AFF] p-5 pt-14 mb-2">
        <View className="flex-row items-center">
          {/* Avatar Circle */}
          <View className="w-14 h-14 rounded-full bg-white/20 justify-center items-center border-2 border-white mr-4">
            <Text className="text-white text-2xl font-bold">
               {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          
          {/* User Info */}
          <View>
            <Text className="text-white text-lg font-bold">
              {user?.name || 'User'}
            </Text>
            <Text className="text-white/80 text-xs mt-0.5">
              {user?.role?.toUpperCase() || 'GUEST'}
            </Text>
          </View>
        </View>
      </View>

      {/* Section: Main Menu */}
      <View className="mb-2">
        <DrawerItem 
          label="Dashboard"
          onPress={() => router.push('/(drawer)/dashboard')}
          icon={({color, size}) => <Ionicons name="home-outline" size={size} color={color} />}
        />
        
        <DrawerItem 
          label="Search Data"
          onPress={() => router.push('/(drawer)/search')}
          icon={({color, size}) => <Ionicons name="search-outline" size={size} color={color} />}
        />
      </View>

      {/* Section: Admin Only */}
      {isAdmin && (
        <View className="mb-2">
          <Text className="text-xs text-gray-400 ml-5 mb-1 mt-2 font-semibold">
            ADMIN CONTROLS
          </Text>
          <DrawerItem 
            label="User Management"
            onPress={() => router.push('/(drawer)/user-manage')}
            icon={({color, size}) => <Ionicons name="people-outline" size={size} color={color} />}
          />
        </View>
      )}

      {/* Section: Footer / Account */}
      <View className="mt-2 border-t border-gray-100 pt-2">
        <Text className="text-xs text-gray-400 ml-5 mb-1 mt-2 font-semibold">
          ACCOUNT
        </Text>
        
        <DrawerItem 
            label="Edit Profile"
            onPress={() => router.push('/(drawer)/profile')}
            icon={({color, size}) => <Ionicons name="person-circle-outline" size={size} color={color} />}
        />
        <DrawerItem 
          label="Change Password"
          onPress={() => router.push('/(drawer)/change-password')}
          icon={({color, size}) => <Ionicons name="key-outline" size={size} color={color} />}
        />
        
        {/* Divider Line */}
        <View className="h-[1px] bg-gray-100 my-1 mx-4" />
        
        <DrawerItem 
          label="Logout"
          onPress={logout}
          icon={({size}) => <Ionicons name="log-out-outline" size={size} color="#FF3B30" />}
          labelStyle={{ color: '#FF3B30', fontWeight: 'bold' }}
        />
      </View>
    </DrawerContentScrollView>
  );
}

// Main Layout Export
export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer 
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
            headerShown: true,
            drawerActiveTintColor: '#007AFF',
            drawerStyle: { width: 300 },
            headerTintColor: '#007AFF',
            // --- ADDED SEARCH ICON TO HEADER ---
            headerRight: () => (
              <TouchableOpacity
                onPress={() => router.push('/(drawer)/search')}
                className="mr-4"
              >
                <Ionicons name="search-outline" size={24} color="#007AFF" />
              </TouchableOpacity>
            ),
        }}
      >
        {/* Visible Routes */}
        <Drawer.Screen 
          name="dashboard" 
          options={{ drawerLabel: 'Dashboard', title: 'Dashboard' }} 
        />
        <Drawer.Screen 
          name="search" 
          options={{ drawerLabel: 'Search', title: 'Search Voter Data' }} 
        />
        <Drawer.Screen 
          name="user-manage" 
          options={{ drawerLabel: 'User Management', title: 'Manage Users' }} 
        />
        
        {/* Hidden Routes */}
        <Drawer.Screen 
          name="profile" 
          options={{ 
            drawerLabel: 'Profile', 
            title: 'My Profile',
            drawerItemStyle: { display: 'none' } 
          }} 
        />
        <Drawer.Screen 
          name="change-password" 
          options={{ 
            drawerLabel: 'Change Password', 
            title: 'Change Password',
            drawerItemStyle: { display: 'none' }
          }} 
        />
        <Drawer.Screen 
          name="user-add" 
          options={{ 
            drawerLabel: 'Add User', 
            title: 'Add New User',
            drawerItemStyle: { display: 'none' }
          }} 
        />
        <Drawer.Screen 
          name="user-edit" 
          options={{ 
            drawerLabel: 'Edit User', 
            title: 'Edit User',
            drawerItemStyle: { display: 'none' }
          }} 
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}