import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SectionCards } from "@/components/section-cards";
import { DataTable } from "@/components/data-table";
import {
  AnalyticsApiError,
  fetchAdminDashboardAnalytics,
} from "./lib/analytics-api";

import data from "./data.json"

export default async function AdminDashboardPage() {
  let analytics = {
    memberCount: 0,
    totalContributions: "0",
    totalInvestments: 0,
    growthRate: 0,
  };
  let loadError: string | null = null;

  try {
    analytics = await fetchAdminDashboardAnalytics();
  } catch (error) {
    if (error instanceof AnalyticsApiError) {
      loadError = error.message;
    } else {
      loadError = "Unable to load dashboard analytics at the moment.";
    }
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        {loadError ? (
          <div className="mx-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 lg:mx-6">
            {loadError}
          </div>
        ) : null}
        <SectionCards
          totalContributions={analytics.totalContributions}
          totalMembers={analytics.memberCount}
          totalInvestments={analytics.totalInvestments}
          growthRate={analytics.growthRate}
        />
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div>
        <DataTable data={data} />
      </div>
    </div>

  );
}
