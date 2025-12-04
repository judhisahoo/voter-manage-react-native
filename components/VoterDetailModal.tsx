import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// --- Interface matching your data structure ---
export interface VoterData {
  _id?: string;
  id?: string;
  epic_no: string;
  name: string;
  name_in_regional_lang?: string;
  age: string;
  gender: string;
  father_name?: string;
  relation_type?: string;
  relation_name?: string;
  state: string;
  district: string;
  city?: string;
  status?: string;
  assembly_constituency?: string;
  parliamentary_constituency?: string;
  part_number?: string;
  part_name?: string;
  polling_station?: string;
  address?: string;
  dataSource?: string;
  createdAt?: string;
}

interface Props {
  visible: boolean;
  voter: VoterData | null;
  onClose: () => void;
}

export default function VoterDetailModal({ visible, voter, onClose }: Props) {
  if (!voter) return null;

  const copyToClipboard = () => {
    const text = JSON.stringify(voter, null, 2);
    // In production, use expo-clipboard
    Alert.alert("Copied", "Voter details copied to clipboard!"); 
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/60">
        <View className="bg-white rounded-t-3xl h-[85%] shadow-2xl overflow-hidden">
          
          {/* Header */}
          <View className="bg-indigo-600 px-6 py-4 flex-row justify-between items-center">
            <View className="flex-row items-center">
              <FontAwesome5 name="id-card" size={24} color="white" />
              <View className="ml-3">
                <Text className="text-white text-xl font-bold">Voter Details</Text>
                <Text className="text-indigo-100 text-sm">EPIC No: {voter.epic_no}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} className="bg-white/20 p-2 rounded-full">
              <Ionicons name="close" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Content Body */}
          <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
            
            {/* Status Section */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-lg font-semibold text-gray-800">Status</Text>
              <View className={`px-4 py-2 rounded-full ${
                voter.status === 'VALID' || voter.status === 'Active' 
                  ? 'bg-green-500' : 'bg-red-500'
              }`}>
                <Text className="text-white font-semibold">
                  {voter.status || 'UNKNOWN'}
                </Text>
              </View>
            </View>

            {/* Personal Information */}
            <View className="border-t border-gray-100 pt-6 mb-6">
              <View className="flex-row items-center mb-4">
                <FontAwesome5 name="user" size={16} color="#4F46E5" />
                <Text className="text-lg font-semibold text-gray-800 ml-2">Personal Information</Text>
              </View>
              
              <View className="flex-row flex-wrap">
                <InfoBox label="Full Name" value={voter.name} fullWidth />
                <InfoBox label="Age" value={voter.age ? `${voter.age} years` : undefined} />
                <InfoBox label="Gender" value={voter.gender} />
                <InfoBox label="Father's Name" value={voter.father_name} />
                <InfoBox label="Relation Type" value={voter.relation_type} />
                <InfoBox label="Relation Name" value={voter.relation_name} />
                <InfoBox label="Regional Name" value={voter.name_in_regional_lang} fullWidth />
              </View>
            </View>

            {/* Address Information */}
            <View className="border-t border-gray-100 pt-6 mb-6">
              <View className="flex-row items-center mb-4">
                <FontAwesome5 name="map-marker-alt" size={16} color="#4F46E5" />
                <Text className="text-lg font-semibold text-gray-800 ml-2">Address Information</Text>
              </View>

              <View className="flex-row flex-wrap">
                <InfoBox label="State" value={voter.state} />
                <InfoBox label="District" value={voter.district} />
                <InfoBox label="City" value={voter.city} />
                <InfoBox label="Assembly Const." value={voter.assembly_constituency} />
                <InfoBox label="Parliamentary Const." value={voter.parliamentary_constituency} />
                <InfoBox label="Part Number" value={voter.part_number} />
                <InfoBox label="Part Name" value={voter.part_name} fullWidth />
                <InfoBox label="Polling Station" value={voter.polling_station} fullWidth />
                <InfoBox label="Address" value={voter.address} fullWidth />
              </View>
            </View>

            {/* Meta Information */}
            {(voter.dataSource || voter.createdAt) && (
              <View className="border-t border-gray-100 pt-6 mb-6">
                  <Text className="text-lg font-semibold text-gray-800 mb-4">Additional Information</Text>
                  <View className="flex-row flex-wrap">
                    <InfoBox label="Data Source" value={voter.dataSource} />
                    <InfoBox label="Added On" value={voter.createdAt ? new Date(voter.createdAt).toLocaleDateString() : 'N/A'} />
                  </View>
              </View>
            )}

            {/* Footer Actions */}
            <View className="border-t border-gray-100 pt-6 pb-10 flex-row gap-4">
                <TouchableOpacity 
                onPress={onClose}
                className="flex-1 bg-gray-200 py-3 rounded-lg items-center"
                >
                  <Text className="text-gray-800 font-semibold">Close</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                onPress={copyToClipboard}
                className="flex-1 bg-indigo-600 py-3 rounded-lg items-center"
                >
                  <Text className="text-white font-semibold">Copy Details</Text>
                </TouchableOpacity>
            </View>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// Helper Component for Modal Info Grid
const InfoBox = ({ label, value, fullWidth }: { label: string; value?: string; fullWidth?: boolean }) => {
  if (!value) return null;
  return (
    <View className={`mb-4 ${fullWidth ? 'w-full' : 'w-1/2 pr-2'}`}>
      <Text className="text-gray-500 text-xs font-medium mb-1 uppercase tracking-wider">{label}</Text>
      <Text className="text-gray-900 font-semibold text-base">{value}</Text>
    </View>
  );
};