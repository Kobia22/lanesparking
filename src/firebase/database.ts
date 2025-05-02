import { db } from './firebaseConfig';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  getDoc, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';

// Import types from types.ts instead of redefining them
import { ParkingLot as ParkingLotType, ParkingSpace as ParkingSpaceType } from './types';

// Internal types for database operations
interface ParkingLotDB {
  id: string;
  name: string;
  location: string;
  totalSpaces: number;
  availableSpaces: number;
  occupiedSpaces: number;
  bookedSpaces: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ParkingSpaceDB {
  id: string;
  lotId: string;
  number: number;
  isOccupied: boolean;
  currentBookingId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Parking Lot Functions
export const fetchParkingLots = async (): Promise<ParkingLotType[]> => {
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
      occupiedSpaces: data.occupiedSpaces ?? 0,
      bookedSpaces: data.bookedSpaces ?? 0,
      createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
      updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
    };
  });
};

export const addParkingLot = async (lot: Omit<ParkingLotType, 'id' | 'createdAt' | 'updatedAt'>): Promise<ParkingLotType> => {
  const docRef = await addDoc(collection(db, 'parkingLots'), {
    ...lot,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  
  // Return the complete lot with ID for easier chaining
  return {
    ...lot,
    id: docRef.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

export const updateParkingLot = async (lotId: string, updates: Partial<ParkingLotType>): Promise<void> => {
  await updateDoc(doc(db, 'parkingLots', lotId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const deleteParkingLot = async (lotId: string): Promise<void> => {
  await deleteDoc(doc(db, 'parkingLots', lotId));
};

export const fetchParkingLotById = async (lotId: string): Promise<ParkingLotType | null> => {
  const lotDoc = await getDoc(doc(db, 'parkingLots', lotId));
  if (lotDoc.exists()) {
    const data = lotDoc.data();
    return {
      id: lotDoc.id,
      name: data.name ?? '',
      location: data.location ?? '',
      totalSpaces: data.totalSpaces ?? 0,
      availableSpaces: data.availableSpaces ?? 0,
      occupiedSpaces: data.occupiedSpaces ?? 0,
      bookedSpaces: data.bookedSpaces ?? 0,
      createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
      updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
    };
  }
  return null;
};

// Parking Space Functions
export const fetchParkingSpaces = async (lotId: string): Promise<ParkingSpaceType[]> => {
  const spacesCollection = collection(db, 'parkingSpaces');
  const q = query(spacesCollection, where('lotId', '==', lotId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      lotId: data.lotId,
      number: data.number,
      isOccupied: data.isOccupied || false,
      currentBookingId: data.currentBookingId || null,
      createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
      updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
    };
  });
};

export const addParkingSpace = async (space: Omit<ParkingSpaceType, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'parkingSpaces'), {
    ...space,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateParkingSpace = async (spaceId: string, updates: Partial<ParkingSpaceType>): Promise<void> => {
  await updateDoc(doc(db, 'parkingSpaces', spaceId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const bookParkingSpace = async (spaceId: string, bookingId: string): Promise<void> => {
  await updateDoc(doc(db, 'parkingSpaces', spaceId), {
    isOccupied: true,
    currentBookingId: bookingId,
    updatedAt: serverTimestamp(),
  });
};

export const releaseParkingSpace = async (spaceId: string): Promise<void> => {
  await updateDoc(doc(db, 'parkingSpaces', spaceId), {
    isOccupied: false,
    currentBookingId: null,
    updatedAt: serverTimestamp(),
  });
};

export const deleteParkingSpace = async (spaceId: string): Promise<void> => {
  await deleteDoc(doc(db, 'parkingSpaces', spaceId));
};