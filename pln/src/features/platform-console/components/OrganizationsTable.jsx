'use client'

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const STATUS_STYLE = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-slate-100 text-slate-600",
  suspended: "bg-red-100 text-red-700",
};

export default function OrganizationsTable({ organizations }) {
  if (!organizations.length) {
    return (
      <p className="text-sm text-slate-500 py-10 text-center">
        এখনো কোনো organization তৈরি হয়নি।
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Organization</TableHead>
          <TableHead>Domain</TableHead>
          <TableHead>Plan</TableHead>
          <TableHead>Branches</TableHead>
          <TableHead>Modules</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {organizations.map((org) => (
          <TableRow key={org.id} className="cursor-pointer hover:bg-slate-50">
            <TableCell>
              <Link href={`/platform-console/organizations/${org.id}`} className="flex items-center gap-3">
                <span
                  className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
                  style={{ backgroundColor: org.theme_color }}
                >
                  {org.logo_initial}
                </span>
                <span className="font-medium text-slate-800">{org.name}</span>
              </Link>
            </TableCell>
            <TableCell className="text-sm text-slate-500">
              {org.custom_domain || `${org.subdomain}.platform.com`}
            </TableCell>
            <TableCell className="capitalize text-sm">{org.subscription_plan}</TableCell>
            <TableCell className="text-sm">{org.branches}</TableCell>
            <TableCell className="text-sm">
              {org.modules_enabled}/{org.modules_total}
            </TableCell>
            <TableCell>
              <Badge className={`${STATUS_STYLE[org.status]} capitalize`} variant="secondary">
                {org.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
