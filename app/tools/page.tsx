import { auth } from "@/auth";
import Calculators from "@/components/Calculators";
import { getPortfolioStatus } from "@/lib/portfolioUtils";

export default async function ToolsPage() {
  const session = await auth();
  // (ถ้ายังไม่ login ก็ให้เข้าได้ แต่จะเป็นธีม Default)
  
  // 1. ดึงสถานะพอร์ต (เพื่อทำธีมสี)
  const status = await getPortfolioStatus();

  return (
    // ส่ง status ไปให้ Component คำนวณ
    <Calculators status={status} />
  );
}