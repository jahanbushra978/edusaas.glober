"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { getSavedAIConfig, saveAIConfigToStorage } from "../lib/aiConfigHelper";

export function useAIChat({ defaultWelcomeText } = {}) {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content:
        defaultWelcomeText ||
        "আসসালামু আলাইকুম! আমি **নূর এআই** — রহমানিয়া ইনস্টিটিউটের কুরআন শিক্ষক ও অফিসিয়াল এআই সহকারী।\n\nমাদরাসার নূরানী, নাজেরা, হিফযুল কুরআন, তাজবীদ ও মাখরাজ অনুশীলন, কিংবা ভর্তি ও প্রাতিষ্ঠানিক যেকোনো তথ্যের জন্য আমাকে প্রশ্ন করতে পারেন।\n\n💡 *টিপ:* আরও দ্রুত ও জেনারেটিভ AI অভিজ্ঞতার জন্য উপরে **'API Key যোগ করুন'** বাটনে ক্লিক করে নিজস্ব ফ্রি Google Gemini বা OpenRouter Key যুক্ত করতে পারেন।",
      timestamp: new Date().toISOString(),
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState(null);
  const [generatedReceipt, setGeneratedReceipt] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // AI Configuration (BYOK / Provider / Model)
  const [config, setConfig] = useState(() => getSavedAIConfig());

  // Load saved settings & listen for cross-component updates
  useEffect(() => {
    setConfig(getSavedAIConfig());

    const handleSync = (e) => {
      if (e?.detail) {
        setConfig(e.detail);
      }
    };
    window.addEventListener("rahmania-ai-settings-updated", handleSync);
    return () => window.removeEventListener("rahmania-ai-settings-updated", handleSync);
  }, []);

  const saveConfig = useCallback((newConfig) => {
    setConfig(newConfig);
    saveAIConfigToStorage(newConfig);
  }, []);

  // Send message to AI Chat API
  const sendMessage = useCallback(
    async (text) => {
      if (!text || !text.trim() || isLoading) return;

      const userMsg = {
        id: `usr_${Date.now()}`,
        role: "user",
        content: text.trim(),
        timestamp: new Date().toISOString(),
      };

      // Rolling 10 Memory: Keep only last 10 conversational messages in context
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setIsLoading(true);

      try {
        const response = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: newMessages.slice(-10).map((m) => ({
              role: m.role,
              content: m.content,
            })),
            provider: config.provider,
            model: config.model,
            baseUrl: config.baseUrl,
            apiKey: config.apiKey,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.ok) {
          if (response.status === 429) {
            toast.error(data.message || "Quota exceeded. Please slow down.");
          } else if (response.status === 401) {
            toast.error("Please log in to use AI assistant.");
          } else {
            toast.error(data.message || "AI response error");
          }

          const errMsg = {
            id: `err_${Date.now()}`,
            role: "assistant",
            content: `⚠️ **ত্রুটি:** ${data.message || "রেসপন্স তৈরিতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।"}${response.status === 429 ? "\n\n💡 *টিপ:* AI Settings থেকে নিজস্ব ফ্রি/পেইড API Key যোগ করে আনলিমিটেড ব্যবহার করতে পারেন।" : ""}`,
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, errMsg]);
          return;
        }

        const aiMsg = {
          id: `ai_${Date.now()}`,
          role: "assistant",
          content: data.content,
          toolCalls: data.toolCalls,
          confirmation: data.confirmation,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, aiMsg]);

        // If sensitive operation requires interactive confirmation
        if (data.confirmation) {
          setPendingConfirmation(data.confirmation);
        }
      } catch (err) {
        toast.error("Network or connection error");
        setMessages((prev) => [
          ...prev,
          {
            id: `err_${Date.now()}`,
            role: "assistant",
            content: "⚠️ সংযোগ বিঘ্নিত হয়েছে। অনুগ্রহ করে ইন্টারনেট কানেকশন বা API Key যাচাই করুন।",
            timestamp: new Date().toISOString(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, config]
  );

  // Confirm High-Risk Operation (e.g. Fee Collection)
  const confirmOperation = useCallback(
    async ({ paymentMethod = "Cash", transactionId = "", notes = "" } = {}) => {
      if (!pendingConfirmation) return;

      setIsLoading(true);
      try {
        const response = await fetch("/api/ai/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            signedToken: pendingConfirmation.signed_token,
            paymentMethod,
            transactionId,
            notes,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.ok) {
          toast.error(data.message || "Failed to confirm operation");
          setMessages((prev) => [
            ...prev,
            {
              id: `conf_err_${Date.now()}`,
              role: "assistant",
              content: `❌ **অপারেশন ব্যর্থ:** ${data.message}`,
              timestamp: new Date().toISOString(),
            },
          ]);
          setPendingConfirmation(null);
          return;
        }

        toast.success(data.message || "Operation confirmed successfully!");

        if (data.receipt) {
          setGeneratedReceipt(data.receipt);
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `conf_success_${Date.now()}`,
            role: "assistant",
            content: `✅ **সফল সম্পন্ন:** ${data.message}\n\nআপনার ডিজিটাল রসিদ নিচে প্রস্তুত করা হয়েছে।`,
            receipt: data.receipt,
            timestamp: new Date().toISOString(),
          },
        ]);

        setPendingConfirmation(null);
      } catch (err) {
        toast.error("Failed to submit confirmation");
      } finally {
        setIsLoading(false);
      }
    },
    [pendingConfirmation]
  );

  const cancelConfirmation = useCallback(() => {
    if (!pendingConfirmation) return;
    setPendingConfirmation(null);
    setMessages((prev) => [
      ...prev,
      {
        id: `conf_cancel_${Date.now()}`,
        role: "assistant",
        content: "অপারেশনটি বাতিল করা হয়েছে। ডাটাবেসে কোনো পরিবর্তন করা হয়নি।",
        timestamp: new Date().toISOString(),
      },
    ]);
  }, [pendingConfirmation]);

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: "welcome_cleared",
        role: "assistant",
        content: "চ্যাট হিস্ট্রি রিসেট করা হয়েছে। আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
        timestamp: new Date().toISOString(),
      },
    ]);
    setPendingConfirmation(null);
    setGeneratedReceipt(null);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    pendingConfirmation,
    confirmOperation,
    cancelConfirmation,
    generatedReceipt,
    setGeneratedReceipt,
    clearChat,
    config,
    saveConfig,
    isSettingsOpen,
    setIsSettingsOpen,
  };
}
