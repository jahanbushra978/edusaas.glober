"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Volume2,
  RotateCcw,
  Eraser,
  PenTool,
  Download,
  Award,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Home,
  Grid,
} from "lucide-react";
import { toast } from "sonner";
import { useLearningLanguage } from "../hooks/useLearningLanguage";
import {
  playArabicSound,
  playMaShaAllahCelebration,
  playStarPopSound,
} from "../lib/arabicSoundPlayer";
import { fireCelebrationConfetti } from "../lib/confetti";

// ── 29 ARABIC ALPHABET DEFINITIONS ──
const ARABIC_ALPHABET = [
  { ar: "ا", nameBn: "আলিফ", nameEn: "Alif", color: "#ef4444", makhraj: "মুখের খালি জায়গা (হলক) থেকে" },
  { ar: "ب", nameBn: "বা", nameEn: "Ba", color: "#f59e0b", makhraj: "দুই ঠোঁটের ভেজা অংশ থেকে" },
  { ar: "ت", nameBn: "তা", nameEn: "Ta", color: "#10b981", makhraj: "জিহ্বার ডগা ও সামনের ওপরের দাঁতের গোড়া" },
  { ar: "ث", nameBn: "ছা", nameEn: "Tha", color: "#06b6d4", makhraj: "জিহ্বার ডগা ও সামনের ওপরের দাঁতের আগা" },
  { ar: "ج", nameBn: "জীম", nameEn: "Jeem", color: "#8b5cf6", makhraj: "জিহ্বার মধ্যভাগ ও তার ওপরের তালু" },
  { ar: "ح", nameBn: "হা", nameEn: "Haa", color: "#ec4899", makhraj: "কণ্ঠনালীর মধ্যভাগ থেকে" },
  { ar: "خ", nameBn: "খা", nameEn: "Kha", color: "#f97316", makhraj: "কণ্ঠনালীর শেষভাগ (মুখের দিকের অংশ)" },
  { ar: "د", nameBn: "দাল", nameEn: "Dal", color: "#14b8a6", makhraj: "জিহ্বার ডগা ও সামনের ওপরের দাঁতের গোড়া" },
  { ar: "ذ", nameBn: "যাল", nameEn: "Dhal", color: "#6366f1", makhraj: "জিহ্বার ডগা ও সামনের ওপরের দাঁতের আগা" },
  { ar: "ر", nameBn: "রা", nameEn: "Ra", color: "#e11d48", makhraj: "জিহ্বার ডগার পিঠ ও তার ওপরের তালু" },
  { ar: "ز", nameBn: "যা", nameEn: "Zay", color: "#84cc16", makhraj: "জিহ্বার ডগা ও সামনের নিচের দুই দাঁতের পেট" },
  { ar: "س", nameBn: "সীন", nameEn: "Seen", color: "#0ea5e9", makhraj: "জিহ্বার ডগা ও সামনের নিচের দুই দাঁতের পেট" },
  { ar: "ش", nameBn: "শীন", nameEn: "Sheen", color: "#a855f7", makhraj: "জিহ্বার মধ্যভাগ ও তার ওপরের তালু" },
  { ar: "ص", nameBn: "ছোয়াদ", nameEn: "Saad", color: "#d97706", makhraj: "জিহ্বার ডগা ও নিচের দাঁতের পেট (মোটা হরফ)" },
  { ar: "ض", nameBn: "দোয়াদ", nameEn: "Daad", color: "#059669", makhraj: "জিহ্বার গোড়ার কিনারা ও ওপরের মাড়ির দাঁত" },
  { ar: "ط", nameBn: "ত্বোয়া", nameEn: "Taa", color: "#2563eb", makhraj: "জিহ্বার ডগা ও ওপরের দাঁতের গোড়া (মোটা হরফ)" },
  { ar: "ظ", nameBn: "যোয়া", nameEn: "Dhaa", color: "#7c3aed", makhraj: "জিহ্বার ডগা ও ওপরের দাঁতের আগা (মোটা হরফ)" },
  { ar: "ع", nameBn: "আইন", nameEn: "Ayn", color: "#db2777", makhraj: "কণ্ঠনালীর মধ্যভাগ থেকে চাপ দিয়ে" },
  { ar: "غ", nameBn: "গইন", nameEn: "Ghayn", color: "#ea580c", makhraj: "কণ্ঠনালীর শেষভাগ থেকে নরমভাবে" },
  { ar: "ف", nameBn: "ফা", nameEn: "Fa", color: "#0d9488", makhraj: "নিচের ঠোঁটের পেট ও ওপরের সামনের দুই দাঁত" },
  { ar: "ق", nameBn: "ক্বাফ", nameEn: "Qaaf", color: "#4f46e5", makhraj: "জিহ্বার গোড়া ও ওপরের নরম তালু" },
  { ar: "ك", nameBn: "কাফ", nameEn: "Kaaf", color: "#ca8a04", makhraj: "জিহ্বার গোড়া থেকে একটু সামনে তালুর সাথে" },
  { ar: "ل", nameBn: "লাম", nameEn: "Laam", color: "#16a34a", makhraj: "জিহ্বার অগ্রভাগের কিনারা ও ওপরের মাড়ি" },
  { ar: "م", nameBn: "মীম", nameEn: "Meem", color: "#0284c7", makhraj: "দুই ঠোঁটের শুকনা অংশ থেকে" },
  { ar: "ن", nameBn: "নূন", nameEn: "Noon", color: "#9333ea", makhraj: "জিহ্বার ডগা ও ওপরের মাড়ি (গুন্নাহ)" },
  { ar: "و", nameBn: "ওয়াও", nameEn: "Waw", color: "#dc2626", makhraj: "দুই ঠোঁট গোল করে সামান্য ফাঁক রেখে" },
  { ar: "هـ", nameBn: "হা", nameEn: "Haa", color: "#65a30d", makhraj: "কণ্ঠনালীর শুরুভাগ (বুকের দিকের অংশ)" },
  { ar: "ء", nameBn: "হামযাহ", nameEn: "Hamzah", color: "#0891b2", makhraj: "কণ্ঠনালীর শুরুভাগ থেকে স্পষ্টভাবে" },
  { ar: "ي", nameBn: "ইয়া", nameEn: "Yaa", color: "#c026d3", makhraj: "জিহ্বার মধ্যভাগ ও তার ওপরের তালু" }
];

