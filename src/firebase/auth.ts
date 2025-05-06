// src/firebase/auth.ts
import auth from '@react-native-firebase/auth';

/**
 * Log in with email and password
 * @param email User's email
 * @param password User's password
 * @returns Promise resolving to user object
 */
export const login = async (email: string, password: string) => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    console.log('Logged in user:', userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

/**
 * Register a new user with email and password
 * @param email User's email
 * @param password User's password
 * @returns Promise resolving to user object
 */
export const register = async (email: string, password: string) => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    console.log('Registered user:', userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

/**
 * Log out the current user
 * @returns Promise that resolves when logout is complete
 */
export const logout = async () => {
  try {
    await auth().signOut();
    console.log('User logged out');
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

/**
 * Get the current authenticated user
 * @returns Current user or null if not authenticated
 */
export const getCurrentUser = () => {
  return auth().currentUser;
};

/**
 * Set up an auth state change listener
 * @param onAuthStateChanged Callback function that receives the user object
 * @returns Unsubscribe function
 */
export const onAuthStateChanged = (callback: (user: any) => void) => {
  return auth().onAuthStateChanged(callback);
};

/**
 * Send password reset email
 * @param email User's email address
 * @returns Promise that resolves when email is sent
 */
export const sendPasswordResetEmail = async (email: string) => {
  try {
    await auth().sendPasswordResetEmail(email);
    console.log('Password reset email sent');
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

/**
 * Update user profile
 * @param profile Object containing displayName and/or photoURL
 * @returns Promise that resolves when profile is updated
 */
export const updateProfile = async (profile: { displayName?: string, photoURL?: string }) => {
  try {
    const user = auth().currentUser;
    if (!user) {
      throw new Error('No user is currently signed in');
    }
    
    await user.updateProfile(profile);
    console.log('User profile updated');
    return true;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

/**
 * Update user email
 * @param email New email address
 * @returns Promise that resolves when email is updated
 */
export const updateEmail = async (email: string) => {
  try {
    const user = auth().currentUser;
    if (!user) {
      throw new Error('No user is currently signed in');
    }
    
    await user.updateEmail(email);
    console.log('User email updated');
    return true;
  } catch (error) {
    console.error('Error updating email:', error);
    throw error;
  }
}; 