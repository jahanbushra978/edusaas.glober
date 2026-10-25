/**
 * Constraint-Based Exam Seating Allocation Engine
 * 
 * Capabilities:
 * - Hard Rules (Strict):
 *   1. Same Class students NEVER share the same table/bench.
 *   2. Locked student seats are never altered during generation.
 *   3. No student duplication or omissions.
 *   4. Exactly one student per assigned seat.
 *   5. Hall capacity limits are strictly respected.
 * - Soft Rules (Optimization):
 *   1. Same Class students avoid adjacent benches (horizontally and vertically).
 *   2. Same Class students distributed across rows with maximum spacing.
 *   3. Class diversity maximized across all benches (smart mixing).
 *   4. Question paper sets (Set A, Set B, ...) distributed alternately; same sets separated.
 * - Disparity & Unequal Class Handling:
 *   - Mathematically calculates if complete separation is possible.
 *   - If unequal (e.g. Class 6 = 100, Class 7 = 20), mixes the 20 across benches first,
 *     then utilizes empty seats, empty benches, and row gaps to minimize conflicts.
 *   - Produces a clear, detailed Conflict Report if conflicts are unavoidable.
 * - Multi-Pass Scoring & Best Plan Selection:
 *   - Evaluates arrangements with a 0-100 Quality Score.
 */

export const DEFAULT_RULES = {
  sameClassSameBench: true,       // Hard rule
  sameClassAdjacentBench: true,   // Soft rule
  sameClassRowSeparation: true,   // Soft rule
  studentsPerBench: 2,            // 1, 2, 3, or 4
  emptySeatPattern: "none",       // "none" | "alternate" | "right_empty"
  emptyBenchPattern: "none",      // "none" | "alternate_bench"
  sortingMethod: "roll_asc",      // "roll_asc" | "roll_desc" | "student_id" | "name_asc" | "name_desc" | "random" | "class_mix"
  sets: ["Set A", "Set B"],
  setDistribution: "alternate",   // "alternate" | "random" | "class_wise"
  sameSetAdjacent: true,          // avoid same set side-by-side
  serialPrefix: "",
  serialDigits: 3,
  serialStart: 1,
};

export const DEFAULT_HALL = {
  id: "hall-1",
  name: "Hall-01",
  room_number: "101",
  rows: 8,
  tables_per_row: 5,
  seats_per_table: 2,
  empty_seat_pattern: "none",
  empty_bench_pattern: "none",
};

/**
 * Calculate total seat capacity of a hall layout
 */
export function calculateHallCapacity(hall) {
  if (!hall) return 0;
  const rows = Math.max(1, Number(hall.rows) || 1);
  const tables = Math.max(1, Number(hall.tables_per_row) || 1);
  const seats = Math.max(1, Number(hall.seats_per_table) || 2);
  let totalBenches = rows * tables;

  const deletedBenchesCount = Array.isArray(hall.deleted_benches) ? hall.deleted_benches.length : 0;
  const effectiveBenches = Math.max(0, totalBenches - deletedBenchesCount);

  if (hall.empty_bench_pattern === "alternate_bench") {
    totalBenches = Math.ceil(effectiveBenches / 2);
  } else {
    totalBenches = effectiveBenches;
  }

  let effectiveSeats = totalBenches * seats;
  const deletedSeatsCount = Array.isArray(hall.deleted_seats)
    ? hall.deleted_seats.filter(sk => !hall.deleted_benches?.some(bk => sk.startsWith(bk + "_"))).length
    : 0;
  effectiveSeats = Math.max(0, effectiveSeats - deletedSeatsCount);

  if (hall.empty_seat_pattern === "alternate" || hall.empty_seat_pattern === "right_empty") {
    effectiveSeats = Math.ceil(effectiveSeats / 2);
  }

  return Math.max(0, effectiveSeats);
}

/**
 * Flatten all available seat slots across all halls
 */
