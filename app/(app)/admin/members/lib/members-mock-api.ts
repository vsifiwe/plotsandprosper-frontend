import "server-only";

import { PaginatedMembers } from "../types";
import { fetchAdminMembers } from "./members-api";

export async function fetchMembers(): Promise<PaginatedMembers> {
  return fetchAdminMembers();
}
