// src/firebase/database.ts
import firestore, {
  FirebaseFirestoreTypes,
  FieldValue,
} from '@react-native-firebase/firestore';

// Import types from types.ts
import { ParkingLot as ParkingLotType, ParkingSpace as ParkingSpaceType } from './types';

// Updated internal types for database operations with consistent Timestamp typing
interface ParkingLotDB {
  name: string;
  location: string;
  totalSpaces: number;
  availableSpaces: number;
  occupiedSpaces: number;
  bookedSpaces: number;
  createdAt: FirebaseFirestoreTypes.Timestamp | null;
  updatedAt: FirebaseFirestoreTypes.Timestamp | null;
}

interface ParkingSpaceDB {
  lotId: string;
  number: number;
  isOccupied: boolean;
  currentBookingId?: string | null;
  createdAt: FirebaseFirestoreTypes.Timestamp | null;
  updatedAt: FirebaseFirestoreTypes.Timestamp | null;
}

// Helper function to convert Firestore timestamp to ISO string with null safety
const toISOString = (timestamp: FirebaseFirestoreTypes.Timestamp | null | undefined): string => {
  return timestamp ? timestamp?.toDate().toISOString() : new Date().toISOString();
};

// Parking Lot Functions
export const fetchParkingLots = async (): Promise<ParkingLotType[]> => {
  try {
    const snapshot = await firestore().collection('parkingLots').get();
    return snapshot.docs.map(doc => {
      const data = doc.data() as ParkingLotDB;
      return {
        id: doc.id,
        name: data.name || '',
        location: data.location || '',
        totalSpaces: data.totalSpaces || 0,
        availableSpaces: data.availableSpaces || 0,
        occupiedSpaces: data.occupiedSpaces || 0,
        bookedSpaces: data.bookedSpaces || 0,
        createdAt: toISOString(data.createdAt),
        updatedAt: toISOString(data.updatedAt),
      };
    });
  } catch (error) {
    console.error("Error fetching parking lots:", error);
    throw error;
  }
};

// Added pagination support for large collections
export const fetchParkingLotsPaginated = async (
  limit: number = 10,
  startAfterDoc?: FirebaseFirestoreTypes.DocumentSnapshot
): Promise<{ lots: ParkingLotType[]; lastDoc: FirebaseFirestoreTypes.DocumentSnapshot | null }> => {
  try {
    let query = firestore()
      .collection('parkingLots')
      .orderBy('name')
      .limit(limit);

    if (startAfterDoc) {
      query = query.startAfter(startAfterDoc);
    }

    const snapshot = await query.get();
    const lots = snapshot.docs.map(doc => {
      const data = doc.data() as ParkingLotDB;
      return {
        id: doc.id,
        name: data.name || '',
        location: data.location || '',
        totalSpaces: data.totalSpaces || 0,
        availableSpaces: data.availableSpaces || 0,
        occupiedSpaces: data.occupiedSpaces || 0,
        bookedSpaces: data.bookedSpaces || 0,
        createdAt: toISOString(data.createdAt),
        updatedAt: toISOString(data.updatedAt),
      };
    });

    const lastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

    return { lots, lastDoc };
  } catch (error) {
    console.error("Error fetching paginated parking lots:", error);
    throw error;
  }
};

