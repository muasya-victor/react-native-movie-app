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

  // Define different tab configurations
  const getTabsForUser = (): TabConfig[] => {
    const baseTabs: TabConfig[] = [
      {
        name: "index",
        title: "Home",
        icon: "home-outline",
      },
    ];
    const profile: TabConfig[] = [
      {
        name: "profile",
        title: "Profile",
        icon: "person-outline",
      },
    ];

    if (userType === "SystemAdmin") {
      return [
        ...baseTabs,
        {
          name: "menu",
          title: "Menu",
          icon: "wine-outline",
        },
        {
          name: "settings",
          title: "Settings",
          icon: "settings-outline",
        },
        ...profile,
      ];
    }

    if (userType === "SiteManager") {
      return [
        ...baseTabs,
        // {
        //   name: "workers",
        //   title: "Workers",
        //   icon: "people-outline"
        // },
        {
          name: "payments",
          title: "Payments",
          icon: "cash-outline",
        },
        // {
        //   name: "withdrawal-requests",
        //   title: "Requests",
        //   icon: "document-text-outline",
        // },
        ...profile,
      ];
    }

    // WageWorker tabs (default)
    return [
      ...baseTabs,
      {
        name: "transactions",
        title: "Transactions",
        icon: "cash-outline",
      },
      ...profile,
    ];
  };

  // Get all possible tab names to determine which ones to hide
  const visibleTabs = getTabsForUser().map((tab) => tab.name);

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

      {/* Hidden routes - these pages exist but aren't shown in tabs */}
      <Tabs.Screen name="withdraw-mpesa" options={{ href: null }} />
      <Tabs.Screen name="withdraw-without-mpesa" options={{ href: null }} />
      <Tabs.Screen name="add-worker" options={{ href: null }} />
      <Tabs.Screen name="worker/[id]" options={{ href: null }} />
      <Tabs.Screen name="add-site" options={{ href: null }} />
      <Tabs.Screen name="worker-details" options={{ href: null }} />
      <Tabs.Screen name="place-order" options={{ href: null }} />
      <Tabs.Screen name="add-menu-item" options={{ href: null }} />
      <Tabs.Screen
        name="disbursements/confirmation-page"
        options={{ href: null }}
      />
      <Tabs.Screen name="disbursements/success-page" options={{ href: null }} />

      {!visibleTabs.includes("workers") && (
        <Tabs.Screen name="workers" options={{ href: null }} />
      )}
      {!visibleTabs.includes("transactions") && (
        <Tabs.Screen name="transactions" options={{ href: null }} />
      )}
      {!visibleTabs.includes("payments") && (
        <Tabs.Screen name="payments" options={{ href: null }} />
      )}
      {!visibleTabs.includes("withdrawal-requests") && (
        <Tabs.Screen name="withdrawal-requests" options={{ href: null }} />
      )}
      {!visibleTabs.includes("sites") && (
        <Tabs.Screen name="sites" options={{ href: null }} />
      )}
      {!visibleTabs.includes("menu") && (
        <Tabs.Screen name="menu" options={{ href: null }} />
      )}
      {!visibleTabs.includes("settings") && (
        <Tabs.Screen name="settings" options={{ href: null }} />
      )}
    </Tabs>
  );
}
