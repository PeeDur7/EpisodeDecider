import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RegistrationPage from './src/Screens/Authentication/Registration';
import LoginPage from './src/Screens/Authentication/Login';
import WelcomePage from './src/Screens/Authentication/Welcome';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, saveUserToStorage, loadUserFromStorage } from './src/Firebase/FirebaseConfig';
import HomePage from './src/Screens/AppScreens/Home';
import ForgotPasswordPage from './src/Screens/Authentication/ForgotPassword';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  
  useEffect(() => {
    loadUserFromStorage().then(user => {
      setIsLoggedIn(!!user);
    });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if(user){
        saveUserToStorage(user);
        setIsLoggedIn(true);
      }
      else setIsLoggedIn(false);
    });
    return unsubscribe;
  },[]);

  return (
    <GestureHandlerRootView style={{flex : 1}}>
      <NavigationContainer>
      <Stack.Navigator>
        {isLoggedIn ? (
          <>
            <Stack.Screen name="Home" component={HomePage} options={{ headerShown : false }}/>
            {/* actual pages where only logged in users can see */}
          </>
        ) : (
          <>
            <Stack.Screen name="Welcome" component={WelcomePage} options={{ headerShown : false}}/>
            <Stack.Screen name="Login" component={LoginPage} options={{ headerShown : false }}/>
            <Stack.Screen name="Registration" component={RegistrationPage} options={{ headerShown: false }}/>
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordPage} options={{ headerShown : false }}/>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
    </GestureHandlerRootView>
  );
}