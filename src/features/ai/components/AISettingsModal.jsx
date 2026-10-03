"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { SUPPORTED_PROVIDERS } from "../../../lib/ai/providers";
import { CheckCircle2, AlertCircle, Eye, EyeOff, Wrench, Zap } from "lucide-react";
import { toast } from "sonner";

export default function AISettingsModal({ open, onOpenChange, config, onSave }) {
  const [provider, setProvider] = useState(config?.provider || "openrouter");
  const [model, setModel] = useState(config?.model || "meta-llama/llama-3.3-70b-instruct:free");
  const [customModelText, setCustomModelText] = useState(config?.model || "");
  const [isCustomModelMode, setIsCustomModelMode] = useState(false);
  const [baseUrl, setBaseUrl] = useState(config?.baseUrl || "");
  const [apiKey, setApiKey] = useState(config?.apiKey || "");
  const [rememberKey, setRememberKey] = useState(Boolean(config?.rememberKey));
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const currentProviderObj = SUPPORTED_PROVIDERS.find((p) => p.id === provider) || SUPPORTED_PROVIDERS[0];
  const availableModels = currentProviderObj.models || [];

  const handleProviderChange = (newProvider) => {
    setProvider(newProvider);
    const pObj = SUPPORTED_PROVIDERS.find((p) => p.id === newProvider);
    if (pObj && pObj.models.length > 0) {
      setModel(pObj.models[0].id);
      setCustomModelText(pObj.models[0].id);
    }
    setTestResult(null);
  };

  const activeModel = isCustomModelMode ? customModelText : model;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/ai/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, model: activeModel, apiKey, baseUrl }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setTestResult({ success: false, message: data.message || "Connection test failed." });
        toast.error(data.message || "Connection test failed.");
      } else {
        setTestResult({ success: true, message: data.message || "Connection successful!" });
        toast.success("AI Provider connection verified!");
      }
    } catch {
      setTestResult({ success: false, message: "Network error while testing connection." });
      toast.error("Network error while testing.");
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    onSave({
      provider,
      model: activeModel.trim() || model,
      baseUrl: baseUrl.trim(),
      apiKey: apiKey.trim(),
      rememberKey,
    });
    toast.success("AI settings updated!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-slate-200 bg-white/95 p-6 shadow-2xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div>
            <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              এআই প্রোভাইডার ও এপিআই সেটিংস (AI Settings)
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              যেকোনো প্রোভাইডার (OpenRouter, Gemini, OpenAI, Groq, DeepSeek) বা নিজস্ব API Key কনফিগার করুন।
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Informative Explanation Banner */}
        <div className="rounded-xl border border-teal-500/20 bg-teal-50/60 p-3 text-xs leading-relaxed text-teal-900 dark:border-teal-500/30 dark:bg-teal-950/30 dark:text-teal-200">
          💡 <strong>BYOK (Bring-Your-Own-Key) কী?</strong> আপনার নিজস্ব যেকোনো ফ্রি বা পেইড AI Key এখানে দিতে পারেন। এই কী কোনো ডাটাবেসে সেভ হবে না, শুধু আপনার ব্রাউজার সেশনে নিরাপদ থাকবে।
        </div>

        <div className="space-y-4 py-1 text-sm">
          {/* Provider Selection */}
          <div>
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              AI Provider (প্রোভাইডার সিলেক্ট করুন)
            </Label>
            <Select value={provider} onValueChange={handleProviderChange}>
              <SelectTrigger className="mt-1 h-10">
                <SelectValue placeholder="Select Provider" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_PROVIDERS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{p.name}</span>
                      {!p.requiresApiKey && (
                        <Badge variant="secondary" className="text-[10px] text-teal-700 dark:text-teal-300">
                          Shared Default
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-1 text-[11px] text-slate-500">{currentProviderObj.description}</p>
          </div>

          {/* Model Selection */}
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Model (মডেল)</Label>
              <button
                type="button"
                onClick={() => setIsCustomModelMode(!isCustomModelMode)}
                className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline font-medium"
              >
                {isCustomModelMode ? "তালিকা থেকে বাছুন" : "কাস্টম মডেল নাম লিখুন"}
              </button>
            </div>

            {isCustomModelMode ? (
              <Input
                type="text"
                value={customModelText}
                onChange={(e) => setCustomModelText(e.target.value)}
                placeholder="e.g. deepseek-r1, llama-3.3-70b-versatile, gpt-4o, gemini-2.0-flash"
                className="mt-1 h-10 text-xs font-mono"
              />
            ) : (
              <Select value={model} onValueChange={(val) => { setModel(val); setCustomModelText(val); }}>
                <SelectTrigger className="mt-1 h-10">
                  <SelectValue placeholder="Select Model" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <div className="flex items-center justify-between gap-3">
                        <span>{m.name}</span>
                        <div className="flex items-center gap-1">
                          {m.isToolCapable && (
                            <Badge variant="outline" className="border-emerald-500/40 text-[9px] text-emerald-600 dark:text-emerald-400">
                              <Wrench className="mr-0.5 h-2.5 w-2.5" /> Tools
                            </Badge>
                          )}
                          {m.badge && (
                            <Badge className="bg-slate-200 text-[9px] text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                              {m.badge}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Custom Base URL (if custom provider or requested) */}
          {(provider === "custom" || currentProviderObj.allowsCustomUrl) && (
            <div>
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Custom API Base URL / Endpoint (ঐচ্ছিক)
              </Label>
              <Input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="e.g. https://api.groq.com/openai/v1 or http://localhost:11434/v1"
                className="mt-1 h-10 text-xs font-mono"
              />
            </div>
          )}

          {/* BYOK API Key Input */}
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Custom API Key {currentProviderObj.requiresApiKey ? "(প্রয়োজনীয়)" : "(ঐচ্ছিক)"}
              </Label>
              <span className="text-[11px] text-slate-400">Zero-Leak • Never stored in DB</span>
            </div>
            <div className="relative mt-1">
              <Input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={
                  provider === "gemini"
                    ? "AIzaSy..."
                    : provider === "groq"
                    ? "gsk_..."
                    : provider === "deepseek"
                    ? "sk-..."
                    : provider === "anthropic"
                    ? "sk-ant-..."
                    : "sk-..."
                }
                className="h-10 pr-20 font-mono text-xs"
              />
              <div className="absolute inset-y-0 right-1 flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-slate-400"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Remember Key Checkbox */}
          <div className="flex items-center space-x-2 rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 dark:border-slate-800 dark:bg-slate-900/50">
            <Checkbox
              id="rememberKey"
              checked={rememberKey}
              onCheckedChange={(checked) => setRememberKey(Boolean(checked))}
            />
            <label
              htmlFor="rememberKey"
              className="text-xs font-medium leading-none text-slate-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-slate-300"
            >
              ব্রাউজারে কী সংরক্ষণ করুন (Remember key across tabs)
            </label>
          </div>

          {/* Connection Test Result */}
          {testResult && (
            <div
              className={`flex items-start gap-2 rounded-lg p-3 text-xs ${
                testResult.success
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-300"
                  : "border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800/40 dark:bg-rose-950/30 dark:text-rose-300"
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTestConnection}
            disabled={isTesting || (!apiKey && currentProviderObj.requiresApiKey)}
            className="h-9 gap-1 text-xs"
          >
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            {isTesting ? "যাচাই করা হচ্ছে..." : "Test Connection"}
          </Button>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-9 text-xs"
            >
              বন্ধ করুন (Cancel)
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              className="h-9 bg-teal-600 text-xs font-semibold text-white hover:bg-teal-700"
            >
              সেভ করুন (Save)
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
