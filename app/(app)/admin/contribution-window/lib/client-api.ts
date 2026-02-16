"use client";

import { PaginatedContributionWindows, PaginationParams } from "../types";

export async function fetchContributionWindowsClient(
  params?: PaginationParams
): Promise<PaginatedContributionWindows> {
  const url = new URL("/api/contribution-windows", window.location.origin);

  if (params?.page) {
    url.searchParams.set("page", params.page.toString());
  }
  if (params?.pageSize) {
    url.searchParams.set("page_size", params.pageSize.toString());
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch contribution windows");
  }

  return response.json();
}
