import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Saves a key-value pair.
 * Uses localStorage on Web and SecureStore on Mobile.
 */
export async function setStorageItem(key: string, value: string) {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error('Local storage is unavailable:', e);
    }
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

/**
 * Retrieves a value by key.
 */
export async function getStorageItem(key: string) {
  if (Platform.OS === 'web') {
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
    } catch (e) {
      console.error('Local storage is unavailable:', e);
    }
    return null;
  } else {
    return await SecureStore.getItemAsync(key);
  }
}

/**
 * Deletes a value by key.
 */
export async function removeStorageItem(key: string) {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Local storage is unavailable:', e);
    }
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}