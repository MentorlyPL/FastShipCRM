export const API_BASE = "http://localhost:8080"

export enum Priority {
  standard = "standard",
  express = "express"
}

export enum Statuses {
  created = "created",
  collected = "collected",
  inTransit = "inTransit",
  forDelivery = "forDelivery",
  delivered = "delivered",
  cancelled = "cancelled"
}

export interface PersonData {
  name: string
  address: Address
  contact: Contact
}

export interface Address {
  street: string
  city: string
  zipCode: string
  country: string
}

export interface Contact {
  email?: string
  phone?: string
}

export interface Package {
  id: string
  sender: PersonData
  receiver: PersonData
  priority: Priority
  weight: number
  status: string
  createdAt: string
}
