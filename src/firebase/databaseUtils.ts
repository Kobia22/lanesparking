// src/firebase/databaseUtils.ts
// Utility functions for booking and parking space queries/filters

import { db } from './firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import type { Booking, ParkingSpace, BookingStatus } from './types';

// Get all available spaces for a specific lot
export const getAvailableSpacesByLot = async (lotId: string): Promise<ParkingSpace[]> => {
  const spacesCollection = collection(db, 'parkingSpaces');
  const q = query(spacesCollection, where('lotId', '==', lotId), where('isOccupied', '==', false));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ParkingSpace));
};

// Filter bookings by status, user, lot, and/or date range
// Filter bookings by supported Firestore fields, then use custom filtering for unsupported (e.g., dateRange)
export const getBookingsByFilter = async (filter: {
  status?: BookingStatus;
  userId?: string;
  lotId?: string;
  dateRange?: [Date, Date];
}): Promise<Booking[]> => {
  // Build Firestore query for supported fields
  const constraints = [];
  if (filter.status) constraints.push(where('status', '==', filter.status));
  if (filter.userId) constraints.push(where('userId', '==', filter.userId));
  if (filter.lotId) constraints.push(where('lotId', '==', filter.lotId));
  const bookingsCollection = collection(db, 'bookings');
  const q = constraints.length ? query(bookingsCollection, ...constraints) : bookingsCollection;
  const snapshot = await getDocs(q);
  let bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));

  // Custom in-memory filtering for unsupported queries (e.g., dateRange)
  if (filter.dateRange !== undefined && filter.dateRange !== null) {
    const [start, end] = filter.dateRange;
    bookings = bookings.filter(b => {
      if (!b.entryTime) return false;
      const entry = b.entryTime?.toDate ? b.entryTime.toDate() : new Date(b.entryTime);
      return entry >= start && entry <= end;
    });
  }
  return bookings;
};

// Format booking time for display, robust against missing or malformed timestamps
export const formatBookingTime = (booking: Booking): string => {
  if (!booking.entryTime) return 'No entry time';
  const entry = booking.entryTime?.toDate
    ? booking.entryTime.toDate()
    : (typeof booking.entryTime === 'string' ? new Date(booking.entryTime) : new Date(booking.entryTime));
  const exit = booking.exitTime?.toDate
    ? booking.exitTime.toDate()
    : (booking.exitTime
        ? (typeof booking.exitTime === 'string' ? new Date(booking.exitTime) : new Date(booking.exitTime))
        : null);
  return exit
    ? `${entry.toLocaleString()} - ${exit.toLocaleString()}`
    : `${entry.toLocaleString()} - (in progress)`;
};

// Calculate parking duration in hours, robust against missing or malformed timestamps
export const calculateParkingDuration = (booking: Booking): number => {
  if (!booking.entryTime) return 0;
  const entry = booking.entryTime?.toDate
    ? booking.entryTime.toDate()
    : (typeof booking.entryTime === 'string' ? new Date(booking.entryTime) : new Date(booking.entryTime));
  const exit = booking.exitTime?.toDate
    ? booking.exitTime.toDate()
    : (booking.exitTime
        ? (typeof booking.exitTime === 'string' ? new Date(booking.exitTime) : new Date(booking.exitTime))
        : new Date());
  return Math.ceil((exit.getTime() - entry.getTime()) / (1000 * 60 * 60));
};
