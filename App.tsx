import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase/firebaseConfig';
import { NavigationContainer } from '@react-navigation/native';
import ProfileScreen from './screens/profile';
import LoginScreen from './screens/login';
import RegisterScreen from "./screens/register";
import FavoriteScreen from './screens/favorite';
import { RootStackParamList, BottomTabParamList } from "./types/props";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ContactScreen from './screens/contact';
import { MaterialIcons } from '@expo/vector-icons';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  function TabNavigator() {
    return (
      <Tab.Navigator
        initialRouteName="Contact"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName: keyof typeof MaterialIcons.glyphMap;
            switch (route.name) {
              case "Favorite":
                iconName = "favorite";
                break;
              case "Contact":
                iconName = "contacts";
                break;
              case "Profile":
                iconName = "person";
                break;
              default:
                iconName = "help";
            }
            return <MaterialIcons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#3B82F6",
          tabBarInactiveTintColor: "#9ca3af",
          headerShown: false,
        })}
      >
        <Tab.Screen name="Favorite" component={FavoriteScreen} />
        <Tab.Screen name="Contact" component={ContactScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    );
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [])

  if (loading) {
    return null;
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerTitleAlign: "center" }}>
        {user ? (
          <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerTitle: "Login", headerShown: true }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerTitle: "Register", headerShown: true }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}


// this is just testing