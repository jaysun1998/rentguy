export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  country: string;
}

export interface Property {
  id: string;
  name: string;
  address1: string;
  address2?: string;
  city: string;
  postalCode: string;
  region: string;
  country: string;
  propertyType: 'residential' | 'commercial' | 'mixed';
  defaultVatRate: number;
  units: number;
  vacancyRate: number;
}

export interface Unit {
  id: string;
  propertyId: string;
  unitNumber: string;
  floor: number;
  bedrooms: number;
  bathrooms: number;
  squareMeters: number;
  rent: number;
  currency: string;
  depositAmount: number;
  status: 'vacant' | 'occupied';
}

export interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  screeningStatus: 'pending' | 'approved' | 'denied' | 'not_submitted';
}

export interface Lease {
  id: string;
  unitId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  rent: number;
  currency: string;
  securityDeposit: number;
  depositCurrency: string;
  vatRate: number;
  status: 'active' | 'pending_signature' | 'expired';
}

export interface Invoice {
  id: string;
  leaseId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  vatAmount: number;
  status: 'pending' | 'paid' | 'overdue';
}

export interface MaintenanceRequest {
  id: string;
  unitId: string;
  tenantId: string;
  category: string;
  description: string;
  reportedAt: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
}

export type Country = {
  code: string;
  name: string;
};

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  company?: string;
  country?: string;
}

export const COUNTRIES: Country[] = [
  { code: 'at', name: 'Austria' },
  { code: 'be', name: 'Belgium' },
  { code: 'bg', name: 'Bulgaria' },
  { code: 'hr', name: 'Croatia' },
  { code: 'cy', name: 'Cyprus' },
  { code: 'cz', name: 'Czech Republic' },
  { code: 'dk', name: 'Denmark' },
  { code: 'ee', name: 'Estonia' },
  { code: 'fi', name: 'Finland' },
  { code: 'fr', name: 'France' },
  { code: 'de', name: 'Germany' },
  { code: 'gr', name: 'Greece' },
  { code: 'hu', name: 'Hungary' },
  { code: 'ie', name: 'Ireland' },
  { code: 'it', name: 'Italy' },
  { code: 'lv', name: 'Latvia' },
  { code: 'lt', name: 'Lithuania' },
  { code: 'lu', name: 'Luxembourg' },
  { code: 'mt', name: 'Malta' },
  { code: 'nl', name: 'Netherlands' },
  { code: 'pl', name: 'Poland' },
  { code: 'pt', name: 'Portugal' },
  { code: 'ro', name: 'Romania' },
  { code: 'sk', name: 'Slovakia' },
  { code: 'si', name: 'Slovenia' },
  { code: 'es', name: 'Spain' },
  { code: 'se', name: 'Sweden' },
  { code: 'gb', name: 'United Kingdom' }
];