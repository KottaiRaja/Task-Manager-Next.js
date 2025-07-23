"use client";
import { useRouter } from "next/navigation";
import TopNavBar from "@/components/TopNavbar";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }) {
  const router = useRouter();

  return (
    <div className="flex h-screen bg-[#0d1117] text-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavBar />
        <main className="overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  );
}
