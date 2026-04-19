import { useMemo, useState } from "react";
import { BadgeCheck, Building2, Search, ShieldX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminEmployers, type AdminEmployer } from "@/data/adminMockData";
import { toast } from "sonner";

export default function EmployerManagementTab() {
  const [employers, setEmployers] = useState<AdminEmployer[]>(adminEmployers);
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      employers.filter(
        (e) =>
          !search ||
          e.company.toLowerCase().includes(search.toLowerCase()) ||
          e.contact.toLowerCase().includes(search.toLowerCase()) ||
          e.industry.toLowerCase().includes(search.toLowerCase()),
      ),
    [employers, search],
  );

  const verify = (id: string, verified: boolean) => {
    setEmployers((prev) => prev.map((e) => (e.id === id ? { ...e, verified } : e)));
    toast.success(verified ? "Employer verified" : "Verification revoked");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-foreground">Employer management</h2>
          <p className="text-sm text-muted-foreground">Verify employers and oversee company accounts.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="h-4 w-4" /> {filtered.length} companies
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search companies, contacts, or industries…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Active jobs</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((e) => (
              <TableRow key={e.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img src={e.logo} alt={e.company} className="h-9 w-9 rounded-xl object-cover" />
                    <div>
                      <p className="font-medium text-foreground">{e.company}</p>
                      <p className="text-xs text-muted-foreground">{e.contact} · {e.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell><Badge variant="secondary">{e.industry}</Badge></TableCell>
                <TableCell className="text-sm text-foreground">{e.activeJobs}</TableCell>
                <TableCell>
                  {e.verified ? (
                    <span className="inline-flex items-center gap-1 text-sm text-emerald-600">
                      <BadgeCheck className="h-4 w-4" /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-sm text-amber-600">
                      <ShieldX className="h-4 w-4" /> Unverified
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{e.joinedAt}</TableCell>
                <TableCell className="text-right">
                  {e.verified ? (
                    <Button size="sm" variant="outline" onClick={() => verify(e.id, false)}>Revoke</Button>
                  ) : (
                    <Button size="sm" onClick={() => verify(e.id, true)}>Verify</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