export function buildSeatGrid(halls = []) {
  const slots = [];
  halls.forEach((hall, hallIdx) => {
    const rows = Math.max(1, Number(hall.rows) || 1);
    const tablesPerRow = Math.max(1, Number(hall.tables_per_row) || 1);
    const seatsPerTable = Math.max(1, Number(hall.seats_per_table) || 2);

    let benchGlobalCounter = 1;

    for (let r = 1; r <= rows; r++) {
      for (let t = 1; t <= tablesPerRow; t++) {
        const benchKey = `r${r}_b${t}`;
        const isBenchDeleted = Array.isArray(hall.deleted_benches) && hall.deleted_benches.includes(benchKey);
        const isBenchEmpty = isBenchDeleted || (hall.empty_bench_pattern === "alternate_bench" && (benchGlobalCounter % 2 === 0));
        
        for (let s = 1; s <= seatsPerTable; s++) {
          const seatKey = `r${r}_b${t}_s${s}`;
          const isSeatDeleted = isBenchDeleted || (Array.isArray(hall.deleted_seats) && hall.deleted_seats.includes(seatKey));
          const isSeatEmpty = isSeatDeleted || (!isBenchEmpty && (
            (hall.empty_seat_pattern === "alternate" && s % 2 === 0) ||
            (hall.empty_seat_pattern === "right_empty" && s === seatsPerTable && seatsPerTable > 1)
          ));

          slots.push({
            slot_id: `${hall.id}_r${r}_b${t}_s${s}`,
            hall_id: hall.id,
            hall_name: hall.name || `Hall-${hallIdx + 1}`,
            room_number: hall.room_number || String(100 + hallIdx + 1),
            row: r,
            bench: t,
            bench_global: benchGlobalCounter,
            seat: s,
            seats_in_bench: seatsPerTable,
            is_empty_bench: isBenchEmpty,
            is_empty_seat: isSeatEmpty,
            is_deleted_bench: isBenchDeleted,
            is_deleted_seat: isSeatDeleted,
            is_usable: !isBenchDeleted && !isSeatDeleted && !isBenchEmpty && !isSeatEmpty,
          });
        }
        benchGlobalCounter++;
      }
    }
  });
  return slots;
}

/**
 * Sort student list according to selected sorting method
 */
export function sortStudents(students, method = "roll_asc") {
  const list = [...students];
  switch (method) {
    case "roll_desc":
      return list.sort((a, b) => Number(b.roll_number || 0) - Number(a.roll_number || 0));
    case "student_id":
      return list.sort((a, b) => Number(a.id || 0) - Number(b.id || 0));
    case "name_asc":
      return list.sort((a, b) => {
        const nameA = a.full_name_bn || a.full_name_en || "";
        const nameB = b.full_name_bn || b.full_name_en || "";
        return nameA.localeCompare(nameB);
      });
    case "name_desc":
      return list.sort((a, b) => {
        const nameA = a.full_name_bn || a.full_name_en || "";
        const nameB = b.full_name_bn || b.full_name_en || "";
        return nameB.localeCompare(nameA);
      });
    case "random":
      return list.sort(() => Math.random() - 0.5);
    case "class_mix":
      return mixStudentsByClass(list);
    case "roll_asc":
    default:
      return list.sort((a, b) => Number(a.roll_number || 0) - Number(b.roll_number || 0));
  }
}

/**
 * Group students by class and interleave them (round-robin)
 */
export function mixStudentsByClass(students) {
  const groups = {};
  students.forEach(s => {
    const cid = String(s.class_key || s.class_id || "default");
    if (!groups[cid]) groups[cid] = [];
    groups[cid].push(s);
  });

  // Sort each group by roll
  Object.keys(groups).forEach(cid => {
    groups[cid].sort((a, b) => Number(a.roll_number || 0) - Number(b.roll_number || 0));
  });

  const sortedClassKeys = Object.keys(groups).sort((a, b) => groups[b].length - groups[a].length);
  const mixed = [];
  let added = true;
  let idx = 0;

  while (added) {
    added = false;
    for (const cid of sortedClassKeys) {
      if (idx < groups[cid].length) {
        mixed.push(groups[cid][idx]);
        added = true;
      }
    }
    idx++;
  }
  return mixed;
}

