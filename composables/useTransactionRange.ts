import { ref } from "vue";
import type { Transaction } from "~/types";

interface DateRangeType {
  start: string | null;
  end: string | null;
}

type RangeType =
  | "custom"
  | "today"
  | "last7days"
  | "daily"
  | "weekly"
  | "monthly";

export default function useTransactionRange() {
  const dateRange = ref<DateRangeType>({
    start: null,
    end: null,
  });

  const selectedRange = ref<RangeType>("daily");

  const filterTransactionsByRange = (
    transactions: Transaction[],
    range: RangeType
  ) => {
    const now = new Date();
    now.setHours(23, 59, 59, 999); // End of today

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0); // Start of today

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    return transactions.filter((t) => {
      const transactionDate = new Date(t.transaction_at);

      if (range === "custom" && dateRange.value.start && dateRange.value.end) {
        const start = new Date(dateRange.value.start);
        const end = new Date(dateRange.value.end);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return transactionDate >= start && transactionDate <= end;
      }

      switch (range) {
        case "today":
          return transactionDate >= startOfToday && transactionDate <= now;
        case "last7days":
          return transactionDate >= sevenDaysAgo && transactionDate <= now;
        default:
          return true;
      }
    });
  };

  const groupTransactionsByRange = (
    transactions: Transaction[],
    range: RangeType
  ) => {
    const grouped = new Map<
      string,
      { date: Date; income: number; expense: number }
    >();
    const now = new Date();
    let numberOfPeriods = 1; // default for today
    let startDate = new Date();
    let endDate = now;

    if (range === "custom" && dateRange.value.start && dateRange.value.end) {
      startDate = new Date(dateRange.value.start);
      endDate = new Date(dateRange.value.end);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      numberOfPeriods =
        Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;
    } else {
      // Set number of periods based on range
      switch (range) {
        case "today":
          numberOfPeriods = 1;
          startDate = now;
          break;
        case "last7days":
          numberOfPeriods = 7;
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 6);
          break;
        case "daily":
          numberOfPeriods = 30;
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 29);
          break;
        case "weekly":
          numberOfPeriods = 12;
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 12 * 7);
          break;
        case "monthly":
          numberOfPeriods = 12;
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 11);
          break;
        default:
          startDate = now;
      }
    }

    // Initialize periods
    for (let i = 0; i < numberOfPeriods; i++) {
      let date = new Date();
      if (range === "custom") {
        date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
      } else if (range === "today") {
        date = new Date(now);
      } else if (range === "last7days" || range === "daily") {
        date.setDate(now.getDate() - i);
      } else if (range === "weekly") {
        date.setDate(now.getDate() - i * 7);
      } else {
        date.setMonth(now.getMonth() - i);
      }

      grouped.set(date.toISOString().split("T")[0], {
        date,
        income: 0,
        expense: 0,
      });
    }

    // Group transactions
    const filteredTransactions = filterTransactionsByRange(transactions, range);
    filteredTransactions.forEach((transaction) => {
      const date = new Date(transaction.transaction_at);
      let key = date.toISOString().split("T")[0];

      if (range === "weekly") {
        // Get the monday of the week
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        key = new Date(date.setDate(diff)).toISOString().split("T")[0];
      } else if (range === "monthly") {
        key = date.toISOString().slice(0, 7);
      }

      if (grouped.has(key)) {
        const amount = transaction.amount;
        const entry = grouped.get(key);
        if (!entry) return;

        if (transaction.type === "income") {
          entry.income += amount;
        } else {
          entry.expense += amount;
        }
      }
    });

    return Array.from(grouped.values()).reverse();
  };

  return {
    dateRange,
    selectedRange,
    filterTransactionsByRange,
    groupTransactionsByRange,
  };
}
