import { Link, Stack, router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useAuth } from '../context/AuthContext';

export default function NotFoundScreen() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    // Redirect to dashboard if logged in, otherwise to login
    if (user) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [loading, user]);

  return (
    <>
      <Stack.Screen options={{ title: 'Redirecting...' }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen doesn't exist.</Text>
        <Text style={{ marginTop: 8, color: '#6B7280' }}>Redirecting you to the app...</Text>
        <ActivityIndicator style={{ marginTop: 20 }} size="small" color="#2e78b7" />
        <View style={styles.link}>
          <Link href="/">
            <Text style={styles.linkText}>Go to home screen!</Text>
          </Link>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
