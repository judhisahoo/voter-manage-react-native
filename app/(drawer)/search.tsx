import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import VoterDetailModal, { VoterData } from '../../components/VoterDetailModal';
import { apiClient } from '../../services/secureAxios';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<VoterData[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedVoter, setSelectedVoter] = useState<VoterData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // --- Search Logic ---
  const handleSearch = async () => {
    if (!query.trim()) {
      Alert.alert('Warning', 'Please enter at least one EPIC number');
      return;
    }

    setLoading(true);
    try {
      // FIX 1: Updated Endpoint to match Next.js (/voter-data/search)
      // FIX 2: Updated Payload key to 'epicNumbers' and passing string instead of array
      const data = await apiClient.post<VoterData[]>('/voter-data/search', { 
        epicNumbers: query 
      });
      
      const mappedData = (data || []).map(item => ({
        ...item,
        epic_no: item.epic_no
      }));

      setResults(mappedData);
      
      if (!mappedData || mappedData.length === 0) {
        // Optional: You can choose to show an alert or just let the empty state handle it
        // Alert.alert('Info', 'No records found for these numbers.');
      }
    } catch (error: any) {
      console.error("Search Error:", error);
      
      // FIX 3: Specific handling for 404 (Not Found)
      if (error.message?.includes('404') || error.response?.status === 404) {
        setResults([]); // Clear previous results
        Alert.alert('No Data Found', 'No records exist for the provided EPIC number(s).');
      } else {
        Alert.alert('Error', 'Failed to fetch voter data. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- View Details Logic ---
  const handleViewDetails = async (voterRecord: VoterData) => {
    setLoadingDetails(true);
    try {
      const response = await apiClient.get<VoterData>(`/voter-data/details/${voterRecord.epic_no}`);
      if (response) {
        setSelectedVoter(response);
      } else {
        throw new Error("No data");
      }
      setModalVisible(true);
    } catch (error) {
      console.log("⚠️ Could not fetch details, using fallback data");
      setSelectedVoter(voterRecord);
      setModalVisible(true);
    } finally {
      setLoadingDetails(false);
    }
  };

  const renderItem = ({ item }: { item: VoterData }) => (
    <View className="bg-white p-4 rounded-xl mb-3 shadow-sm border border-gray-100 flex-row justify-between items-center">
      <View className="flex-1">
        <Text className="text-lg font-bold text-gray-800">{item.name}</Text>
        <View className="flex-row items-center mt-1 flex-wrap">
          <View className="bg-indigo-50 px-2 py-0.5 rounded mr-2 mb-1">
            <Text className="text-xs text-indigo-700 font-bold">{item.epic_no}</Text>
          </View>
          <Text className="text-xs text-gray-500 mr-2 mb-1">Age: {item.age}</Text>
          <View className={`px-2 py-0.5 rounded mb-1 ${
             item.status === 'VALID' || item.status === 'Active' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <Text className={`text-xs font-bold ${
               item.status === 'VALID' || item.status === 'Active' ? 'text-green-700' : 'text-red-700'
            }`}>
              {item.status || 'UNKNOWN'}
            </Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity 
        onPress={() => handleViewDetails(item)}
        className="bg-gray-50 p-3 rounded-full border border-gray-200"
      >
        <Ionicons name="eye-outline" size={20} color="#4F46E5" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      {/* Loading Overlay */}
      {loadingDetails && (
        <View className="absolute z-50 inset-0 bg-black/20 justify-center items-center">
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id || item._id || item.epic_no}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        ListHeaderComponent={
          <View className="mb-6">
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Search Voter Data
            </Text>
            <Text className="text-gray-500 mb-6 text-base">
              Enter EPIC numbers separated by commas
            </Text>

            <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <Text className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                EPIC Numbers
              </Text>
              
              <View className="border border-gray-300 rounded-lg bg-white mb-2">
                <TextInput
                  className="p-3 text-base text-gray-800 h-12"
                  placeholder="XKQ5571104, XKQ5571105..."
                  placeholderTextColor="#9CA3AF"
                  value={query}
                  onChangeText={setQuery}
                  autoCapitalize="characters"
                />
              </View>
              
              <Text className="text-xs text-gray-400 mb-4">
                Tip: You can search multiple records at once using commas.
              </Text>

              <TouchableOpacity 
                onPress={handleSearch}
                disabled={loading}
                className="bg-indigo-600 rounded-lg py-3 flex-row justify-center items-center shadow-sm"
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Ionicons name="search" size={20} color="white" style={{ marginRight: 8 }} />
                    <Text className="text-white font-bold text-base">Search Database</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {results.length > 0 && (
              <Text className="text-lg font-bold text-gray-800 mt-6 mb-2">
                Search Results ({results.length})
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          !loading && results.length === 0 ? (
            <View className="items-center justify-center py-10 opacity-50">
              <Ionicons name="search-outline" size={48} color="#CBD5E1" />
              <Text className="text-gray-400 mt-2">No results to display</Text>
            </View>
          ) : null
        }
      />

      {/* --- Reusable Modal Component --- */}
      <VoterDetailModal 
        visible={modalVisible}
        voter={selectedVoter}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}