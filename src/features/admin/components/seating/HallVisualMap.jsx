import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Lock, Unlock, Search, User, ArrowLeftRight,
  ZoomIn, ZoomOut, Layers, Undo2, RotateCcw, AlertTriangle,
  Maximize2, Minimize2, Printer, Save, Tag, Trash2, X,
  UserMinus, Ban
} from "lucide-react";
import { toast } from "sonner";
import { formatExamSerial } from "./allocationEngine";
import { printBenchWiseSlips, printBenchSerialStickers, printVisualHallMap } from "./seatingPrintUtils";

const CLASS_COLORS = [
  { bg: "bg-emerald-50 text-emerald-800 border-emerald-300", dot: "bg-emerald-500" },
  { bg: "bg-blue-50 text-blue-800 border-blue-300", dot: "bg-blue-500" },
  { bg: "bg-purple-50 text-purple-800 border-purple-300", dot: "bg-purple-500" },
  { bg: "bg-amber-50 text-amber-800 border-amber-300", dot: "bg-amber-500" },
  { bg: "bg-rose-50 text-rose-800 border-rose-300", dot: "bg-rose-500" },
  { bg: "bg-indigo-50 text-indigo-800 border-indigo-300", dot: "bg-indigo-500" },
  { bg: "bg-teal-50 text-teal-800 border-teal-300", dot: "bg-teal-500" },
  { bg: "bg-orange-50 text-orange-800 border-orange-300", dot: "bg-orange-500" },
];

// Helper to normalize Bengali digits to English digits
const normalizeDigits = (str) => {
  if (!str) return "";
  const bnToEn = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
  return String(str).replace(/[০-৯]/g, (d) => bnToEn[d] || d);
};

