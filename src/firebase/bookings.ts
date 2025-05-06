// src/firebase/bookings.ts
// Booking and billing logic for the parking system

import firebase from '@react-native-firebase/app';
const firestore = firebase.firestore;
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
  try {
    const docRef = await firestore().collection('bookings').add({
      ...booking,
      status: 'pending',
      entryTime: firestore.FieldValue.serverTimestamp(),
      occupiedTime: null,
      exitTime: null,
      amountBilled: null,
      paymentStatus: 'pending',
      paymentMethod: null,
      receiptUrl: null,
      notificationsSent: { bookingExpiry: false, abandonment: false },
      adminActions: [],
    });
    return docRef;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
};

// Mark booking as occupied
export const occupyParkingSpace = async (bookingId: string) => {
  try {
    await firestore().collection('bookings').doc(bookingId).update({
      status: 'active',
      occupiedTime: firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error(`Error occupying parking space for booking ${bookingId}:`, error);
    throw error;
  }
};

// Auto-cancel booking if not occupied in 5 mins
export const autoCancelBookingIfNotOccupied = async (bookingId: string) => {
  try {
    const bookingSnap = await firestore().collection('bookings').doc(bookingId).get();
    if (bookingSnap.exists()) {
      const data = bookingSnap.data() as Booking;
      if (data.status === 'pending') {
        await firestore().collection('bookings').doc(bookingId).update({
          status: 'cancelled',
          exitTime: firestore.FieldValue.serverTimestamp(),
        });
        // Notify user of cancellation (push)
        if (data.userId) await notifyBookingExpiry(data.userId, bookingId);
      }
    }
  } catch (error) {
    console.error(`Error auto-cancelling booking ${bookingId}:`, error);
    throw error;
  }
};

// End booking, calculate bill, mark as completed
export const endBookingAndBill = async (bookingId: string, paymentMethod: 'mpesa' | 'cash', adminId: string) => {
  try {
    const bookingSnap = await firestore().collection('bookings').doc(bookingId).get();
    if (!bookingSnap.exists) return;
    
    const data = bookingSnap.data() as Booking;
    const bill = await calculateBill(data);
    
    await firestore().collection('bookings').doc(bookingId).update({
      status: 'completed',
      exitTime: firestore.FieldValue.serverTimestamp(),
      amountBilled: bill,
      paymentStatus: 'paid',
      paymentMethod,
      adminActions: [...(data.adminActions || []), { action: 'exit', adminId, timestamp: new Date().toISOString() }],
    });
    
    // Notify user of payment receipt
    if (data.email) await notifyPaymentReceipt(data.email, bookingId, bill);
  } catch (error) {
    console.error(`Error ending booking and billing ${bookingId}:`, error);
    throw error;
  }
};

// Calculate bill
export const calculateBill = async (booking: Booking): Promise<number> => {
  try {
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
  } catch (error) {
    console.error(`Error calculating bill for booking:`, error);
    throw error;
  }
};

// Fetch a single booking by ID
export const fetchBookingById = async (bookingId: string): Promise<Booking | null> => {
  try {
    const bookingSnap = await firestore().collection('bookings').doc(bookingId).get();
    if (!bookingSnap.exists) return null;
    return { id: bookingSnap.id, ...bookingSnap.data() } as Booking;
  } catch (error) {
    console.error(`Error fetching booking ${bookingId}:`, error);
    throw error;
  }
};

// Admin marks entry
export const adminMarkEntry = async (bookingId: string, adminId: string) => {
  try {
    await firestore().collection('bookings').doc(bookingId).update({
      adminActions: [{ action: 'entry', adminId, timestamp: new Date().toISOString() }],
    });
  } catch (error) {
    console.error(`Error marking entry for booking ${bookingId}:`, error);
    throw error;
  }
};

// Admin marks exit and confirms payment
export const adminMarkExitAndConfirmPayment = async (bookingId: string, adminId: string, paymentMethod: 'mpesa' | 'cash') => {
  try {
    await endBookingAndBill(bookingId, paymentMethod, adminId);
  } catch (error) {
    console.error(`Error marking exit and confirming payment for booking ${bookingId}:`, error);
    throw error;
  }
};

// Fetch all bookings for a user
export const fetchUserBookings = async (userId: string): Promise<Booking[]> => {
  try {
    const bookingsSnapshot = await firestore()
      .collection('bookings')
      .where('userId', '==', userId)
      .orderBy('entryTime', 'desc')
      .get();
      
    return bookingsSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as Booking[];
  } catch (error) {
    console.error(`Error fetching bookings for user ${userId}:`, error);
    throw error;
  }
};

// Fetch active booking for a space
export const fetchActiveBookingForSpace = async (spaceId: string): Promise<Booking | null> => {
  try {
    const bookingsSnapshot = await firestore()
      .collection('bookings')
      .where('spaceId', '==', spaceId)
      .where('status', 'in', ['pending', 'active'])
      .limit(1)
      .get();
      
    if (bookingsSnapshot.empty) return null;
    const doc = bookingsSnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Booking;
  } catch (error) {
    console.error(`Error fetching active booking for space ${spaceId}:`, error);
    throw error;
  }
};