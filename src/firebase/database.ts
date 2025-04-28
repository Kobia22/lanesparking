// Parking Lot Management Functions
// Each parking lot can have fields: name, location, totalSpaces, availableSpaces, etc.
// You can store up to 16 or more lots, scalable as needed.

import { db } from './firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export const fetchParkingSpaces = async () => {
  const parkingSpacesCollection = collection(db, 'parkingSpaces');
  const snapshot = await getDocs(parkingSpacesCollection);
  const spaces = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      lotId: data.lotId ?? '',
      number: data.number ?? 0,
      isOccupied: data.isOccupied ?? false,
      currentBookingId: data.currentBookingId ?? null,
      location: data.location ?? 'Unknown Location', // keep for backward compatibility if needed
    };
  });
  return spaces;
};

export const addParkingSpace = async (lotId: string, number: number) => {
  await addDoc(collection(db, 'parkingSpaces'), {
    lotId,
    number,
    isOccupied: false,
  });
};

// (Legacy) If you want to add by location only
export const addParkingSpaceByLocation = async (location: string) => {
  await addDoc(collection(db, 'parkingSpaces'), {
    location,
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

// --- Parking Lot Functions ---

// Fetch all parking lots
export const fetchParkingLots = async () => {
  const lotsCollection = collection(db, 'parkingLots');
  const snapshot = await getDocs(lotsCollection);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name ?? '',
      location: data.location ?? '',
      totalSpaces: data.totalSpaces ?? 0,
      availableSpaces: data.availableSpaces ?? 0,
    };
  });
};

// Add a new parking lot
export const addParkingLot = async (lot: {
  name: string;
  location: string;
  totalSpaces: number;
  availableSpaces: number;
}) => {
  await addDoc(collection(db, 'parkingLots'), lot);
};

// Update an existing parking lot
export const updateParkingLot = async (lotId: string, updates: Partial<{
  name: string;
  location: string;
  totalSpaces: number;
  availableSpaces: number;
}>) => {
  await updateDoc(doc(db, 'parkingLots', lotId), updates);
};

// Delete a parking lot
export const deleteParkingLot = async (lotId: string) => {
  await deleteDoc(doc(db, 'parkingLots', lotId));
};

// Fetch a single parking lot by ID
export const fetchParkingLotById = async (lotId: string) => {
  const lotDoc = await getDoc(doc(db, 'parkingLots', lotId));
  if (lotDoc.exists()) {
    return { id: lotDoc.id, ...lotDoc.data() };
  } else {
    return null;
  }
};