import { CalculationMethod, Coordinates, PrayerTimes } from "adhan";

export const BANGLADESH_TIME_ZONE = "Asia/Dhaka";

const INSTITUTE_COORDINATES = new Coordinates(23.9922, 90.4125);
const DATE_PARTS_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: BANGLADESH_TIME_ZONE,
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

function getBangladeshCalendarDate(date) {
  const parts = Object.fromEntries(
    DATE_PARTS_FORMATTER.formatToParts(date).map(({ type, value }) => [type, value]),
  );

  return new Date(Number(parts.year), Number(parts.month) - 1, Number(parts.day));
}

export function toBnDigits(num) {
  return String(num).replace(/[0-9]/g, (digit) => "০১২৩৪৫৬৭৮৯"[digit]);
}

export function formatBangladeshDate(date) {
  return new Intl.DateTimeFormat("bn-BD", {
    timeZone: BANGLADESH_TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatBangladeshHijriDate(date, includeWeekday = false) {
  const parts = new Intl.DateTimeFormat("bn-BD-u-ca-islamic-umalqura", {
    timeZone: BANGLADESH_TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  if (includeWeekday) {
    return `${values.weekday}, ${values.day} ${values.month} ${values.year} হিজরি`;
  }
  return `${values.day} ${values.month} ${values.year} হিজরি`;
}

/**
 * Format date to official Bengali Era (বঙ্গাব্দ) according to Bangladesh Bangla Academy revised calendar.
 * @param {Date} date 
 * @returns {string} e.g. "৩০ কার্তিক ১৪৩৩ বঙ্গাব্দ"
 */
export function formatBangladeshEraDate(date) {
  const d = new Date(date.toLocaleString("en-US", { timeZone: BANGLADESH_TIME_ZONE }));
  const year = d.getFullYear();
  const month = d.getMonth() + 1; // 1 to 12
  const day = d.getDate();
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);

  const banglaMonths = [
    "বৈশাখ", "জ্যৈষ্ঠ", "আষাঢ়", "শ্রাবণ", "ভাদ্র", "আশ্বিন",
    "কার্তিক", "অগ্রহায়ণ", "পৌষ", "মাঘ", "ফাল্গুন", "চৈত্র",
  ];

  let bYear = year - 593;
  let bMonthIndex = 0;
  let bDay = 1;

  if (month === 4 && day >= 14) {
    bMonthIndex = 0; bDay = day - 13;
  } else if (month === 5 && day <= 14) {
    bMonthIndex = 0; bDay = day + 17;
  } else if (month === 5 && day >= 15) {
    bMonthIndex = 1; bDay = day - 14;
  } else if (month === 6 && day <= 14) {
    bMonthIndex = 1; bDay = day + 17;
  } else if (month === 6 && day >= 15) {
    bMonthIndex = 2; bDay = day - 14;
  } else if (month === 7 && day <= 15) {
    bMonthIndex = 2; bDay = day + 16;
  } else if (month === 7 && day >= 16) {
    bMonthIndex = 3; bDay = day - 15;
  } else if (month === 8 && day <= 15) {
    bMonthIndex = 3; bDay = day + 16;
  } else if (month === 8 && day >= 16) {
    bMonthIndex = 4; bDay = day - 15;
  } else if (month === 9 && day <= 15) {
    bMonthIndex = 4; bDay = day + 16;
  } else if (month === 9 && day >= 16) {
    bMonthIndex = 5; bDay = day - 15;
  } else if (month === 10 && day <= 16) {
    bMonthIndex = 5; bDay = day + 15;
  } else if (month === 10 && day >= 17) {
    bMonthIndex = 6; bDay = day - 16;
  } else if (month === 11 && day <= 15) {
    bMonthIndex = 6; bDay = day + 15;
  } else if (month === 11 && day >= 16) {
    bMonthIndex = 7; bDay = day - 15;
  } else if (month === 12 && day <= 15) {
    bMonthIndex = 7; bDay = day + 15;
  } else if (month === 12 && day >= 16) {
    bMonthIndex = 8; bDay = day - 15;
  } else if (month === 1 && day <= 14) {
    bYear = year - 594;
    bMonthIndex = 8; bDay = day + 16;
  } else if (month === 1 && day >= 15) {
    bYear = year - 594;
    bMonthIndex = 9; bDay = day - 14;
  } else if (month === 2 && day <= 13) {
    bYear = year - 594;
    bMonthIndex = 9; bDay = day + 17;
  } else if (month === 2 && day >= 14) {
    bYear = year - 594;
    bMonthIndex = 10; bDay = day - 13;
  } else if (month === 3 && day <= 14) {
    bYear = year - 594;
    const falgunLen = isLeap ? 30 : 29;
    bMonthIndex = 10; bDay = day + (falgunLen - 13);
  } else if (month === 3 && day >= 15) {
    bYear = year - 594;
    bMonthIndex = 11; bDay = day - 14;
  } else if (month === 4 && day <= 13) {
    bYear = year - 594;
    bMonthIndex = 11; bDay = day + 17;
  }

  return `${toBnDigits(bDay)} ${banglaMonths[bMonthIndex]} ${toBnDigits(bYear)} বঙ্গাব্দ`;
}

export function formatBangladeshClock(date) {
  return new Intl.DateTimeFormat("bn-BD", {
    timeZone: BANGLADESH_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function getInstituteSunTimes(date) {
  const prayerTimes = new PrayerTimes(
    INSTITUTE_COORDINATES,
    getBangladeshCalendarDate(date),
    CalculationMethod.Karachi(),
  );

  return {
    sunrise: prayerTimes.sunrise,
    sunset: prayerTimes.sunset,
  };
}

export function parseBanglaTimeToMinutes(timeStr) {
  if (!timeStr || timeStr === "—" || timeStr === "-") return null;
  const engStr = timeStr.replace(/[০-৯]/g, (d) => "০১২৩৪৫৬৭৮৯".indexOf(d));
  const match = engStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = (match[3] || "").toUpperCase();
  if (meridiem === "PM" && hours < 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

export function formatRemainingTimeBengali(minutesRemaining) {
  if (minutesRemaining <= 0) return "এখনই জামা'আত";
  const hours = Math.floor(minutesRemaining / 60);
  const mins = minutesRemaining % 60;
  if (hours > 0 && mins > 0) {
    return `${toBnDigits(hours)} ঘণ্টা ${toBnDigits(mins)} মিনিট বাকি`;
  }
  if (hours > 0) {
    return `${toBnDigits(hours)} ঘণ্টা বাকি`;
  }
  return `${toBnDigits(mins)} মিনিট বাকি`;
}

export function calculateRealtimePrayerState(currentTime, customSchedule = []) {
  const d = new Date(currentTime.toLocaleString("en-US", { timeZone: BANGLADESH_TIME_ZONE }));
  const currentMinutes = d.getHours() * 60 + d.getMinutes();
  const isFriday = d.getDay() === 5;

  const DEFAULT_TIMETABLE = [
    { id: "fajr", name: "ফজর", arabic: "الفجر", start: "০৫:০২ AM", jamaat: "০৫:২৫ AM", end: "০৬:১৮ AM" },
    { id: "sunrise", name: "সূর্যোদয়", arabic: "الشروق", start: "০৬:১৯ AM", jamaat: "—", end: "০৬:৩৫ AM", isForbidden: true },
    { id: "dhuhr", name: isFriday ? "পবিত্র জুমু'আ" : "যোহর", arabic: isFriday ? "الجمعة" : "الظهر", start: "১১:৪৬ AM", jamaat: isFriday ? "০১:৩০ PM" : "০১:১৫ PM", end: "০৩:৪৩ PM" },
    { id: "asr", name: "আসর", arabic: "العصر", start: "০৩:৪৪ PM", jamaat: "০৪:১৫ PM", end: "০৫:০৮ PM" },
    { id: "maghrib", name: "মাগরিব", arabic: "المغرب", start: "০৫:০৯ PM", jamaat: "০৫:১৫ PM", end: "০৬:২৩ PM" },
    { id: "isha", name: "এশা", arabic: "العشاء", start: "০৬:২৪ PM", jamaat: "০৭:৩০ PM", end: "০৪:৫৯ AM" },
  ];

  const prayers = (customSchedule && customSchedule.length >= 5 ? customSchedule : DEFAULT_TIMETABLE).map((p, idx) => {
    let id = p.id;
    if (!id) {
      if (p.name?.includes("ফজর")) id = "fajr";
      else if (p.name?.includes("সূর্যোদয়")) id = "sunrise";
      else if (p.name?.includes("যোহর") || p.name?.includes("জুমা")) id = "dhuhr";
      else if (p.name?.includes("আসর")) id = "asr";
      else if (p.name?.includes("মাগরিব")) id = "maghrib";
      else if (p.name?.includes("এশা")) id = "isha";
      else id = `prayer-${idx}`;
    }
    return {
      ...p,
      id,
      startMinutes: parseBanglaTimeToMinutes(p.start),
      jamaatMinutes: parseBanglaTimeToMinutes(p.jamaat),
      endMinutes: parseBanglaTimeToMinutes(p.end),
    };
  });

  let activePrayer = null;

  for (const p of prayers) {
    if (p.isForbidden) continue;
    if (p.startMinutes != null && p.endMinutes != null) {
      if (p.startMinutes <= p.endMinutes) {
        if (currentMinutes >= p.startMinutes && currentMinutes <= p.endMinutes) {
          activePrayer = p;
          break;
        }
      } else {
        // Spans midnight (e.g. Isha: 18:24 to 04:59)
        if (currentMinutes >= p.startMinutes || currentMinutes <= p.endMinutes) {
          activePrayer = p;
          break;
        }
      }
    }
  }

  // If between sunrise and Dhuhr (Chasht / Ishraq period)
  if (!activePrayer) {
    const sunrise = prayers.find((p) => p.id === "sunrise");
    const dhuhr = prayers.find((p) => p.id === "dhuhr");
    if (sunrise && currentMinutes >= sunrise.startMinutes && currentMinutes < (dhuhr?.startMinutes ?? 706)) {
      activePrayer = {
        id: "ishraq",
        name: "ইশরাক ও চাশত",
        arabic: "الإشراق والضحى",
        start: sunrise.end || "০৬:৩৫ AM",
        jamaat: "—",
        end: dhuhr?.start || "১১:৪৫ AM",
        isNafl: true,
      };
    } else {
      activePrayer = prayers.find((p) => p.id === "dhuhr") || prayers[0];
    }
  }

  // Find next upcoming Jama'at
  const jamaatPrayers = prayers.filter((p) => !p.isForbidden && p.jamaatMinutes != null);
  let nextJamaatPrayer = null;
  let remainingMinutes = 0;

  for (const p of jamaatPrayers) {
    if (p.jamaatMinutes > currentMinutes) {
      nextJamaatPrayer = p;
      remainingMinutes = p.jamaatMinutes - currentMinutes;
      break;
    }
  }

  // If all today's jamaats have passed, next is tomorrow's Fajr
  if (!nextJamaatPrayer) {
    const fajr = jamaatPrayers.find((p) => p.id === "fajr") || jamaatPrayers[0];
    nextJamaatPrayer = fajr;
    remainingMinutes = (1440 - currentMinutes) + (fajr?.jamaatMinutes || 325);
  }

  const isCurrentJamaatPending = activePrayer && activePrayer.jamaatMinutes && activePrayer.jamaatMinutes >= currentMinutes;
  const nextJamaatDisplay = isCurrentJamaatPending
    ? `${activePrayer.name} জামা'আত: ${activePrayer.jamaat}`
    : `পরবর্তী জামা'আত: ${nextJamaatPrayer.name} ${nextJamaatPrayer.jamaat}`;

  const countdownDisplay = formatRemainingTimeBengali(remainingMinutes);

  return {
    activePrayer,
    nextJamaatDisplay,
    countdownDisplay,
    remainingMinutes,
  };
}
