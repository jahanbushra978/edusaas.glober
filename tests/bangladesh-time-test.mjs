import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatBangladeshDate,
  formatBangladeshEraDate,
  formatBangladeshHijriDate,
  formatBangladeshClock,
  getInstituteSunTimes,
  parseBanglaTimeToMinutes,
  calculateRealtimePrayerState,
} from "../src/lib/quran/bangladesh-time.js";

describe("Bangladesh Time, Calendar & Prayer Accuracy Test Suite", () => {
  it("formats Bangladesh Date dynamically without static fallbacks", () => {
    const testDate = new Date("2026-11-15T12:23:00+06:00");
    const formatted = formatBangladeshDate(testDate);
    assert.match(formatted, /রবিবার/);
    assert.match(formatted, /১৫ নভেম্বর/);
    assert.match(formatted, /২০২৬/);
  });

  it("formats Bengali Era (বঙ্গাব্দ) accurately for Bangla Academy calendar", () => {
    // Nov 9, 2026 was 24 Kartik
    assert.equal(formatBangladeshEraDate(new Date("2026-11-09T12:00:00+06:00")), "২৪ কার্তিক ১৪৩৩ বঙ্গাব্দ");
    // Nov 15, 2026 (Today) is 30 Kartik
    assert.equal(formatBangladeshEraDate(new Date("2026-11-15T12:00:00+06:00")), "৩০ কার্তিক ১৪৩৩ বঙ্গাব্দ");
    // Nov 16, 2026 is 1 Agrahayan
    assert.equal(formatBangladeshEraDate(new Date("2026-11-16T12:00:00+06:00")), "১ অগ্রহায়ণ ১৪৩৩ বঙ্গাব্দ");
  });

  it("formats Hijri date dynamically", () => {
    const testDate = new Date("2026-11-15T12:23:00+06:00");
    const hijri = formatBangladeshHijriDate(testDate);
    assert.match(hijri, /১৪৪৮ হিজরি/);
  });

  it("formats Bangladesh 12-hour clock in Bengali numerals", () => {
    const testDate = new Date("2026-11-15T12:23:00+06:00");
    const clock = formatBangladeshClock(testDate);
    assert.match(clock, /১২:২৩ PM/);
  });

  it("calculates accurate sunrise and sunset for Gazipur/Dhaka coordinates", () => {
    const testDate = new Date("2026-11-15T12:23:00+06:00");
    const sunTimes = getInstituteSunTimes(testDate);
    assert.ok(sunTimes.sunrise instanceof Date);
    assert.ok(sunTimes.sunset instanceof Date);
    
    const sunriseStr = formatBangladeshClock(sunTimes.sunrise);
    const sunsetStr = formatBangladeshClock(sunTimes.sunset);
    assert.match(sunriseStr, /০৬:[০-৯]{2}\s*AM/); // e.g. ০৬:১৩ AM
    assert.match(sunsetStr, /০৫:[০-৯]{2}\s*PM/);  // e.g. ০৫:১২ PM
  });

  it("parses Bengali time strings into minutes from midnight", () => {
    assert.equal(parseBanglaTimeToMinutes("০৫:০২ AM"), 302);
    assert.equal(parseBanglaTimeToMinutes("১১:৪৬ AM"), 706);
    assert.equal(parseBanglaTimeToMinutes("০১:১৫ PM"), 795);
    assert.equal(parseBanglaTimeToMinutes("০৩:৪৪ PM"), 944);
    assert.equal(parseBanglaTimeToMinutes("০৪:১৫ PM"), 975);
    assert.equal(parseBanglaTimeToMinutes("০৫:১৫ PM"), 1035);
    assert.equal(parseBanglaTimeToMinutes("০৭:৩০ PM"), 1170);
  });

  it("At 12:23 PM (User Screenshot 2 condition): Active Waqt is Dhuhr, next Jama'at Dhuhr 01:15 PM, 52 mins left", () => {
    const dateAt1223 = new Date("2026-11-15T12:23:00+06:00");
    const result = calculateRealtimePrayerState(dateAt1223);

    assert.equal(result.activePrayer.id, "dhuhr");
    assert.equal(result.activePrayer.name, "যোহর");
    assert.equal(result.nextJamaatDisplay, "যোহর জামা'আত: ০১:১৫ PM");
    assert.equal(result.countdownDisplay, "৫২ মিনিট বাকি");
    assert.equal(result.remainingMinutes, 52);
  });

  it("Timetable Grid Invariant: Strictly only 1 card has isCurrent active, never all cards", () => {
    const dateAt1223 = new Date("2026-11-15T12:23:00+06:00");
    const result = calculateRealtimePrayerState(dateAt1223);

    const timetable = [
      { id: "fajr", name: "ফজর", arabic: "الفجر", start: "০৫:০২ AM", jamaat: "০৫:২৫ AM", end: "০৬:১৮ AM" },
      { id: "sunrise", name: "সূর্যোদয়", arabic: "الشروق", start: "০৬:১৯ AM", jamaat: "—", end: "০৬:৩৫ AM", isForbidden: true },
      { id: "dhuhr", name: "যোহর", arabic: "الظهر", start: "১১:৪৬ AM", jamaat: "০১:১৫ PM", end: "০৩:৪৩ PM" },
      { id: "asr", name: "আসর", arabic: "العصر", start: "০৩:৪৪ PM", jamaat: "০৪:১৫ PM", end: "০৫:০৮ PM" },
      { id: "maghrib", name: "মাগরিব", arabic: "المغرب", start: "০৫:০৯ PM", jamaat: "০৫:১৫ PM", end: "০৬:২৩ PM" },
      { id: "isha", name: "এশা", arabic: "العشاء", start: "০৬:২৪ PM", jamaat: "০৭:৩০ PM", end: "০৪:৫৯ AM" },
    ];

    const activeCards = timetable.filter(
      (p) => !p.isForbidden && Boolean(result.activePrayer && (p.id === result.activePrayer.id || p.name === result.activePrayer.name))
    );

    // Exactly 1 card must be active!
    assert.equal(activeCards.length, 1);
    assert.equal(activeCards[0].id, "dhuhr");
  });
});
