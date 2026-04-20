import React, { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Video, AlertCircle, Check } from "lucide-react";
import type { Interview, InterviewType, InterviewRound } from "@/modules/recruiter/types";

interface InterviewSchedulerProps {
  candidateId: string;
  jobId: string;
  onSchedule?: (interview: Interview) => void;
  loading?: boolean;
}

const INTERVIEW_TYPES: InterviewType[] = ["Virtual", "In-Person", "Phone", "Technical"];
const INTERVIEW_ROUNDS: InterviewRound[] = ["Screening", "Technical", "HR", "Final"];

export const InterviewScheduler: React.FC<InterviewSchedulerProps> = ({
  candidateId,
  jobId,
  onSchedule,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    type: "Virtual" as InterviewType,
    round: "Screening" as InterviewRound,
    duration_minutes: 30,
    scheduled_at: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    location: "",
    agenda: "",
  });

  const [step, setStep] = useState<"details" | "slots" | "confirm">("details");
  const [availableSlots, setAvailableSlots] = useState<
    Array<{ start: string; end: string; available: boolean }>
  >([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  useEffect(() => {
    // Fetch available slots when date is selected
    if (formData.scheduled_at) {
      fetchAvailableSlots();
    }
  }, [formData.scheduled_at, formData.duration_minutes]);

  const fetchAvailableSlots = async () => {
    // Mock available slots
    const times = [];
    for (let hour = 9; hour < 18; hour++) {
      times.push({
        start: `${hour.toString().padStart(2, "0")}:00`,
        end: `${hour.toString().padStart(2, "0")}:30`,
        available: Math.random() > 0.3,
      });
      times.push({
        start: `${hour.toString().padStart(2, "0")}:30`,
        end: `${(hour + 1).toString().padStart(2, "0")}:00`,
        available: Math.random() > 0.3,
      });
    }
    setAvailableSlots(times);
  };

  const handleSchedule = async () => {
    if (!selectedSlot) return;

    const interview: Interview = {
      id: `int-${Date.now()}`,
      candidate_id: candidateId,
      job_id: jobId,
      recruiter_id: "current-recruiter",
      type: formData.type,
      round: formData.round,
      duration_minutes: formData.duration_minutes,
      scheduled_at: `${formData.scheduled_at}T${selectedSlot}`,
      timezone: formData.timezone,
      location: formData.type === "In-Person" ? formData.location : undefined,
      agenda: formData.agenda,
      status: "Scheduled",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onSchedule?.(interview);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h2 className="text-xl font-bold text-white">Schedule Interview</h2>
          <p className="text-blue-100 text-sm">Candidate #{candidateId.slice(0, 8)}</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-between">
            {["details", "slots", "confirm"].map((s, i) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step === s
                      ? "bg-blue-600 text-white"
                      : i < ["details", "slots", "confirm"].indexOf(step)
                        ? "bg-green-600 text-white"
                        : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {i < ["details", "slots", "confirm"].indexOf(step) ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                {i < 2 && (
                  <div className={`flex-1 h-1 mx-2 ${step === s ? "bg-blue-600" : "bg-slate-300"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step: Interview Details */}
          {step === "details" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Interview Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as InterviewType })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    aria-label="Interview type"
                  >
                    {INTERVIEW_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Round</label>
                  <select
                    value={formData.round}
                    onChange={(e) => setFormData({ ...formData, round: e.target.value as InterviewRound })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    aria-label="Interview round"
                  >
                    {INTERVIEW_ROUNDS.map((round) => (
                      <option key={round} value={round}>
                        {round}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.scheduled_at}
                    onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                     placeholder="Select interview date"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="120"
                    step="15"
                    value={formData.duration_minutes}
                    onChange={(e) =>
                      setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })
                    }
                     placeholder="30"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {formData.type === "In-Person" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                  <input
                    type="text"
                    placeholder="Office address, meeting room, etc."
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Agenda</label>
                <textarea
                  placeholder="What will you discuss in this interview?"
                  value={formData.agenda}
                  onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Step: Select Time Slot */}
          {step === "slots" && (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">Select a time slot on {formData.scheduled_at}</p>
              <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                {availableSlots.map((slot) => (
                  <button
                    key={`${slot.start}-${slot.end}`}
                    onClick={() =>
                      slot.available && setSelectedSlot(slot.start)
                    }
                    disabled={!slot.available}
                    className={`p-3 rounded-lg border-2 font-medium text-sm transition-all ${
                      selectedSlot === slot.start
                        ? "border-blue-600 bg-blue-50 text-blue-900"
                        : slot.available
                          ? "border-slate-300 hover:border-blue-500"
                          : "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                    }`}
                    title={slot.available ? `${slot.start} - ${slot.end}` : "Slot unavailable"}
                  >
                    {slot.start}
                  </button>
                ))}
              </div>
              {selectedSlot && (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-green-900">
                    Selected: {formData.scheduled_at} at {selectedSlot}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Step: Confirm */}
          {step === "confirm" && (
            <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-slate-600" />
                <span className="text-sm font-medium text-slate-900">
                  {formData.scheduled_at} at {selectedSlot}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-slate-600" />
                <span className="text-sm font-medium text-slate-900">{formData.duration_minutes} minutes</span>
              </div>
              <div className="flex items-center gap-2">
                {formData.type === "Virtual" ? (
                  <Video className="h-5 w-5 text-slate-600" />
                ) : (
                  <MapPin className="h-5 w-5 text-slate-600" />
                )}
                <span className="text-sm font-medium text-slate-900">
                  {formData.type} - {formData.round} Round
                </span>
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex gap-2 pt-4 border-t border-slate-200">
            {step !== "details" && (
              <button
                onClick={() => setStep(step === "slots" ? "details" : "slots")}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-900 font-medium hover:bg-slate-50"
              >
                Back
              </button>
            )}
            <button
              onClick={() => {
                if (step === "details" && formData.scheduled_at) setStep("slots");
                else if (step === "slots" && selectedSlot) setStep("confirm");
                else if (step === "confirm") handleSchedule();
              }}
              disabled={
                (step === "details" && !formData.scheduled_at) ||
                (step === "slots" && !selectedSlot) ||
                loading
              }
              className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-slate-300"
            >
              {step === "confirm" ? "Confirm & Schedule" : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewScheduler;
