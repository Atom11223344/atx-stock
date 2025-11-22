// app/api/auth/[...nextauth]/route.ts

// นี่คือ "ประตูหลังบ้าน" ที่ขาดไป
// มันจะไปดึงการตั้งค่า Google (และอื่นๆ) จากไฟล์ auth.ts ของคุณ

import { handlers } from "@/auth"; // (ตรวจสอบให้แน่ใจว่า Path ไปยัง auth.ts ของคุณถูกต้อง)
export const { GET, POST } = handlers;