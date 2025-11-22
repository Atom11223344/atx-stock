// auth.d.ts

import { type DefaultSession } from "@auth/core/types";

// "ขยาย" (Extend) พิมพ์เขียวดั้งเดิม
declare module "@auth/core/types" {
  
  /** ขยาย "Session" ดั้งเดิม */
  interface Session {
    user: {
      /** นี่คือ 'id' ที่เรา "ยัด" กลับเข้ามาใน auth.ts callbacks */
      id: string; 
    } & DefaultSession["user"]; // (และยังคงมี name, email, image เหมือนเดิม)
  }

}