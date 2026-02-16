import { fetchMembers } from "@/app/(app)/admin/members/lib/members-mock-api";

export type ContributionStatus = "POSTED" | "PENDING";
export type PaymentMethod = "Bank transfer" | "Mobile money" | "Cash";

export type Contribution = {
  id: string;
  memberName: string;
  memberId: string;
  amount: number;
  method: PaymentMethod;
  status: ContributionStatus;
  receivedAt: string;
  receiptNumber: string;
  notes?: string;
};

export type CreateContributionInput = {
  memberId: string;
  amount: number;
  method: PaymentMethod;
  receiptNumber: string;
  notes?: string;
};

export const CONTRIBUTION_PAYMENT_METHODS: PaymentMethod[] = [
  "Bank transfer",
  "Mobile money",
  "Cash",
];

const MOCK_API_DELAY_MS = 400;
const INITIAL_CONTRIBUTION_COUNT = 47;

let membersCache: Awaited<ReturnType<typeof fetchMembers>> | null = null;
let contributionsCache: Contribution[] | null = null;
let initializingContributions: Promise<Contribution[]> | null = null;

function wait(durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });
}

async function getMembers() {
  if (membersCache) return membersCache;

  const members = await fetchMembers();
  membersCache = members;
  return members;
}

function buildInitialContributions(
  members: Awaited<ReturnType<typeof fetchMembers>>
): Contribution[] {
  if (members.length === 0) return [];

  return Array.from({ length: INITIAL_CONTRIBUTION_COUNT }, (_, index) => {
    const member = members[index % members.length];
    const method =
      CONTRIBUTION_PAYMENT_METHODS[index % CONTRIBUTION_PAYMENT_METHODS.length];
    const receivedAt = new Date(Date.UTC(2026, 1, 10, 12, 0, 0));
    receivedAt.setUTCDate(receivedAt.getUTCDate() - index * 2);

    const status: ContributionStatus =
      index % 9 === 0 ? "PENDING" : "POSTED";
    return {
      id: `ctr-${index + 1}`,
      memberName: `${member.firstName} ${member.lastName}`,
      memberId: member.id,
      amount: 120 + ((index % 6) + 1) * 3500,
      method,
      status,
      receivedAt: receivedAt.toISOString(),
      receiptNumber: `RCPT-${(2400 + index).toString()}`,
    };
  }).toSorted((first, second) =>
    second.receivedAt.localeCompare(first.receivedAt)
  );
}

async function getContributionsStore(): Promise<Contribution[]> {
  if (contributionsCache) return contributionsCache;

  if (!initializingContributions) {
    initializingContributions = (async () => {
      const members = await getMembers();
      const initialContributions = buildInitialContributions(members);
      contributionsCache = initialContributions;
      return initialContributions;
    })();
  }

  return initializingContributions;
}

export async function fetchContributions(): Promise<Contribution[]> {
  await wait(MOCK_API_DELAY_MS);
  const contributions = await getContributionsStore();
  return contributions.toSorted((first, second) =>
    second.receivedAt.localeCompare(first.receivedAt)
  );
}

export async function createContribution(
  input: CreateContributionInput
): Promise<Contribution> {
  await wait(MOCK_API_DELAY_MS);

  const [members, contributions] = await Promise.all([
    getMembers(),
    getContributionsStore(),
  ]);
  const member = members.find((entry) => entry.id === input.memberId);

  if (!member) {
    throw new Error("Member was not found.");
  }

  const newContribution: Contribution = {
    id: `ctr-${Date.now()}`,
    memberName: `${member.firstName} ${member.lastName}`,
    memberId: member.id,
    amount: input.amount,
    method: input.method,
    status: "POSTED",
    receivedAt: new Date().toISOString(),
    receiptNumber: input.receiptNumber,
    notes: input.notes,
  };

  contributions.unshift(newContribution);
  return newContribution;
}

export function isPaymentMethod(value: string): value is PaymentMethod {
  return CONTRIBUTION_PAYMENT_METHODS.includes(value as PaymentMethod);
}
