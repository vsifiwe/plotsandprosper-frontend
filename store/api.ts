import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAccessToken } from "@/lib/auth";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL + "/api/v1/",
    prepareHeaders: (headers) => {
      const token = getAccessToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    "User",
    "Window",
    "Contribution",
    "Penalty",
    "InvestmentVehicle",
    "InvestmentEvent",
    "WithdrawalEvent",
    "Asset",
    "Statement",
    "AuditLog",
    "Dashboard",
  ],
  endpoints: () => ({}),
  keepUnusedDataFor: 30,
});
