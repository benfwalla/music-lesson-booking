'use client';

import * as XLSX from 'xlsx';
import { Booking, RentalBooking, PICKUP_LOCATIONS } from './types';

export function exportBookingsToExcel(bookings: Booking[]): void {
  const data = bookings.map(b => ({
    'Student': b.studentName,
    'Day': b.day,
    'Start Time': b.startTime,
    'End Time': b.endTime,
    'Instrument': b.instrument,
    'Recurring': b.recurring ? 'Yes' : 'No',
    'Notes': b.notes,
    'Created': new Date(b.createdAt).toLocaleDateString(),
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Bookings');
  
  // Auto-size columns
  const colWidths = Object.keys(data[0] || {}).map(key => ({
    wch: Math.max(key.length, ...data.map(row => String(row[key as keyof typeof row] || '').length)) + 2
  }));
  ws['!cols'] = colWidths;

  XLSX.writeFile(wb, `lesson-bookings-${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function exportRentalsToExcel(rentals: RentalBooking[]): void {
  const data = rentals.map(r => ({
    'Confirmation Code': r.confirmationCode,
    'Instrument': r.instrument,
    'Category': r.category,
    'Duration': r.duration,
    'Start Date': r.startDate,
    'Price': `$${r.price}`,
    'Status': r.status.replace('_', ' ').toUpperCase(),
    'Renter Name': r.renterName,
    'Renter Email': r.renterEmail,
    'Renter Phone': r.renterPhone,
    'EMC Student': r.isStudent ? 'Yes' : 'No',
    'Pickup Location': PICKUP_LOCATIONS[r.pickupLocation],
    'Booked On': new Date(r.createdAt).toLocaleDateString(),
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rentals');

  const colWidths = Object.keys(data[0] || {}).map(key => ({
    wch: Math.max(key.length, ...data.map(row => String(row[key as keyof typeof row] || '').length)) + 2
  }));
  ws['!cols'] = colWidths;

  XLSX.writeFile(wb, `rental-bookings-${new Date().toISOString().split('T')[0]}.xlsx`);
}
