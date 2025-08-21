import { useAuth } from '@/contexts/AuthContext';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function UserTypeSwitcher() {
  const { user, userType, switchUserType, isLoading } = useAuth();

  const handleSwitchUserType = async (newType) => {
    const result = await switchUserType(newType);
    if (result.success) {
      Alert.alert('Success', `Switched to ${newType}`);
    } else {
      Alert.alert('Error', 'Failed to switch user type');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Type Switcher (For Testing)</Text>
      
      <View style={styles.userInfo}>
        <Text style={styles.userText}>Current User: {user?.name}</Text>
        <Text style={styles.userText}>User Type: {userType}</Text>
        <Text style={styles.userText}>Email: {user?.email}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[
            styles.button, 
            userType === 'WageWorker' && styles.activeButton
          ]}
          onPress={() => handleSwitchUserType('WageWorker')}
        >
          <Text style={[
            styles.buttonText,
            userType === 'WageWorker' && styles.activeButtonText
          ]}>
            Switch to Wage Worker
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.button, 
            userType === 'SiteManager' && styles.activeButton
          ]}
          onPress={() => handleSwitchUserType('SiteManager')}
        >
          <Text style={[
            styles.buttonText,
            userType === 'SiteManager' && styles.activeButtonText
          ]}>
            Switch to Site Manager
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.note}>
        Switch between user types to see different tabs appear in the navigation
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  userInfo: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
  },
  userText: {
    fontSize: 16,
    marginBottom: 5,
  },
  buttonContainer: {
    gap: 15,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  activeButtonText: {
    color: 'white',
  },
  note: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
});