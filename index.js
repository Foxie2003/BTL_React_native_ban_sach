import * as React from 'react';
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import HomeScreen from './HomeScreen';  
import BookDetailScreen from './BookDetailScreen';
import CartScreen from './CartScreen';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import SearchScreen from './SearchScreen';
import SearchResultScreen from './SearchResultScreen';
import TestScreen from './TestScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

function BookDetailStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="BookDetail" component={BookDetailScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
    </Stack.Navigator>
  );
}

function HomeDrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Drawer.Screen name="HomeStackNavigator" component={HomeStackNavigator} />
      <Drawer.Screen name="TestScreen" component={TestScreen} />
    </Drawer.Navigator>
  );
}

function HomeStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="BookDetailStackNavigator" component={BookDetailStackNavigator} />      
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="SearchResult" component={SearchResultScreen} />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: ((route) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? "";
          if (routeName === 'BookDetail') {
            return { display: "none" };
          }
          return {
            height: '6%',
            paddingVertical: '1%'
          };
        })(route),
      })}>
      <Tab.Screen 
        name="HomeDrawerNavigator" 
        component={HomeDrawerNavigator} 
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Giỏ hàng" 
        component={CartScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="cart-outline" color={color} size={size} />
          ),
        }}
      />
      {/* <Tab.Screen 
        name="Tìm kiếm"
        component={SearchScreen} 
        options={{
          title: 'Tìm kiếm',
          tabBarIcon: ({ color, size }) => (
            <Icon name="search-outline" color={color} size={size} />
          ),
        }}
      /> */}
      <Tab.Screen 
        name="Thông báo" 
        component={CartScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="notifications-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Tài khoản" 
        component={CartScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function App() {
  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
}

export default App;
AppRegistry.registerComponent(appName, () => App);
