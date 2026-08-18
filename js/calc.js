// Month-ledger math shared by the dashboard.
//
// Rule being modeled: each month a member gets a fixed quota. Whatever is
// left unused rolls into the NEXT month only — if it's still unused after
// that one grace month, it expires (does not keep compounding forever).
//
// To make that expiry work, leftover quota from month M is spent first
// when calculating month M+1's usage, and only whatever is left of THIS
// month's own quota rolls forward again — money that was already a
// one-month-old carry-in is never re-forwarded a second time.

const TBFCalc = (() => {
  function toMonthKey(dateStr) {
    // '2026-08-01' -> '2026-08'
    return String(dateStr).slice(0, 7);
  }

  function toMonthDate(monthKey) {
    return `${monthKey}-01`;
  }

  function currentMonthKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  function compareMonth(a, b) {
    return a.localeCompare(b);
  }

  function addMonths(monthKey, delta) {
    const [y, m] = monthKey.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  function monthsBetween(start, end) {
    if (compareMonth(start, end) > 0) return [];
    const out = [];
    let cur = start;
    while (compareMonth(cur, end) <= 0) {
      out.push(cur);
      cur = addMonths(cur, 1);
    }
    return out;
  }

  function formatMonthLabel(monthKey) {
    const [y, m] = monthKey.split('-');
    return `${y} 年 ${Number(m)} 月`;
  }

  // quotaHistory: [{ effective_month: '2026-08-01', amount_per_member: 500 }, ...]
  function quotaForMonth(quotaHistory, monthKey) {
    let best = null;
    for (const q of quotaHistory) {
      const qm = toMonthKey(q.effective_month);
      if (compareMonth(qm, monthKey) <= 0) {
        if (!best || compareMonth(qm, toMonthKey(best.effective_month)) > 0) best = q;
      }
    }
    return best ? Number(best.amount_per_member) : 0;
  }

  // usageByMonth: { 'YYYY-MM': totalAmountUsedThatMonth }
  // Returns one row per month in [startMonth, endMonth] with the ledger math.
  function buildLedger({ startMonth, endMonth, quotaHistory, usageByMonth }) {
    const months = monthsBetween(startMonth, endMonth);
    let incomingCarry = 0;
    const rows = [];
    for (const month of months) {
      const ownQuota = quotaForMonth(quotaHistory, month);
      const used = usageByMonth[month] || 0;
      const totalAvailable = ownQuota + incomingCarry;

      // Spend the expiring (carried-in) money first.
      const carryUsed = Math.min(used, incomingCarry);
      const ownUsed = Math.max(0, used - carryUsed);
      const leftoverOwn = Math.max(0, ownQuota - ownUsed);
      const balance = totalAvailable - used;

      rows.push({
        month,
        ownQuota,
        incomingCarry,
        totalAvailable,
        used,
        balance,
        carryToNextMonth: leftoverOwn,
      });

      incomingCarry = leftoverOwn;
    }
    return rows;
  }

  return {
    toMonthKey,
    toMonthDate,
    currentMonthKey,
    compareMonth,
    addMonths,
    monthsBetween,
    formatMonthLabel,
    quotaForMonth,
    buildLedger,
  };
})();