// ── 🐾 MASCOTS & DELICIOUS COLLECTIBLES (EXACTLY MATCHING USER'S 5 IMAGES) ──
const MASCOTS = [
  { id: "elephant", name: "হাতি ছানা", emoji: "🐘", itemEmoji: "⚽", itemName: "রঙিন বল" },
  { id: "lion", name: "সিংহ ছানা", emoji: "🦁", itemEmoji: "🥩", itemName: "মজাদার মাংস" },
  { id: "mouse", name: "ইঁদুর ছানা", emoji: "🐭", itemEmoji: "🧀", itemName: "সুস্বাদু পনির" },
  { id: "camel", name: "মরুর উট", emoji: "🐪", itemEmoji: "🍈", itemName: "মিষ্টি খেজুর" },
  { id: "sheep", name: "মিষ্টি ভেড়া", emoji: "🐑", itemEmoji: "🍎", itemName: "রসালো আপেল" },
  { id: "dove", name: "শান্তির ঘুঘু", emoji: "🕊️", itemEmoji: "⭐", itemName: "সোনার তারা" },
];

// ── 🎯 ACCURATE CALLIGRAPHY STROKE PATHS FOR ALL 29 ARABIC LETTERS ──
// SVG Coordinate System: 0 0 900 560 (Baseline at y = 370)
// Every checkpoint is 100% mathematically locked dead-center on the stroke path.
const ARABIC_STROKE_DATA = {
  "ا": {
    path: "M 450 110 L 450 420",
    dots: [],
    points: [
      { x: 450, y: 110, t: 0 },
      { x: 450, y: 190, t: 0.25 },
      { x: 450, y: 270, t: 0.50 },
      { x: 450, y: 350, t: 0.75 },
      { x: 450, y: 420, t: 1.0 },
    ],
  },
  "ب": {
    path: "M 660 250 Q 620 400 450 400 Q 280 400 240 250",
    dots: [{ x: 450, y: 470, r: 18 }],
    points: [
      { x: 660, y: 250, t: 0 },
      { x: 600, y: 360, t: 0.25 },
      { x: 450, y: 400, t: 0.50 },
      { x: 300, y: 360, t: 0.75 },
      { x: 240, y: 250, t: 1.0 },
    ],
  },
  "ت": {
    path: "M 660 250 Q 620 400 450 400 Q 280 400 240 250",
    dots: [
      { x: 485, y: 160, r: 16 },
      { x: 415, y: 160, r: 16 },
    ],
    points: [
      { x: 660, y: 250, t: 0 },
      { x: 600, y: 360, t: 0.25 },
      { x: 450, y: 400, t: 0.50 },
      { x: 300, y: 360, t: 0.75 },
      { x: 240, y: 250, t: 1.0 },
    ],
  },
  "ث": {
    path: "M 660 250 Q 620 400 450 400 Q 280 400 240 250",
    dots: [
      { x: 450, y: 125, r: 15 },
      { x: 485, y: 170, r: 15 },
      { x: 415, y: 170, r: 15 },
    ],
    points: [
      { x: 660, y: 250, t: 0 },
      { x: 600, y: 360, t: 0.25 },
      { x: 450, y: 400, t: 0.50 },
      { x: 300, y: 360, t: 0.75 },
      { x: 240, y: 250, t: 1.0 },
    ],
  },
  "ج": {
    path: "M 360 170 L 530 170 Q 460 250 440 260 Q 570 330 530 440 Q 450 520 310 470 Q 230 420 210 350",
    dots: [{ x: 370, y: 370, r: 18 }],
    points: [
      { x: 360, y: 170, t: 0 },
      { x: 530, y: 170, t: 0.20 },
      { x: 440, y: 260, t: 0.40 },
      { x: 530, y: 400, t: 0.65 },
      { x: 370, y: 480, t: 0.85 },
      { x: 210, y: 350, t: 1.0 },
    ],
  },
  "ح": {
    path: "M 360 170 L 530 170 Q 460 250 440 260 Q 570 330 530 440 Q 450 520 310 470 Q 230 420 210 350",
    dots: [],
    points: [
      { x: 360, y: 170, t: 0 },
      { x: 530, y: 170, t: 0.20 },
      { x: 440, y: 260, t: 0.40 },
      { x: 530, y: 400, t: 0.65 },
      { x: 370, y: 480, t: 0.85 },
      { x: 210, y: 350, t: 1.0 },
    ],
  },
  "خ": {
    path: "M 360 170 L 530 170 Q 460 250 440 260 Q 570 330 530 440 Q 450 520 310 470 Q 230 420 210 350",
    dots: [{ x: 460, y: 105, r: 18 }],
    points: [
      { x: 360, y: 170, t: 0 },
      { x: 530, y: 170, t: 0.20 },
      { x: 440, y: 260, t: 0.40 },
      { x: 530, y: 400, t: 0.65 },
      { x: 370, y: 480, t: 0.85 },
      { x: 210, y: 350, t: 1.0 },
    ],
  },
  "د": {
    path: "M 560 210 Q 500 310 460 350 Q 430 380 320 380",
    dots: [],
    points: [
      { x: 560, y: 210, t: 0 },
      { x: 490, y: 320, t: 0.35 },
      { x: 430, y: 380, t: 0.70 },
      { x: 320, y: 380, t: 1.0 },
    ],
  },
  "ذ": {
    path: "M 560 210 Q 500 310 460 350 Q 430 380 320 380",
    dots: [{ x: 550, y: 140, r: 18 }],
    points: [
      { x: 560, y: 210, t: 0 },
      { x: 490, y: 320, t: 0.35 },
      { x: 430, y: 380, t: 0.70 },
      { x: 320, y: 380, t: 1.0 },
    ],
  },
  "ر": {
    path: "M 540 270 Q 490 350 440 420 Q 380 480 270 490",
    dots: [],
    points: [
      { x: 540, y: 270, t: 0 },
      { x: 480, y: 360, t: 0.30 },
      { x: 410, y: 440, t: 0.70 },
      { x: 270, y: 490, t: 1.0 },
    ],
  },
  "ز": {
    path: "M 540 270 Q 490 350 440 420 Q 380 480 270 490",
    dots: [{ x: 540, y: 200, r: 18 }],
    points: [
      { x: 540, y: 270, t: 0 },
      { x: 480, y: 360, t: 0.30 },
      { x: 410, y: 440, t: 0.70 },
      { x: 270, y: 490, t: 1.0 },
    ],
  },
  "س": {
    path: "M 660 250 Q 640 330 600 330 Q 590 250 560 250 Q 540 330 500 330 L 500 350 Q 470 490 350 490 Q 240 490 220 360 L 220 320",
    dots: [],
    points: [
      { x: 660, y: 250, t: 0 },
      { x: 600, y: 330, t: 0.18 },
      { x: 560, y: 250, t: 0.32 },
      { x: 500, y: 340, t: 0.48 },
      { x: 400, y: 480, t: 0.75 },
      { x: 220, y: 320, t: 1.0 },
    ],
  },
  "শ": {
    path: "M 660 250 Q 640 330 600 330 Q 590 250 560 250 Q 540 330 500 330 L 500 350 Q 470 490 350 490 Q 240 490 220 360 L 220 320",
    dots: [
      { x: 580, y: 160, r: 15 },
      { x: 610, y: 200, r: 15 },
      { x: 550, y: 200, r: 15 },
    ],
    points: [
      { x: 660, y: 250, t: 0 },
      { x: 600, y: 330, t: 0.18 },
      { x: 560, y: 250, t: 0.32 },
      { x: 500, y: 340, t: 0.48 },
      { x: 400, y: 480, t: 0.75 },
      { x: 220, y: 320, t: 1.0 },
    ],
  },
  "ص": {
    path: "M 470 370 Q 530 270 630 290 Q 670 320 640 370 L 460 370 L 460 330 L 440 370 Q 420 490 330 490 Q 230 490 210 370 L 210 330",
    dots: [],
    points: [
      { x: 470, y: 370, t: 0 },
      { x: 590, y: 280, t: 0.22 },
      { x: 640, y: 360, t: 0.40 },
      { x: 450, y: 340, t: 0.55 },
      { x: 370, y: 480, t: 0.80 },
      { x: 210, y: 330, t: 1.0 },
    ],
  },
  "ض": {
    path: "M 470 370 Q 530 270 630 290 Q 670 320 640 370 L 460 370 L 460 330 L 440 370 Q 420 490 330 490 Q 230 490 210 370 L 210 330",
    dots: [{ x: 590, y: 200, r: 18 }],
    points: [
      { x: 470, y: 370, t: 0 },
      { x: 590, y: 280, t: 0.22 },
      { x: 640, y: 360, t: 0.40 },
      { x: 450, y: 340, t: 0.55 },
      { x: 370, y: 480, t: 0.80 },
      { x: 210, y: 330, t: 1.0 },
    ],
  },
  "ط": {
    path: "M 430 110 L 430 380 Q 530 290 630 310 Q 670 340 640 380 L 280 380",
    dots: [],
    points: [
      { x: 430, y: 110, t: 0 },
      { x: 430, y: 280, t: 0.30 },
      { x: 560, y: 300, t: 0.55 },
      { x: 640, y: 360, t: 0.75 },
      { x: 280, y: 380, t: 1.0 },
    ],
  },
  "ظ": {
    path: "M 430 110 L 430 380 Q 530 290 630 310 Q 670 340 640 380 L 280 380",
    dots: [{ x: 500, y: 200, r: 18 }],
    points: [
      { x: 430, y: 110, t: 0 },
      { x: 430, y: 280, t: 0.30 },
      { x: 560, y: 300, t: 0.55 },
      { x: 640, y: 360, t: 0.75 },
      { x: 280, y: 380, t: 1.0 },
    ],
  },
  "ع": {
    path: "M 390 230 Q 480 180 520 220 Q 520 270 450 280 Q 570 360 530 460 Q 450 530 310 480 Q 230 430 210 350",
    dots: [],
    points: [
      { x: 390, y: 230, t: 0 },
      { x: 500, y: 200, t: 0.22 },
      { x: 450, y: 280, t: 0.40 },
      { x: 530, y: 400, t: 0.65 },
      { x: 390, y: 500, t: 0.85 },
      { x: 210, y: 350, t: 1.0 },
    ],
  },
  "غ": {
    path: "M 390 230 Q 480 180 520 220 Q 520 270 450 280 Q 570 360 530 460 Q 450 530 310 480 Q 230 430 210 350",
    dots: [{ x: 480, y: 125, r: 18 }],
    points: [
      { x: 390, y: 230, t: 0 },
      { x: 500, y: 200, t: 0.22 },
      { x: 450, y: 280, t: 0.40 },
      { x: 530, y: 400, t: 0.65 },
      { x: 390, y: 500, t: 0.85 },
      { x: 210, y: 350, t: 1.0 },
    ],
  },
  "ف": {
    path: "M 560 270 Q 530 220 580 200 Q 630 220 600 280 L 590 370 Q 440 370 290 370 Q 250 370 230 280",
    dots: [{ x: 580, y: 135, r: 18 }],
    points: [
      { x: 560, y: 270, t: 0 },
      { x: 580, y: 200, t: 0.20 },
      { x: 590, y: 330, t: 0.40 },
      { x: 440, y: 370, t: 0.70 },
      { x: 230, y: 280, t: 1.0 },
    ],
  },
  "ق": {
    path: "M 560 250 Q 530 200 580 180 Q 630 200 600 260 L 590 310 Q 550 480 410 480 Q 270 480 250 350 L 250 300",
    dots: [
      { x: 605, y: 120, r: 16 },
      { x: 555, y: 120, r: 16 },
    ],
    points: [
      { x: 560, y: 250, t: 0 },
      { x: 580, y: 180, t: 0.18 },
      { x: 590, y: 300, t: 0.35 },
      { x: 490, y: 460, t: 0.65 },
      { x: 340, y: 470, t: 0.85 },
      { x: 250, y: 300, t: 1.0 },
    ],
  },
  "ك": {
    path: "M 590 120 L 590 350 Q 580 370 300 370 Q 260 370 250 310",
    dots: [{ x: 440, y: 270, r: 18 }],
    points: [
      { x: 590, y: 120, t: 0 },
      { x: 590, y: 260, t: 0.30 },
      { x: 550, y: 370, t: 0.55 },
      { x: 400, y: 370, t: 0.80 },
      { x: 250, y: 310, t: 1.0 },
    ],
  },
  "ل": {
    path: "M 540 100 L 540 340 Q 520 490 380 490 Q 240 490 220 360 L 220 320",
    dots: [],
    points: [
      { x: 540, y: 100, t: 0 },
      { x: 540, y: 260, t: 0.28 },
      { x: 480, y: 450, t: 0.58 },
      { x: 340, y: 480, t: 0.82 },
      { x: 220, y: 320, t: 1.0 },
    ],
  },
  "م": {
    path: "M 490 320 Q 540 260 590 320 Q 540 370 470 360 L 330 360 L 330 510",
    dots: [],
    points: [
      { x: 490, y: 320, t: 0 },
      { x: 560, y: 280, t: 0.22 },
      { x: 530, y: 360, t: 0.45 },
      { x: 330, y: 360, t: 0.70 },
      { x: 330, y: 510, t: 1.0 },
    ],
  },
  "ن": {
    path: "M 630 270 Q 610 470 450 470 Q 290 470 270 270",
    dots: [{ x: 450, y: 310, r: 18 }],
    points: [
      { x: 630, y: 270, t: 0 },
      { x: 570, y: 410, t: 0.25 },
      { x: 450, y: 470, t: 0.50 },
      { x: 330, y: 410, t: 0.75 },
      { x: 270, y: 270, t: 1.0 },
    ],
  },
  "و": {
    path: "M 490 280 Q 530 210 580 240 Q 620 280 570 320 Q 500 380 450 450 Q 400 490 300 490",
    dots: [],
    points: [
      { x: 490, y: 280, t: 0 },
      { x: 560, y: 220, t: 0.20 },
      { x: 570, y: 320, t: 0.40 },
      { x: 450, y: 440, t: 0.70 },
      { x: 300, y: 490, t: 1.0 },
    ],
  },
  "هـ": {
    path: "M 570 260 Q 490 190 410 280 Q 390 360 510 360 Q 580 340 550 280 Q 510 240 450 320 L 300 360",
    dots: [],
    points: [
      { x: 570, y: 260, t: 0 },
      { x: 430, y: 220, t: 0.25 },
      { x: 470, y: 360, t: 0.50 },
      { x: 540, y: 280, t: 0.75 },
      { x: 300, y: 360, t: 1.0 },
    ],
  },
  "ء": {
    path: "M 420 220 Q 490 170 520 230 Q 510 280 440 290 L 500 330",
    dots: [],
    points: [
      { x: 420, y: 220, t: 0 },
      { x: 500, y: 200, t: 0.33 },
      { x: 440, y: 290, t: 0.66 },
      { x: 500, y: 330, t: 1.0 },
    ],
  },
  "ي": {
    path: "M 540 210 Q 590 190 600 230 Q 590 280 500 300 Q 440 320 450 370 Q 450 480 340 480 Q 230 480 210 370 L 210 330",
    dots: [
      { x: 370, y: 520, r: 16 },
      { x: 310, y: 520, r: 16 },
    ],
    points: [
      { x: 540, y: 210, t: 0 },
      { x: 590, y: 230, t: 0.20 },
      { x: 480, y: 310, t: 0.40 },
      { x: 420, y: 470, t: 0.75 },
      { x: 210, y: 330, t: 1.0 },
    ],
  },
};

