import { Customer, InsightAlert, QuickAction, UsageSummary } from "../types";

export const customer: Customer = {
  name: "Rosa",
  accountId: "KE-49231",
  address: "1234 25th Street, San Francisco, CA"
};

export const usageSummary: UsageSummary = {
  month: "January",
  kwh: 742,
  billAmount: 309,
  billChangePct: 17,
  lastMonthKwh: 635
};

export const quickActions: QuickAction[] = [
  {
    id: "dispute-bill",
    title: "Dispute a bill",
    description: ""
  },
  {
    id: "move-out",
    title: "Move out",
    description: ""
  },
  {
    id: "move-in",
    title: "Move in",
    description: ""
  },
  {
    id: "transfer",
    title: "Transfer",
    description: ""
  },
  {
    id: "submit-meter",
    title: "Submit meter reading",
    description: ""
  },
  {
    id: "tariff-plans",
    title: "Tariff Plans",
    description: ""
  },
  {
    id: "update-account",
    title: "Update Account",
    description: ""
  }
];

export const insights: InsightAlert[] = [
  {
    id: "high-bill",
    type: "alert",
    title: "High bill detected",
    description: "Your current bill is trending 12% above last month.",
    isActive: true
  },
  {
    id: "unusual-usage",
    type: "info",
    title: "Unusual usage on weekdays",
    description: "Energy use is higher between 2 PM and 5 PM this week.",
    isActive: true
  },
  {
    id: "savings-tip",
    type: "tip",
    title: "Savings recommendation",
    description: "Adjust your thermostat by 2° to save up to $18/month.",
    isActive: true
  }
];
