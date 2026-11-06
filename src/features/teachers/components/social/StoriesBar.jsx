"use client";

import React, { useState, useEffect } from "react";
import { Plus, X, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";

export default function StoriesBar({ currentUser, currentTeacherUser, onAddStoryClick }) {
  const [stories, setStories] = useState([]);
  const [activeStoryIndex, setActiveStoryIndex] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    async function loadStories() {
      try {
        const res = await fetch("/api/teacher-marketplace/stories");
        const data = await res.json();
        if (data.ok && Array.isArray(data.stories)) {
          setStories(data.stories);
        }
      } catch (e) {
        console.warn("Could not fetch stories:", e);
      }
    }
    loadStories();
  }, []);

  // Story playback timer (5 seconds per story)
  useEffect(() => {
    if (activeStoryIndex === null || isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (activeStoryIndex < stories.length - 1) {
            setActiveStoryIndex((idx) => idx + 1);
            return 0;
          } else {
            setActiveStoryIndex(null);
            return 0;
          }
        }
        return prev + 2; // 50 ticks = 5 seconds (100ms interval)
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeStoryIndex, isPaused, stories.length]);

  const activeStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;

  return (
    <div className="w-full">
      {/* Horizontal Scrollable Stories Container */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        {/* "Create Story" Card */}
        <div
          onClick={onAddStoryClick}
          className="relative w-28 sm:w-32 h-44 sm:h-48 rounded-2xl sm:rounded-3xl overflow-hidden bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm shrink-0 flex flex-col justify-between cursor-pointer group hover:shadow-md transition active:scale-95"
        >
          <div className="h-28 sm:h-32 w-full overflow-hidden relative">
            <img
              src={
                currentUser?.avatar ||
                currentTeacherUser?.avatar ||
                "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80"
              }
              alt="My Profile"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>
          <div className="relative -mt-5 flex flex-col items-center pb-2 px-1 text-center bg-white dark:bg-stone-900 flex-1">
            <div className="w-8 h-8 rounded-full bg-emerald-600 group-hover:bg-emerald-700 text-white flex items-center justify-center border-2 border-white dark:border-stone-900 shadow-md">
              <Plus className="w-4 h-4 stroke-[3]" />
            </div>
            <span className="text-[11px] font-black text-slate-800 dark:text-stone-200 mt-1 truncate w-full">
              স্টোরি দিন
            </span>
          </div>
        </div>

        {/* Existing Active Stories */}
        {stories.map((story, idx) => (
          <div
            key={story.id || idx}
            onClick={() => {
              setActiveStoryIndex(idx);
              setProgress(0);
            }}
            className="relative w-28 sm:w-32 h-44 sm:h-48 rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-800 shrink-0 cursor-pointer shadow-sm group hover:shadow-lg transition active:scale-95"
          >
            <img
              src={story.media_url}
              alt={story.author_name}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Author Avatar with Ring */}
            <div className="absolute top-2.5 left-2.5">
              <div className="w-8 h-8 rounded-full ring-2 ring-emerald-500 overflow-hidden shadow-md">
                <img
                  src={
                    story.author_avatar ||
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80"
                  }
                  alt={story.author_name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Author Name and Role Pill */}
            <div className="absolute bottom-2.5 left-2 right-2 space-y-0.5">
              <span className="text-[10px] font-black text-white truncate block drop-shadow-sm">
                {story.author_name}
              </span>
              <span className="inline-block text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-500/30">
                {story.author_role === "teacher" ? "উস্তাদ" : "শিক্ষার্থী"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Full-Screen Story Viewer Modal */}
      {activeStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-sm w-full h-[80vh] rounded-3xl overflow-hidden shadow-2xl bg-black flex flex-col justify-between">
            {/* Top Progress Bars */}
            <div className="absolute top-3 inset-x-3 z-30 flex items-center gap-1.5">
              {stories.map((_, i) => (
                <div key={i} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-100 ease-linear"
                    style={{
                      width:
                        i < activeStoryIndex
                          ? "100%"
                          : i === activeStoryIndex
                          ? `${progress}%`
                          : "0%",
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Header info */}
            <div className="absolute top-6 inset-x-4 z-30 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <img
                  src={
                    activeStory.author_avatar ||
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80"
                  }
                  alt={activeStory.author_name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500"
                />
                <div>
                  <span className="text-xs font-black block">{activeStory.author_name}</span>
                  <span className="text-[10px] text-white/70">২৪ ঘণ্টার স্টোরি</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPaused((p) => !p)}
                  className="p-1 rounded-full hover:bg-white/20 text-white cursor-pointer"
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setActiveStoryIndex(null)}
                  className="p-1 rounded-full hover:bg-white/20 text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Media Image */}
            <div className="w-full h-full flex items-center justify-center relative">
              <img
                src={activeStory.media_url}
                alt="Story content"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
            </div>

            {/* Caption & Navigation Controls */}
            <div className="absolute bottom-5 inset-x-4 z-30 space-y-3">
              {activeStory.caption && (
                <p className="text-xs font-medium text-white/95 leading-relaxed bg-black/50 p-3 rounded-2xl backdrop-blur-xs">
                  {activeStory.caption}
                </p>
              )}
              <div className="flex items-center justify-between text-white/80">
                <button
                  disabled={activeStoryIndex === 0}
                  onClick={() => {
                    setActiveStoryIndex((i) => Math.max(0, i - 1));
                    setProgress(0);
                  }}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  disabled={activeStoryIndex === stories.length - 1}
                  onClick={() => {
                    setActiveStoryIndex((i) => Math.min(stories.length - 1, i + 1));
                    setProgress(0);
                  }}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
