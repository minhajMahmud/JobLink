import { useEffect, useMemo, useState } from "react";
import { Ban, CheckCircle2, Search, ShieldAlert, Trash2, UserCog } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { adminUsers } from "@/data/adminMockData";
import { adminService } from "@/modules/admin/services/adminService";
import { useAdminPagination } from "@/modules/admin/hooks/useAdminPagination";
import type { AdminUserRecord, AdminUserRole } from "@/modules/admin/types";
import { toast } from "sonner";

const statusStyles: Record<string, string> = {
  Active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  Suspended: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  Banned: "bg-destructive/10 text-destructive border-destructive/20",
  Pending: "bg-blue-500/10 text-blue-600 border-blue-500/20",
};

export default function UserManagementTab() {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "joined_at">("name");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pendingAction, setPendingAction] = useState<{
    title: string;
    description: string;
    run: () => Promise<void>;
  } | null>(null);

  const { page, limit, total, totalPages, setTotal, goNext, goPrev } = useAdminPagination(1, 10);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await adminService.getUsers({
          page,
          limit,
          query: search,
          role: roleFilter,
          status: statusFilter,
        });
        setUsers(response.data);
        setTotal(response.meta.total);
      } catch {
        const fallback: AdminUserRecord[] = adminUsers.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role === "seeker" ? "candidate" : u.role === "employer" ? "recruiter" : "admin",
          status:
            u.status === "active"
              ? "Active"
              : u.status === "suspended"
                ? "Suspended"
                : "Pending",
          joined_at: u.joinedAt,
        }));
        const filteredFallback = fallback.filter((u) => {
          const matchesSearch =
            !search ||
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase());
          const matchesRole = roleFilter === "all" || u.role === roleFilter;
          const matchesStatus = statusFilter === "all" || u.status === statusFilter;
          return matchesSearch && matchesRole && matchesStatus;
        });
        setUsers(filteredFallback.slice((page - 1) * limit, page * limit));
        setTotal(filteredFallback.length);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [page, limit, search, roleFilter, statusFilter, setTotal]);

  const filtered = useMemo(() => {
    const sorted = [...users].sort((a, b) => {
      if (sortBy === "joined_at") {
        return b.joined_at.localeCompare(a.joined_at);
      }
      return a.name.localeCompare(b.name);
    });
    return sorted;
  }, [users, sortBy]);

  const toggleSelected = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      if (checked) {
        return [...prev, id];
      }
      return prev.filter((item) => item !== id);
    });
  };

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filtered.map((u) => u.id));
      return;
    }
    setSelectedIds([]);
  };

  const updateStatus = async (id: string, status: "Active" | "Suspended" | "Banned") => {
    try {
      await adminService.updateUserStatus(id, status);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));
      toast.success(`User status updated to ${status}`);
    } catch {
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));
      toast.success(`User status updated to ${status} (offline mode)`);
    }
  };

  const updateRole = (id: string, role: AdminUserRole) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    toast.success("Role assignment updated");
  };

  const deleteUser = async (id: string) => {
    try {
      await adminService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success("User deleted");
    } catch {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success("User deleted (offline mode)");
    }
  };

  const runBulkSuspend = async () => {
    for (const id of selectedIds) {
      await updateStatus(id, "Suspended");
    }
    setSelectedIds([]);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-foreground">User management</h2>
          <p className="text-sm text-muted-foreground">Search, filter, and moderate platform users.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <UserCog className="h-4 w-4" />
          {filtered.length} users • total {total}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="sm:w-44"><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="seeker">Job seekers</SelectItem>
            <SelectItem value="employer">Employers</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(value: "name" | "joined_at") => setSortBy(value)}>
          <SelectTrigger className="sm:w-44"><SelectValue placeholder="Sort" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Sort by name</SelectItem>
            <SelectItem value="joined_at">Sort by join date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={selectedIds.length === 0}
          onClick={() =>
            setPendingAction({
              title: "Suspend selected users",
              description: `Suspend ${selectedIds.length} selected account(s)?`,
              run: runBulkSuspend,
            })
          }
        >
          <Ban className="h-3.5 w-3.5" /> Bulk Suspend ({selectedIds.length})
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={filtered.length > 0 && selectedIds.length === filtered.length}
                  onCheckedChange={(checked) => toggleAll(Boolean(checked))}
                  aria-label="Select all users"
                />
              </TableHead>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Flags</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow><TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">Loading users...</TableCell></TableRow>
            )}
            {!loading && filtered.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(u.id)}
                    onCheckedChange={(checked) => toggleSelected(u.id, Boolean(checked))}
                    aria-label={`Select ${u.name}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-xs font-semibold">
                      {u.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Select value={u.role} onValueChange={(value: AdminUserRole) => updateRole(u.id, value)}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="recruiter">Recruiter</SelectItem>
                      <SelectItem value="candidate">Candidate</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`${statusStyles[u.status] ?? ""}`}>{u.status}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{u.joined_at}</TableCell>
                <TableCell>
                  {u.status === "Suspended" || u.status === "Banned" ? (
                    <span className="inline-flex items-center gap-1 text-sm text-destructive">
                      <ShieldAlert className="h-3.5 w-3.5" /> flagged
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex gap-2">
                    {u.status !== "Active" ? (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(u.id, "Active")}>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Reinstate
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => updateStatus(u.id, "Suspended")}>
                        <Ban className="h-3.5 w-3.5" /> Suspend
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      onClick={() =>
                        setPendingAction({
                          title: "Delete user",
                          description: `This will permanently remove ${u.name}. Continue?`,
                          run: async () => deleteUser(u.id),
                        })
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!loading && filtered.length === 0 && (
              <TableRow><TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">No users match these filters.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={goPrev} disabled={page <= 1}>Previous</Button>
          <Button size="sm" variant="outline" onClick={goNext} disabled={page >= totalPages}>Next</Button>
        </div>
      </div>

      <AlertDialog open={Boolean(pendingAction)} onOpenChange={(open) => !open && setPendingAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pendingAction?.title}</AlertDialogTitle>
            <AlertDialogDescription>{pendingAction?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (pendingAction) {
                  await pendingAction.run();
                  setPendingAction(null);
                }
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
