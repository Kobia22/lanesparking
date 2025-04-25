// src/firebase/auth.ts
import { auth } from './firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export const login = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log('Logged in user:', user);
      return user;
    })
    .catch((error) => {
      console.error('Error logging in:', error);
      throw error;
    });
};

export const register = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log('Registered user:', user);
      return user;
    })
    .catch((error) => {
      console.error('Error registering user:', error);
      throw error;
    });
};