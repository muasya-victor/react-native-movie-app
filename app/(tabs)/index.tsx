import HomeComponent from "@/components/Home/Home";
import SmartSiteManagerComponent from "@/components/SmartSiteManager/SmartSiteManager";
import SmartWorkersManager from "@/components/SmartWorkersManager/SmartWorkersManager";
import { useAuth } from "@/contexts/AuthContext";
import React from "react";
import { View } from "react-native";


export default function Home() {
  const { user, userType } = useAuth();


  return (
    <View style={{ flex: 1 }}>
      {userType === "WageWorker" ? (
        <HomeComponent />
      ) : userType === "SystemAdmin" ? (
        <SmartSiteManagerComponent />
      ) : (
        <SmartWorkersManager />
      )}
    </View>
  );
}