import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { addEducation, updateEducation } from "@/features/profile/api/candidateApi";
import { toast } from "sonner";

interface EducationData {
    id?: string;
    school: string;
    degree: string;
    field_of_study?: string;
    start_date?: string;
    end_date?: string | null;
    is_current?: boolean;
    grade?: string;
    description?: string;
}

interface AddEducationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editData?: EducationData | null;
}

export function AddEducationModal({
    isOpen,
    onClose,
    onSuccess,
    editData,
}: AddEducationModalProps) {
    const [formData, setFormData] = useState<EducationData>(
        editData || {
            school: "",
            degree: "",
            field_of_study: "",
            start_date: "",
            end_date: null,
            is_current: false,
            grade: "",
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
                await updateEducation(editData.id, payload);
                toast.success("Education updated successfully");
            } else {
                await addEducation(payload);
                toast.success("Education added successfully");
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save education");
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
                        {editData ? "Edit Education" : "Add Education"}
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
                        <Label htmlFor="school">School *</Label>
                        <Input
                            id="school"
                            value={formData.school}
                            onChange={(e) =>
                                setFormData({ ...formData, school: e.target.value })
                            }
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="degree">Degree *</Label>
                        <Input
                            id="degree"
                            value={formData.degree}
                            onChange={(e) =>
                                setFormData({ ...formData, degree: e.target.value })
                            }
                            required
                            placeholder="e.g., Bachelor of Science"
                        />
                    </div>

                    <div>
                        <Label htmlFor="field_of_study">Field of Study</Label>
                        <Input
                            id="field_of_study"
                            value={formData.field_of_study}
                            onChange={(e) =>
                                setFormData({ ...formData, field_of_study: e.target.value })
                            }
                            placeholder="e.g., Computer Science"
                        />
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
                            I currently study here
                        </Label>
                    </div>

                    <div>
                        <Label htmlFor="grade">Grade/GPA</Label>
                        <Input
                            id="grade"
                            value={formData.grade}
                            onChange={(e) =>
                                setFormData({ ...formData, grade: e.target.value })
                            }
                            placeholder="e.g., 3.8 GPA"
                        />
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
                            placeholder="Describe your achievements, activities, etc..."
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
