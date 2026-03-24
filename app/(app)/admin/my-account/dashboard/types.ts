export type TransactionType = "CONTRIBUTION" | "WITHDRAWAL" | "PENALTY";

export type Transaction = {
  date: string;
  description: string;
  amount: string;
  cumulativeContributions: string;
  type: TransactionType;
};

export type PaginatedTransactions = {
  count: number;
  page: number;
  pageSize: number;
  results: Transaction[];
};

export type VehicleType =
  | "LAND"
  | "SHARES"
  | "SAVINGS_ACCOUNT"
  | "TREASURY_BOND"
  | "FIXED_DEPOSIT"
  | "OTHER";

export type Investment = {
  id: number;
  name: string;
  vehicleType: VehicleType;
  currentValue: string;
  description: string;
};

export type SummaryMetric = {
  amount: string;
  growth: string;
};

export type MemberSummary = {
  lifetime: SummaryMetric;
  group: SummaryMetric;
  membership: SummaryMetric;
  investment: SummaryMetric;
};
