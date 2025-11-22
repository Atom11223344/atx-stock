// app/alerts/actions.ts
"use server";

import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type AlertActionResponse = {
  success: boolean;
  message: string;
};

export async function createAlertAction(formData: FormData): Promise<AlertActionResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "กรุณา Login ก่อน" };
  }

  const ticker = (formData.get("ticker") as string)?.toUpperCase();
  const priceStr = formData.get("targetPrice") as string;
  
  // *** FIX: กำหนด condition เป็นค่าตายตัว 'gte' (ราคามากกว่า) ไปเลย ***
  const condition = 'gte';

  if (!ticker || !priceStr) {
    return { success: false, message: "ข้อมูลไม่ครบถ้วน" };
  }

  const targetPrice = parseFloat(priceStr);
  if (isNaN(targetPrice)) {
    return { success: false, message: "ราคาไม่ถูกต้อง" };
  }

  try {
    await db.priceAlert.create({
      data: {
        userId: session.user.id,
        ticker: ticker,
        targetPrice: targetPrice,
        condition: condition,
        active: true,
      }
    });

    revalidatePath("/alerts");
    return { success: true, message: "สร้าง Alert สำเร็จ!" };

  } catch (error) {
    console.error("Create Alert Error:", error);
    return { success: false, message: "Database Error" };
  }
}

export async function deleteAlertAction(alertId: string): Promise<AlertActionResponse> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Login required" };

  try {
    await db.priceAlert.delete({ where: { id: alertId } });
    revalidatePath("/alerts");
    return { success: true, message: "ลบ Alert สำเร็จ" };
  } catch (error) {
    console.error("Delete Alert Error:", error);
    return { success: false, message: "Database Error" };
  }
}