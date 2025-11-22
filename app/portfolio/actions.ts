"use server"; 

import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- Action 1: เพิ่ม/แก้ไข หุ้น ---
export async function addPortfolioItemAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "กรุณา Login ก่อน" };
  
  const userId = session.user.id;
  const ticker = (formData.get("ticker") as string)?.toUpperCase(); 
  const shares = parseFloat(formData.get("shares") as string);
  const averagePrice = parseFloat(formData.get("averagePrice") as string);

  if (!ticker || isNaN(shares) || isNaN(averagePrice) || shares <= 0 || averagePrice <= 0) {
    return { success: false, message: "ข้อมูลไม่ถูกต้อง" };
  }

  try {
    await db.portfolioItem.upsert({
      where: { userId_ticker: { userId: userId, ticker: ticker } },
      update: { shares: shares, averagePrice: averagePrice },
      create: { userId: userId, ticker: ticker, shares: shares, averagePrice: averagePrice },
    });
    revalidatePath("/portfolio"); 
    return { success: true, message: "บันทึกสำเร็จ" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Database Error" };
  }
}

// --- Action 2: ลบหุ้น ---
export async function deletePortfolioItemAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return;
  
  const ticker = formData.get("ticker") as string;
  if (!ticker) return;

  try {
    await db.portfolioItem.delete({
      where: { userId_ticker: { userId: session.user.id, ticker: ticker } }
    });
    revalidatePath("/portfolio");
  } catch (error) {
    console.error("Delete Error:", error);
  }
}

// --- Action 3: บันทึก Snapshot ---
export async function saveSnapshotAction(totalValue: number) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "กรุณา Login" };

  const today = new Date();
  today.setHours(0, 0, 0, 0); 

  const existing = await db.portfolioSnapshot.findFirst({
    where: { userId: session.user.id, date: { gte: today } }
  });

  if (existing) return { success: false, message: "วันนี้บันทึกไปแล้ว!" };
  if (totalValue === 0) return { success: false, message: "พอร์ตว่างเปล่า" };

  try {
    await db.portfolioSnapshot.create({
      data: { userId: session.user.id, totalValue: totalValue }
    });
    revalidatePath("/portfolio");
    return { success: true, message: "บันทึกสำเร็จ!" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Database Error" };
  }
}