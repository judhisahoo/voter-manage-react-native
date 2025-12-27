import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import VoterDetailModal, { VoterData } from '../../components/VoterDetailModal';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/secureAxios';
import { Voter, voterService } from '../../services/voterService';

export default function VoterListScreen() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [voters, setVoters] = useState<Voter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'age' | 'epic_number' | 'state'>('name');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'blocked'>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVoter, setSelectedVoter] = useState<VoterData | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [order, setOrder] = useState<'desc' | 'asc'>('desc');
  const [stateFilter, setStateFilter] = useState<string>('');
  const [genderFilter, setGenderFilter] = useState<string>('All Genders');
  const [perPage, setPerPage] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);

  const stateOptions = [
    { value: '', label: 'All States' },
    { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
    { value: 'Arunachal Pradesh', label: 'Arunachal Pradesh' },
    { value: 'Assam', label: 'Assam' },
    { value: 'Bihar', label: 'Bihar' },
    { value: 'Chhattisgarh', label: 'Chhattisgarh' },
    { value: 'Goa', label: 'Goa' },
    { value: 'Gujarat', label: 'Gujarat' },
    { value: 'Haryana', label: 'Haryana' },
    { value: 'Himachal Pradesh', label: 'Himachal Pradesh' },
    { value: 'Jharkhand', label: 'Jharkhand' },
    { value: 'Karnataka', label: 'Karnataka' },
    { value: 'Kerala', label: 'Kerala' },
    { value: 'Madhya Pradesh', label: 'Madhya Pradesh' },
    { value: 'Maharashtra', label: 'Maharashtra' },
    { value: 'Manipur', label: 'Manipur' },
    { value: 'Meghalaya', label: 'Meghalaya' },
    { value: 'Mizoram', label: 'Mizoram' },
    { value: 'Nagaland', label: 'Nagaland' },
    { value: 'Odisha', label: 'Odisha' },
    { value: 'Punjab', label: 'Punjab' },
    { value: 'Rajasthan', label: 'Rajasthan' },
    { value: 'Sikkim', label: 'Sikkim' },
    { value: 'Tamil Nadu', label: 'Tamil Nadu' },
    { value: 'Telangana', label: 'Telangana' },
    { value: 'Tripura', label: 'Tripura' },
    { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
    { value: 'Uttarakhand', label: 'Uttarakhand' },
    { value: 'West Bengal', label: 'West Bengal' },
    { value: 'Andaman and Nicobar Islands', label: 'Andaman and Nicobar Islands' },
    { value: 'Chandigarh', label: 'Chandigarh' },
    { value: 'Dadra and Nagar Haveli and Daman and Diu', label: 'Dadra and Nagar Haveli and Daman and Diu' },
    { value: 'Delhi', label: 'Delhi' },
    { value: 'Jammu and Kashmir', label: 'Jammu and Kashmir' },
    { value: 'Ladakh', label: 'Ladakh' },
    { value: 'Lakshadweep', label: 'Lakshadweep' },
    { value: 'Puducherry', label: 'Puducherry' },
  ];
  const loadVoters = useCallback(async () => {
    try {
      setLoading(true);
      const q: any = {};
      if (searchQuery) q.q = searchQuery;
      if (sortBy) q.sortBy = sortBy;
      if (order) q.sortOrder = order;
      if (statusFilter !== 'all') q.status = statusFilter;
      if (stateFilter) q.state = stateFilter;
      if (genderFilter && genderFilter !== 'All Genders') q.gender = genderFilter;
      if (perPage) q.limit = perPage;
      if (page) q.page = page;

      const data = await voterService.getAllVoters(q);
      setVoters(data || []);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load voters');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, sortBy, order, statusFilter, stateFilter, genderFilter, perPage, page]);

  useEffect(() => {
    loadVoters();
  }, [loadVoters]);

  const confirmStatusChange = (epicNo: string, currentDisabled: boolean) => {
    const action = currentDisabled ? 'Activate' : 'Inactivate';
    Alert.alert(`${action} Voter`, `Set voter to ${action.toLowerCase()}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'OK', onPress: () => changeStatus(epicNo, !currentDisabled) },
    ]);
  };

  const changeStatus = async (epicNo: string, activate: boolean) => {
    try {
      setLoading(true);
      if (activate) {
        await voterService.disableVoter(epicNo);
      } else {
        await voterService.enableVoter(epicNo);
      }
      await loadVoters();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to change status');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id: string) => {
    Alert.alert('Delete Voter', 'Are you sure you want to delete this voter?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteVoter(id) },
    ]);
  };

  const deleteVoter = async (id: string) => {
    try {
      setLoading(true);
      await voterService.deleteVoter(id);
      await loadVoters();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to delete voter');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (item: Voter) => {
    setLoading(true);
    try {
      const identifier = (item as any).epic_no || item.id || item._id;
      if (identifier) {
        const response = await apiClient.get<VoterData>(`/voter-data/details/${identifier}`);
        if (response) setSelectedVoter(response);
        else setSelectedVoter(item as unknown as VoterData);
      } else {
        setSelectedVoter(item as unknown as VoterData);
      }
    } catch (err) {
      setSelectedVoter(item as unknown as VoterData);
    } finally {
      setLoading(false);
      setModalVisible(true);
    }
  };

  const normalizeStatus = (s?: any) : 'active' | 'inactive' | 'blocked' | 'unknown' => {
    if (typeof s === 'boolean') return s ? 'inactive' : 'active';
    if (!s) return 'unknown';
    const v = String(s).toLowerCase();
    if (v === 'true' || v.includes('valid') || v === 'active') return 'active';
    if (v === 'false' || v.includes('inactive') || v === 'inactive') return 'inactive';
    if (v.includes('blocked') || v === 'blocked') return 'blocked';
    return 'unknown';
  };

  const renderItem = ({ item }: { item: Voter }) => (
    <View className="bg-white p-4 rounded-xl mb-3 shadow-sm border border-gray-100 flex-row justify-between items-center">
      <View className="flex-1">
        <Text className="text-lg font-bold text-gray-800">{item.name}</Text>
        <View className="flex-row items-center mt-1 flex-wrap">
          {(item as any).epic_no ? (
            <View className="bg-indigo-50 px-2 py-0.5 rounded mr-2 mb-1">
              <Text className="text-xs text-indigo-700 font-bold">{(item as any).epic_no}</Text>
            </View>
          ) : null}

          {(item as any).age ? <Text className="text-xs text-gray-500 mr-2 mb-1">Age: {(item as any).age}</Text> : null}

          {(() => {
            const isDisabled = (item as any).isDisabled === true || String((item as any).isDisabled).toLowerCase() === 'true';
            return (
              <View className={`px-2 py-0.5 rounded mb-1 ${isDisabled ? 'bg-red-100' : 'bg-green-100'}`}>
                <Text className={`text-xs font-bold ${isDisabled ? 'text-red-700' : 'text-green-700'}`}>{isDisabled ? 'Inactive' : 'Active'}</Text>
              </View>
            );
          })()}
        </View>
      </View>
      <View className="flex-row items-center gap-3">
        <TouchableOpacity onPress={() => handleViewDetails(item)} className="bg-gray-50 p-3 rounded-full border border-gray-200">
          <Ionicons name="eye-outline" size={20} color="#4F46E5" />
        </TouchableOpacity>

        {isAdmin && (() => {
          const epic = (item as any).epic_no || item._id || item.id || '';
          const isDisabled = (item as any).isDisabled === true || String((item as any).isDisabled).toLowerCase() === 'true';
          return (
            <>
              <TouchableOpacity
                onPress={() => confirmStatusChange(epic, isDisabled)}
                className="bg-yellow-50 px-3 py-2 rounded border border-yellow-100"
              >
                <Text className="text-sm text-yellow-700">{isDisabled ? 'Activate' : 'Deactivate'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => confirmDelete(epic)}
                className="bg-red-50 px-3 py-2 rounded border border-red-100"
              >
                <Ionicons name="trash-outline" size={18} color="#DC2626" />
              </TouchableOpacity>
            </>
          );
        })()}
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-[#F8FAFC] p-4">
      <View className="mb-6">
        <Text className="text-3xl font-bold text-gray-900 mb-2">Voter Data</Text>
        <Text className="text-gray-500 mb-4">Search and filter voter records</Text>

        <View className="bg-white p-1 rounded-2xl shadow-sm border border-gray-200 flex-row items-center">
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput placeholder="Search by name, EPIC number.." value={searchQuery} onChangeText={setSearchQuery} className="flex-1 ml-2 h-9" />
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View className="mt-3 flex-row items-center">
          <TouchableOpacity onPress={() => setAdvancedOpen(!advancedOpen)} className="bg-white border border-gray-200 rounded-lg px-4 py-2 flex-row items-center">
            <Ionicons name="funnel-outline" size={16} color="#111827" style={{ marginRight: 8 }} />
            <Text className="font-medium">Advanced Filters ▾</Text>
          </TouchableOpacity>
        </View>

        {advancedOpen && (
          <View className="bg-white p-4 rounded-xl mt-4 shadow-sm border border-gray-200">
            <View className="mb-3">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Sort By</Text>
              <View>
                <TouchableOpacity
                  onPress={() => setSortDropdownOpen(!sortDropdownOpen)}
                  className="border border-gray-300 rounded px-3 py-2 bg-white flex-row justify-between items-center"
                >
                  <Text className="text-gray-700">
                    {(() => {
                      switch (sortBy) {
                        case 'name': return 'Name';
                        case 'age': return 'Age';
                        case 'epic_number': return 'EPIC Number';
                        case 'state': return 'State';
                        default: return 'Name';
                      }
                    })()}
                  </Text>
                  <Text className="text-gray-400">▾</Text>
                </TouchableOpacity>

                {sortDropdownOpen && (
                  <View className="mt-2 bg-white border border-gray-200 rounded shadow-sm">
                    {[
                      { key: 'name', label: 'Name' },
                      { key: 'age', label: 'Age' },
                      { key: 'epic_number', label: 'EPIC Number' },
                      { key: 'state', label: 'State' },
                    ].map((opt) => (
                      <TouchableOpacity
                        key={opt.key}
                        onPress={() => {
                          // @ts-ignore
                          setSortBy(opt.key);
                          setSortDropdownOpen(false);
                        }}
                        className={`px-3 py-2 ${sortBy === opt.key ? 'bg-blue-50' : ''}`}
                      >
                        <Text className={`${sortBy === opt.key ? 'text-[#007AFF]' : 'text-gray-700'}`}>{opt.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            <View className="mb-3">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Order</Text>
              <View className="flex-row gap-2">
                <TouchableOpacity onPress={() => setOrder('desc')} className={`px-3 py-2 rounded ${order==='desc'?'bg-blue-50':'bg-white'}`}><Text className={`${order==='desc'?'text-[#007AFF]':'text-gray-700'}`}>Descending (New First)</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setOrder('asc')} className={`px-3 py-2 rounded ${order==='asc'?'bg-blue-50':'bg-white'}`}><Text className={`${order==='asc'?'text-[#007AFF]':'text-gray-700'}`}>Ascending (Old First)</Text></TouchableOpacity>
              </View>
            </View>

            <View className="mb-3">
              <Text className="text-sm font-semibold text-gray-700 mb-2">State</Text>
              <View>
                <TouchableOpacity
                  onPress={() => setStateDropdownOpen(!stateDropdownOpen)}
                  className="border border-gray-300 rounded px-3 py-2 bg-white flex-row justify-between items-center"
                >
                  <Text className="text-gray-700">{stateOptions.find(s => s.value === stateFilter)?.label || 'All States'}</Text>
                  <Text className="text-gray-400">▾</Text>
                </TouchableOpacity>

                {stateDropdownOpen && (
                  <View className="mt-2 bg-white border border-gray-200 rounded shadow-sm">
                    <ScrollView style={{ maxHeight: 220 }} nestedScrollEnabled keyboardShouldPersistTaps="handled">
                      {stateOptions.map((opt) => (
                        <TouchableOpacity
                          key={opt.value}
                          onPress={() => { setStateFilter(opt.value); setStateDropdownOpen(false); }}
                          className={`px-3 py-2 ${stateFilter === opt.value ? 'bg-blue-50' : ''}`}
                        >
                          <Text className={`${stateFilter === opt.value ? 'text-[#007AFF]' : 'text-gray-700'}`}>{opt.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>

            <View className="mb-3">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Gender</Text>
              <View className="flex-row gap-2">
                <TouchableOpacity onPress={() => setGenderFilter('All Genders')} className={`px-3 py-2 rounded ${genderFilter==='All Genders'?'bg-gray-100':'bg-white'}`}><Text>All Genders</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setGenderFilter('Male')} className={`px-3 py-2 rounded ${genderFilter==='Male'?'bg-gray-100':'bg-white'}`}><Text>Male</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setGenderFilter('Female')} className={`px-3 py-2 rounded ${genderFilter==='Female'?'bg-gray-100':'bg-white'}`}><Text>Female</Text></TouchableOpacity>
              </View>
            </View>

            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-2">Records Per Page</Text>
              <View className="flex-row gap-2">
                <TouchableOpacity onPress={() => setPerPage(10)} className={`px-3 py-2 rounded ${perPage===10?'bg-gray-100':'bg-white'}`}><Text>10</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setPerPage(25)} className={`px-3 py-2 rounded ${perPage===25?'bg-gray-100':'bg-white'}`}><Text>25</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setPerPage(50)} className={`px-3 py-2 rounded ${perPage===50?'bg-gray-100':'bg-white'}`}><Text>50</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList data={voters} keyExtractor={(i) => i._id || i.id || Math.random().toString()} renderItem={renderItem} contentContainerStyle={{ paddingBottom: 120 }} />
      )}
      <VoterDetailModal visible={modalVisible} voter={selectedVoter} onClose={() => { setModalVisible(false); setSelectedVoter(null); }} />
    </View>
  );
}