export default function InteractiveBlackboard({ onCompleteExercise: _onCompleteExercise }) {
  const { t: _t, isRTL: _isRTL, dir: _dir, lang: _lang } = useLearningLanguage();

  // Navigation Views: "tracing" (The Cartoon Meadow Game) vs "selector" (Select Letter Grid)
  const [viewMode, setViewMode] = useState("tracing");

  const [selectedLetterIndex, setSelectedLetterIndex] = useState(2); // Default 'Taa' (ت)
  const [activeMascotIndex, setActiveMascotIndex] = useState(0); // 0: Elephant, 1: Lion, 2: Mouse...

  // Progress along the path: 0.0 to 1.0
  const [progressRatio, setProgressRatio] = useState(0);
  const [hitCheckpointIndex, setHitCheckpointIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);

  // Gamification coins & stars
  const [coins, setCoins] = useState(150);
  const [completedLetterMap, setCompletedLetterMap] = useState({});

  const svgRef = useRef(null);
  const isDraggingRef = useRef(false);
  const pathLengthRef = useRef(1000);

  const currentLetter = ARABIC_ALPHABET[selectedLetterIndex] || ARABIC_ALPHABET[0];
  const currentMascot = MASCOTS[activeMascotIndex] || MASCOTS[0];
  const strokeData = ARABIC_STROKE_DATA[currentLetter.ar] || ARABIC_STROKE_DATA["ا"];
  const checkpoints = strokeData.points;

  // Initialize coins from localStorage
  useEffect(() => {
    try {
      const storedCoins = localStorage.getItem("nur_student_coins");
      if (storedCoins) setCoins(parseInt(storedCoins, 10));

      const storedMap = localStorage.getItem("nur_blackboard_stars");
      if (storedMap) setCompletedLetterMap(JSON.parse(storedMap));
    } catch {}
  }, []);

  // Compute exact path length for strokeDashoffset
  useEffect(() => {
    if (typeof document !== "undefined") {
      const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
      pathEl.setAttribute("d", strokeData.path);
      pathLengthRef.current = Math.max(100, pathEl.getTotalLength());
    }
  }, [strokeData.path]);

  // Reset tracing state when letter changes
  const resetLetterState = useCallback(() => {
    setProgressRatio(0);
    setHitCheckpointIndex(0);
    setIsCompleted(false);
    setShowCelebrationModal(false);
    isDraggingRef.current = false;
  }, []);

  useEffect(() => {
    resetLetterState();
  }, [selectedLetterIndex, resetLetterState]);

  // Audio Playback
  const playCurrentSound = useCallback(() => {
    try {
      playArabicSound(currentLetter.ar);
    } catch {}
  }, [currentLetter.ar]);

  // Trigger Victory Fanfare
  const triggerVictory = useCallback(() => {
    if (isCompleted) return;
    setIsCompleted(true);
    setProgressRatio(1.0);
    setHitCheckpointIndex(checkpoints.length - 1);
    setShowCelebrationModal(true);

    playMaShaAllahCelebration();
    fireCelebrationConfetti();
    playCurrentSound();

    // Award +5 coins
    const newCoins = coins + 5;
    setCoins(newCoins);
    try {
      localStorage.setItem("nur_student_coins", String(newCoins));
      const newMap = { ...completedLetterMap, [currentLetter.ar]: 3 };
      setCompletedLetterMap(newMap);
      localStorage.setItem("nur_blackboard_stars", JSON.stringify(newMap));
    } catch {}
  }, [checkpoints.length, coins, completedLetterMap, currentLetter.ar, isCompleted, playCurrentSound]);

  // Next Letter Handler
  const handleNextLetter = useCallback(() => {
    const nextIdx = (selectedLetterIndex + 1) % ARABIC_ALPHABET.length;
    setSelectedLetterIndex(nextIdx);
    resetLetterState();
    try {
      playArabicSound(ARABIC_ALPHABET[nextIdx].ar);
    } catch {}
  }, [resetLetterState, selectedLetterIndex]);

  // SVG Matrix coordinate converter
  const getSvgCoordinates = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const p = pt.matrixTransform(ctm.inverse());
    return { x: p.x, y: p.y };
  }, []);

  // ── 🐾 TOUCH & DRAG EVENT HANDLERS (MASCOT ADVANCES ALONG PATH) ──
  const handlePointerDown = (e) => {
    if (isCompleted) return;
    const coords = getSvgCoordinates(e);

    const activeCp = checkpoints[hitCheckpointIndex];
    const dist = Math.hypot(coords.x - activeCp.x, coords.y - activeCp.y);

    // If touching near the current mascot/checkpoint, capture drag
    if (dist < 90) {
      isDraggingRef.current = true;
    }
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current || isCompleted) return;
    const coords = getSvgCoordinates(e);

    // Check hit on the next checkpoint
    const nextIdx = hitCheckpointIndex + 1;
    if (nextIdx < checkpoints.length) {
      const nextCp = checkpoints[nextIdx];
      const dist = Math.hypot(coords.x - nextCp.x, coords.y - nextCp.y);

      // Hit radius: 65px
      if (dist < 65) {
        setHitCheckpointIndex(nextIdx);
        setProgressRatio(nextCp.t);
        playStarPopSound(nextIdx);

        if (nextIdx === checkpoints.length - 1) {
          isDraggingRef.current = false;
          triggerVictory();
        }
      }
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Position of the animated Mascot
  const activeMascotPos = checkpoints[hitCheckpointIndex] || checkpoints[0];

  return (
    <div className="relative w-full min-h-[640px] md:min-h-[720px] rounded-[36px] overflow-hidden border-4 border-sky-300 shadow-2xl select-none flex flex-col justify-between font-hind-siliguri">
      {/* ══════════════════════════════════════════════════════════
          🌞 1. GLORIOUS CARTOON MEADOW & SKY BACKGROUND
          (Matching all 5 reference images: blue sky, clouds, rolling green hills & Dutch windmills)
      ══════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#38bdf8] via-[#7dd3fc] to-[#bae6fd] pointer-events-none" />

      {/* Sunlight Flare */}
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-yellow-200/50 blur-3xl pointer-events-none" />

      {/* Floating Clouds */}
      <div className="absolute top-8 left-12 w-36 h-12 bg-white/80 rounded-full blur-[1px] shadow-sm animate-pulse pointer-events-none" />
      <div className="absolute top-16 right-24 w-48 h-14 bg-white/85 rounded-full blur-[1px] shadow-sm pointer-events-none" />
      <div className="absolute top-28 left-1/3 w-40 h-10 bg-white/70 rounded-full blur-[1px] pointer-events-none" />

      {/* Lush Green Rolling Hills */}
      <div
        className="absolute bottom-0 inset-x-0 h-44 sm:h-52 bg-gradient-to-t from-[#4d7c0f] via-[#65a30d] to-[#84cc16] rounded-t-[50%] scale-x-125 pointer-events-none shadow-inner"
        style={{ transformOrigin: "bottom center" }}
      />
      <div
        className="absolute -bottom-8 -right-16 w-[480px] h-48 bg-gradient-to-t from-[#3f6212] to-[#65a30d] rounded-t-[45%] pointer-events-none"
      />

      {/* 2 Traditional Dutch Windmills on Right Hill (Matching Reference Images 2, 3, 4, 5, 6) */}
      <div className="absolute bottom-20 right-8 sm:right-16 pointer-events-none z-10 flex items-end gap-3 scale-90 sm:scale-100">
        {/* Main Big Windmill */}
        <div className="relative flex flex-col items-center">
          {/* Rotating Blades */}
          <div className="w-20 h-20 -mb-10 relative flex items-center justify-center animate-[spin_12s_linear_infinite]">
            <div className="absolute w-1.5 h-20 bg-amber-900 border border-amber-950 rounded-full" />
            <div className="absolute w-20 h-1.5 bg-amber-900 border border-amber-950 rounded-full" />
            <div className="w-3.5 h-3.5 rounded-full bg-amber-700 border-2 border-white z-10" />
          </div>
          {/* Windmill Body */}
          <div className="w-10 h-16 bg-gradient-to-b from-[#29170e] to-[#140b07] border-2 border-[#452719] rounded-t-lg shadow-xl" />
        </div>

        {/* Small Distant Windmill */}
        <div className="relative flex flex-col items-center opacity-85 scale-75 -ml-2">
          <div className="w-16 h-16 -mb-8 relative flex items-center justify-center animate-[spin_16s_linear_infinite]">
            <div className="absolute w-1.5 h-16 bg-amber-900 rounded-full" />
            <div className="absolute w-16 h-1.5 bg-amber-900 rounded-full" />
            <div className="w-3 h-3 rounded-full bg-amber-700 z-10" />
          </div>
          <div className="w-8 h-12 bg-gradient-to-b from-[#29170e] to-[#140b07] rounded-t-md" />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          🕹️ 2. TOP CONTROLS & HEADER
          (Home, Mascot Selector, Target Badge, Reset, Next Arrow)
      ══════════════════════════════════════════════════════════ */}
      <header className="relative z-30 p-3 sm:p-5 flex items-center justify-between gap-2 max-w-6xl mx-auto w-full">
        {/* Left: Home Button (Switch to Letter Grid) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === "selector" ? "tracing" : "selector")}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-teal-500 hover:bg-teal-600 text-white border-3 border-white shadow-xl flex items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer"
            title="হরফ নির্বাচন তালিকায় যান"
          >
            {viewMode === "selector" ? (
              <ChevronRight className="w-6 h-6 stroke-[3]" />
            ) : (
              <Home className="w-6 h-6 stroke-[2.5]" />
            )}
          </button>

          {/* Grid View Shortcut */}
          <button
            onClick={() => setViewMode("selector")}
            className={`px-3 py-1.5 rounded-2xl bg-white/80 hover:bg-white text-slate-800 font-black text-xs shadow-md border border-white/60 flex items-center gap-1.5 transition active:scale-95 cursor-pointer ${
              viewMode === "selector" ? "ring-2 ring-teal-500 bg-white" : ""
            }`}
          >
            <Grid className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden sm:inline">হরফ তালিকা</span>
          </button>
        </div>

        {/* Center: Active Target Badge & Pronunciation */}
        {viewMode === "tracing" && (
          <div className="flex items-center gap-2 sm:gap-3 bg-white/90 backdrop-blur-md px-3.5 sm:px-5 py-1.5 rounded-full border-2 border-sky-400 shadow-xl">
            <span className="text-xs font-black text-slate-700 hidden sm:inline">হরফ:</span>
            <div
              className="px-3 py-0.5 rounded-full font-arabic font-black text-2xl sm:text-3xl text-white shadow-sm"
              style={{ backgroundColor: currentLetter.color }}
            >
              {currentLetter.ar}
            </div>
            <span className="text-xs sm:text-sm font-black text-slate-900">
              {currentLetter.nameBn}
            </span>
            <button
              onClick={playCurrentSound}
              className="p-1.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition active:scale-95 cursor-pointer"
              title="খাঁটি তিলাওয়াত শুনুন"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Right: Reset & Next Letter Arrow */}
        <div className="flex items-center gap-2">
          {viewMode === "tracing" && (
            <button
              onClick={resetLetterState}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-amber-400 hover:bg-amber-500 text-amber-950 border-2 border-white shadow-lg flex items-center justify-center transition active:scale-95 cursor-pointer"
              title="আবার নতুন করে খেলুন"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}

          {/* Next Letter Circle Arrow (Exact Teal Circle matching User Images) */}
          <button
            onClick={handleNextLetter}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 hover:from-teal-600 hover:to-emerald-500 text-white border-3 border-white shadow-xl flex items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer"
            title="পরবর্তী হরফে যান"
          >
            <ChevronRight className="w-7 h-7 stroke-[3]" />
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════
          VIEW 1: 📋 SELECT LETTER GRID (MATCHING IMAGE 9)
      ══════════════════════════════════════════════════════════ */}
      {viewMode === "selector" && (
        <div className="relative z-20 flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 overflow-y-auto animate-fade-in flex flex-col justify-between">
          <div className="space-y-4">
            {/* Title Bar matching "Select Letter" in Reference */}
            <div className="text-center space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                Select Letter • আরবী হরফ নির্বাচন করুন
              </h2>
              <p className="text-xs sm:text-sm text-sky-100 font-bold drop-shadow">
                যে হরফটি খেলতে ও শিখতে চাও, সেটিতে ট্যাপ করো!
              </p>
            </div>

            {/* Grid of 29 Arabic Letter Glass Cards */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 sm:gap-4 max-h-[55vh] overflow-y-auto p-2">
              {ARABIC_ALPHABET.map((item, idx) => {
                const isCurrent = idx === selectedLetterIndex;
                const stars = completedLetterMap[item.ar] || 0;

                const borderColors = [
                  "border-amber-300 hover:border-amber-400 text-amber-100",
                  "border-lime-300 hover:border-lime-400 text-lime-100",
                  "border-cyan-300 hover:border-cyan-400 text-cyan-100",
                  "border-purple-300 hover:border-purple-400 text-purple-100",
                  "border-orange-300 hover:border-orange-400 text-orange-100",
                  "border-rose-300 hover:border-rose-400 text-rose-100",
                  "border-sky-300 hover:border-sky-400 text-sky-100",
                ];
                const borderColor = borderColors[idx % borderColors.length];

                return (
                  <button
                    key={item.ar}
                    onClick={() => {
                      setSelectedLetterIndex(idx);
                      setViewMode("tracing");
                    }}
                    className={`relative p-3.5 rounded-2xl bg-white/20 hover:bg-white/35 backdrop-blur-md border-3 transition-all duration-200 transform hover:scale-105 active:scale-95 flex flex-col items-center justify-center gap-1 shadow-lg cursor-pointer ${borderColor} ${
                      isCurrent ? "ring-4 ring-white shadow-2xl scale-105 bg-white/40" : ""
                    }`}
                  >
                    <span className="font-arabic font-black text-3xl sm:text-4xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                      {item.ar}
                    </span>
                    <span className="text-[11px] sm:text-xs font-bold text-white drop-shadow">
                      {item.nameBn}
                    </span>
                    {stars > 0 && (
                      <span className="text-[10px] text-amber-300 drop-shadow">⭐⭐⭐</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 text-center">
            <button
              onClick={() => setViewMode("tracing")}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm shadow-xl active:scale-95 transition cursor-pointer"
            >
              <span>ট্রেসিং খেলায় ফিরে যাও</span>
              <span className="ml-2">➔</span>
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          VIEW 2: 🎨 CARTOON TRACING GAME STAGE
          (Left: Solid Reference Letter; Right: Hollow Tracing Path with Mascot)
          (NOTHING can spill outside because strokeDashoffset fills the path itself!)
      ══════════════════════════════════════════════════════════ */}
      {viewMode === "tracing" && (
        <div className="relative z-20 flex-1 max-w-6xl mx-auto w-full p-2 sm:p-4 flex flex-col justify-between">
          {/* Mascot Selector Strip */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap mb-2">
            <span className="text-xs font-bold text-white drop-shadow hidden sm:inline">
              সাথী প্রাণী:
            </span>
            {MASCOTS.map((m, mIdx) => (
              <button
                key={m.id}
                onClick={() => setActiveMascotIndex(mIdx)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeMascotIndex === mIdx
                    ? "bg-white text-slate-900 shadow-md font-black scale-105 ring-2 ring-amber-300"
                    : "bg-white/40 hover:bg-white/60 text-white drop-shadow"
                }`}
              >
                <span>{m.emoji}</span>
                <span className="hidden sm:inline">{m.name}</span>
                <span className="text-[11px] opacity-80">({m.itemEmoji})</span>
              </button>
            ))}
          </div>

          {/* TWO-COLUMN SPLIT STAGE (MATCHING EXACT COMPOSITION OF REFERENCE IMAGES 2, 3, 4, 5, 6) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center flex-1 my-auto">
            {/* ── LEFT COLUMN: SOLID BOLD REFERENCE LETTER (Like Red W, Yellow J, Teal A) ── */}
            <div className="md:col-span-5 flex flex-col items-center justify-center text-center p-4 rounded-3xl bg-white/20 backdrop-blur-md border-3 border-white/50 shadow-2xl">
              <div
                className="font-arabic font-black text-[140px] sm:text-[180px] md:text-[210px] leading-none drop-shadow-[0_8px_16px_rgba(0,0,0,0.45)] transition-all animate-pulse select-none"
                style={{
                  color: currentLetter.color,
                  WebkitTextStroke: "5px #ffffff",
                }}
              >
                {currentLetter.ar}
              </div>

              <div className="space-y-1 mt-2">
                <div className="text-2xl sm:text-3xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                  {currentLetter.nameBn} ({currentLetter.nameEn})
                </div>
                <div className="text-xs text-sky-100 font-bold drop-shadow">
                  মাখরাজ: {currentLetter.makhraj}
                </div>
              </div>

              <button
                onClick={playCurrentSound}
                className="mt-3 px-5 py-2.5 rounded-full bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs shadow-lg flex items-center gap-2 active:scale-95 transition cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>উচ্চারণ শোনো</span>
              </button>
            </div>

            {/* ── RIGHT COLUMN: INTERACTIVE HOLLOW TRACING STAGE WITH MASCOT ── */}
            <div className="md:col-span-7 flex flex-col items-center justify-center">
              <div
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onTouchStart={handlePointerDown}
                onTouchMove={handlePointerMove}
                onTouchEnd={handlePointerUp}
                className="relative w-full max-w-lg h-[360px] sm:h-[430px] rounded-3xl bg-white/20 backdrop-blur-md border-3 border-white/60 shadow-2xl flex items-center justify-center overflow-hidden cursor-crosshair touch-none"
              >
                {/* SVG TRACING SURFACE */}
                <svg
                  ref={svgRef}
                  viewBox="0 0 900 560"
                  preserveAspectRatio="xMidYMid meet"
                  className="w-full h-full pointer-events-none"
                >
                  {/* 1. OUTER HOLLOW TUBE CONTOUR (Pristine White Outline) */}
                  <path
                    d={strokeData.path}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="68"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.35))",
                    }}
                  />

                  {/* 2. INNER HOLLOW CHANNEL (Translucent Glass Interior) */}
                  <path
                    d={strokeData.path}
                    fill="none"
                    stroke="rgba(15, 23, 42, 0.45)"
                    strokeWidth="48"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* 3. SOLID CANDY FILL (PROGRESSIVELY FILLS INSIDE HOLLOW TUBE — 0% SPILL GUARANTEED!) */}
                  <path
                    d={strokeData.path}
                    fill="none"
                    stroke={currentLetter.color}
                    strokeWidth="48"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={pathLengthRef.current}
                    strokeDashoffset={pathLengthRef.current * (1 - progressRatio)}
                    style={{
                      transition: isDraggingRef.current ? "none" : "stroke-dashoffset 0.25s ease-out",
                      filter: `drop-shadow(0 0 8px ${currentLetter.color})`,
                    }}
                  />

                  {/* 4. DOTS (নুক্তা) for letters that possess dots */}
                  {strokeData.dots?.map((d, i) => (
                    <g key={i}>
                      <circle
                        cx={d.x}
                        cy={d.y}
                        r={d.r + 8}
                        fill="#ffffff"
                        style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.3))" }}
                      />
                      <circle
                        cx={d.x}
                        cy={d.y}
                        r={d.r}
                        fill={isCompleted ? currentLetter.color : "rgba(15, 23, 42, 0.45)"}
                        style={{ transition: "fill 0.4s ease" }}
                      />
                    </g>
                  ))}

                  {/* 5. COLLECTIBLE ITEMS PLACED ALONG CHECKPOINTS (Cheese, Meat, Balls, Stars) */}
                  {checkpoints.map((cp, idx) => {
                    const isCollected = idx <= hitCheckpointIndex;
                    const isNextToEat = idx === hitCheckpointIndex + 1;

                    return (
                      <g key={idx} transform={`translate(${cp.x}, ${cp.y})`}>
                        {!isCollected && (
                          <g className={isNextToEat ? "animate-bounce" : ""}>
                            <text
                              textAnchor="middle"
                              dominantBaseline="central"
                              fontSize="32"
                              style={{
                                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
                              }}
                            >
                              {currentMascot.itemEmoji}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {/* 6. ANIMATED MASCOT SITTING AT ACTIVE CHECKPOINT */}
                  <g transform={`translate(${activeMascotPos.x}, ${activeMascotPos.y})`}>
                    {/* Pulsing Aura */}
                    <circle r="36" fill="none" stroke="#fde047" strokeWidth="4" className="animate-ping opacity-75" />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="52"
                      style={{
                        filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.5))",
                      }}
                    >
                      {currentMascot.emoji}
                    </text>
                  </g>
                </svg>

                {/* Tracing Instruction Banner */}
                <div className="absolute bottom-2 inset-x-2 text-center pointer-events-none">
                  <span className="px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-xs font-bold text-white shadow-sm">
                    👆 {currentMascot.name}-কে আঙুল দিয়ে টেনে {currentMascot.itemName} খাওয়াও!
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Rewards & Quick Navigation */}
          <div className="flex items-center justify-between px-3 py-2 bg-white/20 backdrop-blur-md rounded-2xl border border-white/40 mt-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">🪙</span>
              <span className="text-xs font-black text-slate-800">
                মুদ্রা: {coins} কয়েন
              </span>
            </div>

            <div className="text-xs font-bold text-white drop-shadow">
              হরফ {selectedLetterIndex + 1} / {ARABIC_ALPHABET.length}
            </div>

            <button
              onClick={handleNextLetter}
              className="px-4 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs shadow-md flex items-center gap-1 active:scale-95 cursor-pointer"
            >
              <span>পরের হরফ</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          🏆 3. "মাশাআল্লাহ!" VICTORY CELEBRATION MODAL
      ══════════════════════════════════════════════════════════ */}
      {showCelebrationModal && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fade-in">
          <div className="relative max-w-sm w-full p-6 rounded-3xl bg-gradient-to-b from-white via-sky-50 to-emerald-50 border-4 border-amber-300 shadow-2xl text-center flex flex-col items-center gap-3">
            {/* Triumphant Arabic Banner */}
            <div className="px-5 py-1.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black text-sm shadow-md animate-bounce border border-white">
              مَا شَاءَ اللَّهُ! মাশাআল্লাহ!
            </div>

            {/* 3 Sequential Popping Stars */}
            <div className="flex items-center justify-center gap-2 text-amber-400 text-3xl">
              <span className="animate-bounce">⭐</span>
              <span className="animate-bounce [animation-delay:150ms]">⭐</span>
              <span className="animate-bounce [animation-delay:300ms]">⭐</span>
            </div>

            {/* Giant Arabic Letter */}
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center font-arabic font-black text-5xl text-white shadow-xl"
              style={{ backgroundColor: currentLetter.color }}
            >
              {currentLetter.ar}
            </div>

            <div className="space-y-0.5">
              <h3 className="text-xl font-black text-slate-900">
                চমৎকার! হরফটি পূর্ণ হয়েছে!
              </h3>
              <p className="text-xs text-slate-600">
                {currentMascot.name} সবকটি {currentMascot.itemName} খেয়েছে!
              </p>
            </div>

            {/* Rewards Badge */}
            <div className="flex items-center gap-4 py-2 px-4 rounded-2xl bg-amber-100 border border-amber-300">
              <div className="text-center">
                <span className="text-xs text-slate-500 font-bold">অর্জন</span>
                <div className="text-sm font-black text-amber-900">৩ স্টার ⭐</div>
              </div>
              <div className="h-8 w-px bg-amber-300" />
              <div className="text-center">
                <span className="text-xs text-slate-500 font-bold">পুরস্কার</span>
                <div className="text-sm font-black text-amber-900">+৫ 🪙 কয়েন</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-2 pt-2">
              <button
                onClick={() => {
                  setShowCelebrationModal(false);
                  handleNextLetter();
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <span>পরবর্তী হরফে যাও</span>
                <ChevronRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  setShowCelebrationModal(false);
                  resetLetterState();
                }}
                className="w-full py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs shadow-md flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>আবার খেলো</span>
              </button>

              <button
                onClick={() => {
                  setShowCelebrationModal(false);
                  setViewMode("selector");
                }}
                className="w-full py-2 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
              >
                হরফ তালিকায় ফেরো
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
