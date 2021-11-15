
import * as React from 'react';
import { Text, View } from 'react-native';
import { WebView } from "react-native-webview";
import { NavigationContainer } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';


function HomeScreen() {
  return (
    <WebView 
      source={{ uri: "https://sansmots.com/lite" }} 
      style={{ marginTop: 20 }} 
    />
  );
}

function ContactsScreen() {
  return (
    <WebView 
      source={{ uri: "https://sansmots.com/lite/contacts" }} 
      style={{ marginTop: 20 }} 
    />
  );
}

const Tab = createMaterialBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Home"
        activeColor="#ffffff"
        inactiveColor="#000000"
        barStyle={{ backgroundColor: '#24b4db' }}
     >
        <Tab.Screen name="Каталог" component={HomeScreen} 
          options={{
            tabBarLabel: 'Каталог',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="shopping" color={color} size={26} />
            ),
          }}
        />
        <Tab.Screen name="Контакты" component={ContactsScreen}
        options={{
            tabBarLabel: 'Контакты',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="contacts" color={color} size={26} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}