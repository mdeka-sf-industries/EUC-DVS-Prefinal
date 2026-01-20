export type Customer = {
  name: string;
  accountId: string;
  address: string;
};

export type UsageSummary = {
  month: string;
  kwh: number;
  billAmount: number;
  billChangePct: number;
  lastMonthKwh: number;
};

export type QuickAction = {
  id: string;
  title: string;
  description: string;
};

export type InsightAlert = {
  id: string;
  type: "alert" | "info" | "tip";
  title: string;
  description: string;
  isActive: boolean;
};
