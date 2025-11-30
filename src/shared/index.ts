export enum Priority {
  standard = "standard",
  express = "express"
}

export interface Package {
  id: string
  sender: string
  receiver: string
  priority: Priority
  weight: number
  status: string
  createdAt: string
}
