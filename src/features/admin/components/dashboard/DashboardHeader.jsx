"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  GraduationCap,
  Download,
  Bell,
  Menu,
  Mail,
  PanelLeftClose,
  PanelLeftOpen,
  Layers,
  Bot
} from "lucide-react";
import ThemeToggle from "@/components/ui-custom/ThemeToggle";
import GlobalSearchBar from "../../components/GlobalSearchBar";

export default function DashboardHeader({
  setSidebarOpen,
  isSidebarCollapsed,
  toggleSidebar,
  activeSchoolSlug,
  currentUser,
  unreadNotificationsCount = 0,
  combinedNotifications = [],
  setActiveTab,
  exportCSV,
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center justify-between gap-4 shadow-sm select-none">
      {/* Left Side: Sidebar Toggle & Search */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 rounded-xl border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all text-slate-600"
          type="button"
          aria-label="Open Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Desktop Sidebar Toggle Button */}
        <button
          onClick={toggleSidebar}
          type="button"
          title={isSidebarCollapsed ? "Restore Sidebar" : "Expand Workspace"}
          className="hidden lg:flex p-2 rounded-xl border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all text-slate-600 hover:text-[#052E2B] transition-colors duration-200"
          aria-label="Toggle Sidebar"
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>
        <div className="relative flex-1 max-w-full sm:max-w-md group">
          <GlobalSearchBar />
        </div>
      </div>

      {/* Right Side: Session Badge, Notification, Actions */}
      <div className="flex items-center gap-3">
        {/* Quick Page Builder Button */}
        <Link href={`/admin/website/page-builder?slug=${activeSchoolSlug}`}>
          <Button size="sm" className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-sm h-8 px-3">
            <Layers size={14} className="mr-1.5" /> ⚡ Page Builder
          </Button>
        </Link>

        {/* Quick AI Assistant Trigger */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="border-emerald-600/30 text-emerald-800 hover:bg-emerald-50 text-xs font-semibold shadow-sm h-8 px-2.5 gap-1.5 cursor-pointer"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("toggle-ai-chat"));
            }
          }}
          title="এআই সহকারী খুলুন (Alt+A)"
        >
          <Bot size={14} className="text-amber-500 animate-pulse" />
          <span className="hidden sm:inline">এআই সহকারী</span>
        </Button>

        <ThemeToggle />

        {/* Role Badge */}
        {currentUser?.role && (
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
            currentUser.role === "admin"
              ? "bg-red-50 text-red-700 border-red-200"
              : currentUser.role === "boarding_manager"
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-200"
          }`}>
            {currentUser.role === "admin" ? "Super Admin"
              : currentUser.role === "boarding_manager" ? "Boarding Manager (বোর্ডিং ম্যানেজার)"
              : "Branch Admin"}
          </span>
        )}

        {/* Notification Bell */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="relative p-2 rounded-full border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all text-slate-600 focus:outline-none" type="button" aria-label="Notifications">
              <Bell className="h-4.5 w-4.5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-extrabold text-white border border-white">
                  {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[92vw] sm:w-80 p-0 rounded-2xl shadow-xl border border-gray-100 overflow-hidden bg-white z-50">
            {/* Popover Header */}
            <div className="bg-[#022c22] text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Bell className="h-4 w-4 text-[#D4AF37]" />
                <span className="text-xs font-bold tracking-wide">Inbox & Applications ({unreadNotificationsCount})</span>
              </div>
              {unreadNotificationsCount > 0 && (
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full text-white font-medium animate-pulse">New</span>
              )}
            </div>

            {/* Popover List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
              {combinedNotifications.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-xs italic">
                  No incoming messages or applications.
                </div>
              ) : (
                combinedNotifications.slice(0, 8).map((notif) => {
                  const date = notif.date ? new Date(notif.date).toLocaleDateString() : "";
                  return (
                    <div 
                      key={notif.id} 
                      onClick={() => {
                        setActiveTab(notif.type === "sms" ? "messages" : "reserve");
                      }}
                      className={`p-3 hover:bg-gray-50/80 transition-colors cursor-pointer text-left flex gap-3 relative ${
                        notif.isNew ? "bg-amber-50/15" : ""
                      }`}
                    >
                      {/* Dot indicator */}
                      {notif.isNew && (
                        <span className="absolute top-4 right-3 h-2 w-2 rounded-full bg-amber-500" />
                      )}
                      
                      {/* Left icon container */}
                      <div 
                        className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5" 
                        style={{ backgroundColor: `${notif.badgeColor}15`, color: notif.badgeColor }}
                      >
                        {notif.type === "sms" ? (
                          <Mail className="h-4 w-4" />
                        ) : (
                          <GraduationCap className="h-4 w-4" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1 pr-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: notif.badgeColor }}>
                            {notif.type === "sms" ? "SMS" : "Abedon"}
                          </span>
                          <span className="text-[9px] text-gray-400 font-medium">
                            {date}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 line-clamp-1 mt-0.5">
                          {notif.name}
                        </p>
                        <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                          {notif.detail}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Popover Footer */}
            <div className="grid grid-cols-2 divide-x divide-gray-100 bg-gray-50 border-t border-gray-100 text-center">
              <button 
                type="button"
                onClick={() => setActiveTab("messages")}
                className="py-2.5 text-[11px] text-[#022c22] hover:text-[#052E2B] font-bold hover:bg-gray-100 transition-colors block"
              >
                View Messages
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab("reserve")}
                className="py-2.5 text-[11px] text-[#022c22] hover:text-[#052E2B] font-bold hover:bg-gray-100 transition-colors block"
              >
                View Admissions
              </button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Action buttons: Nur AI & Export */}
        <div className="flex items-center gap-2 ml-1">
          <Button
            variant="outline"
            onClick={() => window.dispatchEvent(new CustomEvent("open-ai-chat"))}
            className="gap-1.5 rounded-xl h-9.5 text-xs font-bold transition-all text-emerald-700 dark:text-emerald-300 border-emerald-500/40 bg-emerald-50/60 hover:bg-emerald-100/80 dark:bg-emerald-950/40"
            title="নূর AI সহকারী ও কুরআন শিক্ষক ওপেন করুন"
          >
            <Bot className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline font-serif">নূর AI</span>
          </Button>

          <Button
            variant="premium-outline"
            onClick={exportCSV}
            className="gap-2 rounded-xl h-9.5 text-xs font-bold transition-all"
          >
            <Download className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
