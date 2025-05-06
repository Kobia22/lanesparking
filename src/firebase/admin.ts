// src/firebase/admin.ts
// Admin-specific logic for the parking system

import { getFirestore, Timestamp, FieldValue } from '@react-native-firebase/firestore';
import { notifyAbandonment } from './notifications';
import { endBookingAndBill } from './bookings';
import type { Booking } from './types';

// No need to initialize Firebase here as it's done in the app's entry point
// with React Native Firebase

// Fetch all active/abandoned bookings for admin dashboard
export const fetchActiveOrAbandonedBookings = async (): Promise<Booking[]> => {
  try {
    const snapshot = await getFirestore()
      .collection('bookings')
      .where('status', 'in', ['active', 'abandoned'])
      .get();
    
    return snapshot.docs.map(docSnap => ({ 
      id: docSnap.id, 
      ...docSnap.data() 
    } as Booking));
  } catch (error) {
    console.error('Error fetching active or abandoned bookings:', error);
    throw error;
  }
};

// Admin manual override: mark booking as abandoned
export const markBookingAsAbandoned = async (bookingId: string, adminId: string) => {
  try {
    const bookingRef = getFirestore().collection('bookings').doc(bookingId);
    const bookingSnap = await bookingRef.get();
    
    if (!bookingSnap.exists) {
      throw new Error(`Booking ${bookingId} does not exist`);
    }
    
    const data = bookingSnap.data();
    if (!data) {
      throw new Error(`Booking data for ${bookingId} is undefined`);
    }

    const updatedActions = Array.isArray(data.adminActions) 
      ? [...data.adminActions, { action: 'abandon', adminId, timestamp: Timestamp.now() }] 
      : [{ action: 'abandon', adminId, timestamp: Timestamp.now() }];
    
    await bookingRef.update({
      status: 'abandoned',
      adminActions: updatedActions,
    });
    
    // Optionally notify user of abandonment via email/SMS
    if (data.userId && data.email && data.phone) {
      await notifyAbandonment(data.userId, bookingId, data.email, data.phone);
    }
  } catch (error) {
    console.error(`Error marking booking ${bookingId} as abandoned:`, error);
    throw error;
  }
};

// Admin: fetch booking history for a user or vehicle
export const fetchBookingHistory = async (userIdOrPlate: string): Promise<Booking[]> => {
  try {
    // Use composite query to efficiently find bookings by userId OR plateNumber
    const userSnapshot = await getFirestore()
      .collection('bookings')
      .where('userId', '==', userIdOrPlate)
      .get();
    
    const plateSnapshot = await getFirestore()
      .collection('bookings')
      .where('plateNumber', '==', userIdOrPlate)
      .get();
    
    // Combine results, avoiding duplicates
    const bookingsMap = new Map();
    
    // Add user bookings
    userSnapshot.docs.forEach(doc => {
      bookingsMap.set(doc.id, { id: doc.id, ...doc.data() });
    });
    
    // Add plate bookings (if not already added)
    plateSnapshot.docs.forEach(doc => {
      if (!bookingsMap.has(doc.id)) {
        bookingsMap.set(doc.id, { id: doc.id, ...doc.data() });
      }
    });
    
    return Array.from(bookingsMap.values()) as Booking[];
  } catch (error) {
    console.error(`Error fetching booking history for ${userIdOrPlate}:`, error);
    throw error;
  }
};

// Admin: fetch daily/weekly/monthly analytics
export const fetchAnalytics = async () => {
  try {
    // Get the date ranges for calculations
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Convert to Firestore timestamps
    const monthTimestamp = Timestamp.fromDate(startOfMonth);
    
    // Get all completed bookings from this month (for efficiency)
    const bookingsSnapshot = await getFirestore()
      .collection('bookings')
      .where('exitTime', '>=', monthTimestamp)
      .where('status', '==', 'completed')
      .get();
    
    let dailyRevenue = 0;
    let weeklyRevenue = 0;
    let monthlyRevenue = 0;
    
    bookingsSnapshot.docs.forEach(doc => {
      const booking = doc.data();
      if (booking.totalFee && typeof booking.totalFee === 'number') {
        // Add to monthly revenue
        monthlyRevenue += booking.totalFee;
        
        // Check if it's from this week
        if (booking.exitTime && booking.exitTime.toDate() >= startOfWeek) {
          weeklyRevenue += booking.totalFee;
          
          // Check if it's from today
          if (booking.exitTime.toDate() >= startOfToday) {
            dailyRevenue += booking.totalFee;
          }
        }
      }
    });
    
    // Get current occupancy data
    const lotsSnapshot = await getFirestore()
      .collection('parkingLots')
      .get();
    
    let totalSpaces = 0;
    let occupiedSpaces = 0;
    
    lotsSnapshot.docs.forEach(doc => {
      const lot = doc.data();
      if (lot.totalSpaces) totalSpaces += lot.totalSpaces;
      if (lot.occupiedSpaces) occupiedSpaces += lot.occupiedSpaces;
    });
    
    // Get abandoned bookings count
    const abandonedSnapshot = await getFirestore()
      .collection('bookings')
      .where('status', '==', 'abandoned')
      .count()
      .get();
    
    return {
      dailyRevenue,
      weeklyRevenue,
      monthlyRevenue,
      occupancyRate: totalSpaces > 0 ? (occupiedSpaces / totalSpaces) * 100 : 0,
      abandonedCount: abandonedSnapshot.data().count,
      totalBookings: bookingsSnapshot.size,
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return {
      dailyRevenue: 0,
      weeklyRevenue: 0,
      monthlyRevenue: 0,
      occupancyRate: 0,
      abandonedCount: 0,
      totalBookings: 0,
    };
  }
};

// New: Get admin action log for audit purposes
export const getAdminActionLog = async (limit: number = 50): Promise<any[]> => {
  try {
    // Get bookings with admin actions
    const snapshot = await getFirestore()
      .collection('bookings')
      .where('adminActions', '!=', null)
      .limit(limit)
      .get();
    
    const actionLog = [];
    
    for (const doc of snapshot.docs) {
      const booking = doc.data();
      if (Array.isArray(booking.adminActions)) {
        for (const action of booking.adminActions) {
          actionLog.push({
            bookingId: doc.id,
            userId: booking.userId,
            plateNumber: booking.plateNumber,
            actionType: action.action,
            adminId: action.adminId,
            timestamp: action.timestamp,
          });
        }
      }
    }
    
    // Sort by timestamp descending
    return actionLog.sort((a, b) => {
      const aTime = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : 0;
      const bTime = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : 0;
      return bTime - aTime;
    });
  } catch (error) {
    console.error('Error fetching admin action log:', error);
    throw error;
  }
};