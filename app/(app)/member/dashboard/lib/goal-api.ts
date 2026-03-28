import "server-only";

import { requireRole } from "@/app/lib/auth";
import { buildBackendUrl, extractErrorMessage } from "@/app/lib/server-api-utils";

import type { CreateMemberGoalInput, GoalTimeline, MemberGoal } from "../types";

export class GoalApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "GoalApiError";
    this.status = status;
  }
}

function isGoalTimeline(value: unknown): value is GoalTimeline {
  return (
    value === "6_MONTHS" ||
    value === "1_YEAR" ||
    value === "2_YEARS" ||
    value === "5_YEARS" ||
    value === "10_YEARS"
  );
}

function parseMemberGoal(payload: unknown): MemberGoal | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const raw = payload as Record<string, unknown>;
  if (
    typeof raw.id !== "number" ||
    !isGoalTimeline(raw.timeline) ||
    typeof raw.target_amount !== "string" ||
    typeof raw.current_value !== "string" ||
    typeof raw.progress_percentage !== "string" ||
    typeof raw.gap_to_target !== "string" ||
    typeof raw.created_at !== "string" ||
    typeof raw.updated_at !== "string"
  ) {
    return null;
  }

  return {
    id: raw.id,
    timeline: raw.timeline,
    targetAmount: raw.target_amount,
    currentValue: raw.current_value,
    progressPercentage: raw.progress_percentage,
    gapToTarget: raw.gap_to_target,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

export async function fetchMemberGoal(): Promise<MemberGoal | null> {
  const session = await requireRole("member");

  let response: Response;
  try {
    response = await fetch(buildBackendUrl("/members/me/goal/"), {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      cache: "no-store",
    });
  } catch {
    throw new GoalApiError(
      "Unable to reach the goal service. Please try again.",
      0
    );
  }

  if (response.status === 404) {
    return null;
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new GoalApiError(
        "Your session is no longer valid. Please sign in again.",
        response.status
      );
    }

    const backendMessage = extractErrorMessage(payload);
    throw new GoalApiError(
      backendMessage ?? "Unable to load your goal at the moment.",
      response.status
    );
  }

  const goal = parseMemberGoal(payload);
  if (!goal) {
    throw new GoalApiError("Goal response format is invalid.", response.status);
  }

  return goal;
}

export async function createMemberGoal(
  input: CreateMemberGoalInput
): Promise<MemberGoal> {
  const session = await requireRole("member");

  let response: Response;
  try {
    response = await fetch(buildBackendUrl("/members/me/goal/"), {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        timeline: input.timeline,
        target_amount: input.targetAmount,
      }),
      cache: "no-store",
    });
  } catch {
    throw new GoalApiError(
      "Unable to reach the goal service. Please try again.",
      0
    );
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new GoalApiError(
        "Your session is no longer valid. Please sign in again.",
        response.status
      );
    }

    const backendMessage = extractErrorMessage(payload);
    throw new GoalApiError(
      backendMessage ?? "Unable to create your goal at the moment.",
      response.status
    );
  }

  const goal = parseMemberGoal(payload);
  if (!goal) {
    throw new GoalApiError("Goal response format is invalid.", response.status);
  }

  return goal;
}
