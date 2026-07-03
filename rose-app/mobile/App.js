import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "./src/context/AuthContext";

import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import ChatListScreen from "./src/screens/ChatListScreen";
import ChatScreen from "./src/screens/ChatScreen";

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { user, ready } = useAuth();
  if (!ready) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="ChatList" component={ChatListScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
