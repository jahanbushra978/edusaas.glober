import { db } from "../src/lib/db";

const DEFAULT_SAMPLE_STUDENTS = [
  {
    name: "মুহাম্মদ আব্দুল্লাহ",
    guardianName: "হাজী রফিকুল ইসলাম",
    guardianPhone: "01711223344",
    batch: "Morning",
    progressLevel: "Qaida",
    rollNo: "০১",
    photoUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80",
    currentLesson: "কায়দা পৃষ্ঠা ১৪ (হরকতের মাশ্‌ক)",
  },
  {
    name: "আয়েশা সিদ্দীকা",
    guardianName: "মাও: মাহবুবুর রহমান",
    guardianPhone: "01812345678",
    batch: "Morning",
    progressLevel: "Ampara",
    rollNo: "০২",
    photoUrl: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=200&auto=format&fit=crop&q=80",
    currentLesson: "সূরা নাবা (১ম রুকু মুখস্থ)",
  },
  {
    name: "আব্দুর রহমান",
    guardianName: "মোঃ কামাল হোসেন",
    guardianPhone: "01911987654",
    batch: "Morning",
    progressLevel: "Nazera",
    rollNo: "০৩",
    photoUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=200&auto=format&fit=crop&q=80",
    currentLesson: "সূরা কাহাফ (পৃষ্ঠা ২৯৩)",
  },
  {
    name: "ফাতেমা আক্তার",
    guardianName: "মোঃ আনোয়ারুল হক",
    guardianPhone: "01722112233",
    batch: "Morning",
    progressLevel: "Qaida",
    rollNo: "০৪",
    photoUrl: "https://images.unsplash.com/photo-1595454223600-91fb5ac24458?w=200&auto=format&fit=crop&q=80",
    currentLesson: "কায়দা পৃষ্ঠা ৮ (তানভীন ও সাকিন)",
  },
  {
    name: "মুহাম্মদ তালহা",
    guardianName: "মুফতি আব্দুল বাতেন",
    guardianPhone: "01611445566",
    batch: "Afternoon",
    progressLevel: "Hifz",
    rollNo: "০৫",
    photoUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=200&auto=format&fit=crop&q=80",
    currentLesson: "৩য় পারা (পৃষ্ঠা ৪২ - নতুন সবক)",
  },
  {
    name: "উম্মে হাবিবা",
    guardianName: "মোঃ জহিরুল ইসলাম",
    guardianPhone: "01555667788",
    batch: "Afternoon",
    progressLevel: "Ampara",
    rollNo: "০৬",
    photoUrl: "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=200&auto=format&fit=crop&q=80",
    currentLesson: "সূরা মুলক (পৃষ্ঠা ৫৬২ - রিভিশন)",
  },
];

async function main() {
  const mosques = await db.mosque.findMany();
  console.log(`Found ${mosques.length} mosques`);
  const today = new Date().toISOString().slice(0, 10);

  for (const mosque of mosques) {
    const existing = await db.maktabStudent.count({ where: { mosqueId: mosque.id } });
    if (existing === 0) {
      console.log(`Seeding maktab students for mosque ${mosque.name} (${mosque.id})`);
      for (const s of DEFAULT_SAMPLE_STUDENTS) {
        const student = await db.maktabStudent.create({
          data: {
            mosqueId: mosque.id,
            ...s,
          },
        });
        await db.maktabAttendance.create({
          data: {
            studentId: student.id,
            date: today,
            status: "PRESENT",
            sabaqRating: "EXCELLENT",
            notes: "মাশাআল্লাহ খুব সুন্দর তিলাওয়াত করেছে",
          },
        });
      }
    } else {
      console.log(`Mosque ${mosque.name} already has ${existing} students`);
    }
  }
}

main().catch(console.error);
