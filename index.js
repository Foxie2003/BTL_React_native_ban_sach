import * as React from 'react';
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import { NavigationContainer, useNavigation } from '@react-navigation/native'; 
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import messaging from '@react-native-firebase/messaging'; // Thêm import từ Firebase Messaging
import HomeScreen from './HomeScreen';  
import BookDetailScreen from './BookDetailScreen';
import CartScreen from './CartScreen';
import SearchScreen from './SearchScreen';
import SearchResultScreen from './SearchResultScreen';
import ThanhToan from './ThanhToan';
import Login from './Login';
import Register from './Register';
import UserScreen from './UserScreen';
import TestScreen from './TestScreen';
import OrderDetailScreen from './OrderDetailScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

function UserScreenStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="UserScreen" component={UserScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
    </Stack.Navigator>
  );
}

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
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="BookDetailStackNavigator" component={BookDetailStackNavigator} />      
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="SearchResult" component={SearchResultScreen} />
      <Stack.Screen name="ThanhToan" component={ThanhToan} />
      <Stack.Screen name="Register" component={Register} />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  const navigation = useNavigation(); 
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: (() => {
          const routeName = route.name ?? ""; 
          console.log("name: " + routeName);
          if (routeName === 'ABC' || routeName === 'Login') {
            return { display: "none" };
          }
          return {
            height: '6%',
            paddingVertical: '1%'
          };
        })(),
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
        component={UserScreenStackNavigator} 
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

  React.useEffect(() => {
    requestUserPermission();
    // Không cần gọi getToken() ở đây vì nó sẽ được gọi trong requestUserPermission()
  },[])

  async function requestUserPermission() {
    try {
      await messaging().requestPermission(); // Yêu cầu sự cho phép từ người dùng
      getToken(); // Lấy token sau khi người dùng đã cho phép
    } catch (error) {
      console.log('Permission rejected');
    }
  }

  const getToken = async() => {
    try {
      const token = await messaging().getToken();
      console.log(token);
      // Gửi token này đến máy chủ của bạn để gửi thông báo
    } catch (error) {
      console.log('Failed to get token:', error);
    }
  }

  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
}

export default App;
AppRegistry.registerComponent(appName, () => App);
