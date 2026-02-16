import "server-only";

import { Member } from "../types";
import { fetchAdminMembers } from "./members-api";

export async function fetchMembers(): Promise<Member[]> {
  return fetchAdminMembers();
}
