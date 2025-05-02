// src/firebase/types.ts
// Shared types for the parking system

export enum BookingStatus {
  Pending = 'pending',
  Active = 'active',
  Completed = 'completed',
  Cancelled = 'cancelled',
  Abandoned = 'abandoned',
}

export enum PaymentStatus {
  Pending = 'pending',
  Paid = 'paid',
}

export enum UserRole {
  Student = 'student',
  Guest = 'guest',
  Admin = 'admin',
}

export type AdminAction = {
  action: string;
  adminId: string;
  timestamp: string;
};

export type Notification = {
  id: string;
  userId: string;
  bookingId?: string;
  type: 'push' | 'email' | 'sms';
  message: string;
  sentAt: string;
};

export type Booking = {
  id: string;
  userId?: string;
  plateNumber?: string;
  lotId?: string;
  spaceId?: string;
  entryTime?: any;
  occupiedTime?: any;
  exitTime?: any;
  status?: BookingStatus;
  amountBilled?: number;
  paymentStatus?: PaymentStatus;
  paymentMethod?: string;
  receiptUrl?: string;
  notificationsSent?: any;
  adminActions?: AdminAction[];
  email?: string;
  phone?: string;
  userType?: UserRole;
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'student' | 'guest' | 'admin';
  registeredPlates?: string[];
  deleted?: boolean;
};

export type ParkingLot = {
  id: string;
  name: string;
  location: string;
  totalSpaces: number;
  availableSpaces: number;
  occupiedSpaces: number;
  bookedSpaces: number;
  createdAt?: string;
  updatedAt?: string;
};

export type ParkingSpace = {
  id: string;
  lotId: string;
  number: number;
  isOccupied: boolean;
  currentBookingId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}; // backward compatibility for UI
