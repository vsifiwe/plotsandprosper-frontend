import { fetchAdminMembers, MembersApiError } from "./lib/members-api";
import { AdminMembersClient } from "./components/admin-members-client";
import { type Member } from "./types";

export default async function AdminMembersPage() {
  let initialMembers: Member[] = [];
  let loadError: string | null = null;

  try {
    initialMembers = await fetchAdminMembers();
  } catch (error) {
    if (error instanceof MembersApiError) {
      loadError = error.message;
    } else {
      loadError = "Unable to load members at the moment.";
    }
  }

  return <AdminMembersClient initialMembers={initialMembers} loadError={loadError} />;
}
