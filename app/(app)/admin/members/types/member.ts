export type MemberStatus =
  | "ACTIVE"
  | "EXITED"
  | "SUSPENDED"
  | "INACTIVE"
  | (string & {});

export type Member = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nid: string;
  status: MemberStatus;
  joinDate: string;
};

export type CreateMemberInput = Omit<Member, "id" | "status">;
