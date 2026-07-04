import { useEffect, useState } from 'react'
import { auth } from './firebaseConfig'
import { onAuthStateChanged } from 'firebase/auth';
import HomeScreen from './screens/HomeScreen';
import JoinScreen from './screens/JoinScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CreateSessionScreen from './screens/CreateSessionScreen';
import ScanScreen from './screens/ScanScreen';
import ItemsScreen from './screens/ItemsScreen';
import WaitingScreen from './screens/WaitingScreen';
import SplitScreen from './screens/SplitScreen';
import TotalScreen from './screens/TotalScreen';
import SignUpScreen from './screens/SignUpScreen';
import LoginScreen from './screens/LoginScreen';
import SessionScreen from './screens/SessionScreen';
import AccountScreen from './screens/AccountScreen';
import { Appearance } from 'react-native'
import { BackHandler } from 'react-native'

Appearance.setColorScheme('light')




const Stack = createNativeStackNavigator();

export default function App() {

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return () => unsubscribe()
  },[])

  useEffect(() => {
  const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true)
  return () => backHandler.remove()
  }, [])


  if (loading) {
    return null
  }
  

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions = {{headerShown: false, gestureEnabled: false}}
      initialRouteName={user ? 'Session' : 'Home'}>
        <Stack.Screen name="Home" component={HomeScreen} options={{gestureEnabled: false}}/>
        <Stack.Screen name="Join" component={JoinScreen}options={{gestureEnabled: false}}/>
        <Stack.Screen name="Create" component={CreateSessionScreen}options={{gestureEnabled: false}}/>
        <Stack.Screen name="Scan" component={ScanScreen}options={{gestureEnabled: false}}/>
        <Stack.Screen name="Items" component={ItemsScreen}options={{gestureEnabled: false}}/>
        <Stack.Screen name="Wait" component={WaitingScreen}options={{gestureEnabled: false}}/>
        <Stack.Screen name='Split' component={SplitScreen}options={{gestureEnabled: false}}/>
        <Stack.Screen name='Total' component={TotalScreen}options={{gestureEnabled: false}}/>
        <Stack.Screen name='SignUp' component={SignUpScreen}options={{gestureEnabled: false}}/>
        <Stack.Screen name='Login' component={LoginScreen}options={{gestureEnabled: false}}/>
        <Stack.Screen name='Session' component={SessionScreen}options={{gestureEnabled: false}}/>
        <Stack.Screen name='Account' component={AccountScreen}options={{gestureEnabled: false}}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
