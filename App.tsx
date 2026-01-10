import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RegistrationPage from './src/Screens/Authentication/Registration';
import LoginPage from './src/Screens/Authentication/Login';
import WelcomePage from './src/Screens/Authentication/Welcome';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/Firebase/FirebaseConfig';
import ForgotPasswordPage from './src/Screens/Authentication/ForgotPassword';
import NavBar from './src/Components/NavBar';
import ShowInfo from './src/Screens/AppScreens/ShowInfo';
import ShowLinks from './src/Screens/AppScreens/ShowLinks';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    
    return unsubscribe;
  }, []);

  if(isLoggedIn === null){
    return(
      <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#03AC13" />
              <Text style={styles.loadingText}>Loading page</Text>
          </View>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{flex : 1}}>
      <NavigationContainer>
      <Stack.Navigator>
        {isLoggedIn ? (
          <>
            <Stack.Screen name="NavBar" component={NavBar} options={{ headerShown : false}}/>
            <Stack.Screen name="ShowInfo" component={ShowInfo} options={{ headerShown : false }}/>
            <Stack.Screen name="ShowRedirect" component={ShowLinks} options={{ headerShown : false}}/>
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

const styles = StyleSheet.create({
  container : {
    backgroundColor : "#3A3A3C",
    flex : 1,
    alignItems : "center",
    justifyContent : "center"
  },
  loadingContainer: {
    padding: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
},
  loadingText: {
      color: '#AEAEB2',
      fontSize: 14,
  },
});

