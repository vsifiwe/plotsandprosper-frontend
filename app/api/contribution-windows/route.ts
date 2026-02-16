import { NextRequest, NextResponse } from "next/server";

import {
  fetchContributionWindows,
  ContributionWindowsApiError,
} from "@/app/(app)/admin/contribution-window/lib/contribution-windows-api";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get("page");
  const pageSize = searchParams.get("page_size");

  try {
    const data = await fetchContributionWindows({
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
    });

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof ContributionWindowsApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: "Unable to fetch contribution windows" },
      { status: 500 }
    );
  }
}
