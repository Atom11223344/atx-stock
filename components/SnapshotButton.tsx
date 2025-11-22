// components/SnapshotButton.tsx

"use client";

import { useTransition } from 'react';

// เราจะรับ Server Action เข้ามา
export function SnapshotButton({ 
  saveAction 
}: { 
  saveAction: () => Promise<{ success: boolean, message: string }>;
}) {
  
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    // ใช้ Transition เพื่อไม่ให้หน้าเว็บ "ค้าง"
    startTransition(async () => {
      const result = await saveAction();
      alert(result.message); // แจ้งผลลัพธ์ (เราสามารถทำ UI ให้สวยกว่านี้ได้ทีหลัง)
    });
  };

  return (
    <form action={handleSave}>
      <button 
        type="submit"
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        disabled={isPending}
      >
        {isPending ? "กำลังบันทึก..." : "บันทึกมูลค่าพอร์ตวันนี้"}
      </button>
    </form>
  );
}