// components/ManageSite/AddManagerModal.js
import { useTranslation } from '@/hooks/useTranslation';
import { apiRequest } from '@/services/api';
import { Plus, Search, User, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import translations from './addManagerTranslations.json';

export default function AddManagerModal({ 
  visible, 
  onClose, 
  siteId, 
  onManagerAdded 
}) {
  const { t } = useTranslation(translations);
  const [activeTab, setActiveTab] = useState('existing'); // 'existing' or 'new'
  const [loading, setLoading] = useState(false);

  // Search existing users
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  // New user form
  const [newUserForm, setNewUserForm] = useState({
    phoneCode: '+254',
    phoneNumber: '',
    firstName: '',
    lastName: ''
  });

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await apiRequest('GET', `/users/search?q=${encodeURIComponent(query)}`);
      if (response.success) {
        setSearchResults(response.data.results || []);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleSearchInputChange = (text) => {
    setSearchQuery(text);
    // Debounce search
    setTimeout(() => searchUsers(text), 300);
  };

  const toggleUserSelection = (userId) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const validateNewUserForm = () => {
    const { phoneNumber, firstName, lastName } = newUserForm;
    
    if (!phoneNumber.trim()) {
      Alert.alert(t('error'), t('phoneNumberRequired'));
      return false;
    }
    
    if (!firstName.trim()) {
      Alert.alert(t('error'), t('firstNameRequired'));
      return false;
    }
    
    if (!lastName.trim()) {
      Alert.alert(t('error'), t('lastNameRequired'));
      return false;
    }

    // Basic phone number validation (10 digits)
    if (!/^\d{9,10}$/.test(phoneNumber.trim())) {
      Alert.alert(t('error'), t('invalidPhoneNumber'));
      return false;
    }

    return true;
  };

  const handleAddManagers = async () => {
    if (activeTab === 'existing' && selectedUserIds.length === 0) {
      Alert.alert(t('error'), t('selectAtLeastOneUser'));
      return;
    }

    if (activeTab === 'new' && !validateNewUserForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        user_ids: activeTab === 'existing' ? selectedUserIds : [],
        phone_numbers: activeTab === 'new' ? [{
          phone_code: newUserForm.phoneCode,
          phone_number: newUserForm.phoneNumber.trim(),
          first_name: newUserForm.firstName.trim(),
          last_name: newUserForm.lastName.trim()
        }] : []
      };

      const response = await apiRequest('POST', `/sites/${siteId}/add-managers/`, payload);

      if (response.success) {
        Alert.alert(
          t('success'), 
          activeTab === 'existing' 
            ? t('managersAddedSuccessfully')
            : t('managerCreatedSuccessfully'),
          [
            {
              text: t('ok'),
              onPress: () => {
                onManagerAdded?.();
                handleClose();
              }
            }
          ]
        );
      } else {
        Alert.alert(t('error'), response.error?.message || t('failedToAddManagers'));
      }
    } catch (error) {
      console.error('Error adding managers:', error);
      Alert.alert(t('error'), t('unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUserIds([]);
    setNewUserForm({
      phoneCode: '+254',
      phoneNumber: '',
      firstName: '',
      lastName: ''
    });
    setActiveTab('existing');
    onClose();
  };

  const renderExistingUsersTab = () => (
    <View className="flex-1">
      {/* Search Input */}
      <View className="mb-4">
        <View className="flex-row items-center bg-app-surface border border-app-border rounded-lg px-3 py-2">
          <Search size={20} color="#9E9E9E" />
          <TextInput
            className="flex-1 ml-2 text-app-text-primary"
            placeholder={t('searchUsers')}
            value={searchQuery}
            onChangeText={handleSearchInputChange}
            placeholderTextColor="#9E9E9E"
          />
        </View>
      </View>

      {/* Search Results */}
      <ScrollView className="flex-1 max-h-64">
        {searchResults.length > 0 ? (
          searchResults.map((user) => (
            <TouchableOpacity
              key={user.id}
              onPress={() => toggleUserSelection(user.id)}
              className={`flex-row items-center p-3 mb-2 rounded-lg border ${
                selectedUserIds.includes(user.id)
                  ? 'bg-app-primary-light border-app-primary'
                  : 'bg-app-surface border-app-border'
              }`}
            >
              <View className="w-10 h-10 bg-app-accent-light rounded-full justify-center items-center mr-3">
                <User size={20} color="#2196F3" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-app-text-primary">
                  {user.first_name} {user.last_name}
                </Text>
                <Text className="text-sm text-app-text-secondary">
                  {user.email || user.phone_number}
                </Text>
              </View>
              {selectedUserIds.includes(user.id) && (
                <View className="w-6 h-6 bg-app-primary rounded-full justify-center items-center">
                  <Text className="text-white text-xs font-bold">✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        ) : searchQuery.trim() ? (
          <View className="justify-center items-center py-8">
            <Text className="text-app-text-secondary text-center">
              {t('noUsersFound')}
            </Text>
          </View>
        ) : (
          <View className="justify-center items-center py-8">
            <Text className="text-app-text-secondary text-center">
              {t('startTypingToSearch')}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Selected Users Count */}
      {selectedUserIds.length > 0 && (
        <View className="bg-app-primary-light p-3 rounded-lg mt-3">
          <Text className="text-app-primary font-medium text-center">
            {t('selectedUsers', { count: selectedUserIds.length })}
          </Text>
        </View>
      )}
    </View>
  );

  const renderNewUserTab = () => (
    <ScrollView className="flex-1">
      {/* Phone Number */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-app-text-primary mb-2">
          {t('phoneNumber')} *
        </Text>
        <View className="flex-row">
          <View className="bg-app-surface border border-app-border rounded-lg px-3 py-2 mr-2">
            <Text className="text-app-text-primary">+254</Text>
          </View>
          <TextInput
            className="flex-1 bg-app-surface border border-app-border rounded-lg px-3 py-2 text-app-text-primary"
            placeholder="712345678"
            value={newUserForm.phoneNumber}
            onChangeText={(text) => setNewUserForm(prev => ({...prev, phoneNumber: text}))}
            keyboardType="phone-pad"
            placeholderTextColor="#9E9E9E"
          />
        </View>
      </View>

      {/* First Name */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-app-text-primary mb-2">
          {t('firstName')} *
        </Text>
        <TextInput
          className="bg-app-surface border border-app-border rounded-lg px-3 py-2 text-app-text-primary"
          placeholder={t('enterFirstName')}
          value={newUserForm.firstName}
          onChangeText={(text) => setNewUserForm(prev => ({...prev, firstName: text}))}
          placeholderTextColor="#9E9E9E"
        />
      </View>

      {/* Last Name */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-app-text-primary mb-2">
          {t('lastName')} *
        </Text>
        <TextInput
          className="bg-app-surface border border-app-border rounded-lg px-3 py-2 text-app-text-primary"
          placeholder={t('enterLastName')}
          value={newUserForm.lastName}
          onChangeText={(text) => setNewUserForm(prev => ({...prev, lastName: text}))}
          placeholderTextColor="#9E9E9E"
        />
      </View>

      <View className="bg-app-accent-light p-3 rounded-lg">
        <Text className="text-app-accent text-sm">
          {t('newUserNote')}
        </Text>
      </View>
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-green/80 justify-end">
        <View className="bg-app-background rounded-t-3xl flex-1 ">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-app-border">
            <Text className="text-xl font-semibold text-app-text-primary">
              {t('addManager')}
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <X size={24} color="#757575" />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View className="flex-row bg-app-surface mx-4 mt-4 rounded-lg p-1">
            <TouchableOpacity
              onPress={() => setActiveTab('existing')}
              className={`flex-1 py-2 px-4 rounded-md ${
                activeTab === 'existing' ? 'bg-app-primary' : 'bg-transparent'
              }`}
            >
              <Text className={`text-center font-medium ${
                activeTab === 'existing' ? 'text-white' : 'text-app-text-secondary'
              }`}>
                {t('existingUser')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('new')}
              className={`flex-1 py-2 px-4 rounded-md ${
                activeTab === 'new' ? 'bg-app-primary' : 'bg-transparent'
              }`}
            >
              <Text className={`text-center font-medium ${
                activeTab === 'new' ? 'text-white' : 'text-app-text-secondary'
              }`}>
                {t('newUser')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View className="flex-1 p-4">
            {activeTab === 'existing' ? renderExistingUsersTab() : renderNewUserTab()}
          </View>

          {/* Action Buttons */}
          <View className="flex-row p-4 border-t border-app-border">
            <TouchableOpacity
              onPress={handleClose}
              className="flex-1 bg-app-surface border border-app-border rounded-lg py-3 mr-2"
            >
              <Text className="text-center text-app-text-primary font-medium">
                {t('cancel')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleAddManagers}
              disabled={loading}
              className={`flex-1 rounded-lg py-3 ml-2 flex-row items-center justify-center ${
                loading ? 'bg-app-text-tertiary' : 'bg-app-primary'
              }`}
            >
              {loading ? (
                <Text className="text-white font-medium">{t('adding')}</Text>
              ) : (
                <>
                  <Plus size={16} color="white" className="mr-2" />
                  <Text className="text-white font-medium ml-2">
                    {t('addManager')}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}