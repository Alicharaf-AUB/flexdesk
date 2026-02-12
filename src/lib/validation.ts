import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).optional(),
  role: z.enum([
    "customer",
    "corporate_admin",
    "coworking_operator",
    "micro_host",
    "super_admin",
  ]).optional(),
  accountType: z.enum(["booker", "coworking_operator", "micro_host", "corporate_admin"]).optional(),
  companyDomain: z.string().min(3).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const bookingSchema = z.object({
  listingId: z.string().min(1),
  deskLabel: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  duration: z.string().min(1),
  totalPrice: z.number().int().positive(),
});

export const supportRequestSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.string().min(1).optional(),
  topic: z.string().min(1),
  message: z.string().min(10),
});
