"use client";

import TopNavBar from "@/components/TopNavbar";
import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { SendBirdProvider, TypingIndicatorType } from "@sendbird/uikit-react";
import "@sendbird/uikit-react/dist/index.css";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const APP_ID = "A448CF95-4220-42EE-8600-EF05BEC75D02";

  const [userId, setUserId] = useState(null);
  const [nickname, setNickname] = useState(null);

  useEffect(() => {
    const storedId = localStorage.getItem("userId");
    const storedName = localStorage.getItem("username");

    if (!storedId || !storedName) {
      router.push("/login");
    } else {
      setUserId(storedId);
      setNickname(storedName);
    }
  }, []);

  if (!userId || !nickname) return null;

  return (
    <SendBirdProvider
      appId={APP_ID}
      userId={userId}
      nickname={nickname}
      theme="dark"
      uikitOptions={{
        groupChannel: {
          enableTypingIndicator: true,
          typingIndicatorTypes: new Set([
            TypingIndicatorType.Bubble,
            TypingIndicatorType.Text,
          ]),
          enableMention: true,
          enableVoiceMessage: true, // ✅ Voice messages enabled
        },
      }}
      config={{
        userMention: {
          maxMentionCount: 10,
          maxSuggestionCount: 15,
        },
      }}
    >
      <div className="flex h-screen bg-[#0d1117] text-white overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNavBar />
          <main className="overflow-y-auto p-4">{children}</main>
        </div>
      </div>
    </SendBirdProvider>
  );
}
