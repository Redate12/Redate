import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithGoogle,
  signInWithCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  linkWithCredential,
} from 'firebase/auth';
import {Google} from 'expo-auth-session/providers/google';
import {Platform} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import {makeRedirectUri, useAuthRequest} from 'expo-auth-session';
import {auth} from '../config/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {api} from './api';

WebBrowser.maybeCompleteAuthSession();

// Store tokens
async function storeTokens(user, token) {
  try {
    await AsyncStorage.setItem('user_id', user.uid);
    await AsyncStorage.setItem('email', user.email || '');
    if (user.displayName) {
      await AsyncStorage.setItem('display_name', user.displayName);
    }
    if (user.photoURL) {
      await AsyncStorage.setItem('photo_url', user.photoURL);
    }
    if (token) {
      await AsyncStorage.setItem('token', token);
    }
  } catch (error) {
    console.error('Error storing tokens:', error);
  }
}

// Clear tokens
async function clearTokens() {
  try {
    await AsyncStorage.multiRemove([
      'user_id',
      'email',
      'display_name',
      'photo_url',
      'token',
    ]);
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
}

// Sign up with email and password
export const signUp = async (email, password, name) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    if (name) {
      await updateProfile(userCredential.user, {displayName: name});
    }

    // Get ID token
    const idToken = await userCredential.user.getIdToken();

    // Call backend to create user
    await api.post('/auth/register', {
      email,
      password,
      name,
      firebase_token: idToken,
    });

    // Store tokens
    await storeTokens(userCredential.user, idToken);

    return userCredential.user;
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

// Sign in with email and password
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // Get ID token
    const idToken = await userCredential.user.getIdToken();

    // Call backend login
    await api.post('/auth/login', {
      firebase_token: idToken,
    });

    // Store tokens
    await storeTokens(userCredential.user, idToken);

    return userCredential.user;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

// Google Sign In
export const signInWithGoogle = async () => {
  try {
    const result = await promptAsync();
    if (result?.type === 'success') {
      const {id_token} = result.params;
      const credential = GoogleAuthProvider.credential(id_token);
      const userCredential = await signInWithCredential(auth, credential);

      // Get ID token
      const idToken = await userCredential.user.getIdToken();

      // Call backend social login
      await api.post('/auth/social', {
        provider: 'google',
        id_token: idToken,
        email: userCredential.user.email,
        name: userCredential.user.displayName,
      });

      // Store tokens
      await storeTokens(userCredential.user, idToken);

      return userCredential.user;
    }
  } catch (error) {
    console.error('Google sign in error:', error);
    throw error;
  }
};

// Sign out
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    await clearTokens();
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// Auth state observer
export const onAuthStateChangedListener = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const idToken = await user.getIdToken();
      callback({user, token: idToken});
    } else {
      callback(null);
    }
  });
};

// Get current user ID
export const getCurrentUserId = () => auth.currentUser?.uid;

export default {
  signUp,
  signIn,
  signInWithGoogle,
  signOut,
  onAuthStateChangedListener,
  getCurrentUserId,
};