// app/(tabs)/_layout.tsx - Fixed duplicate screen names
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

// Define tab configuration interface
interface TabConfig {
  name: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export default function TabsLayout() {
  const { user, userType } = useAuth();

  console.log('Current userType:', userType);

  // Define different tab configurations
  const getTabsForUser = (): TabConfig[] => {
    const baseTabs: TabConfig[] = [
      {
        name: "index",
        title: "Home",
        icon: "home-outline"
      },
    ];
    const profile: TabConfig[] = [
      {
        name: "profile",
        title: "Profile",
        icon: "person-outline"
      }
    ];

    if (userType === 'SystemAdmin') {
      return [
        ...baseTabs,
        {
          name: "workers",
          title: "Workers",
          icon: "people-outline"
        },
        ...profile
      ];
    }

    if (userType === 'SiteManager') {
      return [
        ...baseTabs,
        {
          name: "workers",
          title: "Workers",
          icon: "people-outline"
        },
        ...profile,

      ];
    }

    // WageWorker tabs (default)
    return [
      ...baseTabs,
      {
        name: "transactions", 
        title: "Transactions",
        icon: "cash-outline"
      },
      ...profile,

    ];
  };

  // Get all possible tab names to determine which ones to hide
  const visibleTabs = getTabsForUser().map(tab => tab.name);
  const allPossibleTabs = ["workers",  "transactions"];
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#4CAF50",
        tabBarStyle: {
          paddingTop: 10,    
        },
        tabBarLabelStyle: {
          fontSize: 10,      
        },
      }}
    >
      {/* Render visible tabs */}
      {getTabsForUser().map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name={tab.icon} size={size} color={color} />
            ),
          }}
        />
      ))}
      
      {/* Hidden routes that are always hidden */}
      <Tabs.Screen name="withdraw-mpesa" options={{ href: null }} />
      <Tabs.Screen name="withdraw-without-mpesa" options={{ href: null }} />
      <Tabs.Screen name="add-worker" options={{ href: null }} />
      <Tabs.Screen name="worker/[id]" options={{ href: null }} />
      
      {/* Hide tabs that aren't visible for current user */}
      {allPossibleTabs
        .filter(tabName => !visibleTabs.includes(tabName))
        .map(tabName => (
          <Tabs.Screen 
            key={`hidden-${tabName}`}
            name={tabName} 
            options={{ href: null }} 
          />
        ))
      }
    </Tabs>
  );
}