// prisma.config.ts

import "dotenv/config"; // ⬅️⬅️ เพิ่มบรรทัดนี้เข้าไปบนสุด

// (โค้ดเดิมที่อาจจะมีอยู่ เช่น import { defineConfig }... ก็ปล่อยไว้อย่างนั้น)
// (ถ้าไฟล์มันว่างเปล่า ก็แค่ใส่บรรทัดข้างบนลงไป)
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
