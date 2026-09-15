import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export const productSchema = z.object({
  name: z
    .string()
    .min(2, "Product name must be at least 2 characters")
    .max(100, "Product name must not exceed 100 characters"),

  category_id: z
    .number()
    .int("Category must be valid")
    .positive("Category is required"),

  price: z
    .number()
    .positive("Price must be greater than 0"),

  stock: z
    .number()
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative"),

  unit: z
    .string()
    .max(20, "Unit must not exceed 20 characters")
    .optional(),
});

export const saleSchema = z.object({
  product_id: z
    .number()
    .int("Product must be valid")
    .positive("Product is required"),

  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .positive("Quantity must be greater than 0"),

  sold_on: z
    .string()
    .datetime("Sold date must be a valid date"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export type ProductFormData = z.infer<typeof productSchema>;

export type SaleFormData = z.infer<typeof saleSchema>;