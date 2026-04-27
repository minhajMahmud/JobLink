import { useState, useRef } from "react";
import { FileText, Download, Plus, Trash2, LayoutTemplate, Sparkles, Wand2, FileDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { currentUser } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import ResumeUpload from "@/components/profile/ResumeUpload";
import { motion } from "framer-motion";

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
    "Passionate software engineer with 5+ years of experience building scalable web applications. Recognized for leadership in architectural design and performance optimization."
  );
  const [skills, setSkills] = useState(currentUser.skills?.join(", ") ?? "");
  const [sections, setSections] = useState<ResumeSection[]>([
    {
      id: "1",
      type: "experience",
      title: "Senior Software Engineer",
      subtitle: "TechFlow Inc.",
      period: "2022 - Present",
      description: "Leading frontend architecture for the main product platform. Mentored junior developers and improved CI/CD pipeline efficiency.",
    },
    {
      id: "2",
      type: "experience",
      title: "Software Engineer",
      subtitle: "StartupX",
      period: "2019 - 2022",
      description: "Built core features and improved performance by 60%. Orchestrated secure database migrations with zero downtime.",
    },
    {
      id: "3",
      type: "education",
      title: "BS Computer Science",
      subtitle: "Massachusetts Institute of Technology",
      period: "2015 - 2019",
      description: "Dean's List, GPA 3.8. President of the AI Robotics Club.",
    },
  ]);

  const [portfolioLinks, setPortfolioLinks] = useState([
    { label: "GitHub", url: "github.com/alexmorgan" },
    { label: "Portfolio", url: "alexmorgan.dev" },
  ]);

  const printRef = useRef<HTMLDivElement>(null);

  const addSection = (type: ResumeSection["type"]) => {
    setSections([...sections, { id: Date.now().toString(), type, title: "", subtitle: "", period: "", description: "" }]);
  };

  const updateSection = (id: string, field: keyof ResumeSection, value: string) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const removeSection = (id: string) => {
    setSections(sections.filter((s) => s.id !== id));
  };

  const handleDownload = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const originalBody = document.body.innerHTML;

    // Setup print styles dynamically
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body * { visibility: hidden; }
        #print-resume-container, #print-resume-container * { visibility: visible; }
        #print-resume-container { position: absolute; left: 0; top: 0; width: 100%; color: black !important; background: white !important;}
        @page { margin: 0; size: auto; }
      }
    `;
    document.head.appendChild(style);

    window.print();

    document.head.removeChild(style);
    toast({ title: "Formatting PDF...", description: "Your resume is ready to be saved as a PDF." });
  };

  const handleDownloadDocx = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    // Create a clean HTML document for Word
    const preHtml = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Resume</title><style>body { font-family: 'Arial', sans-serif; }</style></head><body>";
    const postHtml = "</body></html>";
    const html = preHtml + printContent.innerHTML + postHtml;

    // Create a Blob with word MIME type
    const blob = new Blob(['\ufeff', html], {
      type: 'application/msword'
    });

    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.replace(/\s/g, "_")}_Resume.doc`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({ title: "DOCX Exported!", description: "Your resume has been saved as a Word document." });
  };

  const sectionLabel = (type: ResumeSection["type"]) =>
    type === "experience" ? "Professional Experience" : type === "education" ? "Education" : "Projects";

  return (
    <div className="space-y-6">

      {/* Premium Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-card border border-border p-5 rounded-2xl shadow-sm gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2"><LayoutTemplate className="h-5 w-5 text-blue-500" /> Resume Studio</h2>
          <p className="text-sm text-muted-foreground mt-1">Design, edit, and export your professional resume instantly.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex justify-center items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-500/20 transition-all">
            <Sparkles className="h-4 w-4" /> Auto Generate
          </button>
          <button onClick={handleDownloadDocx} className="flex-1 sm:flex-none flex justify-center items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-bold text-white hover:bg-indigo-700 shadow-md transition-all">
            <FileDown className="h-4 w-4" /> Export DOCX
          </button>
          <button onClick={handleDownload} className="flex-1 sm:flex-none flex justify-center items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-blue-700 shadow-md transition-all">
            <Download className="h-4 w-4" /> Export PDF
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Editor Side */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
            <h3 className="font-bold text-foreground font-display flex items-center gap-2 border-b border-border pb-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs">1</span> Personal Details
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Full Name</label><Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl bg-secondary/50" /></div>
              <div><label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Title</label><Input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl bg-secondary/50" /></div>
              <div><label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Email</label><Input value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl bg-secondary/50" /></div>
              <div><label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Phone</label><Input value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-xl bg-secondary/50" /></div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-foreground font-display flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs">2</span> Summary & Skills
              </h3>
              <button className="text-[10px] bg-amber-500/10 text-amber-600 font-bold px-2 py-1 flex items-center gap-1 rounded hover:bg-amber-500/20"><Sparkles className="h-3 w-3" /> Auto-write</button>
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Professional Summary</label>
              <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} className="rounded-xl bg-secondary/50 min-h-[100px]" />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Skills</label>
              <Input value={skills} onChange={(e) => setSkills(e.target.value)} className="rounded-xl bg-secondary/50" />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-foreground font-display flex items-center gap-2 border-b border-border pb-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs">3</span> Experience & Education
            </h3>
            {(["experience", "education", "project"] as const).map((type) => {
              const items = sections.filter((s) => s.type === type);
              return (
                <div key={type} className="bg-secondary/20 p-4 rounded-xl border border-border/50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs uppercase tracking-wider font-bold text-foreground">{sectionLabel(type)}</h4>
                    <button onClick={() => addSection(type)} className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-500/10 px-2 py-1 rounded">
                      <Plus className="h-3 w-3" /> Add
                    </button>
                  </div>
                  <div className="space-y-4">
                    {items.map((section) => (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} key={section.id} className="relative group p-4 border border-border bg-card rounded-xl">
                        <button onClick={() => removeSection(section.id)} className="absolute top-2 right-2 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-secondary p-1.5 rounded-md"><Trash2 className="h-3 w-3" /></button>
                        <div className="grid gap-3 sm:grid-cols-2 mb-3">
                          <Input placeholder="Position / Degree" value={section.title} onChange={(e) => updateSection(section.id, "title", e.target.value)} className="h-8 text-xs bg-secondary/30" />
                          <Input placeholder="Company / Institution" value={section.subtitle} onChange={(e) => updateSection(section.id, "subtitle", e.target.value)} className="h-8 text-xs bg-secondary/30" />
                        </div>
                        <Input placeholder="Date Period (e.g. 2020 - 2023)" value={section.period} onChange={(e) => updateSection(section.id, "period", e.target.value)} className="h-8 text-xs bg-secondary/30 mb-3 w-full sm:w-1/2" />
                        <Textarea placeholder="Highlights & Achievements..." value={section.description} onChange={(e) => updateSection(section.id, "description", e.target.value)} className="text-xs bg-secondary/30 min-h-[60px]" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Live Preview Side */}
        <div className="hidden lg:block relative sticky top-24 h-[calc(100vh-120px)] overflow-hidden rounded-2xl border-4 border-secondary bg-zinc-100 dark:bg-zinc-800 shadow-inner flex items-center justify-center p-8">
          <div className="absolute top-4 right-4 bg-background px-3 py-1.5 rounded-lg text-[10px] font-bold text-muted-foreground uppercase tracking-widest shadow-sm">Live Preview</div>

          {/* Faux A4 Paper (ATS Friendly Layout) */}
          <div className="w-full max-w-[500px] aspect-[1/1.414] bg-white text-black shadow-2xl overflow-y-auto p-6 sm:p-8 no-scrollbar text-left text-[9px] sm:text-[11px] leading-tight font-sans">
            {/* Header */}
            <div className="text-center border-b-[1.5px] border-black pb-3 mb-3">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-black uppercase">{name || "Full Name"}</h1>
              <div className="flex flex-wrap items-center justify-center gap-x-2 mt-1 text-black font-medium">
                <span>{phone}</span> |
                <span>{email}</span> |
                <a href={`https://${portfolioLinks[0]?.url}`} className="text-blue-700">{portfolioLinks[0]?.url}</a> |
                <a href={`https://${portfolioLinks[1]?.url}`} className="text-blue-700">{portfolioLinks[1]?.url}</a>
              </div>
            </div>

            {/* Professional Summary */}
            {summary && (
              <div className="mb-4">
                <h2 className="text-[11px] sm:text-[12px] font-bold uppercase tracking-widest text-black mb-1 border-b border-gray-300 pb-0.5">Professional Summary</h2>
                <p className="text-black">{summary}</p>
              </div>
            )}

            {/* Skills */}
            {skills && (
              <div className="mb-4">
                <h2 className="text-[11px] sm:text-[12px] font-bold uppercase tracking-widest text-black mb-1 border-b border-gray-300 pb-0.5">Skills</h2>
                <p className="text-black font-semibold">{skills}</p>
              </div>
            )}

            {/* Dynamic Sections */}
            {(["education", "experience", "project"] as const).map(type => {
              const items = sections.filter(s => s.type === type);
              if (!items.length) return null;
              return (
                <div key={type} className="mb-4">
                  <h2 className="text-[11px] sm:text-[12px] font-bold uppercase tracking-widest text-black mb-2 border-b border-gray-300 pb-0.5">{sectionLabel(type)}</h2>
                  <div className="space-y-3">
                    {items.map(item => (
                      <div key={item.id}>
                        <div className="flex justify-between items-baseline mb-0.5">
                          <span className="font-bold text-black">{item.title} — {item.subtitle}</span>
                          <span className="font-semibold text-black whitespace-nowrap ml-2">{item.period}</span>
                        </div>
                        <ul className="list-disc list-inside text-black pl-1 mt-1 space-y-0.5">
                          {item.description.split('. ').filter(Boolean).map((bullet, i) => (
                            <li key={i}>{bullet.trim()}{bullet.endsWith('.') ? '' : '.'}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hidden Print Anchor container */}
      <div id="print-resume-container" ref={printRef} className="hidden print:block w-full max-w-[800px] mx-auto bg-white text-black p-10 font-sans leading-relaxed text-sm">
        <div className="text-center border-b-2 border-black pb-4 mb-4">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-black uppercase">{name}</h1>
          <div className="flex flex-wrap items-center justify-center gap-x-4 mt-2 text-black font-medium text-sm">
            <span>{phone}</span> | <span>{email}</span> | <span>{portfolioLinks[0]?.url}</span> | <span>{portfolioLinks[1]?.url}</span>
          </div>
        </div>

        {summary && <div className="mb-5"><h2 className="text-base font-bold uppercase tracking-widest text-black mb-1.5 border-b border-gray-300 pb-1">Professional Summary</h2><p className="text-black">{summary}</p></div>}

        {skills && (<div className="mb-5"><h2 className="text-base font-bold uppercase tracking-widest text-black mb-1.5 border-b border-gray-300 pb-1">Skills</h2><p className="text-black font-semibold">{skills}</p></div>)}

        {(["education", "experience", "project"] as const).map(type => {
          const items = sections.filter(s => s.type === type);
          if (!items.length) return null;
          return (
            <div key={type} className="mb-5 page-break-inside-avoid">
              <h2 className="text-base font-bold uppercase tracking-widest text-black mb-2 border-b border-gray-300 pb-1">{sectionLabel(type)}</h2>
              <div className="space-y-4">
                {items.map(item => (
                  <div key={item.id}>
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="font-bold text-black text-sm">{item.title} — {item.subtitle}</span>
                      <span className="font-semibold text-black">{item.period}</span>
                    </div>
                    <ul className="list-disc list-inside text-black pl-2 mt-1 space-y-1">
                      {item.description.split('. ').filter(Boolean).map((bullet, i) => (
                        <li key={i}>{bullet.trim()}{bullet.endsWith('.') ? '' : '.'}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
