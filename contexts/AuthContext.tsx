import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define user types
export type UserType = 'WageWorker' | 'SiteManager' | 'SystemAdmin';

// Define user interface
export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  userType?: UserType;
}

// Define the context interface
interface AuthContextType {
  // State
  user: User | null;
  userType: UserType;
  isLoading: boolean;
  
  // Actions
  switchUserType: (newUserType: UserType) => Promise<{ success: boolean; error?: string }>;
  updateUser: (updatedUserData: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  
  // Helpers
  isSiteManager: () => boolean;
  isWageWorker: () => boolean;
  isSystemAdmin: () => boolean;
}

// Create the Auth Context with proper typing
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define props for the provider
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<UserType>('SiteManager'); // Default to SystemManager,WageWorker
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth state on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Check if user data exists in AsyncStorage
      const userData = await AsyncStorage.getItem('user');
      const savedUserType = await AsyncStorage.getItem('userType');
      
      if (userData && savedUserType) {
        const parsedUser: User = JSON.parse(userData);
        setUser(parsedUser);
        setUserType(savedUserType as UserType);
      } else {
        // Set default user
        const defaultUser: User = {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
        };
        setUser(defaultUser);
        setUserType('WageWorker');
        
        // Save to AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify(defaultUser));
        await AsyncStorage.setItem('userType', 'WageWorker');
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get user data based on type
  const getUserDataByType = (type: UserType): Partial<User> => {
    const userData: Record<UserType, Partial<User>> = {
      WageWorker: {
        name: 'John Worker',
        email: 'worker@example.com',
        role: 'Construction Worker'
      },
      SiteManager: {
        name: 'Jane Manager',
        email: 'manager@example.com',
        role: 'Site Manager'
      },
      SystemAdmin: {
        name: 'Admin Smith',
        email: 'admin@example.com',
        role: 'System Administrator'
      }
    };
    
    return userData[type] || userData.WageWorker;
  };

  // Function to switch between user types for testing
  const switchUserType = async (newUserType: UserType): Promise<{ success: boolean; error?: string }> => {
    try {
      setUserType(newUserType);
      await AsyncStorage.setItem('userType', newUserType);
      
      // Update user data based on type
      const typeUserData = getUserDataByType(newUserType);
      const updatedUser: User = {
        ...user!,
        userType: newUserType,
        ...typeUserData
      };
      
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      return { success: true };
    } catch (error) {
      console.error('Error switching user type:', error);
      return { success: false, error: (error as Error).message };
    }
  };

  const updateUser = async (updatedUserData: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        throw new Error('No user to update');
      }
      
      const updatedUser: User = { ...user, ...updatedUserData };
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error: (error as Error).message };
    }
  };

  // Helper functions
  const isSiteManager = (): boolean => userType === 'SiteManager';
  const isWageWorker = (): boolean => userType === 'WageWorker';
  const isSystemAdmin = (): boolean => userType === 'SystemAdmin';

  const contextValue: AuthContextType = {
    // State
    user,
    userType,
    isLoading,
    
    // Actions
    switchUserType,
    updateUser,
    
    // Helpers
    isSiteManager,
    isWageWorker,
    isSystemAdmin,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context with proper error handling
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
