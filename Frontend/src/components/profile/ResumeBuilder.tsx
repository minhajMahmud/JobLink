import React, { useState, useRef, useCallback, useEffect } from "react";
import type { ElementType } from "react";
import { getCandidateResume, updateCandidateResume } from "@/features/profile/api/candidateApi";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type Theme = "classic" | "modern" | "creative" | "developer" | "executive";

interface ResumeSection {
  id: string;
  type: "experience" | "education" | "project" | "certification";
  title: string;
  subtitle: string;
  period: string;
  description: string;
  link?: string;
}

interface ResumeHeaders {
  summary: string;
  experience: string;
  education: string;
  project: string;
  skills: string;
  languages: string;
  certifications: string;
  contact: string;
}

// ─────────────────────────────────────────────
// Icon components (inline SVG, no lucide-react dep)
// ─────────────────────────────────────────────
const Icon = ({
  d,
  size = 16,
  className = "",
}: {
  d: string;
  size?: number;
  className?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d={d} />
  </svg>
);

const DownloadIcon = () => (
  <Icon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
);
const PlusIcon = () => <Icon d="M12 5v14M5 12h14" />;
const Trash2Icon = () => (
  <Icon d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
);
const FileDownIcon = () => (
  <Icon d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M12 18v-6M9 15l3 3 3-3" />
);
const CheckCircle2Icon = () => (
  <Icon d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7l-3-3 1.414-1.414L11 12.172l4.586-4.586L17 9l-6 6z" />
);
const ColumnsIcon = () => (
  <Icon d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M9 3v18M15 3v18" />
);
const AlignLeftIcon = () => (
  <Icon d="M3 6h18M3 12h12M3 18h15" />
);
const TerminalIcon = () => (
  <Icon d="M4 17l6-6-6-6M12 19h8" />
);
const PaletteIcon = () => (
  <Icon d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8z" />
);
const UploadIcon = () => (
  <Icon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
);
const BotIcon = () => (
  <Icon d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2zM9 14v2M15 14v2" />
);
const BriefcaseIcon = () => (
  <Icon d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
);
const LayoutTemplateIcon = () => (
  <Icon d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
);
const SparklesIcon = () => (
  <Icon d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
);
const ImageIcon = () => (
  <Icon d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 21" />
);

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function escHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function bulletsHtml(text: string): string {
  if (!text) return "";
  return text
    .split("\n")
    .filter((s) => s.trim().length > 0)
    .map(
      (s) =>
        `<li>${escHtml(s.trim())}${s.trim().endsWith(".") ? "" : "."}</li>`
    )
    .join("");
}

// Simple toast hook (no external dep)
function useToast() {
  const [toasts, setToasts] = useState<
    { id: string; title: string; description?: string; variant?: "destructive" }[]
  >([]);

  const toast = useCallback(
    ({
      title,
      description,
      variant,
    }: {
      title: string;
      description?: string;
      variant?: "destructive";
    }) => {
      const id = Date.now().toString();
      setToasts((prev) => [...prev, { id, title, description, variant }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
    },
    []
  );

  const ToastContainer = () => (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium border animate-fade-in ${
            t.variant === "destructive"
              ? "bg-red-600 text-white border-red-700"
              : "bg-zinc-900 text-white border-zinc-700"
          }`}
        >
          <div className="font-bold">{t.title}</div>
          {t.description && (
            <div className="text-xs opacity-80 mt-0.5">{t.description}</div>
          )}
        </div>
      ))}
    </div>
  );

  return { toast, ToastContainer };
}

// ─────────────────────────────────────────────
// Default data
// ─────────────────────────────────────────────
const DEFAULT_SECTIONS: ResumeSection[] = [
  {
    id: "1",
    type: "experience",
    title: "Senior Software Engineer",
    subtitle: "TechFlow Inc.",
    period: "Oct 2022 - Present",
    description:
      "Spearheaded the migration of a legacy monolithic application to a microservices architecture, reducing system latency by 40%.\nMentored a team of 5 junior developers, improving sprint velocity by 25% over two quarters.\nEngineered a highly available distributed caching system utilizing Redis, handling over 10k requests per second.",
  },
  {
    id: "2",
    type: "experience",
    title: "Software Engineer",
    subtitle: "StartupX",
    period: "Jan 2019 - Sep 2022",
    description:
      "Developed and deployed core features for the main SaaS product, directly contributing to a 60% increase in user retention.\nOrchestrated secure, zero-downtime database migrations for over 2TB of relational data using PostgreSQL.\nCollaborated cross-functionally with product and design teams to deliver 15+ major releases ahead of schedule.",
  },
  {
    id: "3",
    type: "education",
    title: "Bachelor of Science in Computer Science",
    subtitle: "Massachusetts Institute of Technology",
    period: "Sep 2015 - May 2019",
    description:
      "Graduated with Honors. GPA: 3.8/4.0\nPresident of the AI & Robotics Club, organizing campus-wide hackathons for 500+ attendees.",
  },
  {
    id: "4",
    type: "project",
    title: "OpenSource Protocol",
    subtitle: "React, Node.js, Redis",
    period: "2021",
    description:
      "Developed an open-source distributed caching system utilized by 50+ enterprise companies.\nGarnered over 1,200 stars on GitHub and recognized in the top 10 trending repositories for TypeScript.",
    link: "github.com/alexmorgan/open",
  },
  {
    id: "5",
    type: "certification",
    title: "AWS Certified Solutions Architect – Professional",
    subtitle: "Amazon Web Services",
    period: "2023",
    description:
      "Validated advanced technical skills and experience in designing distributed applications and systems on the AWS platform.",
  },
];

const DEFAULT_HEADERS: ResumeHeaders = {
  summary: "Professional Summary",
  experience: "Professional Experience",
  education: "Education",
  project: "Selected Projects",
  skills: "Technical Skills",
  languages: "Languages",
  certifications: "Certifications",
  contact: "Contact",
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export default function ResumeBuilder() {
  const { toast, ToastContainer } = useToast();

  // ── State ──────────────────────────────────
  const [theme, setTheme] = useState<Theme>("executive");
  const [includeAvatar, setIncludeAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  const [name, setName] = useState("Alex Morgan");
  const [jobTitle, setJobTitle] = useState("Senior Software Engineer");
  const [email, setEmail] = useState("alex.morgan@email.com");
  const [phone, setPhone] = useState("+1 (555) 123-4567");
  const [address, setAddress] = useState("San Francisco, CA");
  const [linkedin, setLinkedin] = useState("linkedin.com/in/alexmorgan");
  const [github, setGithub] = useState("github.com/alexmorgan");

  const [summary, setSummary] = useState(
    "Results-driven Software Engineer with 5+ years of experience engineering scalable web applications and distributed systems. Proven track record of leading architectural overhauls, optimizing performance by up to 40%, and mentoring high-performing engineering teams."
  );
  const [skills, setSkills] = useState(
    "JavaScript, TypeScript, React, Node.js, Python, AWS, Docker, Kubernetes, SQL, NoSQL"
  );
  const [languages, setLanguages] = useState(
    "English (Native), Spanish (Fluent)"
  );

  const [headers, setHeaders] = useState<ResumeHeaders>(DEFAULT_HEADERS);
  const [sections, setSections] = useState<ResumeSection[]>(DEFAULT_SECTIONS);

  const printRef = useRef<HTMLDivElement>(null);

  // Load resume from server on mount, fall back to localStorage
  useEffect(() => {
    const loadResume = async () => {
      try {
        const response = await getCandidateResume();
        if (response?.success && response?.data) {
          const d = response.data;
          if (d.theme) setTheme(d.theme as Theme);
          if (d.include_avatar !== undefined) setIncludeAvatar(d.include_avatar === 1 || d.include_avatar === true);
          if (d.personal_info) {
            const pi = typeof d.personal_info === 'string' ? JSON.parse(d.personal_info) : d.personal_info;
            if (pi.name) setName(pi.name);
            if (pi.jobTitle) setJobTitle(pi.jobTitle);
            if (pi.email) setEmail(pi.email);
            if (pi.phone) setPhone(pi.phone);
            if (pi.address) setAddress(pi.address);
            if (pi.linkedin) setLinkedin(pi.linkedin);
            if (pi.github) setGithub(pi.github);
          }
          if (d.summary) setSummary(d.summary);
          if (d.skills) setSkills(d.skills);
          if (d.languages) setLanguages(d.languages);
          if (d.headers) {
            const h = typeof d.headers === 'string' ? JSON.parse(d.headers) : d.headers;
            setHeaders((prev) => ({ ...prev, ...h }));
          }
          if (Array.isArray(d.sections)) {
            const secs = typeof d.sections === 'string' ? JSON.parse(d.sections) : d.sections;
            if (secs.length > 0) setSections(secs);
          }
          return; // server data loaded, skip localStorage
        }
      } catch {
        // server unavailable, fall through to localStorage
      }

      // Fallback to localStorage
      try {
        const saved = localStorage.getItem("resumeBuilderData");
        if (saved) {
          const d = JSON.parse(saved);
          if (d.theme) setTheme(d.theme);
          if (d.name) setName(d.name);
          if (d.jobTitle) setJobTitle(d.jobTitle);
          if (d.email) setEmail(d.email);
          if (d.phone) setPhone(d.phone);
          if (d.address) setAddress(d.address);
          if (d.linkedin) setLinkedin(d.linkedin);
          if (d.github) setGithub(d.github);
          if (d.summary) setSummary(d.summary);
          if (d.skills) setSkills(d.skills);
          if (d.languages) setLanguages(d.languages);
          if (d.headers) setHeaders((h) => ({ ...h, ...d.headers }));
          if (Array.isArray(d.sections) && d.sections.length > 0)
            setSections(d.sections);
        }
      } catch {
        // ignore
      }
    };

    loadResume();
  }, []);

  // ── Save (server + localStorage fallback) ──
  const handleSave = async () => {
    // Save to server
    try {
      const payload = {
        theme,
        include_avatar: includeAvatar,
        personal_info: { name, jobTitle, email, phone, address, linkedin, github },
        summary,
        skills,
        languages,
        headers,
        sections,
      };
      const res = await updateCandidateResume(payload);
      if (res?.success) {
        toast({
          title: "Resume Saved!",
          description: "Your resume has been saved to the server.",
        });
      } else {
        throw new Error(res?.message || "Server save failed");
      }
    } catch {
      // Fallback: save to localStorage
      try {
        localStorage.setItem(
          "resumeBuilderData",
          JSON.stringify({
            theme,
            name,
            jobTitle,
            email,
            phone,
            address,
            linkedin,
            github,
            summary,
            skills,
            languages,
            headers,
            sections,
          })
        );
        toast({
          title: "Resume Saved Locally",
          description: "Server unavailable. Saved to local storage.",
        });
      } catch {
        toast({
          title: "Error",
          description: "Failed to save resume.",
          variant: "destructive",
        });
      }
    }
  };

  // ── Section CRUD ───────────────────────────
  const addSection = (type: ResumeSection["type"]) => {
    setSections((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type,
        title: "",
        subtitle: "",
        period: "",
        description: "",
        link: "",
      },
    ]);
  };

  const updateSection = (
    id: string,
    field: keyof ResumeSection,
    val: string
  ) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: val } : s))
    );
  };

  const removeSection = (id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

  // ── Image upload (store both blob URL for preview + data URL for export) ──
  const avatarDataUrlRef = useRef<string>("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Store blob URL for live preview
    const blobUrl = URL.createObjectURL(file);
    setAvatarUrl(blobUrl);

    // Convert to data URL for export (works in PDF/DOCX)
    const reader = new FileReader();
    reader.onloadend = () => {
      avatarDataUrlRef.current = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  // ── AI mock ───────────────────────────────
  const handleAIImprove = () => {
    toast({
      title: "AI Enhancing Resume",
      description: "Analyzing text and optimizing for ATS readability…",
    });
    setTimeout(() => {
      toast({
        title: "Resume Improved!",
        description: "Your summary and descriptions have been enhanced.",
      });
    }, 2000);
  };

  // ── Bullet renderer (JSX) ─────────────────
  const renderBullets = (text: string) => {
    if (!text) return null;
    return text
      .split("\n")
      .filter((s) => s.trim().length > 0)
      .map((bullet, i) => (
        <li key={i} className="mb-[2px]">
          {bullet.trim()}
          {bullet.trim().endsWith(".") ? "" : "."}
        </li>
      ));
  };

  // ─────────────────────────────────────────────
  // Helper: get the currently rendered theme HTML as string (from the live DOM)
  // ─────────────────────────────────────────────
  const getLivePreviewHtml = useCallback((): string => {
    const el = printRef.current;
    if (!el) return "";
    // Clone to avoid affecting the live preview
    const clone = el.cloneNode(true) as HTMLElement;
    // Remove the scaled transform, set to full A4 size
    clone.style.transform = "none";
    clone.style.width = "210mm";
    clone.style.minHeight = "297mm";
    clone.style.margin = "0";
    clone.style.padding = "0";
    clone.style.overflow = "visible";
    clone.style.background = "#fff";
    return clone.outerHTML;
  }, []);

  // ─────────────────────────────────────────────
  // PDF Export - uses the actual rendered theme DOM
  // ─────────────────────────────────────────────
  const handleDownload = async () => {
    toast({
      title: "Generating PDF…",
      description: "Please wait while we render your resume.",
    });

    try {
      type WindowWithLibs = Window &
        typeof globalThis & {
          jspdf?: { jsPDF: new (...a: unknown[]) => unknown };
          html2canvas?: (
            el: HTMLElement,
            opts: object
          ) => Promise<HTMLCanvasElement>;
        };

      const w = window as WindowWithLibs;

      const loadScript = (src: string): Promise<void> =>
        new Promise<void>((res, rej) => {
          if (document.querySelector(`script[src="${src}"]`)) {
            res();
            return;
          }
          const s = document.createElement("script");
          s.src = src;
          s.onload = () => res();
          s.onerror = () => rej(new Error(`Failed to load ${src}`));
          document.head.appendChild(s);
        });

      await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
      );
      await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
      );

      await new Promise((r) => setTimeout(r, 400));

      if (!w.jspdf || !w.html2canvas) throw new Error("Libraries not loaded");

      // Get the actual rendered theme HTML from the DOM
      const themeHtml = getLivePreviewHtml();
      if (!themeHtml) throw new Error("No resume content found");

      // Create a container with the theme HTML at full A4 size
      const container = document.createElement("div");
      container.innerHTML = themeHtml;
      container.style.cssText =
        "position:fixed;top:-9999px;left:-9999px;width:210mm;background:#fff;z-index:-1;overflow:visible;";
      document.body.appendChild(container);

      // Use the first child (the rendered theme div)
      const pageEl = container.firstElementChild as HTMLElement;
      if (!pageEl) throw new Error("Page element not found");

      await new Promise((r) => setTimeout(r, 1000));

      const canvas = await w.html2canvas(pageEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: 794,
        windowWidth: 794,
        height: pageEl.scrollHeight,
        windowHeight: pageEl.scrollHeight,
        scrollY: 0,
      });

      document.body.removeChild(container);

      const A4_W_MM = 210;
      const A4_H_MM = 297;
      const A4_W_PX = canvas.width;
      const pageHeightPx = Math.round((A4_H_MM / A4_W_MM) * A4_W_PX);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { jsPDF } = w.jspdf as any;
      const pdf = new jsPDF({
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      });

      let yOffset = 0;
      let isFirstPage = true;

      while (yOffset < canvas.height) {
        const sliceHeight = Math.min(pageHeightPx, canvas.height - yOffset);

        const slice = document.createElement("canvas");
        slice.width = A4_W_PX;
        slice.height = sliceHeight;
        const ctx = slice.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, slice.width, slice.height);
        ctx.drawImage(
          canvas,
          0,
          yOffset,
          A4_W_PX,
          sliceHeight,
          0,
          0,
          A4_W_PX,
          sliceHeight
        );

        const imgData = slice.toDataURL("image/jpeg", 0.95);
        const sliceHeightMM = (sliceHeight / A4_W_PX) * A4_W_MM;

        if (!isFirstPage) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, 0, A4_W_MM, sliceHeightMM);

        yOffset += sliceHeight;
        isFirstPage = false;
      }

      pdf.save(`${name.replace(/\s+/g, "_")}_Resume.pdf`);
      toast({
        title: "PDF Exported!",
        description: "Your resume has been successfully downloaded.",
      });
    } catch (err) {
      console.error("PDF generation error:", err);
      toast({
        title: "Export Failed",
        description: "Please try the DOCX export instead.",
        variant: "destructive",
      });
    }
  };

  // ─────────────────────────────────────────────
  // DOCX Export - uses the actual rendered theme HTML
  // ─────────────────────────────────────────────
  const handleDownloadDocx = () => {
    const themeHtml = getLivePreviewHtml();
    if (!themeHtml) {
      toast({
        title: "Error",
        description: "No resume content to export.",
        variant: "destructive",
      });
      return;
    }

    const fullHtml = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>${escHtml(name)} - Resume</title>
  <style>
    @page { size: A4; margin: 0; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; color: #000; line-height: 1.4; background: #fff; }
  </style>
</head>
<body>
<div style="width:210mm;min-height:297mm;padding:0;margin:0 auto;background:#fff;">
${themeHtml}
</div>
</body>
</html>`;

    const blob = new Blob(["\uFEFF", fullHtml], {
      type: "application/msword;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.replace(/\s+/g, "_")}_Resume.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "DOCX Exported!",
      description: "Your resume has been saved as a Word document.",
    });
  };

  // ─────────────────────────────────────────────
  // Theme Renderers
  // ─────────────────────────────────────────────

  const renderExecutiveTheme = (isPrint = false) => (
    <div
      className={`px-10 py-10 bg-white text-black leading-tight font-serif ${
        isPrint ? "w-[210mm] min-h-[297mm]" : "w-full aspect-[1/1.414]"
      }`}
    >
      <div className="text-center mb-4">
        <h1 className="text-[20px] font-bold uppercase tracking-wide mb-1">
          {name}
        </h1>
        <div className="text-[11px] flex flex-wrap justify-center items-center gap-2">
          {address && <span>{address}</span>}
          {address && phone && <span>|</span>}
          {phone && <span>{phone}</span>}
          {phone && email && <span>|</span>}
          {email && <span>{email}</span>}
          {email && linkedin && <span>|</span>}
          {linkedin && (
            <span>{linkedin.replace("https://", "").replace("www.", "")}</span>
          )}
          {linkedin && github && <span>|</span>}
          {github && (
            <span>{github.replace("https://", "").replace("www.", "")}</span>
          )}
        </div>
      </div>

      {summary && (
        <div className="mb-4">
          <h2 className="text-[12px] font-bold uppercase border-b border-black pb-[2px] mb-2">
            {headers.summary}
          </h2>
          <p className="text-[11px] leading-snug">{summary}</p>
        </div>
      )}

      {(["experience", "project", "education", "certification"] as const).map(
        (type) => {
          const items = sections.filter((s) => s.type === type);
          if (!items.length) return null;
          const label =
            type === "experience"
              ? headers.experience
              : type === "education"
              ? headers.education
              : type === "certification"
              ? headers.certifications
              : headers.project;
          return (
            <div key={type} className="mb-4">
              <h2 className="text-[12px] font-bold uppercase border-b border-black pb-[2px] mb-2">
                {label}
              </h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id}>
                    <div className="flex justify-between items-end mb-[1px]">
                      <span className="font-bold text-[11px]">
                        {item.subtitle || item.title}
                      </span>
                      <span className="text-[11px] whitespace-nowrap">
                        {item.period}
                      </span>
                    </div>
                    {item.subtitle && (
                      <div className="flex justify-between items-end mb-1">
                        <span className="italic text-[11px]">{item.title}</span>
                        {item.link && (
                          <span className="text-[10px]">{item.link}</span>
                        )}
                      </div>
                    )}
                    {!item.subtitle && item.link && (
                      <div className="text-[10px] mb-1">{item.link}</div>
                    )}
                    <ul className="list-disc text-[11px] pl-4 space-y-[2px]">
                      {renderBullets(item.description)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          );
        }
      )}

      {skills && (
        <div className="mb-4">
          <h2 className="text-[12px] font-bold uppercase border-b border-black pb-[2px] mb-2">
            {headers.skills}
          </h2>
          <div className="text-[11px]">
            <span className="font-bold">Technical Skills: </span>
            {skills}
          </div>
        </div>
      )}
      {languages && (
        <div className="mb-4 text-[11px]">
          <span className="font-bold">Languages: </span>
          {languages}
        </div>
      )}
    </div>
  );

  const renderClassicTheme = (isPrint = false) => (
    <div
      className={`p-8 sm:p-10 bg-white text-gray-900 font-sans leading-relaxed ${
        isPrint ? "w-[210mm] min-h-[297mm]" : "w-full aspect-[1/1.414]"
      }`}
    >
      <div className="text-center pb-4 mb-5 border-b-2 border-gray-200">
        <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-1">
          {name}
        </h1>
        <h2 className="text-[15px] font-semibold text-gray-600 mb-2 uppercase tracking-widest">
          {jobTitle}
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-1 text-gray-600 text-[11px] font-medium">
          <span>{phone}</span>
          <span>•</span>
          <span>{email}</span>
          <span>•</span>
          <span>{address}</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-1 text-gray-500 text-[11px]">
          {linkedin && <span>{linkedin}</span>}
          {linkedin && github && <span>•</span>}
          {github && <span>{github}</span>}
        </div>
      </div>

      {summary && (
        <div className="mb-5">
          <h2 className="text-[13px] font-bold uppercase tracking-widest text-gray-900 mb-1.5">
            {headers.summary}
          </h2>
          <p className="text-[11px] leading-snug text-gray-700">{summary}</p>
        </div>
      )}

      {skills && (
        <div className="mb-5">
          <h2 className="text-[13px] font-bold uppercase tracking-widest text-gray-900 mb-1.5">
            {headers.skills}
          </h2>
          <p className="text-[11px] text-gray-700 font-medium">{skills}</p>
        </div>
      )}

      {(["experience", "education", "project", "certification"] as const).map(
        (type) => {
          const items = sections.filter((s) => s.type === type);
          if (!items.length) return null;
          const label =
            type === "experience"
              ? headers.experience
              : type === "education"
              ? headers.education
              : type === "certification"
              ? headers.certifications
              : headers.project;
          return (
            <div key={type} className="mb-5">
              <h2 className="text-[13px] font-bold uppercase tracking-widest text-gray-900 mb-2">
                {label}
              </h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id}>
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="font-bold text-[12px] text-gray-900">
                        {item.title}
                        {item.subtitle ? ` — ${item.subtitle}` : ""}
                      </span>
                      <span className="text-[11px] font-semibold text-gray-500 whitespace-nowrap">
                        {item.period}
                      </span>
                    </div>
                    {item.link && (
                      <div className="text-[10px] text-gray-500 mb-1">
                        {item.link}
                      </div>
                    )}
                    <ul className="list-disc list-inside text-[11px] pl-2 mt-1 space-y-0.5 leading-snug text-gray-700">
                      {renderBullets(item.description)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          );
        }
      )}
    </div>
  );

  const renderModernTheme = (isPrint = false) => (
    <div
      className={`flex text-slate-800 font-sans ${
        isPrint ? "w-[210mm] min-h-[297mm]" : "w-full aspect-[1/1.414]"
      } bg-gradient-to-r from-[#f4f4f5] from-[35%] to-white to-[35%]`}
    >
      {/* Sidebar */}
      <div className="w-[35%] p-6 sm:p-8 flex flex-col gap-6 border-r border-slate-200">
        {includeAvatar && avatarUrl && (
          <div className="flex justify-center">
            <img
              src={avatarUrl}
              alt="Profile"
              className="w-28 h-28 lg:w-36 lg:h-36 rounded-full object-cover border-[3px] border-white shadow-md mx-auto"
            />
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-[12px] font-bold tracking-widest text-[#2c3e50] uppercase border-b border-slate-300 pb-1 mb-3">
            {headers.contact}
          </h3>
          <div className="text-[10px] space-y-2 text-slate-700 font-medium break-all">
            <div className="flex items-center gap-2">
              <span>📞</span>
              {phone}
            </div>
            <div className="flex items-center gap-2">
              <span>✉️</span>
              {email}
            </div>
            <div className="flex items-center gap-2">
              <span>📍</span>
              {address}
            </div>
            {linkedin && (
              <div className="flex items-center gap-2">
                <span>in</span>
                {linkedin.replace("https://", "")}
              </div>
            )}
            {github && (
              <div className="flex items-center gap-2">
                <span>gh</span>
                {github.replace("https://", "")}
              </div>
            )}
          </div>
        </div>

        {skills && (
          <div className="space-y-2">
            <h3 className="text-[12px] font-bold tracking-widest text-[#2c3e50] uppercase border-b border-slate-300 pb-1 mb-3">
              {headers.skills}
            </h3>
            <ul className="text-[10px] text-slate-700 space-y-1.5 font-medium">
              {skills.split(",").map((s) => (
                <li key={s} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2c3e50] shrink-0 inline-block" />
                  {s.trim()}
                </li>
              ))}
            </ul>
          </div>
        )}

        {languages && (
          <div className="space-y-2">
            <h3 className="text-[12px] font-bold tracking-widest text-[#2c3e50] uppercase border-b border-slate-300 pb-1 mb-3">
              {headers.languages}
            </h3>
            <ul className="text-[10px] text-slate-700 space-y-1.5 font-medium">
              {languages.split(",").map((s) => (
                <li key={s} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2c3e50] shrink-0 inline-block" />
                  {s.trim()}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Main */}
      <div className="w-[65%] p-6 sm:p-10 flex flex-col gap-6 bg-white">
        <div>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-[#2c3e50] uppercase mb-1 leading-none">
            {name}
          </h1>
          <h2 className="text-[14px] tracking-widest text-slate-500 uppercase font-semibold">
            {jobTitle}
          </h2>
        </div>

        {summary && (
          <div>
            <h3 className="text-[13px] font-bold tracking-widest text-[#2c3e50] uppercase border-b border-slate-200 pb-1 mb-3">
              {headers.summary}
            </h3>
            <p className="text-[11px] leading-relaxed text-slate-600 font-medium">
              {summary}
            </p>
          </div>
        )}

        {(["experience", "education", "project", "certification"] as const).map(
          (type) => {
            const items = sections.filter((s) => s.type === type);
            if (!items.length) return null;
            const label =
              type === "experience"
                ? headers.experience
                : type === "education"
                ? headers.education
                : type === "certification"
                ? headers.certifications
                : headers.project;
            return (
              <div key={type}>
                <h3 className="text-[13px] font-bold tracking-widest text-[#2c3e50] uppercase border-b border-slate-200 pb-1 mb-4">
                  {label}
                </h3>
                <div className="space-y-5">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="relative pl-4 border-l-2 border-[#2c3e50]/20"
                    >
                      <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-[#2c3e50]" />
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h4 className="font-bold text-[12px] text-[#2c3e50] uppercase">
                          {item.title}
                        </h4>
                        <span className="text-[10px] font-bold text-[#2c3e50] whitespace-nowrap bg-slate-100 px-2 py-0.5 rounded">
                          {item.period}
                        </span>
                      </div>
                      <div className="text-[11px] font-bold text-slate-500 mb-1.5">
                        {item.subtitle}
                      </div>
                      {item.link && (
                        <div className="text-[10px] text-blue-500 mb-1">
                          {item.link}
                        </div>
                      )}
                      <ul className="list-disc list-inside text-[11px] leading-relaxed text-slate-600 pl-1">
                        {renderBullets(item.description)}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );

  const renderCreativeTheme = (isPrint = false) => (
    <div
      className={`bg-[#f9fafb] text-gray-800 font-sans ${
        isPrint ? "w-[210mm] min-h-[297mm]" : "w-full aspect-[1/1.414]"
      }`}
    >
      <div className="bg-[#4f46e5] text-white p-8 sm:p-10 pb-16 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">{name}</h1>
          <h2 className="text-xl font-medium text-indigo-200">{jobTitle}</h2>
        </div>
        {includeAvatar && avatarUrl && (
          <img
            src={avatarUrl}
            alt="Profile"
            className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-xl rotate-3"
          />
        )}
      </div>

      <div className="flex -mt-8 bg-gradient-to-l from-gray-50 from-[35%] to-transparent to-[35%]">
        <div className="w-[65%] p-6 sm:p-10 pt-0 flex flex-col gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 mt-[-2rem] relative z-10 border border-gray-100">
            <h3 className="text-[13px] font-black text-indigo-600 uppercase mb-2 flex items-center gap-2">
              <SparklesIcon /> {headers.summary}
            </h3>
            <p className="text-[12px] leading-relaxed text-gray-600">
              {summary}
            </p>
          </div>

          {(["experience", "education", "project"] as const).map((type) => {
            const items = sections.filter((s) => s.type === type);
            if (!items.length) return null;
            const label =
              type === "experience"
                ? headers.experience
                : type === "education"
                ? headers.education
                : headers.project;
            return (
              <div key={type}>
                <h3 className="text-[14px] font-black text-gray-800 uppercase border-b-2 border-indigo-100 pb-2 mb-4 inline-block">
                  {label}
                </h3>
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="relative">
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className="font-bold text-[13px] text-gray-800">
                          {item.title}
                        </h4>
                        <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                          {item.period}
                        </span>
                      </div>
                      <div className="text-[12px] font-medium text-gray-500 mb-2">
                        {item.subtitle}
                      </div>
                      {item.link && (
                        <div className="text-[11px] text-indigo-500 mb-2">
                          {item.link}
                        </div>
                      )}
                      <ul className="list-none text-[12px] leading-relaxed text-gray-600 space-y-1">
                        {item.description
                          .split("\n")
                          .filter((s) => s.trim().length > 0)
                          .map((bullet, i) => (
                            <li key={i} className="flex gap-2">
                              <span className="text-indigo-400 mt-[2px]">✦</span>
                              <span>
                                {bullet.trim()}
                                {bullet.trim().endsWith(".") ? "" : "."}
                              </span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="w-[35%] p-6 sm:p-8 flex flex-col gap-8 border-l border-gray-200">
          <div className="space-y-4">
            <h3 className="text-[13px] font-black text-gray-800 uppercase tracking-widest">
              {headers.contact}
            </h3>
            <div className="text-[11px] space-y-3 text-gray-600 break-all">
              <div>
                <strong className="block text-gray-800 mb-0.5">Phone</strong>
                {phone}
              </div>
              <div>
                <strong className="block text-gray-800 mb-0.5">Email</strong>
                {email}
              </div>
              <div>
                <strong className="block text-gray-800 mb-0.5">Address</strong>
                {address}
              </div>
              {linkedin && (
                <div>
                  <strong className="block text-gray-800 mb-0.5">
                    LinkedIn
                  </strong>
                  {linkedin}
                </div>
              )}
              {github && (
                <div>
                  <strong className="block text-gray-800 mb-0.5">GitHub</strong>
                  {github}
                </div>
              )}
            </div>
          </div>

          {skills && (
            <div className="space-y-3">
              <h3 className="text-[13px] font-black text-gray-800 uppercase tracking-widest">
                {headers.skills}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {skills.split(",").map((s) => (
                  <span
                    key={s}
                    className="bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-md text-[10px] font-bold"
                  >
                    {s.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {languages && (
            <div className="space-y-3">
              <h3 className="text-[13px] font-black text-gray-800 uppercase tracking-widest">
                {headers.languages}
              </h3>
              <div className="flex flex-col gap-1.5">
                {languages.split(",").map((s) => (
                  <span key={s} className="text-gray-600 text-[11px]">
                    {s.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {sections.filter((s) => s.type === "certification").length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[13px] font-black text-gray-800 uppercase tracking-widest">
                {headers.certifications}
              </h3>
              <div className="space-y-3">
                {sections
                  .filter((s) => s.type === "certification")
                  .map((item) => (
                    <div key={item.id}>
                      <div className="font-bold text-[11px] text-gray-800">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {item.subtitle} • {item.period}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderDeveloperTheme = (isPrint = false) => (
    <div
      className={`p-8 sm:p-10 bg-[#0d1117] text-[#c9d1d9] font-mono leading-relaxed ${
        isPrint ? "w-[210mm] min-h-[297mm]" : "w-full aspect-[1/1.414]"
      }`}
    >
      <div className="border-b border-[#30363d] pb-6 mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-[#58a6ff] mb-2">{`// ${name}`}</h1>
        <h2 className="text-lg text-[#8b949e] mb-4">{`> ${jobTitle}`}</h2>
        <div className="grid grid-cols-2 gap-2 text-[11px] text-[#8b949e]">
          <div>
            <span className="text-[#ff7b72]">const</span> phone ={" "}
            <span className="text-[#a5d6ff]">"{phone}"</span>;
          </div>
          <div>
            <span className="text-[#ff7b72]">const</span> email ={" "}
            <span className="text-[#a5d6ff]">"{email}"</span>;
          </div>
          <div>
            <span className="text-[#ff7b72]">const</span> location ={" "}
            <span className="text-[#a5d6ff]">"{address}"</span>;
          </div>
          {github && (
            <div>
              <span className="text-[#ff7b72]">const</span> github ={" "}
              <span className="text-[#a5d6ff]">"{github}"</span>;
            </div>
          )}
          {linkedin && (
            <div className="col-span-2">
              <span className="text-[#ff7b72]">const</span> linkedin ={" "}
              <span className="text-[#a5d6ff]">"{linkedin}"</span>;
            </div>
          )}
        </div>
      </div>

      {summary && (
        <div className="mb-6">
          <h2 className="text-[13px] font-bold text-[#7ee787] mb-2">{`/* ${headers.summary} */`}</h2>
          <p className="text-[12px] leading-relaxed opacity-90">{summary}</p>
        </div>
      )}

      {skills && (
        <div className="mb-6">
          <h2 className="text-[13px] font-bold text-[#7ee787] mb-2">{`/* ${headers.skills} */`}</h2>
          <div className="text-[12px]">
            <span className="text-[#ff7b72]">const</span> skills = [
            <span className="text-[#a5d6ff]">
              {skills
                .split(",")
                .map((s) => `"${s.trim()}"`)
                .join(", ")}
            </span>
            ];
          </div>
        </div>
      )}

      {(["project", "experience", "education", "certification"] as const).map(
        (type) => {
          const items = sections.filter((s) => s.type === type);
          if (!items.length) return null;
          const label =
            type === "experience"
              ? headers.experience
              : type === "education"
              ? headers.education
              : type === "certification"
              ? headers.certifications
              : headers.project;
          return (
            <div key={type} className="mb-6">
              <h2 className="text-[13px] font-bold text-[#7ee787] mb-3">{`/* ${label} */`}</h2>
              <div className="space-y-5 border-l border-[#30363d] pl-4">
                {items.map((item) => (
                  <div key={item.id} className="relative">
                    <div className="absolute -left-[21px] top-1.5 text-[#30363d] text-[10px]">
                      {">"}
                    </div>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="font-bold text-[12px] text-[#d2a8ff]">
                        {item.title}{" "}
                        <span className="text-[#8b949e] font-normal">
                          @ {item.subtitle}
                        </span>
                      </span>
                      <span className="text-[11px] text-[#8b949e]">
                        {item.period}
                      </span>
                    </div>
                    {item.link && (
                      <div className="text-[11px] text-[#58a6ff] mb-1">
                        {item.link}
                      </div>
                    )}
                    <ul className="list-disc list-inside text-[11px] mt-2 space-y-1 opacity-80">
                      {renderBullets(item.description)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          );
        }
      )}
    </div>
  );

  // ─────────────────────────────────────────────
  // Theme list metadata
  // ─────────────────────────────────────────────
  const themesList: { id: Theme; name: string; icon: ElementType }[] = [
    { id: "executive", name: "Executive", icon: BriefcaseIcon },
    { id: "classic", name: "Classic", icon: AlignLeftIcon },
    { id: "modern", name: "Modern", icon: ColumnsIcon },
    { id: "creative", name: "Creative", icon: PaletteIcon },
    { id: "developer", name: "Developer", icon: TerminalIcon },
  ];

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div className="space-y-6 p-4 max-w-[1600px] mx-auto">
      <ToastContainer />

      {/* ── Action Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white border border-gray-200 p-5 rounded-2xl shadow-sm gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <LayoutTemplateIcon /> Resume Studio Pro
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Design, customize sections, choose themes, and export instantly.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto flex-wrap">
          <button
            onClick={handleAIImprove}
            className="shrink-0 flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-100 transition-all"
          >
            <BotIcon /> AI Enhance
          </button>
          <button
            onClick={handleSave}
            className="shrink-0 flex items-center gap-1.5 rounded-xl border border-green-500/30 bg-green-50 px-4 py-2 text-sm font-semibold text-green-600 hover:bg-green-100 transition-all"
          >
            <CheckCircle2Icon /> Save
          </button>
          <button
            onClick={handleDownloadDocx}
            className="shrink-0 flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-bold text-white hover:bg-indigo-700 shadow-md transition-all"
          >
            <FileDownIcon /> Export DOCX
          </button>
          <button
            onClick={handleDownload}
            className="shrink-0 flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2 text-sm font-bold text-white shadow-md transition-all hover:bg-slate-700"
          >
            <DownloadIcon /> Export PDF
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr,600px] gap-6">
        {/* ── Left: Editor ── */}
        <div className="space-y-6">
          {/* Theme picker */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-3 mb-4">
              Resume Theme
            </h3>
            <div className="flex flex-wrap gap-3 mb-5">
              {themesList.map((t) => {
                const ThemeIcon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all flex-1 min-w-[110px] justify-center ${
                      theme === t.id
                        ? "border-blue-500 bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-300"
                        : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <ThemeIcon />
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      {t.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Avatar toggle for themes that support it */}
            {(theme === "modern" || theme === "creative") && (
              <div className="mb-5 overflow-hidden">
                <div className="flex flex-col gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeAvatar}
                      onChange={(e) => setIncludeAvatar(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <ImageIcon />
                    Include Profile Picture
                  </label>
                  {includeAvatar && (
                    <div className="flex items-center gap-3 mt-2">
                      {avatarUrl && (
                        <img
                          src={avatarUrl}
                          alt="Avatar preview"
                          className="w-10 h-10 rounded-full object-cover border"
                        />
                      )}
                      <label className="text-xs font-bold bg-white border px-3 py-1.5 rounded-lg cursor-pointer hover:bg-gray-50 transition flex items-center gap-1">
                        <UploadIcon /> Upload Photo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Section header customiser */}
            <label className="text-[11px] uppercase tracking-wider font-bold text-gray-500 mb-2 block border-t border-gray-200 pt-4">
              Customize Section Headers
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  ["Education Header", "education"],
                  ["Experience Header", "experience"],
                  ["Skills Header", "skills"],
                  ["Projects Header", "project"],
                  ["Certifications", "certifications"],
                  ["Summary Header", "summary"],
                ] as [string, keyof ResumeHeaders][]
              ).map(([label, key]) => (
                <div key={key}>
                  <span className="text-[10px] text-gray-500 block mb-1">
                    {label}
                  </span>
                  <input
                    title={label}
                    placeholder={label}
                    value={headers[key]}
                    onChange={(e) =>
                      setHeaders({ ...headers, [key]: e.target.value })
                    }
                    className="h-8 text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Personal info */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-3">
              Personal Information
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {(
                [
                  ["Full Name", name, setName],
                  ["Title / Profession", jobTitle, setJobTitle],
                  ["Email", email, setEmail],
                  ["Phone", phone, setPhone],
                  ["Address / Location", address, setAddress],
                  ["LinkedIn", linkedin, setLinkedin],
                ] as [string, string, (v: string) => void][]
              ).map(([label, val, setter]) => (
                <div key={label}>
                  <label className="text-[11px] uppercase tracking-wider font-bold text-gray-500 mb-1 block">
                    {label}
                  </label>
                  <input
                    title={label}
                    placeholder={label}
                    value={val}
                    onChange={(e) => setter(e.target.value)}
                    className="rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="text-[11px] uppercase tracking-wider font-bold text-gray-500 mb-1 block">
                  GitHub / Portfolio
                </label>
                <input
                  title="GitHub / Portfolio"
                  placeholder="GitHub / Portfolio"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  className="rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
            </div>
          </div>

          {/* Summary & skills */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-3">
              Summary & Skills
            </h3>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] uppercase tracking-wider font-bold text-gray-500">
                  Professional Summary
                </label>
                <button
                  onClick={handleAIImprove}
                  className="text-[10px] text-blue-500 font-bold flex items-center gap-1 hover:text-blue-600"
                >
                  <SparklesIcon /> AI Improve
                </button>
              </div>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Write a short summary…"
                className="rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 text-sm w-full min-h-[100px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider font-bold text-gray-500 mb-1 block">
                Core Skills (comma-separated)
              </label>
              <input
                title="Core Skills"
                placeholder="Core Skills"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider font-bold text-gray-500 mb-1 block">
                Languages (comma-separated)
              </label>
              <input
                title="Languages"
                placeholder="Languages"
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
                className="rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>

          {/* Dynamic sections */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-3">
              Experiences, Education, Projects &amp; Certs
            </h3>

            {(
              ["experience", "education", "project", "certification"] as const
            ).map((type) => {
              const items = sections.filter((s) => s.type === type);
              const sectionLabel =
                type === "experience"
                  ? headers.experience
                  : type === "education"
                  ? headers.education
                  : type === "certification"
                  ? headers.certifications
                  : headers.project;

              return (
                <div
                  key={type}
                  className="bg-gray-50 p-4 rounded-xl border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs uppercase tracking-wider font-bold text-gray-700">
                      {sectionLabel}
                    </h4>
                    <button
                      onClick={() => addSection(type)}
                      className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded"
                    >
                      <PlusIcon /> Add
                    </button>
                  </div>

                  <div className="space-y-4">
                    {items.map((section) => (
                      <div
                        key={section.id}
                        className="relative group p-4 border border-gray-200 bg-white rounded-xl shadow-sm"
                      >
                        <button
                          title="Remove section"
                          aria-label="Remove section"
                          onClick={() => removeSection(section.id)}
                          className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-100 p-1.5 rounded-md shadow-sm"
                        >
                          <Trash2Icon />
                        </button>

                        <div className="grid gap-3 sm:grid-cols-2 mb-3">
                          <input
                            placeholder={
                              type === "education"
                                ? "Degree (e.g. B.S. Computer Science)"
                                : "Role / Title"
                            }
                            value={section.title}
                            onChange={(e) =>
                              updateSection(section.id, "title", e.target.value)
                            }
                            className="h-9 text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 font-bold focus:outline-none focus:ring-2 focus:ring-blue-300 w-full"
                          />
                          <input
                            placeholder={
                              type === "education"
                                ? "University / Institution"
                                : "Company / Organization"
                            }
                            value={section.subtitle}
                            onChange={(e) =>
                              updateSection(
                                section.id,
                                "subtitle",
                                e.target.value
                              )
                            }
                            className="h-9 text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 focus:outline-none focus:ring-2 focus:ring-blue-300 w-full"
                          />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 mb-3">
                          <input
                            placeholder="Time Period (e.g. Oct 2021 – Present)"
                            value={section.period}
                            onChange={(e) =>
                              updateSection(
                                section.id,
                                "period",
                                e.target.value
                              )
                            }
                            className="h-8 text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 focus:outline-none focus:ring-2 focus:ring-blue-300 w-full"
                          />
                          <input
                            placeholder="Link (optional)"
                            value={section.link ?? ""}
                            onChange={(e) =>
                              updateSection(section.id, "link", e.target.value)
                            }
                            className="h-8 text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 focus:outline-none focus:ring-2 focus:ring-blue-300 w-full"
                          />
                        </div>

                        <div className="relative">
                          <div className="absolute right-2 top-2 z-10">
                            <button
                              onClick={handleAIImprove}
                              className="text-[10px] text-blue-500 font-bold flex items-center gap-1 hover:text-blue-600 bg-blue-50 px-2 py-1 rounded"
                            >
                              <SparklesIcon /> Auto-bullet
                            </button>
                          </div>
                          <textarea
                            placeholder="Highlights & Achievements (one bullet per line)…"
                            value={section.description}
                            onChange={(e) =>
                              updateSection(
                                section.id,
                                "description",
                                e.target.value
                              )
                            }
                            className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 pt-8 pb-2 min-h-[120px] leading-relaxed w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right: Live Preview ── */}
        <div className="hidden lg:flex sticky top-24 h-[calc(100vh-120px)] w-full overflow-hidden rounded-2xl border-4 border-gray-200 bg-zinc-200 shadow-inner flex-col items-center">
          <div className="absolute top-4 right-4 bg-white px-3 py-1.5 rounded-lg text-[10px] font-bold text-gray-800 uppercase tracking-widest shadow-md z-10 flex items-center gap-1">
            <CheckCircle2Icon /> Live Preview
          </div>

          <div className="w-full h-full overflow-y-auto flex justify-center items-start pt-10 pb-32">
            <div
              ref={printRef}
              className="bg-white shadow-2xl origin-top w-[210mm] min-h-[297mm] scale-[0.55] -mb-[45%]"
            >
              {theme === "executive" && renderExecutiveTheme(true)}
              {theme === "classic" && renderClassicTheme(true)}
              {theme === "modern" && renderModernTheme(true)}
              {theme === "creative" && renderCreativeTheme(true)}
              {theme === "developer" && renderDeveloperTheme(true)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}