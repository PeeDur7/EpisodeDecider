import { initializeApp } from "firebase/app";
import { initializeAuth, User, onAuthStateChanged, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
  };

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence : getReactNativePersistence(ReactNativeAsyncStorage)
});
export const db = getFirestore(app);

export const saveUserToStorage = async (user: User | null) => {
  try {
    if (user) {
      await AsyncStorage.setItem("firebaseUser", JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem("firebaseUser");
    }
  } catch (e) {
    console.error("Error saving user to AsyncStorage", e);
  }
};

export const loadUserFromStorage = async (): Promise<User | null> => {
  try {
    const userString = await AsyncStorage.getItem("firebaseUser");
    return userString ? JSON.parse(userString) : null;
  } catch (e) {
    console.error("Error loading user from AsyncStorage", e);
    return null;
  }
};

export default app;