export default function HallVisualMap({
  halls = [],
  activeHallId,
  onSelectHall,
  allocations = [],
  onUpdateAllocations,
  rules = {},
  isFullScreen: _isFullScreen = false,
  onToggleFullScreen: _onToggleFullScreen,
  onAutoGenerate,
  studentsTotal = 0,
  availableStudents = [],
  exam,
  branch,
  settings,
  onSavePlan,
  isSaving = false,
  onUpdateHalls,
}) {
  const [zoom, setZoom] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeatForSwap, setSelectedSeatForSwap] = useState(null);
  const [draggedSeat, setDraggedSeat] = useState(null);
  const [dragOverKey, setDragOverKey] = useState(null);
  const [history, setHistory] = useState([]);
  const [isCanvasFullScreen, setIsCanvasFullScreen] = useState(false);
  const [activeSearchSlot, setActiveSearchSlot] = useState(null);
  const [slotSearchRoll, setSlotSearchRoll] = useState("");

  const activeHall = halls.find(h => h.id === activeHallId) || halls[0];

  // Auto-fit zoom when entering fullscreen so all rows fit comfortably without vertical clipping
  useEffect(() => {
    if (isCanvasFullScreen) {
      const rowsCount = Math.max(1, Number(activeHall?.rows) || 1);
      if (rowsCount >= 6) setZoom(0.65);
      else if (rowsCount >= 5) setZoom(0.72);
      else if (rowsCount >= 4) setZoom(0.80);
      else if (rowsCount >= 3) setZoom(0.88);
      else setZoom(1);
    }
  }, [isCanvasFullScreen, activeHall]);

  // Click outside search slot dropdown to close it
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (activeSearchSlot && !e.target.closest(".seat-search-container")) {
        setActiveSearchSlot(null);
        setSlotSearchRoll("");
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [activeSearchSlot]);

  // Keyboard shortcut: Press Escape to exit canvas full screen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isCanvasFullScreen) {
        setIsCanvasFullScreen(false);
        setActiveSearchSlot(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCanvasFullScreen]);

  // Map class_id to distinct colors
  const classColorMap = useMemo(() => {
    const map = new Map();
    let idx = 0;
    allocations.forEach(a => {
      const cid = String(a.class_id || "none");
      if (!map.has(cid)) {
        map.set(cid, CLASS_COLORS[idx % CLASS_COLORS.length]);
        idx++;
      }
    });
    return map;
  }, [allocations]);

  // Lookup allocation by hall_id, row, bench, seat
  const allocationMap = useMemo(() => {
    const map = new Map();
    allocations.forEach(a => {
      const key = `${a.hall_id}_r${a.row}_b${a.bench}_s${a.seat}`;
      map.set(key, a);
    });
    return map;
  }, [allocations]);

  // Lookup allocation by student_id to know if and where student is currently seated
  const allocationMapByStudent = useMemo(() => {
    const map = new Map();
    allocations.forEach(a => {
      if (a.student_id) map.set(String(a.student_id), a);
    });
    return map;
  }, [allocations]);

  // Calculate sequential seat serial for active slots only (skips cancelled benches and seats)
  const getSlotSerial = (row, bench, seat) => {
    let activeCounter = 0;
    for (const h of halls) {
      const rCount = Math.max(1, Number(h.rows) || 1);
      const tCount = Math.max(1, Number(h.tables_per_row) || 1);
      const sCount = Math.max(1, Number(h.seats_per_table) || 2);
      const isCur = h.id === activeHall?.id;

      for (let r = 1; r <= rCount; r++) {
        for (let b = 1; b <= tCount; b++) {
          const bKey = `r${r}_b${b}`;
          const isBDeleted = Array.isArray(h.deleted_benches) && h.deleted_benches.includes(bKey);

          for (let s = 1; s <= sCount; s++) {
            const sKey = `r${r}_b${b}_s${s}`;
            const isSDeleted = isBDeleted || (Array.isArray(h.deleted_seats) && h.deleted_seats.includes(sKey));

            if (!isSDeleted) {
              activeCounter++;
            }

            if (isCur && r === row && b === bench && s === seat) {
              return isSDeleted ? "" : formatExamSerial(activeCounter - 1, rules);
            }
          }
        }
      }
      if (isCur) break;
    }
    return formatExamSerial(Math.max(0, activeCounter - 1), rules);
  };

  // Calculate question paper set for any slot
  const getSlotSet = (row, bench, seat) => {
    const setsList = Array.isArray(rules?.sets) && rules.sets.length > 0 ? rules.sets : ["Set A", "Set B"];
    return setsList[(row + bench + seat) % setsList.length] || "Set A";
  };

  // Handle Lock / Unlock toggle
  const toggleLock = (alloc) => {
    if (!alloc) return;
    const updated = allocations.map(a => {
      if (a.student_id === alloc.student_id) {
        const nextLocked = !a.locked;
        toast.info(nextLocked ? `Locked ${a.student_name} to Seat` : `Unlocked ${a.student_name}`);
        return { ...a, locked: nextLocked };
      }
      return a;
    });
    onUpdateAllocations(updated);
  };

  // Execute Move / Swap (shared by drag-drop and click selection)
  // NON-BLOCKING: If admin intentionally breaks rules, show notice but NEVER BLOCK!
  const executeMoveOrSwap = (sourceAlloc, targetRow, targetBench, targetSeat) => {
    if (!sourceAlloc) return;
    if (sourceAlloc.row === targetRow && sourceAlloc.bench === targetBench && sourceAlloc.seat === targetSeat) {
      setSelectedSeatForSwap(null);
      return;
    }

    const targetBenchKey = `r${targetRow}_b${targetBench}`;
    const targetSeatKey = `r${targetRow}_b${targetBench}_s${targetSeat}`;
    if (
      activeHall?.deleted_benches?.includes(targetBenchKey) ||
      activeHall?.deleted_seats?.includes(targetSeatKey)
    ) {
      toast.error("মুছে ফেলা টেবিল বা বেঞ্চে স্থানান্তর করা যাবে না!");
      setSelectedSeatForSwap(null);
      return;
    }

    const targetKey = `${activeHall.id}_r${targetRow}_b${targetBench}_s${targetSeat}`;
    const targetAlloc = allocationMap.get(targetKey);

    const targetSerial = getSlotSerial(targetRow, targetBench, targetSeat);
    const targetSet = getSlotSet(targetRow, targetBench, targetSeat);
    const sourceSerial = getSlotSerial(sourceAlloc.row, sourceAlloc.bench, sourceAlloc.seat);
    const sourceSet = getSlotSet(sourceAlloc.row, sourceAlloc.bench, sourceAlloc.seat);

    // Check if target bench has students of the same class/session (Rule Conflict Detection)
    const targetBenchOccupants = allocations.filter(
      a => a.hall_id === activeHall.id &&
           a.row === targetRow &&
           a.bench === targetBench &&
           a.student_id !== sourceAlloc.student_id &&
           (!targetAlloc || a.student_id !== targetAlloc.student_id)
    );
    const sameClassConflict = targetBenchOccupants.filter(
      a => String(a.class_id) === String(sourceAlloc.class_id)
    );

    // Save previous state to history for 1-click Undo
    setHistory(prev => [
      ...prev.slice(-29), // keep last 30 moves
      {
        allocations: JSON.parse(JSON.stringify(allocations)),
        halls: JSON.parse(JSON.stringify(halls)),
        desc: `${sourceAlloc.student_name} -> Seat ${targetSeat}`,
      }
    ]);

    // Update allocations
    const updated = allocations.map(a => {
      if (a.student_id === sourceAlloc.student_id) {
        return {
          ...a,
          row: targetRow,
          bench: targetBench,
          seat: targetSeat,
          exam_serial: targetSerial, // target seat's physical serial!
          set: a.set || targetSet,
          seat_label: `${activeHall.name} - R${targetRow} B${targetBench} S${targetSeat}`,
          previous_seat: {
            row: sourceAlloc.row,
            bench: sourceAlloc.bench,
            seat: sourceAlloc.seat,
            exam_serial: sourceAlloc.exam_serial || sourceSerial,
            set: sourceAlloc.set || sourceSet,
          },
        };
      }
      if (targetAlloc && a.student_id === targetAlloc.student_id) {
        // Swap target student into source seat
        return {
          ...a,
          row: sourceAlloc.row,
          bench: sourceAlloc.bench,
          seat: sourceAlloc.seat,
          exam_serial: sourceSerial, // source seat's physical serial!
          set: a.set || sourceSet,
          seat_label: `${activeHall.name} - R${sourceAlloc.row} B${sourceAlloc.bench} S${sourceAlloc.seat}`,
          previous_seat: {
            row: targetRow,
            bench: targetBench,
            seat: targetSeat,
            exam_serial: targetAlloc.exam_serial || targetSerial,
            set: targetAlloc.set || targetSet,
          },
        };
      }
      return a;
    });

    onUpdateAllocations(updated);
    setSelectedSeatForSwap(null);

    // Notify the user - DO NOT BLOCK!
    if (sameClassConflict.length > 0) {
      toast.warning(
        `সতর্কবার্তা (ম্যানুয়াল ওভাররাইড): একই শ্রেণি/সেশনের শিক্ষার্থী (${sourceAlloc.student_name} ও ${sameClassConflict.map(s => s.student_name).join(", ")}) একই বেঞ্চে (Bench ${targetBench}) বসানো হয়েছে।`,
        { duration: 5000 }
      );
    } else {
      toast.success(
        targetAlloc 
          ? `${sourceAlloc.student_name} ⇄ ${targetAlloc.student_name} সিট সোয়াপ করা হয়েছে!`
          : `${sourceAlloc.student_name}-কে সিট #${targetSerial}-এ স্থানান্তর করা হয়েছে!`
      );
    }
  };

  // Handle 1-click Undo
  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    if (last.allocations) onUpdateAllocations(last.allocations);
    if (last.halls && onUpdateHalls) onUpdateHalls(last.halls);
    toast.info("পূর্বের অবস্থানে ফেরত নেওয়া হয়েছে (Undo successful)!");
  };

  // Pool of unassigned students from availableStudents
  const unassignedStudents = useMemo(() => {
    const assignedIds = new Set(allocations.map(a => String(a.student_id)));
    return (availableStudents || []).filter(s => !assignedIds.has(String(s.id)));
  }, [availableStudents, allocations]);

  // Search results for slot assignment by roll number or name
  const searchResults = useMemo(() => {
    if (!slotSearchRoll.trim()) return [];
    const rawQ = slotSearchRoll.trim().toLowerCase();
    const normQ = normalizeDigits(rawQ);
    return (availableStudents || []).filter(s => {
      const rawR = String(s.roll_number || s.roll || "").toLowerCase();
      const normR = normalizeDigits(rawR);
      const n = (s.full_name_bn || s.full_name_en || s.student_name || "").toLowerCase();
      return normR.includes(normQ) || rawR.includes(rawQ) || n.includes(rawQ);
    }).slice(0, 25);
  }, [slotSearchRoll, availableStudents]);

  // 1. Remove student from seat (Delete Student Button)
  const handleRemoveStudentFromSeat = (alloc) => {
    if (!alloc) return;

    // Save previous state to history for 1-click Undo
    setHistory(prev => [
      ...prev.slice(-29),
      {
        allocations: JSON.parse(JSON.stringify(allocations)),
        halls: JSON.parse(JSON.stringify(halls)),
        desc: `${alloc.student_name} removed from seat`,
      }
    ]);

    const updated = allocations.filter(a => String(a.student_id) !== String(alloc.student_id));
    onUpdateAllocations(updated);

    if (selectedSeatForSwap && String(selectedSeatForSwap.student_id) === String(alloc.student_id)) {
      setSelectedSeatForSwap(null);
    }

    toast.success(`✅ ${alloc.student_name} (রোল: ${alloc.roll}) কে সিট থেকে অপসারণ করা হয়েছে (পুনরায় তালিকায় রয়েছে)`);
  };

  // 2. Toggle Delete Seat / Table (Delete Table Button)
  const handleToggleDeleteSeat = (rowNum, benchNum, seatNum) => {
    if (!activeHall) return;
    const seatKey = `r${rowNum}_b${benchNum}_s${seatNum}`;
    const currentDeleted = Array.isArray(activeHall.deleted_seats) ? [...activeHall.deleted_seats] : [];
    const isDeleted = currentDeleted.includes(seatKey);
    const slotSerial = getSlotSerial(rowNum, benchNum, seatNum);

    // Save previous state to history for 1-click Undo
    setHistory(prev => [
      ...prev.slice(-29),
      {
        allocations: JSON.parse(JSON.stringify(allocations)),
        halls: JSON.parse(JSON.stringify(halls)),
        desc: isDeleted ? `Restored Table #${slotSerial}` : `Deleted Table #${slotSerial}`,
      }
    ]);

    let updatedDeleted;
    if (isDeleted) {
      updatedDeleted = currentDeleted.filter(k => k !== seatKey);
      toast.success(`✅ টেবিল #${slotSerial} (Seat ${seatNum}) পুনরুদ্ধার করা হয়েছে`);
    } else {
      updatedDeleted = [...currentDeleted, seatKey];
      // Remove student in this seat if any back to available pool
      const remainingAllocs = allocations.filter(
        a => !(a.hall_id === activeHall.id && a.row === rowNum && a.bench === benchNum && a.seat === seatNum)
      );
      if (remainingAllocs.length !== allocations.length) {
        onUpdateAllocations(remainingAllocs);
      }
      toast.warning(`🚫 টেবিল #${slotSerial} (Seat ${seatNum}) মুছে ফেলা হয়েছে। এটি আর ফিলাপ হবে না এবং প্রিন্টেও খালি থাকবে।`);
    }

    const updatedHalls = halls.map(h => {
      if (h.id === activeHall.id) {
        return { ...h, deleted_seats: updatedDeleted };
      }
      return h;
    });
    if (onUpdateHalls) onUpdateHalls(updatedHalls);
  };

  // 3. Toggle Delete Bench (Delete Bench Button)
  const handleToggleDeleteBench = (rowNum, benchNum) => {
    if (!activeHall) return;
    const benchKey = `r${rowNum}_b${benchNum}`;
    const currentDeleted = Array.isArray(activeHall.deleted_benches) ? [...activeHall.deleted_benches] : [];
    const isDeleted = currentDeleted.includes(benchKey);

    // Save previous state to history for 1-click Undo
    setHistory(prev => [
      ...prev.slice(-29),
      {
        allocations: JSON.parse(JSON.stringify(allocations)),
        halls: JSON.parse(JSON.stringify(halls)),
        desc: isDeleted ? `Restored Bench ${benchNum}` : `Deleted Bench ${benchNum}`,
      }
    ]);

    let updatedDeleted;
    if (isDeleted) {
      updatedDeleted = currentDeleted.filter(k => k !== benchKey);
      toast.success(`✅ বেঞ্চ Bench ${benchNum} (Row ${rowNum}) পুনরুদ্ধার করা হয়েছে`);
    } else {
      updatedDeleted = [...currentDeleted, benchKey];
      // Remove all students seated in this bench back to available pool
      const remainingAllocs = allocations.filter(
        a => !(a.hall_id === activeHall.id && a.row === rowNum && a.bench === benchNum)
      );
      if (remainingAllocs.length !== allocations.length) {
        onUpdateAllocations(remainingAllocs);
      }
      toast.warning(`🚫 বেঞ্চ Bench ${benchNum} (Row ${rowNum}) মুছে ফেলা হয়েছে। এটি আর ফিলাপ হবে না এবং প্রিন্টেও খালি থাকবে।`);
    }

    const updatedHalls = halls.map(h => {
      if (h.id === activeHall.id) {
        return { ...h, deleted_benches: updatedDeleted };
      }
      return h;
    });
    if (onUpdateHalls) onUpdateHalls(updatedHalls);
  };

  // Assign student to slot via roll search
  const handleAssignStudentToSlot = (student, targetRow, targetBench, targetSeat) => {
    if (!student) return;

    const targetBenchKey = `r${targetRow}_b${targetBench}`;
    const targetSeatKey = `r${targetRow}_b${targetBench}_s${targetSeat}`;
    if (
      activeHall?.deleted_benches?.includes(targetBenchKey) ||
      activeHall?.deleted_seats?.includes(targetSeatKey)
    ) {
      toast.error("মুছে ফেলা টেবিল বা বেঞ্চে শিক্ষার্থী বরাদ্দ করা যাবে না!");
      return;
    }

    const targetSerial = getSlotSerial(targetRow, targetBench, targetSeat);
    const targetSet = getSlotSet(targetRow, targetBench, targetSeat);

    setHistory(prev => [
      ...prev.slice(-29),
      {
        allocations: JSON.parse(JSON.stringify(allocations)),
        halls: JSON.parse(JSON.stringify(halls)),
        desc: `${student.full_name_bn || student.student_name} -> R${targetRow}-B${targetBench}-S${targetSeat}`,
      }
    ]);

    const studentId = String(student.id || student.student_id);
    const filtered = allocations.filter(a => String(a.student_id) !== studentId);
    const cleared = filtered.filter(
      a => !(a.hall_id === activeHall.id && a.row === targetRow && a.bench === targetBench && a.seat === targetSeat)
    );

    const newAllocation = {
      student_id: student.id || student.student_id,
      exam_serial: targetSerial,
      hall_id: activeHall.id,
      hall_name: activeHall.name,
      room_number: activeHall.room_number,
      row: targetRow,
      bench: targetBench,
      seat: targetSeat,
      seat_label: `${activeHall.name} - R${targetRow} B${targetBench} S${targetSeat}`,
      set: targetSet,
      locked: false,
      student_name: student.full_name_bn || student.full_name_en || student.student_name || "Student",
      roll: student.roll_number || student.roll || "—",
      class_id: student.class_key || student.class_id,
      class_name: student.class_display_name || student.class_name || "Class",
      section_name: student.section_name,
      group_name: student.group_name,
      photo_url: student.photo_url,
    };

    onUpdateAllocations([...cleared, newAllocation]);
    setActiveSearchSlot(null);
    setSlotSearchRoll("");

    const otherBenchStudents = cleared.filter(
      a => a.hall_id === activeHall.id && a.row === targetRow && a.bench === targetBench
    );
    const sameClassConflict = otherBenchStudents.filter(
      s => String(s.class_id) === String(newAllocation.class_id)
    );

    if (sameClassConflict.length > 0) {
      toast.warning(
        `সতর্কবার্তা: একই শ্রেণির শিক্ষার্থী (${newAllocation.student_name} ও ${sameClassConflict.map(s => s.student_name).join(", ")}) একই বেঞ্চে বসানো হয়েছে।`
      );
    } else {
      toast.success(
        `🎉 ${newAllocation.student_name} (রোল: ${newAllocation.roll}) কে সিট #${targetSerial}-এ বসানো হয়েছে!`
      );
    }
  };

  // Handle clicking a seat for swap or move
  const handleSeatClick = (row, bench, seat) => {
    const benchKey = `r${row}_b${bench}`;
    const seatKey = `r${row}_b${bench}_s${seat}`;
    const isBenchDeleted = Array.isArray(activeHall?.deleted_benches) && activeHall.deleted_benches.includes(benchKey);
    const isSeatDeleted = isBenchDeleted || (Array.isArray(activeHall?.deleted_seats) && activeHall.deleted_seats.includes(seatKey));

    if (isSeatDeleted || isBenchDeleted) {
      toast.error("মুছে ফেলা টেবিল বা বেঞ্চে কোনো কাজ করা যাবে না। প্রথমে পুনরুদ্ধার করুন।");
      return;
    }

    const key = `${activeHall.id}_r${row}_b${bench}_s${seat}`;
    const clickedAlloc = allocationMap.get(key);

    if (!selectedSeatForSwap) {
      if (!clickedAlloc) {
        toast.info("এই সিটটি বর্তমানে খালি। কাউকে এখানে আনতে প্রথমে তার সিটে ক্লিক করুন অথবা তাকে ড্র্যাগ করে আনুন।");
        return;
      }
      setSelectedSeatForSwap({ ...clickedAlloc, row, bench, seat });
      toast.info(`সিলেক্ট করা হয়েছে: ${clickedAlloc.student_name}। এবার যে সিটে নিতে চান সেখানে ক্লিক করুন।`);
      return;
    }

    // Execute Move or Swap
    executeMoveOrSwap(selectedSeatForSwap, row, bench, seat);
  };

  // Adjust zoom automatically to fit all rows into screen
  const handleFitToScreen = () => {
    const r = Math.max(1, Number(activeHall?.rows) || 1);
    if (r >= 6) setZoom(0.65);
    else if (r >= 5) setZoom(0.72);
    else if (r >= 4) setZoom(0.80);
    else if (r >= 3) setZoom(0.88);
    else setZoom(1);
    toast.info("স্ক্রিন সাইজ অনুযায়ী ক্যানভাস অ্যাডজাস্ট করা হয়েছে (Fit to screen)!");
  };

  if (!activeHall) {
    return <div className="text-center py-12 text-slate-400 text-sm">No hall layout configured.</div>;
  }

  const rowsCount = Math.max(1, Number(activeHall.rows) || 1);
  const tablesPerRow = Math.max(1, Number(activeHall.tables_per_row) || 1);
  const seatsPerTable = Math.max(1, Number(activeHall.seats_per_table) || 2);

  const canvasContent = (
    <div className={
      isCanvasFullScreen
        ? "fixed inset-0 z-[99999] bg-slate-100 flex flex-col p-2 sm:p-4 w-screen h-screen overflow-hidden shadow-2xl animate-in fade-in"
        : "space-y-2 flex-1 flex flex-col min-h-0"
    }>
      {/* Visual Map Top Bar */}
      <div className="bg-white border rounded-xl sm:rounded-2xl p-2 px-3 shadow-xs flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Hall Switcher & Canvas Status */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Layers className="h-3.5 w-3.5 text-[#052E2B]" /> Hall:
          </span>
          {halls.map(hall => {
            const hallCount = allocations.filter(a => a.hall_id === hall.id).length;
            const isCur = hall.id === activeHall.id;
            return (
              <button
                key={hall.id}
                onClick={() => onSelectHall(hall.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isCur
                    ? "bg-[#052E2B] text-white shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                <span>{hall.name}</span>
                <Badge className={`text-[9px] px-1.5 py-0 h-4 border-0 ${isCur ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`}>
                  {hallCount}
                </Badge>
              </button>
            );
          })}

          {isCanvasFullScreen && (
            <Badge className="bg-[#052E2B] text-[#D4AF37] border border-[#D4AF37]/40 text-[11px] font-bold px-2.5 py-1 rounded-xl shadow-xs gap-1 hidden md:flex items-center">
              <Maximize2 className="h-3 w-3" /> ক্যানভাস ফুল স্ক্রিন মোড (Esc চেপে বের হতে পারেন)
            </Badge>
          )}
        </div>

        {/* Search, Undo, Zoom & Action Buttons */}
        <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end flex-wrap">
          <Button
            size="sm"
            onClick={() => {
              printVisualHallMap({
                exam,
                branch,
                settings,
                allocations,
                halls,
                selectedHallId: activeHall?.id,
                rules,
              });
            }}
            disabled={!activeHall}
            className="h-8 text-xs rounded-xl font-bold gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs"
            title="বর্তমান হল ম্যাপটি A4 ল্যান্ডস্কেপে প্রিন্ট করুন"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>হল ম্যাপ প্রিন্ট</span>
          </Button>

          {/* Bench Serial Stickers Button (বেঞ্চের ক্রমিক নম্বর স্টিকার) */}
          <Button
            size="sm"
            onClick={() => {
              printBenchSerialStickers({
                exam,
                branch,
                settings,
                allocations,
                halls,
                selectedHallId: activeHall?.id,
              });
              toast.success("বেঞ্চের নম্বর স্টিকার প্রিন্ট প্রিভিউ ওপেন করা হয়েছে!");
            }}
            disabled={allocations.length === 0}
            className="h-8 text-xs rounded-xl font-extrabold gap-1.5 bg-[#D4AF37] hover:bg-[#bfa035] text-[#052E2B] shadow-xs"
            title="প্রতিটি কাঠের বেঞ্চে লাগানোর বেঞ্চ নম্বর স্টিকার (Bench 1, Bench 2...) প্রিন্ট করুন"
          >
            <Tag className="h-3.5 w-3.5" />
            <span>বেঞ্চ নম্বর স্টিকার</span>
          </Button>

          {/* Bench Slips Print Button (বেঞ্চে লাগানোর কাগজের স্লিপ) */}
          <Button
            size="sm"
            onClick={() => {
              printBenchWiseSlips({
                exam,
                branch,
                settings,
                allocations,
                halls,
                selectedHallId: activeHall?.id,
              });
              toast.success("বেঞ্চের কাগজের স্লিপ প্রিন্ট প্রিভিউ ওপেন করা হয়েছে!");
            }}
            disabled={allocations.length === 0}
            className="h-8 text-xs rounded-xl font-bold gap-1.5 bg-[#052E2B] hover:bg-[#031d1b] text-white shadow-xs border border-emerald-800"
            title="এই হলের কাঠের বেঞ্চে লাগানোর শিক্ষার্থীদের বিস্তারিত সিট স্লিপ প্রিন্ট করুন"
          >
            <Printer className="h-3.5 w-3.5 text-[#D4AF37]" />
            <span>বেঞ্চের স্লিপ প্রিন্ট</span>
          </Button>

          {/* Quick Save Plan in Fullscreen */}
          {isCanvasFullScreen && onSavePlan && (
            <Button
              size="sm"
              onClick={onSavePlan}
              disabled={isSaving || allocations.length === 0}
              className="h-8 text-xs rounded-xl font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              title="বর্তমান সিট প্ল্যান ডাটাবেসে সেভ করুন"
            >
              <Save className={`h-3.5 w-3.5 ${isSaving ? 'animate-spin' : ''}`} />
              <span>{isSaving ? "Saving..." : "সেভ করুন"}</span>
            </Button>
          )}

          {/* Prominent Canvas Full Screen Toggle Button (Marked button from screenshot!) */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsCanvasFullScreen(prev => !prev)}
            className={`h-8 text-xs rounded-xl font-bold gap-1.5 transition-all shadow-xs ${
              isCanvasFullScreen 
                ? "bg-rose-600 hover:bg-rose-700 text-white border-rose-600 shadow-md" 
                : "bg-white text-[#052E2B] border-emerald-700 hover:bg-emerald-50"
            }`}
            title={isCanvasFullScreen ? "ছোট স্ক্রিনে ফিরুন (Esc)" : "শুধুমাত্র ছাত্র ও বেঞ্চের অংশ ফুল স্ক্রিন করুন"}
          >
            {isCanvasFullScreen ? (
              <>
                <Minimize2 className="h-3.5 w-3.5" />
                <span>✕ ছোট স্ক্রিন (Esc)</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-3.5 w-3.5 text-[#052E2B]" />
                <span>⛶ ফুল স্ক্রিন</span>
              </>
            )}
          </Button>

          {/* 1-Click Undo Button */}
          <Button
            size="sm"
            variant="outline"
            disabled={history.length === 0}
            onClick={handleUndo}
            className={`h-8 text-xs rounded-xl font-bold gap-1 transition-all ${
              history.length > 0 
                ? "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 shadow-xs" 
                : "border-slate-200 text-slate-400"
            }`}
            title="পূর্বাবস্থায় ফেরত নিন"
          >
            <Undo2 className="h-3.5 w-3.5" />
            <span>Undo {history.length > 0 && `(${history.length})`}</span>
          </Button>

          {/* Search Input */}
          <div className="relative w-36 sm:w-56">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search Student, Roll, Serial..."
              className="h-8 pl-8 text-xs rounded-xl"
            />
          </div>

          {/* Fit to Screen Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleFitToScreen}
            className="h-8 text-xs rounded-xl font-bold gap-1 bg-white hover:bg-slate-50 border-slate-300 text-slate-700 shadow-xs"
            title="সবগুলো রো স্ক্রিনে ফিট করুন (Fit All Rows to Screen)"
          >
            <Maximize2 className="h-3.5 w-3.5 text-emerald-700" />
            <span>ফিট স্ক্রিন</span>
          </Button>

          {/* Zoom In / Out */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-slate-600"
              onClick={() => setZoom(z => Math.max(0.65, z - 0.1))}
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <button
              type="button"
              onClick={() => setZoom(1)}
              className="text-[10px] font-bold text-slate-600 px-1 hover:text-[#052E2B] cursor-pointer"
              title="Reset Zoom (100%)"
            >
              {Math.round(zoom * 100)}%
            </button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-slate-600"
              onClick={() => setZoom(z => Math.min(1.4, z + 0.1))}
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Unallocated Students Notice Banner */}
      {allocations.length === 0 && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl sm:rounded-2xl p-2 px-3 flex flex-wrap items-center justify-between gap-2 text-emerald-950 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold">
            <AlertTriangle className="h-4 w-4 text-emerald-700 flex-shrink-0" />
            <span>
              {studentsTotal > 0 ? `${studentsTotal} জন শিক্ষার্থী প্রস্তুত আছে কিন্তু সিট বরাদ্দ করা হয়নি:` : "শিক্ষার্থী লোড হচ্ছে..."}
            </span>
          </div>
          {onAutoGenerate && (
            <Button
              size="sm"
              onClick={onAutoGenerate}
              className="bg-[#052E2B] hover:bg-[#031d1b] text-white font-extrabold text-xs h-7 px-3 rounded-xl shadow-xs"
            >
              ⚡ এখনই সিট বণ্টন করুন (Generate Seat Plan)
            </Button>
          )}
        </div>
      )}

      {/* Selected for Swap Indicator Banner */}
      {selectedSeatForSwap && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs text-amber-900 shadow-xs animate-pulse">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4 text-amber-600" />
            <span>
              স্থানান্তর / সোয়াপ করা হচ্ছে: <strong>{selectedSeatForSwap.student_name}</strong> (Roll: {selectedSeatForSwap.roll}, Serial: #{selectedSeatForSwap.exam_serial})। লক্ষ্য সিটে ক্লিক বা ড্র্যাগ করুন।
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs text-amber-800 hover:bg-amber-100 rounded-lg font-bold"
            onClick={() => setSelectedSeatForSwap(null)}
          >
            বাতিল (Cancel)
          </Button>
        </div>
      )}

      {/* Visual Hall Layout Container */}
      <div className="border border-slate-200 bg-slate-50/50 rounded-xl sm:rounded-2xl p-2 sm:p-4 overflow-auto shadow-inner flex-1 min-h-0 w-full">
        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: "top center", transition: "transform 0.15s ease-out" }}
          className="space-y-3 min-w-max mx-auto pb-32"
        >
          {/* BLACKBOARD / FRONT OF HALL BANNER */}
          <div className="max-w-xl mx-auto bg-gradient-to-r from-emerald-950 via-[#052E2B] to-emerald-950 text-white rounded-xl py-1.5 px-4 text-center shadow-sm border-b-2 border-[#D4AF37]">
            <div className="text-[10px] font-mono tracking-widest text-[#D4AF37] uppercase">FRONT OF EXAMINATION HALL</div>
            <div className="text-xs font-black tracking-wider flex items-center justify-center gap-1.5 mt-0.5">
              <span>⬛ BLACKBOARD / TEACHER&apos;S PODIUM ⬛</span>
            </div>
            <div className="text-[9.5px] text-emerald-200">
              {exam?.title ? <span className="text-[#D4AF37] font-bold mr-1.5">{exam.title} •</span> : null}
              {activeHall.name} — Room: {activeHall.room_number} (Capacity: {rowsCount * tablesPerRow * seatsPerTable})
            </div>
          </div>

          {/* GRID OF ROWS */}
          <div className="space-y-4 pt-2">
            {Array.from({ length: rowsCount }, (_, rIdx) => {
              const rowNum = rIdx + 1;
              return (
                <div key={`row-${rowNum}`} className="flex items-center gap-3">
                  {/* Row Indicator Badge */}
                  <div className="w-14 flex-shrink-0 text-center">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-1 rounded-lg bg-[#052E2B] text-white shadow-sm block">
                      Row {rowNum}
                    </span>
                  </div>

                  {/* Benches in this row */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {Array.from({ length: tablesPerRow }, (_, bIdx) => {
                      const benchNum = bIdx + 1;
                      const benchKey = `r${rowNum}_b${benchNum}`;
                      const isBenchDeleted = Array.isArray(activeHall?.deleted_benches) && activeHall.deleted_benches.includes(benchKey);
                      const isBenchSelected = selectedSeatForSwap && selectedSeatForSwap.row === rowNum && selectedSeatForSwap.bench === benchNum;

                      // Check if bench has same class conflict
                      const benchStudents = allocations.filter(
                        a => a.hall_id === activeHall.id && a.row === rowNum && a.bench === benchNum
                      );
                      const hasSameClassConflict = benchStudents.length > 1 &&
                        benchStudents.some((s1, i) => benchStudents.slice(i + 1).some(s2 => String(s1.class_id) === String(s2.class_id)));

                      if (isBenchDeleted) {
                        return (
                          <div
                            key={`b-${benchNum}`}
                            className="rounded-2xl border-2 border-dashed border-rose-300 bg-rose-50/20 p-2.5 shadow-2xs transition-all duration-200"
                          >
                            {/* Deleted Bench Header */}
                            <div className="flex items-center justify-between text-[10px] font-bold border-b border-rose-200 pb-1.5 mb-2 px-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-rose-700 line-through">Bench {benchNum}</span>
                                <Badge className="bg-rose-100 text-rose-800 border-rose-300 text-[8px] px-1.5 py-0 h-4 font-bold">
                                  মুছে ফেলা বেঞ্চ
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] text-rose-400 font-mono">R{rowNum}-B{benchNum}</span>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleToggleDeleteBench(rowNum, benchNum)}
                                  className="h-5 px-1.5 text-[9px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-md shadow-2xs gap-1"
                                  title="এই বেঞ্চটি সক্রিয় / পুনরুদ্ধার করুন"
                                >
                                  <RotateCcw className="h-2.5 w-2.5" />
                                  <span>পুনরুদ্ধার</span>
                                </Button>
                              </div>
                            </div>

                            {/* Seats placeholders inside deleted bench */}
                            <div className="flex items-center gap-2">
                              {Array.from({ length: seatsPerTable }, (_, sIdx) => {
                                const seatNum = sIdx + 1;
                                return (
                                  <div
                                    key={`s-${seatNum}`}
                                    className="w-38 sm:w-40 h-38 sm:h-40 rounded-xl border-2 border-dashed border-rose-200 bg-white/70 p-2 flex flex-col justify-between items-center text-center select-none"
                                  >
                                    <div className="flex items-center justify-end w-full">
                                      <Badge variant="secondary" className="text-[8px] px-1 py-0 h-3.5 bg-rose-100 text-rose-700 font-bold">
                                        বাতিলকৃত বেঞ্চ
                                      </Badge>
                                    </div>
                                    <div className="my-auto py-1">
                                      <div className="text-[11px] font-extrabold text-rose-600">
                                        বেঞ্চ বাতিলকৃত
                                      </div>
                                      <div className="text-[9px] text-slate-400 mt-0.5">
                                        প্রিন্ট ও সিটে খালি থাকবে
                                      </div>
                                    </div>
                                    <div className="w-full pt-1 border-t border-rose-100 text-[9px] font-bold text-slate-400">
                                      Seat {seatNum}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={`b-${benchNum}`}
                          className={`rounded-2xl border-2 p-2.5 bg-white shadow-sm transition-all duration-200 ${
                            isBenchSelected
                              ? "border-amber-500 ring-2 ring-amber-200 shadow-md"
                              : hasSameClassConflict
                              ? "border-amber-400 bg-amber-50/20"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {/* Bench Header with Bench Delete Button */}
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 border-b pb-1.5 mb-2 px-1">
                            <div className="flex items-center gap-1.5">
                              <span>Bench {benchNum}</span>
                              {hasSameClassConflict && (
                                <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[8px] px-1 py-0 h-3.5 gap-0.5">
                                  <AlertTriangle className="h-2.5 w-2.5" /> একই শ্রেণি
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] text-slate-400 font-normal">R{rowNum}-B{benchNum}</span>
                              {/* 3. Bench Delete Button at Bench Header */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleDeleteBench(rowNum, benchNum);
                                }}
                                className="p-1 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors shadow-2xs flex items-center gap-0.5 text-[8.5px] font-bold"
                                title="৩. সম্পূর্ণ বেঞ্চ ডিলিট করুন (Bench Delete)"
                              >
                                <Trash2 className="h-2.5 w-2.5" />
                                <span>বেঞ্চ ডিলিট</span>
                              </button>
                            </div>
                          </div>

                          {/* Seats on this bench */}
                          <div className="flex items-center gap-2">
                            {Array.from({ length: seatsPerTable }, (_, sIdx) => {
                              const seatNum = sIdx + 1;
                              const seatKey = `r${rowNum}_b${benchNum}_s${seatNum}`;
                              const isSeatDeleted = Array.isArray(activeHall?.deleted_seats) && activeHall.deleted_seats.includes(seatKey);
                              const slotKey = `${activeHall.id}_r${rowNum}_b${benchNum}_s${seatNum}`;
                              const alloc = allocationMap.get(slotKey);
                              const slotSerial = getSlotSerial(rowNum, benchNum, seatNum);

                              if (isSeatDeleted) {
                                return (
                                  <div
                                    key={`s-${seatNum}`}
                                    className="w-38 sm:w-40 h-38 sm:h-40 rounded-xl border-2 border-dashed border-rose-300 bg-rose-50/20 p-2 flex flex-col justify-between select-none shadow-2xs"
                                  >
                                    <div className="flex items-center justify-end gap-1">
                                      <Badge className="bg-rose-100 text-rose-800 border-rose-300 text-[8px] px-1 py-0 h-3.5 font-bold">
                                        মুছে ফেলা টেবিল
                                      </Badge>
                                    </div>
                                    <div className="my-auto text-center px-1">
                                      <div className="text-[11px] font-extrabold text-rose-600 mb-0.5">
                                        টেবিল বাতিলকৃত
                                      </div>
                                      <div className="text-[9px] text-slate-500 leading-tight">
                                        এই টেবিলটি খালি থাকবে
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-1 border-t border-rose-200">
                                      <span className="text-[9px] font-bold text-slate-400">Seat {seatNum}</span>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleToggleDeleteSeat(rowNum, benchNum, seatNum)}
                                        className="h-5 px-1.5 text-[9px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-md gap-0.5 shadow-2xs"
                                        title="এই টেবিলটি সক্রিয় / পুনরুদ্ধার করুন"
                                      >
                                        <RotateCcw className="h-2.5 w-2.5" />
                                        <span>পুনরুদ্ধার</span>
                                      </Button>
                                    </div>
                                  </div>
                                );
                              }

                              const isSelected = selectedSeatForSwap &&
                                selectedSeatForSwap.row === rowNum &&
                                selectedSeatForSwap.bench === benchNum &&
                                selectedSeatForSwap.seat === seatNum;

                              const isHighlighted = searchQuery.trim() && alloc && (
                                alloc.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                String(alloc.roll || "").includes(searchQuery) ||
                                String(alloc.exam_serial || "").toLowerCase().includes(searchQuery.toLowerCase())
                              );

                              const classColor = alloc ? classColorMap.get(String(alloc.class_id || "none")) || CLASS_COLORS[0] : null;
                              const isDragOver = dragOverKey === slotKey;

                              return (
                                <div
                                  key={`s-${seatNum}`}
                                  draggable={!!alloc && !alloc.locked}
                                  onDragStart={(e) => {
                                    if (!alloc || alloc.locked) return;
                                    setDraggedSeat(alloc);
                                    e.dataTransfer.setData("text/plain", JSON.stringify(alloc));
                                    e.dataTransfer.effectAllowed = "move";
                                  }}
                                  onDragEnd={() => {
                                    setDraggedSeat(null);
                                    setDragOverKey(null);
                                  }}
                                  onDragOver={(e) => {
                                    e.preventDefault();
                                    e.dataTransfer.dropEffect = "move";
                                    if (dragOverKey !== slotKey) setDragOverKey(slotKey);
                                  }}
                                  onDragLeave={() => {
                                    if (dragOverKey === slotKey) setDragOverKey(null);
                                  }}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    setDragOverKey(null);
                                    let src = draggedSeat;
                                    if (!src) {
                                      try {
                                        src = JSON.parse(e.dataTransfer.getData("text/plain"));
                                      } catch {
                                        return;
                                      }
                                    }
                                    if (src) {
                                      if (src.isUnassignedPool || !src.row) {
                                        handleAssignStudentToSlot(src, rowNum, benchNum, seatNum);
                                      } else {
                                        executeMoveOrSwap(src, rowNum, benchNum, seatNum);
                                      }
                                      setDraggedSeat(null);
                                    }
                                  }}
                                  onClick={() => handleSeatClick(rowNum, benchNum, seatNum)}
                                  className={`w-38 sm:w-40 h-38 sm:h-40 rounded-xl border-2 p-2 flex flex-col justify-between cursor-pointer transition-all duration-200 relative select-none ${
                                    isDragOver
                                      ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-300 shadow-lg scale-[1.02]"
                                      : isSelected
                                      ? "border-amber-500 bg-amber-50/50 shadow-md ring-2 ring-amber-300"
                                      : isHighlighted
                                      ? "border-[#D4AF37] bg-yellow-50 shadow-lg ring-2 ring-yellow-400 animate-bounce"
                                      : alloc
                                      ? "border-slate-200 bg-white hover:border-[#052E2B] hover:shadow-md"
                                      : "border-dashed border-slate-300 bg-slate-50/70 hover:bg-slate-100 hover:border-slate-400"
                                  }`}
                                >
                                  {alloc ? (
                                    <>
                                      {/* Seat Top: Serial, Set Badges & 3 Delete Buttons */}
                                      <div className="flex items-center justify-between gap-1">
                                        <Badge className="bg-[#052E2B] text-white text-[9.5px] px-1.5 py-0 h-4 border-0 font-mono font-bold shadow-xs flex-shrink-0">
                                          #{slotSerial}
                                        </Badge>
                                        <div className="flex items-center gap-0.5">
                                          {alloc.set && (
                                            <Badge className="bg-sky-100 text-sky-800 border-sky-300 text-[8.5px] px-1 py-0 h-4 font-extrabold">
                                              {alloc.set}
                                            </Badge>
                                          )}
                                          <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); toggleLock(alloc); }}
                                            className={`p-0.5 rounded transition-colors ${
                                              alloc.locked ? "text-amber-600 bg-amber-50" : "text-slate-300 hover:text-slate-600"
                                            }`}
                                            title={alloc.locked ? "Seat is LOCKED. Click to unlock." : "Click to lock seat in place."}
                                          >
                                            {alloc.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                                          </button>

                                          {/* 1. Delete Student Button */}
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleRemoveStudentFromSeat(alloc);
                                            }}
                                            className="p-1 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors shadow-2xs group flex items-center justify-center"
                                            title="১. ছাত্র ডিলিট করুন (সিট থেকে শিক্ষার্থী সরান)"
                                          >
                                            <UserMinus className="h-3 w-3 group-hover:scale-110 transition-transform" />
                                          </button>

                                          {/* 2. Delete Table Button */}
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleToggleDeleteSeat(rowNum, benchNum, seatNum);
                                            }}
                                            className="p-1 text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md transition-colors shadow-2xs group flex items-center justify-center"
                                            title="২. টেবিল ডিলিট করুন (এই টেবিল/সিট স্লটটি খালি ও বাতিল রাখুন)"
                                          >
                                            <Ban className="h-3 w-3 group-hover:scale-110 transition-transform" />
                                          </button>

                                          {/* 3. Delete Bench Button */}
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleToggleDeleteBench(rowNum, benchNum);
                                            }}
                                            className="p-1 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors shadow-2xs group flex items-center justify-center"
                                            title="৩. বেঞ্চ ডিলিট করুন (সম্পূর্ণ বেঞ্চটি খালি ও বাতিল রাখুন)"
                                          >
                                            <Trash2 className="h-3 w-3 group-hover:scale-110 transition-transform" />
                                          </button>
                                        </div>
                                      </div>

                                      {/* Student Info Center */}
                                      <div className="flex items-center gap-2 my-1">
                                        <Avatar className="h-7 w-7 rounded-lg border flex-shrink-0">
                                          <AvatarImage src={alloc.photo_url} />
                                          <AvatarFallback className="bg-slate-100 text-[9px] font-bold text-slate-600">
                                            {alloc.student_name ? alloc.student_name.slice(0, 2) : <User className="h-3.5 w-3.5" />}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                          <div className="text-[11px] font-bold text-slate-800 line-clamp-1 leading-tight">
                                            {alloc.student_name || "Student"}
                                          </div>
                                          <div className="text-[9px] font-semibold text-slate-500">
                                            Roll: <strong className="text-slate-800">{alloc.roll || "—"}</strong>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Seat Bottom: Class Tag & Quick Revert or Seat Num */}
                                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                                        <span className={`text-[8.5px] px-1.5 py-0.5 rounded font-extrabold border truncate max-w-[70px] ${classColor?.bg}`}>
                                          {alloc.class_name || "Class"}
                                        </span>
                                        {alloc.previous_seat ? (
                                          <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); handleRevertStudent(alloc); }}
                                            className="text-[8.5px] bg-amber-100 hover:bg-amber-200 text-amber-900 px-1 py-0.5 rounded font-bold flex items-center gap-0.5 shadow-2xs"
                                            title={`পূর্বে ছিল #${alloc.previous_seat.exam_serial}। এক ক্লিকে পূর্বের সিটে ফেরত নিন।`}
                                          >
                                            <RotateCcw className="h-2.5 w-2.5" /> আগের সিট
                                          </button>
                                        ) : (
                                          <span className="text-[9px] font-bold text-slate-400">
                                            Seat {seatNum}
                                          </span>
                                        )}
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      {/* Empty Seat Header: shows physical serial & 2 Delete Buttons (Table & Bench) */}
                                      <div className="flex items-center justify-between gap-1">
                                        <Badge variant="outline" className="border-slate-300 text-slate-500 bg-white text-[9.5px] px-1.5 py-0 h-4 font-mono font-bold shadow-xs">
                                          #{slotSerial}
                                        </Badge>
                                        <div className="flex items-center gap-0.5">
                                          <Badge variant="secondary" className="text-[8px] px-1 py-0 h-3.5 bg-slate-200/70 text-slate-500 font-semibold">
                                            খালি
                                          </Badge>

                                          {/* 2. Delete Table Button */}
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleToggleDeleteSeat(rowNum, benchNum, seatNum);
                                            }}
                                            className="p-1 text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md transition-colors shadow-2xs group flex items-center justify-center"
                                            title="২. টেবিল ডিলিট করুন (এই টেবিল/সিট স্লটটি খালি ও বাতিল রাখুন)"
                                          >
                                            <Ban className="h-3 w-3 group-hover:scale-110 transition-transform" />
                                          </button>

                                          {/* 3. Delete Bench Button */}
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleToggleDeleteBench(rowNum, benchNum);
                                            }}
                                            className="p-1 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors shadow-2xs group flex items-center justify-center"
                                            title="৩. বেঞ্চ ডিলিট করুন (সম্পূর্ণ বেঞ্চটি খালি ও বাতিল রাখুন)"
                                          >
                                            <Trash2 className="h-3 w-3 group-hover:scale-110 transition-transform" />
                                          </button>
                                        </div>
                                      </div>

                                      {/* Empty Center: Direct Roll Search Bar */}
                                      <div className="seat-search-container my-auto w-full px-0.5" onClick={(e) => e.stopPropagation()}>
                                        <div className="text-[10px] font-bold text-slate-600 text-center mb-1">
                                          Seat {seatNum}
                                        </div>

                                        <div className="relative">
                                          <div className="relative flex items-center">
                                            <Search className="h-3 w-3 absolute left-1.5 text-emerald-600 pointer-events-none" />
                                            <Input
                                              value={activeSearchSlot === slotKey ? slotSearchRoll : ""}
                                              onFocus={() => {
                                                setActiveSearchSlot(slotKey);
                                                setSlotSearchRoll("");
                                              }}
                                              onChange={(e) => {
                                                setActiveSearchSlot(slotKey);
                                                setSlotSearchRoll(e.target.value);
                                              }}
                                              onKeyDown={(e) => {
                                                if (e.key === "Escape") {
                                                  setActiveSearchSlot(null);
                                                  setSlotSearchRoll("");
                                                }
                                              }}
                                              placeholder="রোল দিয়ে খুঁজুন..."
                                              className="h-6.5 pl-5 pr-5 text-[9.5px] font-semibold bg-white border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-md shadow-2xs w-full placeholder:text-slate-400 placeholder:text-[9px]"
                                            />
                                            {activeSearchSlot === slotKey && slotSearchRoll && (
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setSlotSearchRoll("");
                                                }}
                                                className="absolute right-1 text-slate-400 hover:text-slate-700 p-0.5"
                                                title="ক্লিয়ার করুন"
                                              >
                                                <X className="h-2.5 w-2.5" />
                                              </button>
                                            )}
                                          </div>

                                          {/* Search results dropdown popover */}
                                          {activeSearchSlot === slotKey && (
                                            <div
                                              className="absolute right-0 top-full mt-1 z-50 bg-white border border-slate-300 rounded-lg shadow-xl max-h-48 overflow-y-auto p-1 divide-y divide-slate-100 text-left min-w-[210px] -left-10"
                                              onMouseDown={(e) => e.stopPropagation()}
                                            >
                                              <div className="text-[8.5px] font-bold text-slate-400 px-1 py-0.5 uppercase tracking-wider flex items-center justify-between">
                                                <span>{slotSearchRoll.trim() ? "খোঁজার ফলাফল" : "বাকি শিক্ষার্থী তালিকা"}</span>
                                                <button
                                                  type="button"
                                                  onClick={() => setActiveSearchSlot(null)}
                                                  className="text-slate-400 hover:text-slate-700 font-bold px-1"
                                                >
                                                  ✕
                                                </button>
                                              </div>
                                              {(slotSearchRoll.trim() ? searchResults : unassignedStudents).length > 0 ? (
                                                (slotSearchRoll.trim() ? searchResults : unassignedStudents).map(stu => {
                                                  const alreadyAllocated = allocationMapByStudent.get(String(stu.id || stu.student_id));
                                                  return (
                                                    <div
                                                      key={stu.id || stu.student_id}
                                                      draggable={true}
                                                      onDragStart={(e) => {
                                                        const dragPayload = {
                                                          id: stu.id || stu.student_id,
                                                          student_id: stu.id || stu.student_id,
                                                          student_name: stu.full_name_bn || stu.full_name_en || stu.student_name,
                                                          full_name_bn: stu.full_name_bn,
                                                          full_name_en: stu.full_name_en,
                                                          roll: stu.roll_number || stu.roll,
                                                          roll_number: stu.roll_number || stu.roll,
                                                          class_id: stu.class_key || stu.class_id,
                                                          class_name: stu.class_display_name || stu.class_name,
                                                          photo_url: stu.photo_url,
                                                          isUnassignedPool: true,
                                                        };
                                                        setDraggedSeat(dragPayload);
                                                        e.dataTransfer.setData("text/plain", JSON.stringify(dragPayload));
                                                        e.dataTransfer.effectAllowed = "move";
                                                      }}
                                                      onDragEnd={() => setDraggedSeat(null)}
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAssignStudentToSlot(stu, rowNum, benchNum, seatNum);
                                                      }}
                                                      className="p-1.5 hover:bg-emerald-50 rounded-md cursor-pointer transition-colors flex items-center justify-between gap-1.5 select-none active:scale-98"
                                                      title="ক্লিক করে এই সিটে বসান অথবা টেনে অন্য খালি সিটে ড্র্যাগ করুন"
                                                    >
                                                      <div className="min-w-0 flex-1">
                                                        <div className="text-[10px] font-bold text-slate-800 truncate">
                                                          {stu.full_name_bn || stu.full_name_en || stu.student_name}
                                                        </div>
                                                        <div className="text-[8px] text-slate-500 truncate flex items-center gap-1">
                                                          <span>{stu.class_display_name || stu.class_name}</span>
                                                          {alreadyAllocated && (
                                                            <span className="text-amber-600 font-semibold">(বর্তমানে #{alreadyAllocated.exam_serial})</span>
                                                          )}
                                                        </div>
                                                      </div>
                                                      <Badge className="bg-[#052E2B] text-white text-[9px] px-1.5 py-0 h-4 font-mono font-extrabold flex-shrink-0">
                                                        রোল: {stu.roll_number || stu.roll}
                                                      </Badge>
                                                    </div>
                                                  );
                                                })
                                              ) : (
                                                <div className="p-2 text-center text-[9.5px] text-slate-400">
                                                  {slotSearchRoll.trim() ? "কোনো শিক্ষার্থী পাওয়া যায়নি" : "কোনো অবণ্টনকৃত শিক্ষার্থী নেই"}
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>

                                        <div className="text-[8px] text-slate-400 text-center mt-1">বা ড্র্যাগ করুন</div>
                                      </div>

                                      {/* Empty Bottom */}
                                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/80 text-[8.5px] text-slate-400">
                                        <span className="italic">খালি আসন</span>
                                        <span className="font-bold text-slate-500">Seat {seatNum}</span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  if (isCanvasFullScreen && typeof document !== "undefined") {
    return createPortal(canvasContent, document.body);
  }

  return canvasContent;
}
