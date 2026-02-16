import "server-only";

import { requireRole } from "@/app/lib/auth";

import { type CreateMemberInput, type Member } from "../types";

const DEFAULT_ADMIN_MEMBERS_ENDPOINT = "http://localhost:8000/api/v1/admin/members/";

type BackendMember = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationalId: string;
  status: string;
  joinDate: string;
};

type CreateBackendMemberPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationalId: string;
  joinDate: string;
  status: "ACTIVE";
};

export class MembersApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "MembersApiError";
    this.status = status;
  }
}

function getAdminMembersEndpoint(): string {
  const configuredEndpoint = process.env.BACKEND_ADMIN_MEMBERS_ENDPOINT?.trim();
  if (configuredEndpoint && configuredEndpoint.length > 0) {
    return configuredEndpoint;
  }

  return DEFAULT_ADMIN_MEMBERS_ENDPOINT;
}

function parseBackendMember(payload: unknown): Member | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const backendMember = payload as Partial<BackendMember>;
  if (
    typeof backendMember.id !== "string" ||
    typeof backendMember.firstName !== "string" ||
    typeof backendMember.lastName !== "string" ||
    typeof backendMember.email !== "string" ||
    typeof backendMember.phone !== "string" ||
    typeof backendMember.nationalId !== "string" ||
    typeof backendMember.status !== "string" ||
    typeof backendMember.joinDate !== "string"
  ) {
    return null;
  }

  return {
    id: backendMember.id,
    firstName: backendMember.firstName,
    lastName: backendMember.lastName,
    email: backendMember.email,
    phoneNumber: backendMember.phone,
    nid: backendMember.nationalId,
    status: backendMember.status,
    joinDate: backendMember.joinDate,
  };
}

function parseMembers(payload: unknown): Member[] | null {
  if (!Array.isArray(payload)) {
    return null;
  }

  const members: Member[] = [];
  for (const item of payload) {
    const member = parseBackendMember(item);
    if (!member) {
      return null;
    }

    members.push(member);
  }

  return members;
}

function extractErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const detail = (payload as { detail?: unknown }).detail;
  if (typeof detail === "string" && detail.trim().length > 0) {
    return detail;
  }

  const message = (payload as { message?: unknown }).message;
  if (typeof message === "string" && message.trim().length > 0) {
    return message;
  }

  return null;
}

function mapCreateMemberInputToPayload(
  input: CreateMemberInput
): CreateBackendMemberPayload {
  return {
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phoneNumber,
    nationalId: input.nid,
    joinDate: input.joinDate,
    status: "ACTIVE",
  };
}

export async function fetchAdminMembers(): Promise<Member[]> {
  const session = await requireRole("admin");

  let response: Response;
  try {
    response = await fetch(getAdminMembersEndpoint(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      cache: "no-store",
    });
  } catch {
    throw new MembersApiError(
      "Unable to reach the members service. Please try again.",
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
      throw new MembersApiError(
        "Your session is no longer valid. Please sign in again.",
        response.status
      );
    }

    const backendMessage = extractErrorMessage(payload);
    throw new MembersApiError(
      backendMessage ?? "Unable to load members at the moment.",
      response.status
    );
  }

  const members = parseMembers(payload);
  if (!members) {
    throw new MembersApiError(
      "Members response format is invalid.",
      response.status
    );
  }

  return members;
}

export async function createAdminMember(
  input: CreateMemberInput
): Promise<Member> {
  const session = await requireRole("admin");
  const payload = mapCreateMemberInputToPayload(input);

  let response: Response;
  try {
    response = await fetch(getAdminMembersEndpoint(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  } catch {
    throw new MembersApiError(
      "Unable to reach the members service. Please try again.",
      0
    );
  }

  let responsePayload: unknown = null;
  try {
    responsePayload = await response.json();
  } catch {
    responsePayload = null;
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new MembersApiError(
        "Your session is no longer valid. Please sign in again.",
        response.status
      );
    }

    const backendMessage = extractErrorMessage(responsePayload);
    throw new MembersApiError(
      backendMessage ?? "Unable to create member at the moment.",
      response.status
    );
  }

  const createdMember = parseBackendMember(responsePayload);
  if (!createdMember) {
    throw new MembersApiError(
      "Create member response format is invalid.",
      response.status
    );
  }

  return createdMember;
}
