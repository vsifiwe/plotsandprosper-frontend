export const INVESTMENT_VEHICLE_TYPES = [
  "SAVINGS_ACCOUNT",
  "LAND",
  "SHARES",
  "GOVERNMENT_BOND",
  "OTHER",
] as const;

export type InvestmentVehicleType = (typeof INVESTMENT_VEHICLE_TYPES)[number];

export type Investment = {
  id: number;
  name: string;
  vehicleType: InvestmentVehicleType | (string & {});
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedInvestments = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Investment[];
};

export type CreateInvestmentInput = {
  name: string;
  vehicleType: InvestmentVehicleType;
  description: string;
};

export function formatVehicleType(vehicleType: string): string {
  return vehicleType
    .split("_")
    .filter((segment) => segment.length > 0)
    .map((segment) => segment[0] + segment.slice(1).toLowerCase())
    .join(" ");
}
