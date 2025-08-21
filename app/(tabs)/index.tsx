import HomeComponent from "@/components/Home/Home";
import { useAuth } from "@/contexts/AuthContext";
import React from "react";
import { Text, View } from "react-native";
import WorkersComponent from "@/components/Workers/Workers";

export default function Home() {
  const { user, userType } = useAuth();

  console.log('user from index', userType);
  

  return (
    <>
      {userType === "WageWorker" ? (
        <HomeComponent />
      ) : (
        <WorkersComponent/> 
      )}
    </>
    
  );
}