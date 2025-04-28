// src/firebase/bookings.ts
// Booking and billing logic for the parking system

import { db } from './firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import type { Booking } from './types';
import { notifyBookingExpiry, notifyPaymentReceipt } from './notifications';

// Create a new booking
export const createBooking = async (booking: {
  userId?: string; // undefined for guests
  plateNumber: string;
  lotId: string;
  spaceId: string;
  userType: 'student' | 'guest';
  email?: string;
}) => {
  return await addDoc(collection(db, 'bookings'), {
    ...booking,
    status: 'pending',
    entryTime: serverTimestamp(),
    occupiedTime: null,
    exitTime: null,
    amountBilled: null,
    paymentStatus: 'pending',
    paymentMethod: null,
    receiptUrl: null,
    notificationsSent: { bookingExpiry: false, abandonment: false },
    adminActions: [],
  });
};

// Mark booking as occupied
export const occupyParkingSpace = async (bookingId: string) => {
  await updateDoc(doc(db, 'bookings', bookingId), {
    status: 'active',
    occupiedTime: serverTimestamp(),
  });
};

// Auto-cancel booking if not occupied in 5 mins
export const autoCancelBookingIfNotOccupied = async (bookingId: string) => {
  const bookingSnap = await getDoc(doc(db, 'bookings', bookingId));
  if (bookingSnap.exists()) {
    const data = bookingSnap.data() as Booking;
    if (data.status === 'pending') {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'cancelled',
        exitTime: serverTimestamp(),
      });
      // Notify user of cancellation (push)
      if (data.userId) await notifyBookingExpiry(data.userId, bookingId);
    }
  }
};

// End booking, calculate bill, mark as completed
export const endBookingAndBill = async (bookingId: string, paymentMethod: 'mpesa' | 'cash', adminId: string) => {
  const bookingSnap = await getDoc(doc(db, 'bookings', bookingId));
  if (!bookingSnap.exists()) return;
  const data = bookingSnap.data() as Booking;
  const bill = await calculateBill(data);
  await updateDoc(doc(db, 'bookings', bookingId), {
    status: 'completed',
    exitTime: serverTimestamp(),
    amountBilled: bill,
    paymentStatus: 'paid',
    paymentMethod,
    adminActions: [...(data.adminActions || []), { action: 'exit', adminId, timestamp: new Date().toISOString() }],
  });
  // Notify user of payment receipt
  if (data.email) await notifyPaymentReceipt(data.email, bookingId, bill);
};

// Calculate bill
export const calculateBill = async (booking: Booking): Promise<number> => {
  const entry = booking.occupiedTime?.toDate ? booking.occupiedTime.toDate() : new Date(booking.occupiedTime);
  const exit = booking.exitTime?.toDate ? booking.exitTime.toDate() : new Date();
  const ms = exit.getTime() - entry.getTime();
  const hours = Math.ceil(ms / (1000 * 60 * 60));
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  if (booking.userType === 'student') {
    return 200 * days;
  } else {
    if (days > 1) {
      return 100 * hours + 100 * (days - 1);
    }
    return 100 * hours;
  }
};

// Fetch a single booking by ID
export const fetchBookingById = async (bookingId: string): Promise<Booking | null> => {
  const bookingSnap = await getDoc(doc(db, 'bookings', bookingId));
  if (!bookingSnap.exists()) return null;
  return { id: bookingSnap.id, ...bookingSnap.data() } as Booking;
};

// Admin marks entry
export const adminMarkEntry = async (bookingId: string, adminId: string) => {
  await updateDoc(doc(db, 'bookings', bookingId), {
    adminActions: [{ action: 'entry', adminId, timestamp: new Date().toISOString() }],
  });
};

// Admin marks exit and confirms payment
export const adminMarkExitAndConfirmPayment = async (bookingId: string, adminId: string, paymentMethod: 'mpesa' | 'cash') => {
  await endBookingAndBill(bookingId, paymentMethod, adminId);
};
