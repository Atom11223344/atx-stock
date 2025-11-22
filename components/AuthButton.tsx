// components/AuthButton.tsx

import { auth, signIn, signOut } from "@/auth"; // 1. Import ทุกอย่างจาก auth.ts

// 3. สร้าง Server Action สำหรับ Sign Out
async function SignOutAction() {
  "use server"; // บอกว่านี่คือ Server Action
  await signOut();
}

// 2. สร้าง Server Action สำหรับ Sign In
async function SignInAction() {
  "use server";
  // เราจะส่ง User ไปที่หน้า Google Login
  await signIn("google"); 
}

// 4. นี่คือ Component หลัก
export default async function AuthButton() {
  // 5. เช็กสถานะ Login (นี่คือวิธีเช็กใน Server Component)
  const session = await auth(); 

  if (!session?.user) {
    // 6. ถ้ายังไม่ Login
    return (
      <form action={SignInAction}>
        <button 
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Sign in with Google
        </button>
      </form>
    );
  }

  // 7. ถ้า Login แล้ว
  return (
    <div className="flex items-center gap-4">
      {session.user.image && (
        <img 
          src={session.user.image} 
          alt={session.user.name || "User Avatar"}
          className="w-10 h-10 rounded-full"
        />
      )}
      <span className="text-white hidden md:block">{session.user.name}</span>
      <form action={SignOutAction}>
        <button 
          type="submit"
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Sign Out
        </button>
      </form>
    </div>
  );
}