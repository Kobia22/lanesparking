// src/firebase/database.ts
import { db } from './firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';

export const fetchParkingSpaces = async () => {
  const parkingSpacesCollection = collection(db, 'parkingSpaces');
  const snapshot = await getDocs(parkingSpacesCollection);
  const spaces = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
  return spaces;
};

export const addParkingSpace = async (location: string) => {
  await addDoc(collection(db, 'parkingSpaces'), {
    location: location,
    isOccupied: false,
  });
};

export const bookParkingSpace = async (spaceId: string) => {
  const updatedSpace = {
    isOccupied: true,
    bookedTime: new Date().getTime(),
    expiryTime: new Date().getTime() + 300000, // 5 minutes in milliseconds
  };
  await updateDoc(doc(db, 'parkingSpaces', spaceId), updatedSpace);
};