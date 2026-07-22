export function padMonth(month) {
  return String(month).padStart(2, "0");
}

export function getDateKey(date = new Date()) {
  const value = date instanceof Date ? date : new Date(date);
  const year = value.getFullYear();
  const month = padMonth(value.getMonth() + 1);
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getAccountingPeriod(date = new Date()) {
  const value = date instanceof Date ? date : new Date(date);
  const year = String(value.getFullYear());
  const month = padMonth(value.getMonth() + 1);

  return {
    year,
    month,
    key: `${year}-${month}`,
  };
}

export function toAccountingPeriodKey({ year, month } = {}) {
  if (!year || !month) return getAccountingPeriod().key;
  return `${String(year)}-${padMonth(month)}`;
}

export function getRecordAccountingPeriodKey(record = {}) {
  if (record.accounting_period) return String(record.accounting_period);
  if (record.month && /^\d{4}-\d{2}$/.test(String(record.month))) return String(record.month);
  if (record.year && record.month) return toAccountingPeriodKey({ year: record.year, month: record.month });
  if (record.date) return String(record.date).slice(0, 7);
  if (record.payment_date) return String(record.payment_date).slice(0, 7);
  if (record.paid_date) return String(record.paid_date).slice(0, 7);
  if (record.created_date) return String(record.created_date).slice(0, 7);
  return "";
}

export function isRecordInAccountingPeriod(record, periodKey = getAccountingPeriod().key) {
  return getRecordAccountingPeriodKey(record) === periodKey;
}

export function isRecordOnDate(record, dateKey = getDateKey()) {
  return String(record?.attendance_date || record?.record_date || record?.date || "").slice(0, 10) === dateKey;
}