// Added validation and better error handling
export const addParkingLot = async (lot: Omit<ParkingLotType, 'id' | 'createdAt' | 'updatedAt'>): Promise<ParkingLotType> => {
  try {
    // Validate input
    if (!lot.name || lot.name.trim() === '') {
      throw new Error('Parking lot name is required');
    }

    if (!lot.location || lot.location.trim() === '') {
      throw new Error('Parking lot location is required');
    }

    if (typeof lot.totalSpaces !== 'number' || lot.totalSpaces < 0) {
      throw new Error('Total spaces must be a non-negative number');
    }

    const lotToAdd = {
      ...lot,
      availableSpaces: lot.availableSpaces ?? lot.totalSpaces,
      occupiedSpaces: lot.occupiedSpaces ?? 0,
      bookedSpaces: lot.bookedSpaces ?? 0,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await firestore().collection('parkingLots').add(lotToAdd);

    // Fetch the actual document to get the server timestamps
    const docSnapshot = await docRef.get();
    const data = docSnapshot.data() as ParkingLotDB;

    // Return the complete lot with ID and server timestamps
    return {
      ...lot,
      id: docRef.id,
      availableSpaces: lot.availableSpaces ?? lot.totalSpaces,
      occupiedSpaces: lot.occupiedSpaces ?? 0,
      bookedSpaces: lot.bookedSpaces ?? 0,
      createdAt: toISOString(data.createdAt),
      updatedAt: toISOString(data.updatedAt),
    };
  } catch (error) {
    console.error("Error adding parking lot:", error);
    throw error;
  }
};

export const updateParkingLot = async (lotId: string, updates: Partial<ParkingLotType>): Promise<void> => {
  try {
    // Validate essential updates
    if (updates.totalSpaces !== undefined && updates.totalSpaces < 0) {
      throw new Error('Total spaces must be a non-negative number');
    }

    // Remove properties that shouldn't be updated directly
    const { id, createdAt, updatedAt, ...validUpdates } = updates;

    await firestore().collection('parkingLots').doc(lotId).update({
      ...validUpdates,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error(`Error updating parking lot ${lotId}:`, error);
    throw error;
  }
};

export const deleteParkingLot = async (lotId: string): Promise<void> => {
  try {
    // First check if there are any spaces associated with this lot
    const spacesSnapshot = await firestore()
      .collection('parkingSpaces')
      .where('lotId', '==', lotId)
      .limit(1)
      .get();

    if (!spacesSnapshot.empty) {
      throw new Error('Cannot delete parking lot with existing parking spaces. Delete all spaces first.');
    }

    await firestore().collection('parkingLots').doc(lotId).delete();
  } catch (error) {
    console.error(`Error deleting parking lot ${lotId}:`, error);
    throw error;
  }
};

export const fetchParkingLotById = async (lotId: string): Promise<ParkingLotType | null> => {
  try {
    const lotDoc = await firestore().collection('parkingLots').doc(lotId).get();
    if (lotDoc.exists()) {
      const data = lotDoc.data() as ParkingLotDB;
      return {
        id: lotDoc.id,
        name: data.name || '',
        location: data.location || '',
        totalSpaces: data.totalSpaces || 0,
        availableSpaces: data.availableSpaces || 0,
        occupiedSpaces: data.occupiedSpaces || 0,
        bookedSpaces: data.bookedSpaces || 0,
        createdAt: toISOString(data.createdAt),
        updatedAt: toISOString(data.updatedAt),
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching parking lot ${lotId}:`, error);
    throw error;
  }
};

// Parking Space Functions
export const fetchParkingSpaces = async (lotId: string): Promise<ParkingSpaceType[]> => {
  try {
    const snapshot = await firestore()
      .collection('parkingSpaces')
      .where('lotId', '==', lotId)
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data() as ParkingSpaceDB;
      return {
        id: doc.id,
        lotId: data.lotId,
        number: data.number,
        isOccupied: data.isOccupied || false,
        currentBookingId: data.currentBookingId || null,
        createdAt: toISOString(data.createdAt),
        updatedAt: toISOString(data.updatedAt),
      };
    });
  } catch (error) {
    console.error(`Error fetching parking spaces for lot ${lotId}:`, error);
    throw error;
  }
};

// Added pagination support
export const fetchParkingSpacesPaginated = async (
  lotId: string,
  limit: number = 20,
  startAfterDoc?: FirebaseFirestoreTypes.DocumentSnapshot
): Promise<{ spaces: ParkingSpaceType[]; lastDoc: FirebaseFirestoreTypes.DocumentSnapshot | null }> => {
  try {
    let query = firestore()
      .collection('parkingSpaces')
      .where('lotId', '==', lotId)
      .orderBy('number')
      .limit(limit);

    if (startAfterDoc) {
      query = query.startAfter(startAfterDoc);
    }

    const snapshot = await query.get();
    const spaces = snapshot.docs.map(doc => {
      const data = doc.data() as ParkingSpaceDB;
      return {
        id: doc.id,
        lotId: data.lotId,
        number: data.number,
        isOccupied: data.isOccupied || false,
        currentBookingId: data.currentBookingId || null,
        createdAt: toISOString(data.createdAt),
        updatedAt: toISOString(data.updatedAt),
      };
    });

    const lastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

    return { spaces, lastDoc };
  } catch (error) {
    console.error(`Error fetching paginated parking spaces for lot ${lotId}:`, error);
    throw error;
  }
};

// Made return type consistent with other add functions
export const addParkingSpace = async (space: Omit<ParkingSpaceType, 'id' | 'createdAt' | 'updatedAt'>): Promise<ParkingSpaceType> => {
  try {
    // Validate input
    if (!space.lotId) {
      throw new Error('Parking space must be associated with a lot');
    }

    if (typeof space.number !== 'number' || space.number < 1) {
      throw new Error('Parking space number must be a positive number');
    }

    // Verify the lot exists
    const lotDoc = await firestore().collection('parkingLots').doc(space.lotId).get();
    if (!lotDoc.exists) {
      throw new Error(`Parking lot ${space.lotId} does not exist`);
    }

    // Check for duplicate space numbers in the same lot
    const existingSpaceQuery = await firestore()
      .collection('parkingSpaces')
      .where('lotId', '==', space.lotId)
      .where('number', '==', space.number)
      .get();

    if (!existingSpaceQuery.empty) {
      throw new Error(`Parking space number ${space.number} already exists in this lot`);
    }

    const spaceToAdd = {
      ...space,
      isOccupied: space.isOccupied || false,
      currentBookingId: space.currentBookingId || null,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await firestore().collection('parkingSpaces').add(spaceToAdd);

    // Update the lot's total spaces count in a transaction
    const lotRef = firestore().collection('parkingLots').doc(space.lotId);
    await firestore().runTransaction(async (transaction) => {
      const lotDoc = await transaction.get(lotRef);

      if (!lotDoc.exists) {
        throw new Error(`Parking lot ${space.lotId} no longer exists`);
      }

      const lotData = lotDoc.data() as ParkingLotDB;
      const totalSpaces = (lotData.totalSpaces || 0) + 1;
      const availableSpaces = space.isOccupied ? (lotData.availableSpaces || 0) : (lotData.availableSpaces || 0) + 1;

      transaction.update(lotRef, {
        totalSpaces,
        availableSpaces,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    });

    // Fetch the actual document to get the server timestamps
    const docSnapshot = await docRef.get();
    const data = docSnapshot.data() as ParkingSpaceDB;

    // Return complete space object with server timestamps
    return {
      ...space,
      id: docRef.id,
      isOccupied: space.isOccupied || false,
      currentBookingId: space.currentBookingId || null,
      createdAt: toISOString(data.createdAt),
      updatedAt: toISOString(data.updatedAt),
    };
  } catch (error) {
    console.error("Error adding parking space:", error);
    throw error;
  }
};

export const updateParkingSpace = async (spaceId: string, updates: Partial<ParkingSpaceType>): Promise<void> => {
  try {
    // Remove properties that shouldn't be updated directly
    const { id, lotId, createdAt, updatedAt, ...validUpdates } = updates;

    // If isOccupied is changing, we need to update the lot counts as well
    if (validUpdates.isOccupied !== undefined) {
      const spaceDoc = await firestore().collection('parkingSpaces').doc(spaceId).get();
      if (!spaceDoc.exists) {
        throw new Error(`Parking space ${spaceId} does not exist`);
      }

      const spaceData = spaceDoc.data() as ParkingSpaceDB;
      const lotId = spaceData.lotId;
      const currentOccupied = spaceData.isOccupied;
      const newOccupied = validUpdates.isOccupied;

      // Only run transaction if occupation status is changing
      if (currentOccupied !== newOccupied) {
        await firestore().runTransaction(async (transaction) => {
          const lotRef = firestore().collection('parkingLots').doc(lotId);
          const lotDoc = await transaction.get(lotRef);

          if (!lotDoc.exists) {
            throw new Error(`Parking lot ${lotId} does not exist`);
          }

          const lotData = lotDoc.data() as ParkingLotDB;
          const spaceRef = firestore().collection('parkingSpaces').doc(spaceId);

          // Update space counts based on occupation change
          if (newOccupied) {
            // Space becoming occupied
            transaction.update(lotRef, {
              availableSpaces: Math.max(0, (lotData.availableSpaces || 0) - 1),
              bookedSpaces: (lotData.bookedSpaces || 0) + 1,
              updatedAt: firestore.FieldValue.serverTimestamp(),
            });
          } else {
            // Space becoming available
            transaction.update(lotRef, {
              availableSpaces: (lotData.availableSpaces || 0) + 1,
              bookedSpaces: Math.max(0, (lotData.bookedSpaces || 0) - 1),
              updatedAt: firestore.FieldValue.serverTimestamp(),
            });
          }

          // Update the space document
          transaction.update(spaceRef, {
            ...validUpdates,
            updatedAt: firestore.FieldValue.serverTimestamp(),
          });
        });
        return; // Transaction already updated the space
      }
    }

    // If we didn't run a transaction, update the space directly
    await firestore().collection('parkingSpaces').doc(spaceId).update({
      ...validUpdates,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error(`Error updating parking space ${spaceId}:`, error);
    throw error;
  }
};

// Added transaction to keep lot and space data in sync
export const bookParkingSpace = async (spaceId: string, bookingId: string): Promise<void> => {
  try {
    const spaceDoc = await firestore().collection('parkingSpaces').doc(spaceId).get();
    if (!spaceDoc.exists) {
      throw new Error(`Parking space ${spaceId} does not exist`);
    }

    const spaceData = spaceDoc.data() as ParkingSpaceDB;
    if (spaceData.isOccupied) {
      throw new Error(`Parking space ${spaceId} is already occupied`);
    }

    const lotId = spaceData.lotId;

    await firestore().runTransaction(async (transaction) => {
      // Get the current state of the parking lot
      const lotRef = firestore().collection('parkingLots').doc(lotId);
      const lotDoc = await transaction.get(lotRef);
      if (!lotDoc.exists) {
        throw new Error(`Parking lot ${lotId} does not exist`);
      }

      const lotData = lotDoc.data() as ParkingLotDB;
      const spaceRef = firestore().collection('parkingSpaces').doc(spaceId);

      // Update the lot document with new counts
      transaction.update(lotRef, {
        availableSpaces: Math.max(0, (lotData.availableSpaces || 0) - 1),
        bookedSpaces: (lotData.bookedSpaces || 0) + 1,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      // Update the space document
      transaction.update(spaceRef, {
        isOccupied: true,
        currentBookingId: bookingId,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    });
  } catch (error) {
    console.error(`Error booking parking space ${spaceId}:`, error);
    throw error;
  }
};

// Added transaction to keep lot and space data in sync
export const releaseParkingSpace = async (spaceId: string): Promise<void> => {
  try {
    const spaceDoc = await firestore().collection('parkingSpaces').doc(spaceId).get();
    if (!spaceDoc.exists) {
      throw new Error(`Parking space ${spaceId} does not exist`);
    }

    const spaceData = spaceDoc.data() as ParkingSpaceDB;
    if (!spaceData.isOccupied) {
      throw new Error(`Parking space ${spaceId} is not currently occupied`);
    }

    const lotId = spaceData.lotId;

    await firestore().runTransaction(async (transaction) => {
      // Get the current state of the parking lot
      const lotRef = firestore().collection('parkingLots').doc(lotId);
      const lotDoc = await transaction.get(lotRef);
      if (!lotDoc.exists) {
        throw new Error(`Parking lot ${lotId} does not exist`);
      }

      const lotData = lotDoc.data() as ParkingLotDB;
      const spaceRef = firestore().collection('parkingSpaces').doc(spaceId);

      // Update the lot document with new counts
      transaction.update(lotRef, {
        availableSpaces: (lotData.availableSpaces || 0) + 1,
        bookedSpaces: Math.max(0, (lotData.bookedSpaces || 0) - 1),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      // Update the space document
      transaction.update(spaceRef, {
        isOccupied: false,
        currentBookingId: null,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    });
  } catch (error) {
    console.error(`Error releasing parking space ${spaceId}:`, error);
    throw error;
  }
};

// Added transaction to keep lot and space data in sync
export const deleteParkingSpace = async (spaceId: string): Promise<void> => {
  try {
    const spaceDoc = await firestore().collection('parkingSpaces').doc(spaceId).get();
    if (!spaceDoc.exists) {
      throw new Error(`Parking space ${spaceId} does not exist`);
    }

    const spaceData = spaceDoc.data() as ParkingSpaceDB;
    const lotId = spaceData.lotId;
    const isOccupied = spaceData.isOccupied;

    await firestore().runTransaction(async (transaction) => {
      // Get the current state of the parking lot
      const lotRef = firestore().collection('parkingLots').doc(lotId);
      const lotDoc = await transaction.get(lotRef);
      if (!lotDoc.exists) {
        throw new Error(`Parking lot ${lotId} does not exist`);
      }

      const lotData = lotDoc.data() as ParkingLotDB;
      const spaceRef = firestore().collection('parkingSpaces').doc(spaceId);

      // Update the lot document with new counts
      transaction.update(lotRef, {
        totalSpaces: Math.max(0, (lotData.totalSpaces || 0) - 1),
        availableSpaces: isOccupied
          ? lotData.availableSpaces
          : Math.max(0, (lotData.availableSpaces || 0) - 1),
        bookedSpaces: isOccupied
          ? Math.max(0, (lotData.bookedSpaces || 0) - 1)
          : lotData.bookedSpaces,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      // Delete the space document
      transaction.delete(spaceRef);
    });
  } catch (error) {
    console.error(`Error deleting parking space ${spaceId}:`, error);
    throw error;
  }
};

// New function to fetch spaces by booking ID
export const fetchParkingSpaceByBookingId = async (bookingId: string): Promise<ParkingSpaceType | null> => {
  try {
    const snapshot = await firestore()
      .collection('parkingSpaces')
      .where('currentBookingId', '==', bookingId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data() as ParkingSpaceDB;

    return {
      id: doc.id,
      lotId: data.lotId,
      number: data.number,
      isOccupied: data.isOccupied || false,
      currentBookingId: data.currentBookingId || null,
      createdAt: toISOString(data.createdAt),
      updatedAt: toISOString(data.updatedAt),
    };
  } catch (error) {
    console.error(`Error fetching parking space for booking ${bookingId}:`, error);
    throw error;
  }
};