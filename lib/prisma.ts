// lib/prisma.ts

import { PrismaClient } from "@prisma/client";

// โค้ดนี้จะช่วยให้แน่ใจว่าเรามี PrismaClient แค่ "ตัวเดียว"
// ในระหว่างการพัฒนา (dev) เพื่อไม่ให้มันสร้าง connection ใหม่ตลอดเวลา

declare global {
  var prisma: PrismaClient | undefined;
}

export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;