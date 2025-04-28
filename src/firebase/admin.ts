// src/firebase/admin.ts
// Admin-specific logic for the parking system

import { db } from './firebaseConfig';
import { collection, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { notifyAbandonment } from './notifications';
import { endBookingAndBill } from './bookings';
import type { Booking } from './types';

// Fetch all active/abandoned bookings for admin dashboard
export const fetchActiveOrAbandonedBookings = async (): Promise<Booking[]> => {
  const bookingsCollection = collection(db, 'bookings');
  const snapshot = await getDocs(bookingsCollection);
  return snapshot.docs
    .map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Booking))
    .filter(b => b.status === 'active' || b.status === 'abandoned');
};

// Admin manual override: mark booking as abandoned
export const markBookingAsAbandoned = async (bookingId: string, adminId: string) => {
  const bookingRef = doc(db, 'bookings', bookingId);
  const bookingSnap = await getDoc(bookingRef);
  if (!bookingSnap.exists()) return;
  const data = bookingSnap.data();
  const updatedActions = Array.isArray(data.adminActions) ? [...data.adminActions, { action: 'abandon', adminId, timestamp: new Date().toISOString() }] : [{ action: 'abandon', adminId, timestamp: new Date().toISOString() }];
  await updateDoc(bookingRef, {
    status: 'abandoned',
    adminActions: updatedActions,
  });
  // Optionally notify user of abandonment via email/SMS
  if (data.userId && data.email && data.phone) {
    await notifyAbandonment(data.userId, bookingId, data.email, data.phone);
  }
};

// Admin: fetch booking history for a user or vehicle
export const fetchBookingHistory = async (userIdOrPlate: string): Promise<Booking[]> => {
  const bookingsCollection = collection(db, 'bookings');
  const snapshot = await getDocs(bookingsCollection);
  return snapshot.docs
    .map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Booking))
    .filter(b => b.userId === userIdOrPlate || b.plateNumber === userIdOrPlate);
};

// Admin: fetch daily/weekly/monthly analytics (placeholder)
export const fetchAnalytics = async () => {
  // TODO: Aggregate bookings, revenue, occupancy, etc.
  return {
    dailyRevenue: 0,
    weeklyRevenue: 0,
    occupancyRate: 0,
    abandonedCount: 0,
  };
};