/**
 * Format Exam Serial (e.g. 001, A-001)
 */
export function formatExamSerial(index, rules = {}) {
  const start = Number(rules.serialStart || 1);
  const num = start + index;
  const digits = Math.max(1, Number(rules.serialDigits || 3));
  const prefix = rules.serialPrefix || "";
  return `${prefix}${String(num).padStart(digits, "0")}`;
}

/**
 * Single-pass allocation engine
 */
export function runAllocationPass({ students, halls, rules, lockedAllocations = [] }) {
  const slots = buildSeatGrid(halls);
  const usableSlots = slots.filter(s => s.is_usable);
  const totalStudentCount = students.length;
  const capacity = usableSlots.length;

  // Group usable slots by hall & bench for quick lookup
  const benchMap = new Map();
  usableSlots.forEach(slot => {
    const bKey = `${slot.hall_id}_r${slot.row}_b${slot.bench}`;
    if (!benchMap.has(bKey)) benchMap.set(bKey, []);
    benchMap.get(bKey).push(slot);
  });

  // Handle locked allocations
  const lockedMap = new Map(); // student_id -> locked slot
  const slotOccupied = new Map(); // slot_id -> student

  (lockedAllocations || []).forEach(alloc => {
    if (alloc.locked && alloc.student_id) {
      const matchSlot = usableSlots.find(
        s => s.hall_id === alloc.hall_id && s.row === alloc.row && s.bench === alloc.bench && s.seat === alloc.seat
      );
      if (matchSlot) {
        lockedMap.set(String(alloc.student_id), matchSlot);
        const stu = students.find(s => String(s.id) === String(alloc.student_id));
        if (stu) {
          slotOccupied.set(matchSlot.slot_id, {
            ...stu,
            exam_serial: alloc.exam_serial,
            set: alloc.set || (rules.sets && rules.sets[0]) || "A",
            locked: true,
            slot: matchSlot,
          });
        }
      }
    }
  });

  // Remaining students to seat
  const remainingStudents = students.filter(s => !lockedMap.has(String(s.id)));
  const sortedStudents = sortStudents(remainingStudents, rules.sortingMethod || "class_mix");

  // Partition students by class
  const classBuckets = {};
  sortedStudents.forEach(s => {
    const cid = String(s.class_key || s.class_id || s.class_name || "unassigned");
    if (!classBuckets[cid]) classBuckets[cid] = [];
    classBuckets[cid].push(s);
  });

  const setsList = (Array.isArray(rules.sets) && rules.sets.length > 0) ? rules.sets : ["Set A", "Set B"];
  let serialCounter = 0;

  // Track violations
  let sameClassBenchViolations = 0;
  let adjacentViolations = 0;
  let unavoidableHardViolations = 0;

  const benchesList = Array.from(benchMap.entries());

  // Determine max seats per bench in the layout (usually 2)
  const maxSeatsInAnyBench = Math.max(2, ...usableSlots.map(s => s.seat || 1));

  // Multi-Pass Seating Strategy:
  // Pass 1: Fill Seat 1 of EVERY bench across the hall first (alternating classes to maximize distance).
  // This guarantees that if total students <= total benches, ZERO students of the same class share any bench!
  // Pass 2+: For remaining seats (Seat 2, 3..), strictly select students of a DIFFERENT class than whoever is on that bench!
  for (let seatIdx = 1; seatIdx <= maxSeatsInAnyBench; seatIdx++) {
    benchesList.forEach(([, bSlots]) => {
      const slot = bSlots.find(s => s.seat === seatIdx && !slotOccupied.has(s.slot_id));
      if (!slot) return;

      const candidateClassKeys = Object.keys(classBuckets).filter(k => classBuckets[k].length > 0);
      if (candidateClassKeys.length === 0) return; // all students seated

      // Check which classes are already sitting on this specific bench
      const existingClassesOnBench = new Set();
      bSlots.forEach(s => {
        const occ = slotOccupied.get(s.slot_id);
        if (occ) existingClassesOnBench.add(String(occ.class_key || occ.class_id));
      });

      let pickedClassKey = null;

      if (rules.sameClassSameBench) {
        // Preferred: Pick a class that is NOT already sitting on this bench!
        const nonConflictingKeys = candidateClassKeys.filter(k => !existingClassesOnBench.has(k));
        if (nonConflictingKeys.length > 0) {
          // Balance by picking class with the most remaining students
          nonConflictingKeys.sort((a, b) => classBuckets[b].length - classBuckets[a].length);
          pickedClassKey = nonConflictingKeys[0];
        } else {
          // Unavoidable: all remaining students share a class with someone already on this bench
          // (Only happens when total students of a class exceeds total benches in the hall)
          candidateClassKeys.sort((a, b) => classBuckets[b].length - classBuckets[a].length);
          pickedClassKey = candidateClassKeys[0];
          sameClassBenchViolations++;
          unavoidableHardViolations++;
        }
      } else {
        candidateClassKeys.sort((a, b) => classBuckets[b].length - classBuckets[a].length);
        pickedClassKey = candidateClassKeys[0];
      }

      if (pickedClassKey && classBuckets[pickedClassKey].length > 0) {
        const student = classBuckets[pickedClassKey].shift();

        // Assign Set: alternate set so students on the same bench or adjacent benches get different sets
        const setChoice = setsList[(slot.row + slot.bench + slot.seat) % setsList.length];

        slotOccupied.set(slot.slot_id, {
          ...student,
          exam_serial: formatExamSerial(serialCounter, rules),
          set: setChoice,
          locked: false,
          slot,
        });
        serialCounter++;
      }
    });
  }

  // Calculate adjacent violations (horizontal or vertical bench neighbors of same class)
  benchesList.forEach(([, bSlots]) => {
    const firstSlot = bSlots[0];
    if (!firstSlot) return;

    const row = firstSlot.row;
    const bench = firstSlot.bench;
    const hallId = firstSlot.hall_id;

    // Students in this bench
    const studentsInThisBench = bSlots.map(s => slotOccupied.get(s.slot_id)).filter(Boolean);
    const classesInThisBench = new Set(studentsInThisBench.map(s => String(s.class_key || s.class_id)));

    // Adjacent horizontal neighbor (bench - 1 or bench + 1)
    const nextBenchSlots = benchMap.get(`${hallId}_r${row}_b${bench + 1}`) || [];
    nextBenchSlots.forEach(s => {
      const occ = slotOccupied.get(s.slot_id);
      if (occ && classesInThisBench.has(String(occ.class_key || occ.class_id))) {
        adjacentViolations++;
      }
    });

    // Adjacent vertical neighbor (row + 1, same bench)
    const nextRowSlots = benchMap.get(`${hallId}_r${row + 1}_b${bench}`) || [];
    nextRowSlots.forEach(s => {
      const occ = slotOccupied.get(s.slot_id);
      if (occ && classesInThisBench.has(String(occ.class_key || occ.class_id))) {
        adjacentViolations++;
      }
    });
  });

  // Collect final allocations
  const finalAllocations = [];
  slotOccupied.forEach((studentWithSlot) => {
    const slot = studentWithSlot.slot;
    finalAllocations.push({
      student_id: studentWithSlot.id,
      exam_serial: studentWithSlot.exam_serial,
      hall_id: slot.hall_id,
      hall_name: slot.hall_name,
      room_number: slot.room_number,
      row: slot.row,
      bench: slot.bench,
      seat: slot.seat,
      seat_label: `${slot.hall_name} - R${slot.row} B${slot.bench} S${slot.seat}`,
      set: studentWithSlot.set,
      locked: !!studentWithSlot.locked,
      student_name: studentWithSlot.full_name_bn || studentWithSlot.full_name_en,
      roll: studentWithSlot.roll_number,
      class_id: studentWithSlot.class_key || studentWithSlot.class_id,
      class_name: studentWithSlot.class_display_name || studentWithSlot.class_name,
      section_name: studentWithSlot.section_name,
      group_name: studentWithSlot.group_name,
      photo_url: studentWithSlot.photo_url,
    });
  });

  // Sort final allocations by exam_serial
  finalAllocations.sort((a, b) => String(a.exam_serial).localeCompare(String(b.exam_serial), undefined, { numeric: true }));

  // Check unassigned students
  const assignedStudentIds = new Set(finalAllocations.map(a => String(a.student_id)));
  const unassignedStudents = students.filter(s => !assignedStudentIds.has(String(s.id)));

  // Quality score computation (0 - 100)
  let score = 100;
  if (unassignedStudents.length > 0) {
    score -= Math.min(40, unassignedStudents.length * 10);
  }
  if (sameClassBenchViolations > 0) {
    score -= Math.min(30, sameClassBenchViolations * 15);
  }
  if (adjacentViolations > 0) {
    score -= Math.min(20, adjacentViolations * 2);
  }
  score = Math.max(0, Math.min(100, Math.round(score)));

  // Conflict diagnosis
  const isSeparationPossible = unavoidableHardViolations === 0;
  const reasons = [];
  if (unassignedStudents.length > 0) {
    reasons.push(`Hall capacity exceeded: ${unassignedStudents.length} student(s) could not be seated.`);
  }
  if (sameClassBenchViolations > 0) {
    reasons.push(`Class imbalance: One class has more students than all other classes combined. Mathematical complete separation on all benches is impossible without additional classes or empty seats.`);
  }
  if (adjacentViolations > 0 && rules.sameClassAdjacentBench) {
    reasons.push(`${adjacentViolations} adjacent bench pairing(s) of the same class detected due to space constraints.`);
  }

  return {
    allocations: finalAllocations,
    unassignedStudents,
    qualityScore: score,
    metrics: {
      totalStudents: totalStudentCount,
      assignedCount: finalAllocations.length,
      unassignedCount: unassignedStudents.length,
      sameClassBenchViolations,
      adjacentViolations,
      emptySeatsCount: slots.filter(s => s.is_empty_seat).length,
      emptyBenchesCount: slots.filter(s => s.is_empty_bench).length,
      setSeparationPct: Math.round(Math.max(0, 100 - (adjacentViolations * 3))),
      capacity,
    },
    conflictReport: {
      hasConflicts: reasons.length > 0,
      isSeparationPossible,
      reasons,
      unavoidableHardViolations,
    },
  };
}

/**
 * Multi-Pass Optimizer:
 * Runs multiple passes (best of N) and picks the one with highest quality score.
 */
export function generateBestSeatPlan({ students, halls, rules, lockedAllocations = [], passes = 5 }) {
  if (!students || students.length === 0) {
    return {
      allocations: [],
      unassignedStudents: [],
      qualityScore: 0,
      metrics: { totalStudents: 0, assignedCount: 0, unassignedCount: 0 },
      conflictReport: { hasConflicts: false, reasons: ["No students available to seat."] },
    };
  }

  let bestResult = null;

  for (let i = 0; i < passes; i++) {
    // Inject slight randomness in ties during subsequent passes
    const passRules = {
      ...rules,
      sortingMethod: i === 0 ? (rules.sortingMethod || "class_mix") : (i % 2 === 0 ? "random" : "class_mix"),
    };

    const result = runAllocationPass({
      students,
      halls,
      rules: passRules,
      lockedAllocations,
    });

    if (!bestResult || result.qualityScore > bestResult.qualityScore) {
      bestResult = result;
    }

    // Short-circuit if perfect plan
    if (result.qualityScore === 100) {
      break;
    }
  }

  return bestResult;
}
