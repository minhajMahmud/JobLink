import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Building2, Search, ShieldX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminEmployers } from "@/data/adminMockData";
import { adminService } from "@/modules/admin/services/adminService";
import { useAdminPagination } from "@/modules/admin/hooks/useAdminPagination";
import type { AdminEmployerRecord } from "@/modules/admin/types";
import { toast } from "sonner";

export default function EmployerManagementTab() {
  const [employers, setEmployers] = useState<AdminEmployerRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { page, limit, total, totalPages, setTotal, goNext, goPrev } = useAdminPagination(1, 10);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await adminService.getEmployers({
          page,
          limit,
          query: search,
          status: statusFilter,
        });
        setEmployers(response.data);
        setTotal(response.meta.total);
      } catch {
        const fallback: AdminEmployerRecord[] = adminEmployers.map((e) => ({
          id: e.id,
          company_name: e.company,
          email: e.email,
          is_verified: e.verified,
          status: e.verified ? "Active" : "Pending",
          jobs_posted: e.activeJobs,
        }));

        const filteredFallback = fallback.filter((e) => {
          const matchesSearch =
            !search ||
            e.company_name.toLowerCase().includes(search.toLowerCase()) ||
            e.email.toLowerCase().includes(search.toLowerCase());
          const matchesStatus = statusFilter === "all" || e.status === statusFilter;
          return matchesSearch && matchesStatus;
        });

        setEmployers(filteredFallback.slice((page - 1) * limit, page * limit));
        setTotal(filteredFallback.length);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [page, limit, search, statusFilter, setTotal]);

  const filtered = useMemo(
    () => employers,
    [employers],
  );

  const verify = (id: string, verified: boolean) => {
    adminService.verifyEmployer(id, verified)
      .catch(() => null)
      .finally(() => {
        setEmployers((prev) =>
          prev.map((e) =>
            e.id === id
              ? { ...e, is_verified: verified, status: verified ? "Active" : "Pending" }
              : e,
          ),
        );
        toast.success(verified ? "Employer verified" : "Verification revoked");
      });
  };

  const suspend = (id: string) => {
    setEmployers((prev) => prev.map((e) => (e.id === id ? { ...e, status: "Suspended" } : e)));
    toast.success("Employer suspended");
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

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search companies, contacts, or industries…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Active jobs</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow><TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">Loading employers...</TableCell></TableRow>
            )}
            {!loading && filtered.map((e) => (
              <TableRow key={e.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-xs font-semibold">
                      {e.company_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{e.company_name}</p>
                      <p className="text-xs text-muted-foreground">{e.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{e.email}</TableCell>
                <TableCell className="text-sm text-foreground">{e.jobs_posted}</TableCell>
                <TableCell>
                  {e.is_verified ? (
                    <span className="inline-flex items-center gap-1 text-sm text-emerald-600">
                      <BadgeCheck className="h-4 w-4" /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-sm text-amber-600">
                      <ShieldX className="h-4 w-4" /> Unverified
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{e.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex gap-2">
                    {e.is_verified ? (
                      <Button size="sm" variant="outline" onClick={() => verify(e.id, false)}>Revoke</Button>
                    ) : (
                      <Button size="sm" onClick={() => verify(e.id, true)}>Verify</Button>
                    )}
                    <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => suspend(e.id)}>
                      Suspend
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!loading && filtered.length === 0 && (
              <TableRow><TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">No employers found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Page {page} of {totalPages} • total {total}</p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={goPrev} disabled={page <= 1}>Previous</Button>
          <Button size="sm" variant="outline" onClick={goNext} disabled={page >= totalPages}>Next</Button>
        </div>
      </div>
    </div>
  );
}
