// auth.ts

import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/prisma" 

export const { 
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  
  adapter: PrismaAdapter(db), 
  session: { strategy: "database" },

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],

  // =======================================================
  // *** นี่คือส่วนที่ "เพิ่ม" เข้าไปเพื่อแก้ปัญหา ***
  // =======================================================
  callbacks: {
    // ฟังก์ชันนี้จะ "แก้ไข" session ก่อนที่จะส่งกลับไปให้เรา
    async session({ session, user }) {
      // 1. ตรวจสอบว่า session และ user มีอยู่จริง
      if (session.user && user) {
        // 2. "ยัด" user.id (จาก Database) เข้าไปใน session.user.id
        session.user.id = user.id; 
      }
      // 3. ส่ง session ที่ "อัปเกรด" แล้วกลับไป
      return session;
    },
  },
  // =======================================================

})