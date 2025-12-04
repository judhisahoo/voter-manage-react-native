import { apiClient } from './secureAxios';

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: 'admin' | 'support';
  status?: 'active' | 'inactive' | 'blocked';
  lastLogin?: string;
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'support';
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: 'admin' | 'support';
}

export interface UserListResponse {
  data?: User[];
  users?: User[];
}

class UserService {
  // Get all users (admin only)
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await apiClient.get<User[] | UserListResponse>('/users');
      console.log('response ::', response);
      
      // Handle different response structures
      // If response is already an array, return it directly
      if (Array.isArray(response)) {
        return response;
      }
      
      // If response is an object, check for data or users property
      if (response && typeof response === 'object') {
        const responseObj = response as UserListResponse;
        return responseObj.data || responseObj.users || [];
      }
      
      // Fallback to empty array
      return [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Get user by ID
  async getUserById(id: string): Promise<User> {
    try {
      const response = await apiClient.get<User>(`/users/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  // Create new user (admin only)
  async createUser(userData: CreateUserDto): Promise<User> {
    try {
      const response = await apiClient.post<User>('/users', userData);
      return response;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Update user (admin only)
  async updateUser(id: string, userData: UpdateUserDto): Promise<User> {
    try {
      const response = await apiClient.put<User>(`/users/${id}`, userData);
      return response;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Update user status (admin only)
  async updateUserStatus(id: string, status: 'active' | 'inactive' | 'blocked'): Promise<User> {
    try {
      const response = await apiClient.patch<User>(`/users/${id}/status`, { status });
      return response;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }

  // Delete user (admin only)
  async deleteUser(id: string): Promise<void> {
    try {
      await apiClient.delete(`/users/${id}`);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}

export const userService = new UserService();

