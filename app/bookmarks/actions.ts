// app/bookmarks/actions.ts

"use server"; 

import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface ActionResponse {
  success: boolean;
  message: string;
}

// --- Action 1: สร้าง List ใหม่ (เหมือนเดิม) ---
export async function createListAction(formData: FormData): Promise<ActionResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "กรุณา Login ก่อน" };
  }

  const listName = formData.get("listName") as string;
  if (!listName || listName.trim().length < 1) {
    return { success: false, message: "ชื่อ List ห้ามว่าง" };
  }

  try {
    const existing = await db.bookmarkList.findFirst({
      where: { userId: session.user.id, name: listName }
    });

    if (existing) {
      return { success: false, message: "คุณมี List ชื่อนี้อยู่แล้ว" };
    }

    await db.bookmarkList.create({
      data: {
        name: listName,
        userId: session.user.id,
      }
    });

    revalidatePath("/bookmarks"); 
    return { success: true, message: "สร้าง List สำเร็จ!" };

  } catch (error) {
    console.error(error);
    return { success: false, message: "Database Error" };
  }
}

// --- Action 2: ลบ List (เหมือนเดิม) ---
export async function deleteListAction(formData: FormData): Promise<ActionResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "กรุณา Login ก่อน" };
  }

  const listId = formData.get("listId") as string;
  if (!listId) {
    return { success: false, message: "ไม่พบ ID" };
  }

  try {
    const list = await db.bookmarkList.findUnique({
      where: { id: listId }
    });

    if (!list || list.userId !== session.user.id) {
      return { success: false, message: "คุณไม่ใช่เจ้าของ List นี้" };
    }

    await db.bookmarkList.delete({
      where: { id: listId }
    });

    revalidatePath("/bookmarks");
    return { success: true, message: "ลบ List สำเร็จ" };

  } catch (error) {
    console.error(error);
    return { success: false, message: "Database Error" };
  }
}


// --- !!! (นี่คือ Action ที่เพิ่มใหม่) !!! ---

// --- Action 3: เพิ่มหุ้น (Stock) ลงใน List [source: Page 2] ---
export async function addStockToListAction(formData: FormData): Promise<ActionResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "กรุณา Login ก่อน" };
  }

  const listId = formData.get("listId") as string;
  const ticker = (formData.get("ticker") as string)?.toUpperCase();

  if (!listId || !ticker) {
    return { success: false, message: "ข้อมูลไม่ครบถ้วน" };
  }

  // (TODO: เราควรจะเช็คก่อนว่า Ticker นี้มีอยู่จริงหรือไม่ โดยการเรียก API)

  try {
    await db.bookmarkItem.create({
      data: {
        listId: listId,
        ticker: ticker,
      }
    });

    revalidatePath("/bookmarks");
    return { success: true, message: "เพิ่มหุ้นสำเร็จ" };

  } catch (error) {
    // (Error นี้มักจะเกิด ถ้าคุณพยายามเพิ่มหุ้นที่ "ซ้ำ" ใน List เดิม)
    console.error(error);
    return { success: false, message: "เพิ่มหุ้นไม่สำเร็จ (อาจมีหุ้นนี้อยู่แล้ว)" };
  }
}

// --- Action 4: ลบหุ้น (Stock) ออกจาก List [source: Page 2] ---
export async function deleteStockFromListAction(formData: FormData): Promise<ActionResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "กรุณา Login ก่อน" };
  }

  const itemId = formData.get("itemId") as string;
  if (!itemId) {
    return { success: false, message: "ไม่พบ ID ของหุ้น" };
  }

  try {
    // (เราควรจะเช็คก่อนว่า User เป็นเจ้าของ Item นี้จริงๆ)
    const item = await db.bookmarkItem.findUnique({
      where: { id: itemId },
      include: { list: true } // (ดึง List แม่มาด้วย)
    });

    if (!item || item.list.userId !== session.user.id) {
      return { success: false, message: "คุณไม่ใช่เจ้าของ" };
    }
    
    await db.bookmarkItem.delete({
      where: { id: itemId }
    });
    
    revalidatePath("/bookmarks");
    return { success: true, message: "ลบหุ้นสำเร็จ" };

  } catch (error) {
    console.error(error);
    return { success: false, message: "Database Error" };
  }
}