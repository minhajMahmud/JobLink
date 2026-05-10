import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { addExperience, updateExperience } from "@/features/profile/api/candidateApi";
import { toast } from "sonner";

interface ExperienceData {
    id?: string;
    title: string;
    company: string;
    location?: string;
    employment_type?: string;
    start_date?: string;
    end_date?: string | null;
    is_current?: boolean;
    description?: string;
}

interface AddExperienceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editData?: ExperienceData | null;
}

export function AddExperienceModal({
    isOpen,
    onClose,
    onSuccess,
    editData,
}: AddExperienceModalProps) {
    const [formData, setFormData] = useState<ExperienceData>(
        editData || {
            title: "",
            company: "",
            location: "",
            employment_type: "Full-time",
            start_date: "",
            end_date: null,
            is_current: false,
            description: "",
        }
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                ...formData,
                is_current: formData.is_current ? 1 : 0,
                end_date: formData.is_current ? null : formData.end_date,
            };

            if (editData?.id) {
                await updateExperience(editData.id, payload);
                toast.success("Experience updated successfully");
            } else {
                await addExperience(payload);
                toast.success("Experience added successfully");
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save experience");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold">
                        {editData ? "Edit Experience" : "Add Experience"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({ ...formData, title: e.target.value })
                            }
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="company">Company *</Label>
                        <Input
                            id="company"
                            value={formData.company}
                            onChange={(e) =>
                                setFormData({ ...formData, company: e.target.value })
                            }
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) =>
                                setFormData({ ...formData, location: e.target.value })
                            }
                        />
                    </div>

                    <div>
                        <Label htmlFor="employment_type">Employment Type</Label>
                        <Select
                            value={formData.employment_type}
                            onValueChange={(value) =>
                                setFormData({ ...formData, employment_type: value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Full-time">Full-time</SelectItem>
                                <SelectItem value="Part-time">Part-time</SelectItem>
                                <SelectItem value="Contract">Contract</SelectItem>
                                <SelectItem value="Freelance">Freelance</SelectItem>
                                <SelectItem value="Internship">Internship</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="start_date">Start Date *</Label>
                            <Input
                                id="start_date"
                                type="date"
                                value={formData.start_date}
                                onChange={(e) =>
                                    setFormData({ ...formData, start_date: e.target.value })
                                }
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="end_date">End Date</Label>
                            <Input
                                id="end_date"
                                type="date"
                                value={formData.end_date || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, end_date: e.target.value })
                                }
                                disabled={formData.is_current}
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="is_current"
                            checked={formData.is_current}
                            onCheckedChange={(checked) =>
                                setFormData({ ...formData, is_current: checked as boolean })
                            }
                        />
                        <Label htmlFor="is_current" className="cursor-pointer">
                            I currently work here
                        </Label>
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            rows={4}
                            placeholder="Describe your responsibilities and achievements..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : editData ? "Update" : "Add"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
