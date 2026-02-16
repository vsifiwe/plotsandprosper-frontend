import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { fetchMembers } from "@/app/(app)/admin/members/lib/members-mock-api";
import {
  CONTRIBUTION_PAYMENT_METHODS,
  createContribution,
  isPaymentMethod,
} from "@/app/(app)/admin/contributions/lib/contributions-mock-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

async function createContributionAction(formData: FormData) {
  "use server";

  const memberId = String(formData.get("memberId") ?? "").trim();
  const amountInput = String(formData.get("amount") ?? "").trim();
  const methodInput = String(formData.get("method") ?? "").trim();
  const receiptNumber = String(formData.get("receiptNumber") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  const amount = Number.parseFloat(amountInput);
  const hasValidAmount = Number.isFinite(amount) && amount > 0;
  if (
    !memberId ||
    !hasValidAmount ||
    !isPaymentMethod(methodInput) ||
    !receiptNumber
  ) {
    redirect("/admin/contributions/new?error=invalid-input");
  }

  await createContribution({
    memberId,
    amount,
    method: methodInput,
    receiptNumber,
    notes: notes || undefined,
  });

  revalidatePath("/admin/contributions");
  redirect("/admin/contributions");
}

type SearchParams = {
  error?: string | string[];
};

type NewAdminContributionPageProps = {
  searchParams?: Promise<SearchParams>;
};

function parseError(value: string | string[] | undefined): string | null {
  const rawValue = Array.isArray(value) ? value[0] : value;
  if (!rawValue) return null;
  return rawValue;
}

export default async function NewAdminContributionPage({
  searchParams,
}: NewAdminContributionPageProps) {
  const members = await fetchMembers();
  const resolvedSearchParams = (await searchParams) ?? {};
  const error = parseError(resolvedSearchParams.error);
  const membersByName = members.toSorted((first, second) => {
    const firstName = `${first.firstName} ${first.lastName}`;
    const secondName = `${second.firstName} ${second.lastName}`;
    return firstName.localeCompare(secondName);
  });

  return (
    <main className="space-y-5">
      <Button asChild size="sm" variant="outline">
        <Link href="/admin/contributions">Back to contributions</Link>
      </Button>

      <div>
        <h2 className="text-xl font-semibold">Log New Contribution</h2>
        <p className="text-sm text-zinc-600">
          Capture a member contribution and save it to the ledger.
        </p>
      </div>

      {error === "invalid-input" ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Enter all required fields before saving the contribution.
        </div>
      ) : null}

      <form
        action={createContributionAction}
        className="grid gap-4 rounded-md border p-4 sm:grid-cols-2"
      >
        <div className="space-y-2">
          <Label htmlFor="member-id">Member</Label>
          <Select name="memberId" required>
            <SelectTrigger id="member-id" className="w-full">
              <SelectValue placeholder="Select a member" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {membersByName.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.firstName} {member.lastName} ({member.id})
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="method">Payment method</Label>
          <Select name="method" required>
            <SelectTrigger id="method" className="w-full">
              <SelectValue placeholder="Select a payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {CONTRIBUTION_PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="receipt-number">Receipt number</Label>
          <Input
            id="receipt-number"
            name="receiptNumber"
            placeholder="RCPT-2401"
            required
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Input id="notes" name="notes" placeholder="Additional context" />
        </div>

        <div className="sm:col-span-2">
          <Button className="w-full sm:w-auto" type="submit">
            Save contribution
          </Button>
        </div>
      </form>
    </main>
  );
}
