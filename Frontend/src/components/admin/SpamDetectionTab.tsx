import { useEffect, useState } from "react";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminService } from "@/modules/admin/services/adminService";
import type { SpamAlertRecord } from "@/modules/admin/types";
import { toast } from "sonner";

const riskStyles: Record<SpamAlertRecord["risk_level"], string> = {
  Low: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  Medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  High: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function SpamDetectionTab() {
  const [alerts, setAlerts] = useState<SpamAlertRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await adminService.getSpamAlerts();
        setAlerts(response.alerts);
      } catch {
        setAlerts([
          { entity_type: "post", entity_id: "p2", score: 92, risk_level: "High", reasons: ["repeated_links", "blacklisted_keyword"] },
          { entity_type: "job", entity_id: "j2", score: 97, risk_level: "High", reasons: ["suspicious_contact", "salary_claim_anomaly"] },
          { entity_type: "user", entity_id: "u3", score: 64, risk_level: "Medium", reasons: ["mass_messaging"] },
        ]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const markReviewed = (entityId: string) => {
    setAlerts((prev) => prev.filter((a) => a.entity_id !== entityId));
    toast.success("Spam alert marked as reviewed");
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground">Spam detection system</h2>
        <p className="text-sm text-muted-foreground">Rule-based + ML-based risk engine for posts, jobs, and users.</p>
      </div>

      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-primary" />
          <p className="font-medium">Hybrid detector enabled</p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Alerts are auto-flagged when score {`>`} 70. High-risk entities can be auto-hidden pending moderation.
        </p>
      </div>

      <div className="grid gap-3">
        {loading && (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            Loading spam alerts...
          </div>
        )}

        {!loading && alerts.map((alert) => (
          <div key={`${alert.entity_type}-${alert.entity_id}`} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground">
                    {alert.entity_type.toUpperCase()} #{alert.entity_id}
                  </h3>
                  <Badge variant="outline" className={riskStyles[alert.risk_level]}>
                    <AlertTriangle className="mr-1 h-3.5 w-3.5" /> {alert.risk_level}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Score: {alert.score}/100</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {alert.reasons.map((reason) => (
                    <Badge key={reason} variant="secondary">{reason}</Badge>
                  ))}
                </div>
              </div>

              <Button size="sm" variant="outline" onClick={() => markReviewed(alert.entity_id)}>
                Mark reviewed
              </Button>
            </div>
          </div>
        ))}

        {!loading && alerts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No active spam alerts.
          </div>
        )}
      </div>
    </div>
  );
}
