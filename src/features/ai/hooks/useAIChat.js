"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

const STORAGE_KEY_SETTINGS = "rahmania_ai_settings_v1";

export function useAIChat({ defaultWelcomeText } = {}) {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content:
        defaultWelcomeText ||
        "আসসালামু আলাইকুম! আমি **রহমানিয়া ইনস্টিটিউট এআই সহকারী**।\n\n🚧 **আমাদের ওয়েবসাইটের কাজ বর্তমানে চলমান রয়েছে।**\nআপাতত মাদরাসার নূরানী, নাজেরা, হিফযুল কুরআন, কিতাব ও জেনারেল বিভাগ, ভর্তি তথ্য বা যোগাযোগ সংক্রান্ত তথ্যের জন্য নিচের অপশন বা হেল্পলাইন ব্যবহার করতে পারেন।",
      timestamp: new Date().toISOString(),
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState(null);
  const [generatedReceipt, setGeneratedReceipt] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // AI Configuration (BYOK / Provider / Model)
  const [config, setConfig] = useState({
    provider: "openrouter",
    model: "meta-llama/llama-3.3-70b-instruct:free",
    apiKey: "", // In-memory session key
    baseUrl: "",
    rememberKey: false,
  });

  // Load saved settings (if any)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        setConfig((prev) => ({
          ...prev,
          provider: parsed.provider || "openrouter",
          model: parsed.model || "meta-llama/llama-3.3-70b-instruct:free",
          baseUrl: parsed.baseUrl || "",
          rememberKey: Boolean(parsed.rememberKey),
          apiKey: parsed.rememberKey && parsed.apiKey ? parsed.apiKey : "",
        }));
      }
    } catch {}
  }, []);

  const saveConfig = useCallback((newConfig) => {
    setConfig(newConfig);
    try {
      const toSave = {
        provider: newConfig.provider,
        model: newConfig.model,
        baseUrl: newConfig.baseUrl || "",
        rememberKey: newConfig.rememberKey,
        apiKey: newConfig.rememberKey ? newConfig.apiKey : "",
      };
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(toSave));
    } catch {}
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
