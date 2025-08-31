// app/(tabs)/_layout.tsx
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
        ...profile,
      ];
    }

    if (userType === "SiteManager") {
      return [
        ...baseTabs,
        // {
        //   name: "workers",
        //   title: "Workers",
        //   icon: "people-outline",
        // },
        {
          name: "payments",
          title: "Payments",
          icon: "cash-outline",
        },
        {
          name: "place-order",
          title: "Place Order",
          icon: "fast-food-outline",
        },
        {
          name: "attendance",
          title: "Attendance",
          icon: "calendar-outline",
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
        icon: "cash-outline",
      },
      ...profile,
    ];
  };

  // Get all possible tab names to determine which ones to hide
  const visibleTabs = getTabsForUser().map((tab) => tab.name);

  // All possible screen names that exist in your app
  const allScreens = [
    "index",
    "payments",
    "withdrawal-requests",
    "profile",
    "withdraw-mpesa",
    "withdraw-without-mpesa",
    "add-worker",
    "worker/[id]",
    "attendance",
    "add-site",
    "worker-details",
    "place-order",
    "add-menu-item",
    "menu",
    "settings",
    "disbursements/confirmation-page",
    "disbursements/success-page",
    "workers",
    "transactions",
    "sites",
  ];

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
      {allScreens
        .filter((screen) => !visibleTabs.includes(screen))
        .map((screen) => (
          <Tabs.Screen key={screen} name={screen} options={{ href: null }} />
        ))}
    </Tabs>
  );
}
