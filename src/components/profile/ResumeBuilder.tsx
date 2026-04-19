import { useState } from "react";
import { FileText, Download, Plus, Trash2, GripVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { currentUser } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

interface ResumeSection {
  id: string;
  type: "experience" | "education" | "project";
  title: string;
  subtitle: string;
  period: string;
  description: string;
}

export default function ResumeBuilder() {
  const { toast } = useToast();
  const [name, setName] = useState(currentUser.name);
  const [title, setTitle] = useState(currentUser.title);
  const [email, setEmail] = useState("alex.morgan@email.com");
  const [phone, setPhone] = useState("+1 (555) 123-4567");
  const [summary, setSummary] = useState(
    "Passionate software engineer with 5+ years of experience building scalable web applications."
  );
  const [skills, setSkills] = useState(currentUser.skills?.join(", ") ?? "");
  const [sections, setSections] = useState<ResumeSection[]>([
    {
      id: "1",
      type: "experience",
      title: "Senior Software Engineer",
      subtitle: "TechFlow Inc.",
      period: "2022 - Present",
      description: "Leading frontend architecture for the main product platform.",
    },
    {
      id: "2",
      type: "experience",
      title: "Software Engineer",
      subtitle: "StartupX",
      period: "2019 - 2022",
      description: "Built core features and improved performance by 60%.",
    },
    {
      id: "3",
      type: "education",
      title: "BS Computer Science",
      subtitle: "State University",
      period: "2015 - 2019",
      description: "Dean's List, GPA 3.8",
    },
  ]);

  const [portfolioLinks, setPortfolioLinks] = useState([
    { label: "GitHub", url: "https://github.com/alexmorgan" },
    { label: "Portfolio", url: "https://alexmorgan.dev" },
  ]);

  const addSection = (type: ResumeSection["type"]) => {
    setSections([
      ...sections,
      { id: Date.now().toString(), type, title: "", subtitle: "", period: "", description: "" },
    ]);
  };

  const updateSection = (id: string, field: keyof ResumeSection, value: string) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const removeSection = (id: string) => {
    setSections(sections.filter((s) => s.id !== id));
  };

  const handleDownload = () => {
    // Generate text-based resume for download
    let resume = `${name}\n${title}\n${email} | ${phone}\n\n`;
    resume += `SUMMARY\n${summary}\n\n`;
    resume += `SKILLS\n${skills}\n\n`;

    const experience = sections.filter((s) => s.type === "experience");
    if (experience.length) {
      resume += "EXPERIENCE\n";
      experience.forEach((s) => {
        resume += `${s.title} — ${s.subtitle} (${s.period})\n${s.description}\n\n`;
      });
    }

    const education = sections.filter((s) => s.type === "education");
    if (education.length) {
      resume += "EDUCATION\n";
      education.forEach((s) => {
        resume += `${s.title} — ${s.subtitle} (${s.period})\n${s.description}\n\n`;
      });
    }

    const projects = sections.filter((s) => s.type === "project");
    if (projects.length) {
      resume += "PROJECTS\n";
      projects.forEach((s) => {
        resume += `${s.title} — ${s.subtitle} (${s.period})\n${s.description}\n\n`;
      });
    }

    if (portfolioLinks.length) {
      resume += "LINKS\n";
      portfolioLinks.forEach((l) => {
        resume += `${l.label}: ${l.url}\n`;
      });
    }

    const blob = new Blob([resume], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.replace(/\s/g, "_")}_Resume.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: "Resume downloaded!", description: "Your resume has been saved as a text file." });
  };

  const sectionLabel = (type: ResumeSection["type"]) =>
    type === "experience" ? "Experience" : type === "education" ? "Education" : "Project";

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold font-display text-foreground">Resume Builder</h2>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
      </div>

      {/* Personal Info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Full Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Phone</label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-xl" />
        </div>
      </div>

      {/* Summary */}
      <div>
        <label className="text-sm font-medium text-foreground mb-1 block">Professional Summary</label>
        <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} className="rounded-xl" rows={3} />
      </div>

      {/* Skills */}
      <div>
        <label className="text-sm font-medium text-foreground mb-1 block">Skills (comma-separated)</label>
        <Input value={skills} onChange={(e) => setSkills(e.target.value)} className="rounded-xl" />
      </div>

      {/* Sections */}
      {(["experience", "education", "project"] as const).map((type) => {
        const items = sections.filter((s) => s.type === type);
        return (
          <div key={type}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">{sectionLabel(type)}</h3>
              <button
                onClick={() => addSection(type)}
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <Plus className="h-3 w-3" /> Add
              </button>
            </div>
            <div className="space-y-4">
              {items.map((section) => (
                <div key={section.id} className="rounded-xl border border-border p-4 space-y-3 relative group">
                  <button
                    onClick={() => removeSection(section.id)}
                    className="absolute top-3 right-3 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      placeholder="Title"
                      value={section.title}
                      onChange={(e) => updateSection(section.id, "title", e.target.value)}
                      className="rounded-xl"
                    />
                    <Input
                      placeholder="Organization"
                      value={section.subtitle}
                      onChange={(e) => updateSection(section.id, "subtitle", e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <Input
                    placeholder="Period (e.g. 2020 - Present)"
                    value={section.period}
                    onChange={(e) => updateSection(section.id, "period", e.target.value)}
                    className="rounded-xl"
                  />
                  <Textarea
                    placeholder="Description"
                    value={section.description}
                    onChange={(e) => updateSection(section.id, "description", e.target.value)}
                    className="rounded-xl"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Portfolio Links */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Portfolio Links</h3>
          <button
            onClick={() => setPortfolioLinks([...portfolioLinks, { label: "", url: "" }])}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>
        <div className="space-y-3">
          {portfolioLinks.map((link, i) => (
            <div key={i} className="flex gap-3 items-center">
              <Input
                placeholder="Label (e.g. GitHub)"
                value={link.label}
                onChange={(e) => {
                  const updated = [...portfolioLinks];
                  updated[i] = { ...updated[i], label: e.target.value };
                  setPortfolioLinks(updated);
                }}
                className="rounded-xl w-1/3"
              />
              <Input
                placeholder="URL"
                value={link.url}
                onChange={(e) => {
                  const updated = [...portfolioLinks];
                  updated[i] = { ...updated[i], url: e.target.value };
                  setPortfolioLinks(updated);
                }}
                className="rounded-xl flex-1"
              />
              <button
                onClick={() => setPortfolioLinks(portfolioLinks.filter((_, idx) => idx !== i))}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
