import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Member, MemberStatus } from "../types";
import { Badge } from "@/components/ui/badge";
import { CircleCheckIcon, LoaderIcon } from "lucide-react";

type MembersListProps = {
  members: Member[];
};

function StatusBadge({ status }: { status: MemberStatus }) {
  return (
    <Badge variant="outline" className="text-muted-foreground px-1.5">
        {status === "ACTIVE" ? (
          <CircleCheckIcon className="fill-green-500 dark:fill-green-400" />
        ) : (
          <LoaderIcon
          />
        )}
        {status}
      </Badge>
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function MembersList({ members }: MembersListProps) {
  if (members.length === 0) {
    return (
      <div className="rounded-md border py-6 text-center text-sm text-zinc-600">
        No members found.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {members.map((member) => (
          <article key={member.id} className="space-y-3 rounded-md border p-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold">
                {member.firstName} {member.lastName}
              </h3>
              <StatusBadge status={member.status} />
            </div>
            <dl className="grid grid-cols-1 gap-2 text-sm">
              <div>
                <dt className="text-zinc-500">Email</dt>
                <dd className="break-all">{member.email}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Phone</dt>
                <dd>{member.phoneNumber}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">NID</dt>
                <dd>{member.nid}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Join date</dt>
                <dd>{formatDate(member.joinDate)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <div className="hidden rounded-md border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>First name</TableHead>
              <TableHead>Last name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone number</TableHead>
              <TableHead>NID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Join date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>{member.firstName}</TableCell>
                <TableCell>{member.lastName}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.phoneNumber}</TableCell>
                <TableCell>{member.nid}</TableCell>
                <TableCell>
                  <StatusBadge status={member.status} />
                </TableCell>
                <TableCell>{formatDate(member.joinDate)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
