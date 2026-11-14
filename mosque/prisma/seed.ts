/* Demo data for local development. Refuses to run in production. */
import bcrypt from "bcryptjs";
import { db } from "../src/lib/db";
import { DEFAULT_ROLES } from "../src/lib/permissions";

const PASSWORD = process.env.SEED_PASSWORD ?? "Mosque@12345";

let seed = 42;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);

const NAMES = [
  "Abdul Karim", "Mohammad Rahim", "Hasan Mahmud", "Nurul Islam", "Jahangir Alam", "Faruk Hossain",
  "Salman Ahmed", "Mizanur Rahman", "Shafiqul Islam", "Abu Bakar", "Omar Faruk", "Delwar Hossain",
  "Kamrul Hasan", "Rashed Khan", "Tareq Aziz", "Monir Uddin", "Sirajul Islam", "Habibur Rahman",
  "Anwar Hossain", "Zahid Hasan", "Ibrahim Khalil", "Yusuf Ali", "Moshiur Rahman", "Altaf Hossain",
];

async function main() {
  if (process.env.NODE_ENV === "production") throw new Error("Refusing to seed production");
  const hash = await bcrypt.hash(PASSWORD, 12);

  const mosque = await db.mosque.upsert({
    where: { slug: "baitun-noor" },
    update: {},
    create: { slug: "baitun-noor", name: "Baitun Noor Jame Mosque", startMonth: "2026-01", showContributors: true },
  });
  const roles: Record<string, string> = {};
  for (const r of DEFAULT_ROLES) {
    const row = await db.role.upsert({
      where: { mosqueId_key: { mosqueId: mosque.id, key: r.key } },
      update: { permissions: r.permissions },
      create: { mosqueId: mosque.id, key: r.key, name: r.name, permissions: r.permissions, isSystem: true },
    });
    roles[r.key] = row.id;
  }
  const existingFunds = await db.fund.count({ where: { mosqueId: mosque.id } });
  if (existingFunds === 0) {
    await db.fund.createMany({
      data: [
        { mosqueId: mosque.id, name: "General fund", isMonthly: true },
        { mosqueId: mosque.id, name: "Zakat", restricted: true },
        { mosqueId: mosque.id, name: "Sadaqah", restricted: true },
      ],
    });
  }
  const funds = await db.fund.findMany({ where: { mosqueId: mosque.id } });
  const general = funds.find((f) => f.isMonthly)!;

  const people = [
    { loginId: "president", name: "Haji Abdur Rahman", role: "president", pledge: 1000 },
    { loginId: "treasurer", name: "Mostafa Kamal", role: "treasurer", pledge: 500 },
    { loginId: "imam", name: "Maulana Abdullah", role: "imam", pledge: 0 },
    ...NAMES.map((name, i) => ({
      loginId: `member${String(i + 1).padStart(2, "0")}`,
      name,
      role: "member",
      pledge: [200, 300, 500, 1000][Math.floor(rnd() * 4)] as number,
    })),
  ];
  const memberIds: { id: string; pledge: number }[] = [];
  for (const p of people) {
    const user = await db.user.upsert({
      where: { loginId: p.loginId },
      update: {},
      create: { loginId: p.loginId, name: p.name, passwordHash: hash },
    });
    const m = await db.membership.upsert({
      where: { mosqueId_userId: { mosqueId: mosque.id, userId: user.id } },
      update: {},
      create: {
        mosqueId: mosque.id,
        userId: user.id,
        roleId: roles[p.role] as string,
        status: "ACTIVE",
        monthlyPledge: p.pledge,
        joinedAt: new Date("2025-12-01"),
      },
    });
    if (p.pledge > 0) memberIds.push({ id: m.id, pledge: p.pledge });
  }
  const treasurer = await db.user.findUniqueOrThrow({ where: { loginId: "treasurer" } });

  if ((await db.payment.count({ where: { mosqueId: mosque.id } })) === 0) {
    const periods = ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10"];
    let n = 0;
    const rows = [];
    for (const [pi, period] of periods.entries()) {
      const payChance = pi === periods.length - 1 ? 0.45 : 0.9 - pi * 0.01;
      for (const m of memberIds) {
        const r = rnd();
        if (r > payChance) continue;
        const partial = rnd() < 0.12;
        n += 1;
        rows.push({
          mosqueId: mosque.id,
          membershipId: m.id,
          fundId: general.id,
          period,
          amount: partial ? Math.round(m.pledge / 2) : m.pledge,
          method: ["CASH", "BKASH", "NAGAD"][Math.floor(rnd() * 3)] as string,
          status: "VERIFIED" as const,
          receiptNo: `R-2026-${String(n).padStart(5, "0")}`,
          idempotencyKey: `seed-${period}-${m.id}`,
          recordedById: treasurer.id,
          paidAt: new Date(`${period}-${String(5 + Math.floor(rnd() * 20)).padStart(2, "0")}T10:00:00Z`),
        });
      }
    }
    await db.payment.createMany({ data: rows });
    await db.mosque.update({ where: { id: mosque.id }, data: { receiptSeq: n, voucherSeq: 3 } });

    await db.expense.createMany({
      data: [
        { voucherNo: "EXP-0001", category: "Utilities", description: "Electricity bill", amount: 4800, status: "PAID" as const, spentAt: new Date("2026-09-12"), paidAt: new Date("2026-09-12") },
        { voucherNo: "EXP-0002", category: "Salary", description: "Imam and Muazzin salary", amount: 15000, status: "PAID" as const, spentAt: new Date("2026-09-30"), paidAt: new Date("2026-09-30") },
        { voucherNo: "EXP-0003", category: "Maintenance", description: "Fan and light repair", amount: 9500, status: "PENDING_APPROVAL" as const, spentAt: new Date("2026-10-08"), submittedAt: new Date("2026-10-11T06:00:00Z") },
      ].map((e) => ({ ...e, mosqueId: mosque.id, fundId: general.id, createdById: treasurer.id })),
    });
  }
  console.log(`Seeded. Mosque code: baitun-noor | logins: president, treasurer, imam, member01..member24 | password: ${PASSWORD}`);
}

main().finally(() => db.$disconnect());
