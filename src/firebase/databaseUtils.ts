// src/firebase/databaseUtils.ts
// Utility functions for booking and parking space queries/filters

import { getFirestore } from '@react-native-firebase/firestore';
import type { Booking, ParkingSpace, BookingStatus } from './types';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

const firestore = getFirestore();

// Get all available spaces for a specific lot
export const getAvailableSpacesByLot = async (lotId: string): Promise<ParkingSpace[]> => {
  try {
    const snapshot = await firestore
      .collection('parkingSpaces')
      .where('lotId', '==', lotId)
      .where('isOccupied', '==', false)
      .get();
    
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as ParkingSpace));
  } catch (error) {
    console.error(`Error fetching available spaces for lot ${lotId}:`, error);
    throw error;
  }
};

// Filter bookings by status, user, lot, and/or date range
// Filter bookings by supported Firestore fields, then use custom filtering for unsupported (e.g., dateRange)
export const getBookingsByFilter = async (filter: {
  status?: BookingStatus;
  userId?: string;
  lotId?: string;
  dateRange?: [Date, Date];
}): Promise<Booking[]> => {
  try {
    // Start with a base query reference
    
        let bookingsQuery: FirebaseFirestoreTypes.Query<FirebaseFirestoreTypes.DocumentData> = firestore.collection('bookings');
    // Apply filters one by one
    if (filter.status) {
      bookingsQuery = bookingsQuery.where('status', '==', filter.status);
    }
    if (filter.userId) {
      bookingsQuery = bookingsQuery.where('userId', '==', filter.userId);
    }
    if (filter.lotId) {
      bookingsQuery = bookingsQuery.where('lotId', '==', filter.lotId);
    }
    
    const snapshot = await bookingsQuery.get();
    let bookings = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as Booking));

    // Custom in-memory filtering for unsupported queries (e.g., dateRange)
    if (filter.dateRange && filter.dateRange.length === 2) {
      const [start, end] = filter.dateRange;
      bookings = bookings.filter(b => {
        if (!b.entryTime) return false;
        const entry = b.entryTime?.toDate ? b.entryTime.toDate() : new Date(b.entryTime);
        return entry >= start && entry <= end;
      });
    }
    
    return bookings;
  } catch (error) {
    console.error('Error fetching bookings by filter:', error);
    throw error;
  }
};

// Format booking time for display, robust against missing or malformed timestamps
export const formatBookingTime = (booking: Booking): string => {
  if (!booking.entryTime) return 'No entry time';
  
  // Handle different timestamp formats
  const entry = booking.entryTime?.toDate
    ? booking.entryTime.toDate()
    : (typeof booking.entryTime === 'string' 
        ? new Date(booking.entryTime) 
        : new Date(booking.entryTime));
  
  const exit = booking.exitTime?.toDate
    ? booking.exitTime.toDate()
    : (booking.exitTime
        ? (typeof booking.exitTime === 'string' 
            ? new Date(booking.exitTime) 
            : new Date(booking.exitTime))
        : null);
  
  return exit
    ? `${entry.toLocaleString()} - ${exit.toLocaleString()}`
    : `${entry.toLocaleString()} - (in progress)`;
};

// Calculate parking duration in hours, robust against missing or malformed timestamps
export const calculateParkingDuration = (booking: Booking): number => {
  if (!booking.entryTime) return 0;
  
  // Handle different timestamp formats
  const entry = booking.entryTime?.toDate
    ? booking.entryTime.toDate()
    : (typeof booking.entryTime === 'string' 
        ? new Date(booking.entryTime) 
        : new Date(booking.entryTime));
  
  const exit = booking.exitTime?.toDate
    ? booking.exitTime.toDate()
    : (booking.exitTime
        ? (typeof booking.exitTime === 'string' 
            ? new Date(booking.exitTime) 
            : new Date(booking.exitTime))
        : new Date());
  
  return Math.ceil((exit.getTime() - entry.getTime()) / (1000 * 60 * 60));
};

// New utility function - Get booking by ID
export const getBookingById = async (bookingId: string): Promise<Booking | null> => {
  try {
    const docSnapshot = await firestore
      .collection('bookings')
      .doc(bookingId)
      .get();
    
    if (!docSnapshot.exists) {
      return null;
    }
    
    return {
      id: docSnapshot.id,
      ...docSnapshot.data()
    } as Booking;
  } catch (error) {
    console.error(`Error fetching booking with ID ${bookingId}:`, error);
    throw error;
  }
};

// New utility function - Get recent bookings with pagination
export const getRecentBookings = async (
  limit: number = 10,
  startAfterDoc?: any
): Promise<{ bookings: Booking[], lastDoc: any }> => {
  try {
    let query = firestore
      .collection('bookings')
      .orderBy('entryTime', 'desc')
      .limit(limit);
    
    if (startAfterDoc) {
      query = query.startAfter(startAfterDoc);
    }
    
    const snapshot = await query.get();
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Booking));
    
    const lastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
    
    return { bookings, lastDoc };
  } catch (error) {
    console.error('Error fetching recent bookings:', error);
    throw error;
  }
};