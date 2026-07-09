export const SETTINGS_KEYS = {
  bookingRules: 'booking_rules',
  companyInfo: 'company_info',
  preferences: 'preferences',
} as const

export interface BookingRules {
  minDays: number
  maxDays: number
  minAge: number
  freeCancelHours: number
}

export interface CompanyInfo {
  name: string
  address: string
  email: string
  phone: string
}

export interface Preferences {
  emailNotifications: boolean
}

export const DEFAULT_BOOKING_RULES: BookingRules = { minDays: 1, maxDays: 30, minAge: 21, freeCancelHours: 48 }

export const DEFAULT_COMPANY_INFO: CompanyInfo = {
  name: 'City Moto Yard',
  address: '12 Rue des Motards, 75011 Paris',
  email: 'contact@citymotoyard.fr',
  phone: '+33 1 42 00 00 00',
}

export const DEFAULT_PREFERENCES: Preferences = { emailNotifications: true }
