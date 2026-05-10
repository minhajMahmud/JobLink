import { useState, useEffect } from "react";
import { X, Check, AlertCircle, ChevronRight, Plus, Trash2, Briefcase, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { updateCandidateProfile, addExperience, updateExperience, deleteExperience, addEducation, updateEducation, deleteEducation } from "@/features/profile/api/candidateApi";

interface Experience {
  id?: string;
  title: string;
  company: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  description?: string;
}

interface Education {
  id?: string;
  degree: string;
  school: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  description?: string;
  grade?: string;
}

interface CandidateProfile {
  first_name?: string;
  last_name?: string;
  bio?: string;
  headline?: string;
  location?: string;
  website?: string;
  phone?: string;
  experience_years?: number;
  education_level?: string;
  skills?: string[];
  availability_status?: string;
  experience?: Experience[];
  education?: Education[];
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData?: CandidateProfile;
  onSave?: (data: CandidateProfile) => void;
  initialSection?: FormSection;
}

type FormSection = "personal" | "professional" | "experience" | "education" | "preferences";

const sections: { id: FormSection; label: string; icon: string }[] = [
  { id: "personal", label: "Personal Info", icon: "👤" },
  { id: "professional", label: "Professional", icon: "💼" },
  { id: "experience", label: "Experience", icon: "💼" },
  { id: "education", label: "Education", icon: "🎓" },
  { id: "preferences", label: "Preferences", icon: "⚙️" },
];

const emptyExperience = (): Experience => ({
  title: "",
  company: "",
  start_date: "",
  end_date: "",
  is_current: false,
  description: "",
});

const emptyEducation = (): Education => ({
  degree: "",
  school: "",
  field_of_study: "",
  start_date: "",
  end_date: "",
  is_current: false,
  description: "",
  grade: "",
});

export default function EditProfileModal({
  isOpen,
  onClose,
  profileData,
  onSave,
  initialSection = "personal",
}: EditProfileModalProps) {
  const [activeSection, setActiveSection] = useState<FormSection>(initialSection);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    bio: "",
    headline: "",
    location: "",
    website: "",
    phone: "",
    experience_years: 0,
    education_level: "Bachelor",
    skills: "",
    availability_status: "Open to opportunities",
  });
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);

  // Reset form data when modal opens with new profile data
  useEffect(() => {
    if (isOpen) {
      setActiveSection(initialSection);
      setError("");
      setSuccess(false);
      setFormData({
        first_name: profileData?.first_name || "",
        last_name: profileData?.last_name || "",
        bio: profileData?.bio || "",
        headline: profileData?.headline || "",
        location: profileData?.location || "",
        website: profileData?.website || "",
        phone: profileData?.phone || "",
        experience_years: profileData?.experience_years || 0,
        education_level: profileData?.education_level || "Bachelor",
        skills: Array.isArray(profileData?.skills)
          ? profileData.skills.join(", ")
          : "",
        availability_status: profileData?.availability_status || "Open to opportunities",
      });
      setExperiences(profileData?.experience?.length ? profileData.experience.map(e => ({ ...e })) : [emptyExperience()]);
      setEducations(profileData?.education?.length ? profileData.education.map(e => ({ ...e })) : [emptyEducation()]);
    }
  }, [isOpen, initialSection, profileData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) {
      setError("");
    }
  };

  const handleExpChange = (idx: number, field: keyof Experience, value: string | boolean) => {
    setExperiences(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  };

  const handleEduChange = (idx: number, field: keyof Education, value: string | boolean) => {
    setEducations(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  };

  const addExperienceRow = () => setExperiences(prev => [...prev, emptyExperience()]);
  const removeExperienceRow = (idx: number) => setExperiences(prev => prev.filter((_, i) => i !== idx));
  const addEducationRow = () => setEducations(prev => [...prev, emptyEducation()]);
  const removeEducationRow = (idx: number) => setEducations(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const storedAuth = localStorage.getItem("joblink.auth.user");
      if (!storedAuth) {
        setError("Please log in again to update your profile");
        setLoading(false);
        return;
      }

      let authUser;
      try {
        authUser = JSON.parse(storedAuth);
      } catch {
        setError("Authentication data corrupted. Please log in again.");
        setLoading(false);
        localStorage.removeItem("joblink.auth.user");
        return;
      }

      if (!authUser?.id) {
        setError("User session expired. Please log in again.");
        setLoading(false);
        localStorage.removeItem("joblink.auth.user");
        return;
      }

      const userId = String(authUser.id).trim();
      if (!userId || userId === "undefined" || userId === "null") {
        setError("Invalid authentication. Please log in again.");
        setLoading(false);
        localStorage.removeItem("joblink.auth.user");
        return;
      }

      const submitData = {
        ...formData,
        skills: formData.skills
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
        experience_years: parseInt(String(formData.experience_years), 10),
      };

      const response = await updateCandidateProfile(submitData);

      if (response.status) {
        // Save experiences
        for (const exp of experiences) {
          if (!exp.title && !exp.company) continue;
          if (exp.id) {
            await updateExperience(exp.id, { ...exp, is_current: exp.is_current ? 1 : 0 });
          } else {
            await addExperience({ ...exp, is_current: exp.is_current ? 1 : 0 });
          }
        }

        // Save educations
        for (const edu of educations) {
          if (!edu.degree && !edu.school) continue;
          if (edu.id) {
            await updateEducation(edu.id, { ...edu, is_current: edu.is_current ? 1 : 0 });
          } else {
            await addEducation({ ...edu, is_current: edu.is_current ? 1 : 0 });
          }
        }

        setSuccess(true);
        setTimeout(() => {
          if (onSave) {
            onSave(response.data);
          }
          onClose();
        }, 1500);
      } else {
        setError(response.message || "Failed to update profile");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred while updating profile";
      console.error("Profile update error:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-4xl rounded-2xl border border-border/20 bg-card shadow-2xl overflow-hidden"
            >
            {/* Header with Gradient Background */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 px-8 py-8">
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
              
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">Edit Profile</h2>
                  <p className="text-blue-100 text-sm mt-2">Update your professional information</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 transition-colors text-white backdrop-blur-sm"
                  title="Close"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Section Navigation */}
            <div className="border-b border-border/30 bg-secondary/50">
              <div className="flex overflow-x-auto">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex-1 px-4 py-4 text-center text-xs sm:text-sm font-semibold transition-all relative whitespace-nowrap ${
                      activeSection === section.id
                        ? "text-blue-600 bg-white/60"
                        : "text-muted-foreground hover:text-foreground bg-transparent"
                    }`}
                  >
                    <span className="mr-1">{section.icon}</span>
                    {section.label}
                    {activeSection === section.id && (
                      <motion.div
                        layoutId="underline"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="max-h-[65vh] overflow-y-auto">
              <div className="px-8 py-8">
                {/* Success Message */}
                <AnimatePresence>
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mb-6 flex gap-3 rounded-lg bg-green-500/10 border border-green-500/30 p-4 items-center"
                    >
                      <div className="flex-shrink-0">
                        <Check className="h-5 w-5 text-green-600" />
                      </div>
                      <p className="text-sm font-medium text-green-700">Profile updated successfully!</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mb-6 flex gap-3 rounded-lg bg-destructive/10 border border-destructive/30 p-4 items-center"
                    >
                      <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                      <p className="text-sm text-destructive font-medium">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Personal Info Section */}
                <AnimatePresence mode="wait">
                  {activeSection === "personal" && (
                    <motion.div
                      key="personal"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="first_name" className="block text-sm font-semibold text-foreground mb-2.5">
                            First Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="first_name"
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            placeholder="John"
                            className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="last_name" className="block text-sm font-semibold text-foreground mb-2.5">
                            Last Name
                          </label>
                          <input
                            id="last_name"
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            placeholder="Doe"
                            className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="location" className="block text-sm font-semibold text-foreground mb-2.5">
                          Location
                        </label>
                        <input
                          id="location"
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          placeholder="New York, USA"
                          className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-semibold text-foreground mb-2.5">
                          Phone
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+1 (555) 000-0000"
                          className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label htmlFor="website" className="block text-sm font-semibold text-foreground mb-2.5">
                          Website
                        </label>
                        <input
                          id="website"
                          type="url"
                          name="website"
                          value={formData.website}
                          onChange={handleChange}
                          placeholder="https://yourwebsite.com"
                          className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Professional Section */}
                <AnimatePresence mode="wait">
                  {activeSection === "professional" && (
                    <motion.div
                      key="professional"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <label htmlFor="headline" className="block text-sm font-semibold text-foreground mb-2.5">
                          Professional Headline
                        </label>
                        <input
                          id="headline"
                          type="text"
                          name="headline"
                          value={formData.headline}
                          onChange={handleChange}
                          placeholder="e.g., Senior Software Engineer at TechFlow"
                          className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label htmlFor="bio" className="block text-sm font-semibold text-foreground mb-2.5">
                          About You
                        </label>
                        <textarea
                          id="bio"
                          name="bio"
                          value={formData.bio}
                          onChange={handleChange}
                          placeholder="Tell us about your background, interests, and goals..."
                          rows={5}
                          className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                        />
                      </div>

                      <div>
                        <label htmlFor="skills" className="block text-sm font-semibold text-foreground mb-2.5">
                          Skills
                        </label>
                        <p className="text-xs text-muted-foreground mb-2">Separate skills with commas</p>
                        <textarea
                          id="skills"
                          name="skills"
                          value={formData.skills}
                          onChange={handleChange}
                          placeholder="React, TypeScript, Node.js, PostgreSQL, AWS"
                          rows={3}
                          className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="experience_years" className="block text-sm font-semibold text-foreground mb-2.5">
                            Years of Experience
                          </label>
                          <input
                            id="experience_years"
                            type="number"
                            name="experience_years"
                            value={formData.experience_years}
                            onChange={handleChange}
                            min="0"
                            className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                        </div>
                        <div>
                          <label htmlFor="education_level" className="block text-sm font-semibold text-foreground mb-2.5">
                            Education Level
                          </label>
                          <select
                            id="education_level"
                            name="education_level"
                            value={formData.education_level}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                          >
                            <option value="High School">High School</option>
                            <option value="Bachelor">Bachelor</option>
                            <option value="Master">Master</option>
                            <option value="PhD">PhD</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Experience Section */}
                <AnimatePresence mode="wait">
                  {activeSection === "experience" && (
                    <motion.div
                      key="experience"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                          <Briefcase className="h-5 w-5 text-blue-500" /> Work Experience
                        </h3>
                        <button
                          type="button"
                          onClick={addExperienceRow}
                          className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Plus className="h-4 w-4" /> Add Experience
                        </button>
                      </div>

                      {experiences.map((exp, idx) => (
                        <div key={idx} className="relative p-5 border border-border rounded-xl bg-background/30 space-y-4">
                          {experiences.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeExperienceRow(idx)}
                              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                              title="Remove"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-foreground mb-1.5">Job Title *</label>
                              <input
                                type="text"
                                value={exp.title}
                                onChange={(e) => handleExpChange(idx, "title", e.target.value)}
                                placeholder="Senior Software Engineer"
                                className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-foreground mb-1.5">Company *</label>
                              <input
                                type="text"
                                value={exp.company}
                                onChange={(e) => handleExpChange(idx, "company", e.target.value)}
                                placeholder="TechFlow Inc."
                                className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-foreground mb-1.5">Start Date</label>
                              <input
                                type="text"
                                value={exp.start_date || ""}
                                onChange={(e) => handleExpChange(idx, "start_date", e.target.value)}
                                placeholder="Oct 2022"
                                className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-foreground mb-1.5">End Date</label>
                              <input
                                type="text"
                                value={exp.end_date || ""}
                                onChange={(e) => handleExpChange(idx, "end_date", e.target.value)}
                                placeholder="Present"
                                className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                          <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                            <input
                              type="checkbox"
                              checked={exp.is_current || false}
                              onChange={(e) => handleExpChange(idx, "is_current", e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            I currently work here
                          </label>
                          <div>
                            <label className="block text-xs font-semibold text-foreground mb-1.5">Description</label>
                            <textarea
                              value={exp.description || ""}
                              onChange={(e) => handleExpChange(idx, "description", e.target.value)}
                              placeholder="Describe your responsibilities and achievements..."
                              rows={3}
                              className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            />
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Education Section */}
                <AnimatePresence mode="wait">
                  {activeSection === "education" && (
                    <motion.div
                      key="education"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                          <GraduationCap className="h-5 w-5 text-purple-500" /> Education
                        </h3>
                        <button
                          type="button"
                          onClick={addEducationRow}
                          className="flex items-center gap-1 text-sm font-semibold text-purple-600 hover:text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Plus className="h-4 w-4" /> Add Education
                        </button>
                      </div>

                      {educations.map((edu, idx) => (
                        <div key={idx} className="relative p-5 border border-border rounded-xl bg-background/30 space-y-4">
                          {educations.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeEducationRow(idx)}
                              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                              title="Remove"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-foreground mb-1.5">Degree *</label>
                              <input
                                type="text"
                                value={edu.degree}
                                onChange={(e) => handleEduChange(idx, "degree", e.target.value)}
                                placeholder="B.S. Computer Science"
                                className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-foreground mb-1.5">School *</label>
                              <input
                                type="text"
                                value={edu.school}
                                onChange={(e) => handleEduChange(idx, "school", e.target.value)}
                                placeholder="MIT"
                                className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-foreground mb-1.5">Field of Study</label>
                              <input
                                type="text"
                                value={edu.field_of_study || ""}
                                onChange={(e) => handleEduChange(idx, "field_of_study", e.target.value)}
                                placeholder="Computer Science"
                                className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-foreground mb-1.5">Grade</label>
                              <input
                                type="text"
                                value={edu.grade || ""}
                                onChange={(e) => handleEduChange(idx, "grade", e.target.value)}
                                placeholder="3.8/4.0"
                                className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-foreground mb-1.5">Start Date</label>
                              <input
                                type="text"
                                value={edu.start_date || ""}
                                onChange={(e) => handleEduChange(idx, "start_date", e.target.value)}
                                placeholder="Sep 2015"
                                className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-foreground mb-1.5">End Date</label>
                              <input
                                type="text"
                                value={edu.end_date || ""}
                                onChange={(e) => handleEduChange(idx, "end_date", e.target.value)}
                                placeholder="May 2019"
                                className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                          <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                            <input
                              type="checkbox"
                              checked={edu.is_current || false}
                              onChange={(e) => handleEduChange(idx, "is_current", e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            I currently study here
                          </label>
                          <div>
                            <label className="block text-xs font-semibold text-foreground mb-1.5">Description</label>
                            <textarea
                              value={edu.description || ""}
                              onChange={(e) => handleEduChange(idx, "description", e.target.value)}
                              placeholder="Describe your studies, honors, activities..."
                              rows={2}
                              className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            />
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Preferences Section */}
                <AnimatePresence mode="wait">
                  {activeSection === "preferences" && (
                    <motion.div
                      key="preferences"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <label htmlFor="availability_status" className="block text-sm font-semibold text-foreground mb-2.5">
                          Job Search Status
                        </label>
                        <select
                          id="availability_status"
                          name="availability_status"
                          value={formData.availability_status}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                        >
                          <option value="Actively looking">🔥 Actively Looking</option>
                          <option value="Open to opportunities">🤔 Open to Opportunities</option>
                          <option value="Passive">😌 Passive</option>
                          <option value="Not interested">❌ Not Interested</option>
                        </select>
                      </div>

                      <div className="bg-blue-50/50 dark:bg-blue-900/20 rounded-xl p-5 border border-blue-200/50 dark:border-blue-800/30">
                        <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-200 mb-2">💡 Pro Tip</h3>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          Keep your profile updated regularly to appear higher in recruiter searches and increase your chances of landing your dream job.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="border-t border-border/30 bg-secondary/30 px-8 py-6 flex items-center justify-between gap-4 sticky bottom-0">
              <p className="text-xs text-muted-foreground">
                {activeSection === "personal" && "Step 1 of 5: Personal Information"}
                {activeSection === "professional" && "Step 2 of 5: Professional Details"}
                {activeSection === "experience" && "Step 3 of 5: Work Experience"}
                {activeSection === "education" && "Step 4 of 5: Education"}
                {activeSection === "preferences" && "Step 5 of 5: Job Preferences"}
              </p>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  disabled={loading || success}
                  className="px-6 py-2.5 rounded-xl border border-border bg-background text-foreground hover:bg-secondary transition-colors disabled:opacity-50 font-medium"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading || success}
                  className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-700 hover:to-cyan-600 transition-all disabled:opacity-50 font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  {success ? (
                    <>
                      <Check className="h-5 w-5" />
                      Saved!
                    </>
                  ) : loading ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Save Changes
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </motion.button>
              </div>
            </div>
            </form>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}