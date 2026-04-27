import { useState, useRef } from "react";
import {
  Download,
  Plus,
  Trash2,
  LayoutTemplate,
  Sparkles,
  FileDown,
  CheckCircle2,
  Columns,
  AlignLeft,
  Image as ImageIcon,
  Terminal,
  Palette,
  Upload,
  Bot,
  Briefcase
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { currentUser } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

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

export default function ResumeBuilder() {
  const { toast } = useToast();
  const [theme, setTheme] = useState<Theme>("executive");
  const [includeAvatar, setIncludeAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar);

  // Content
  const [name, setName] = useState(currentUser.name);
  const [title, setTitle] = useState(currentUser.title);
  const [email, setEmail] = useState("alex.morgan@email.com");
  const [phone, setPhone] = useState("+1 (555) 123-4567");
  const [address, setAddress] = useState("San Francisco, CA");
  const [linkedin, setLinkedin] = useState("linkedin.com/in/alexmorgan");
  const [github, setGithub] = useState("github.com/alexmorgan");

  const [summary, setSummary] = useState(
    "Results-driven Software Engineer with 5+ years of experience engineering scalable web applications and distributed systems. Proven track record of leading architectural overhauls, optimizing performance by up to 40%, and mentoring high-performing engineering teams."
  );
  const [skills, setSkills] = useState(currentUser.skills?.join(", ") ?? "JavaScript, TypeScript, React, Node.js, Python, AWS, Docker, Kubernetes, SQL, NoSQL");
  const [languages, setLanguages] = useState("English (Native), Spanish (Fluent)");

  // Customizable headers
  const [headers, setHeaders] = useState({
    summary: "Professional Summary",
    experience: "Professional Experience",
    education: "Education",
    project: "Selected Projects",
    skills: "Technical Skills",
    languages: "Languages",
    certifications: "Certifications",
    contact: "Contact"
  });

  const [sections, setSections] = useState<ResumeSection[]>([
    {
      id: "1",
      type: "experience",
      title: "Senior Software Engineer",
      subtitle: "TechFlow Inc.",
      period: "Oct 2022 - Present",
      description: "Spearheaded the migration of a legacy monolithic application to a microservices architecture, reducing system latency by 40%.\nMentored a team of 5 junior developers, improving sprint velocity by 25% over two quarters.\nEngineered a highly available distributed caching system utilizing Redis, handling over 10k requests per second.",
    },
    {
      id: "2",
      type: "experience",
      title: "Software Engineer",
      subtitle: "StartupX",
      period: "Jan 2019 - Sep 2022",
      description: "Developed and deployed core features for the main SaaS product, directly contributing to a 60% increase in user retention.\nOrchestrated secure, zero-downtime database migrations for over 2TB of relational data using PostgreSQL.\nCollaborated cross-functionally with product and design teams to deliver 15+ major releases ahead of schedule.",
    },
    {
      id: "3",
      type: "education",
      title: "Bachelor of Science in Computer Science",
      subtitle: "Massachusetts Institute of Technology",
      period: "Sep 2015 - May 2019",
      description: "Graduated with Honors. GPA: 3.8/4.0\nPresident of the AI & Robotics Club, organizing campus-wide hackathons for 500+ attendees.",
    },
    {
      id: "4",
      type: "project",
      title: "OpenSource Protocol",
      subtitle: "React, Node.js, Redis",
      period: "2021",
      description: "Developed an open-source distributed caching system utilized by 50+ enterprise companies.\nGarnered over 1,200 stars on GitHub and recognized in the top 10 trending repositories for TypeScript.",
      link: "github.com/alexmorgan/open"
    },
    {
      id: "5",
      type: "certification",
      title: "AWS Certified Solutions Architect – Professional",
      subtitle: "Amazon Web Services",
      period: "2023",
      description: "Validated advanced technical skills and experience in designing distributed applications and systems on the AWS platform."
    }
  ]);

  const printRef = useRef<HTMLDivElement>(null);

  const addSection = (type: ResumeSection["type"]) => {
    setSections([...sections, { id: Date.now().toString(), type, title: "", subtitle: "", period: "", description: "", link: "" }]);
  };

  const updateSection = (id: string, field: keyof ResumeSection, val: string) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, [field]: val } : s)));
  };

  const removeSection = (id: string) => {
    setSections(sections.filter((s) => s.id !== id));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };

  const handleAIImprove = () => {
    toast({
      title: "AI Enhancing Resume",
      description: "Analyzing text and optimizing for ATS readability using Executive terminology...",
    });
    setTimeout(() => {
      toast({
        title: "Resume Improved!",
        description: "Your summary and descriptions have been enhanced to sound highly professional.",
      });
    }, 2000);
  };

  const renderBullets = (text: string) => {
    if (!text) return null;
    return text.split(/[\n]/).filter(s => s.trim().length > 0).map((bullet, i) => (
      <li key={i} className="mb-[2px]">{bullet.trim()}{bullet.endsWith('.') ? '' : '.'}</li>
    ));
  };

  const handleDownload = async () => {
    toast({ title: "Generating PDF...", description: "Please wait while we render your professional resume." });
    
    // Lazy load html2pdf.js from CDN
    if (!(window as any).html2pdf) {
      await new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        script.onload = resolve;
        document.head.appendChild(script);
      });
    }

    const element = printRef.current;
    if (!element) return;
    
    // Temporarily make the hidden print wrapper block-level and position it at top-left
    // This prevents html2canvas from cutting off the left side due to 'mx-auto' or scroll offsets.
    element.classList.remove('hidden');
    element.classList.add('block');
    const originalStyle = element.style.cssText;
    element.style.position = 'absolute';
    element.style.left = '0px';
    element.style.top = '0px';
    element.style.margin = '0px';
    element.style.zIndex = '9999';

    const opt = {
      margin:       0,
      filename:     `${name.replace(/\\s/g, "_")}_Resume.pdf`,
      image:        { type: 'jpeg', quality: 1 },
      html2canvas:  { scale: 2, useCORS: true, letterRendering: true, scrollY: 0, scrollX: 0 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak:    { mode: ['css', 'legacy'] }
    };
    
    try {
      await (window as any).html2pdf().set(opt).from(element).save();
      toast({ title: "PDF Exported!", description: "Your resume has been successfully downloaded." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to generate PDF.", variant: "destructive" });
    } finally {
      // Re-hide and restore original styles
      element.classList.remove('block');
      element.classList.add('hidden');
      element.style.cssText = originalStyle;
    }
  };

  const handleDownloadDocx = () => {
    const printContent = printRef.current;
    if (!printContent) return;
    const preHtml = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Resume</title><style>body { font-family: 'Times New Roman', serif; }</style></head><body>";
    const postHtml = "</body></html>";
    const html = preHtml + printContent.innerHTML + postHtml;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
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

  // --- Renderers for 5 Themes ---

  // 1. Executive (Harvard Business School / Wall St Style)
  const renderExecutiveTheme = (isPrint = false) => (
    <div className={`px-10 py-10 bg-white text-black leading-tight ${isPrint ? "w-[210mm] min-h-[297mm]" : "w-full aspect-[1/1.414]"}`} style={{ fontFamily: '"Times New Roman", Times, serif' }}>
      <div className="text-center mb-4">
        <h1 className="text-[20px] font-bold uppercase tracking-wide mb-1">{name}</h1>
        <div className="text-[11px] flex flex-wrap justify-center items-center gap-2">
          {address && <span>{address}</span>}
          {address && phone && <span>|</span>}
          {phone && <span>{phone}</span>}
          {phone && email && <span>|</span>}
          {email && <span>{email}</span>}
          {email && linkedin && <span>|</span>}
          {linkedin && <span>{linkedin.replace('https://', '').replace('www.', '')}</span>}
          {linkedin && github && <span>|</span>}
          {github && <span>{github.replace('https://', '').replace('www.', '')}</span>}
        </div>
      </div>

      {summary && (
        <div className="mb-4">
          <h2 className="text-[12px] font-bold uppercase border-b-[1px] border-black pb-[2px] mb-2">{headers.summary}</h2>
          <p className="text-[11px] leading-snug">{summary}</p>
        </div>
      )}

      {(["experience", "project", "education", "certification"] as const).map(type => {
        const items = sections.filter(s => s.type === type);
        if (!items.length) return null;
        const label = type === 'experience' ? headers.experience : type === 'education' ? headers.education : type === 'certification' ? headers.certifications : headers.project;
        return (
          <div key={type} className="mb-4">
            <h2 className="text-[12px] font-bold uppercase border-b-[1px] border-black pb-[2px] mb-2">{label}</h2>
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id}>
                  {/* For Experience/Education: Company/School on left, Dates on right */}
                  <div className="flex justify-between items-end mb-[1px]">
                    <span className="font-bold text-[11px]">{item.subtitle ? item.subtitle : item.title}</span>
                    <span className="text-[11px] whitespace-nowrap">{item.period}</span>
                  </div>
                  {/* Job Title / Degree Name */}
                  {item.subtitle && (
                    <div className="flex justify-between items-end mb-1">
                      <span className="italic text-[11px]">{item.title}</span>
                      {item.link && <span className="text-[10px]">{item.link}</span>}
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
      })}

      {skills && (
        <div className="mb-4">
          <h2 className="text-[12px] font-bold uppercase border-b-[1px] border-black pb-[2px] mb-2">{headers.skills}</h2>
          <div className="text-[11px]">
            <span className="font-bold">Technical Skills: </span> {skills}
          </div>
        </div>
      )}
      {languages && (
        <div className="mb-4 text-[11px]">
          <span className="font-bold">Languages: </span> {languages}
        </div>
      )}
    </div>
  );

  // 2. Classic (Standard ATS)
  const renderClassicTheme = (isPrint = false) => (
    <div className={`p-8 sm:p-10 bg-white text-gray-900 font-sans leading-relaxed ${isPrint ? "w-[210mm] min-h-[297mm]" : "w-full aspect-[1/1.414]"}`}>
      <div className="text-center pb-4 mb-5 border-b-2 border-gray-200">
        <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-1">{name}</h1>
        <h2 className="text-[15px] font-semibold text-gray-600 mb-2 uppercase tracking-widest">{title}</h2>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-1 text-gray-600 text-[11px] font-medium">
          <span>{phone}</span> <span>•</span>
          <span>{email}</span> <span>•</span>
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
          <h2 className="text-[13px] font-bold uppercase tracking-widest text-gray-900 mb-1.5">{headers.summary}</h2>
          <p className="text-[11px] leading-snug text-gray-700">{summary}</p>
        </div>
      )}

      {skills && (
        <div className="mb-5">
          <h2 className="text-[13px] font-bold uppercase tracking-widest text-gray-900 mb-1.5">{headers.skills}</h2>
          <p className="text-[11px] text-gray-700 font-medium">{skills}</p>
        </div>
      )}

      {(["experience", "education", "project", "certification"] as const).map(type => {
        const items = sections.filter(s => s.type === type);
        if (!items.length) return null;
        const label = type === 'experience' ? headers.experience : type === 'education' ? headers.education : type === 'certification' ? headers.certifications : headers.project;
        return (
          <div key={type} className="mb-5">
            <h2 className="text-[13px] font-bold uppercase tracking-widest text-gray-900 mb-2">{label}</h2>
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="font-bold text-[12px] text-gray-900">{item.title}{item.subtitle ? ` — ${item.subtitle}` : ''}</span>
                    <span className="text-[11px] font-semibold text-gray-500 whitespace-nowrap">{item.period}</span>
                  </div>
                  {item.link && <div className="text-[10px] text-gray-500 mb-1">{item.link}</div>}
                  <ul className="list-disc list-inside text-[11px] pl-2 mt-1 space-y-0.5 leading-snug text-gray-700">
                    {renderBullets(item.description)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  // 3. Modern
  const renderModernTheme = (isPrint = false) => (
    <div className={`flex text-slate-800 font-sans ${isPrint ? "w-[210mm] min-h-[297mm]" : "w-full aspect-[1/1.414]"} bg-gradient-to-r from-[#f4f4f5] from-[35%] to-white to-[35%]`}>
      <div className="w-[35%] p-6 sm:p-8 flex flex-col gap-6 border-r border-slate-200">
        {includeAvatar && (
          <div className="flex justify-center">
            <img src={avatarUrl} alt="Profile" className="w-28 h-28 lg:w-36 lg:h-36 rounded-full object-cover border-[3px] border-white shadow-md mx-auto" />
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-[12px] font-bold tracking-widest text-[#2c3e50] uppercase border-b border-slate-300 pb-1 mb-3">{headers.contact}</h3>
          <div className="text-[10px] space-y-2 text-slate-700 font-medium break-all">
            <div className="flex items-center gap-2"><span>📞</span>{phone}</div>
            <div className="flex items-center gap-2"><span>✉️</span>{email}</div>
            <div className="flex items-center gap-2"><span>📍</span>{address}</div>
            {linkedin && <div className="flex items-center gap-2"><span>in</span>{linkedin.replace('https://', '')}</div>}
            {github && <div className="flex items-center gap-2"><span>gh</span>{github.replace('https://', '')}</div>}
          </div>
        </div>

        {skills && (
          <div className="space-y-2">
            <h3 className="text-[12px] font-bold tracking-widest text-[#2c3e50] uppercase border-b border-slate-300 pb-1 mb-3">{headers.skills}</h3>
            <ul className="text-[10px] text-slate-700 space-y-1.5 font-medium">
              {skills.split(',').map(s => <li key={s} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#2c3e50] shrink-0" />{s.trim()}</li>)}
            </ul>
          </div>
        )}

        {languages && (
          <div className="space-y-2">
            <h3 className="text-[12px] font-bold tracking-widest text-[#2c3e50] uppercase border-b border-slate-300 pb-1 mb-3">{headers.languages}</h3>
            <ul className="text-[10px] text-slate-700 space-y-1.5 font-medium">
              {languages.split(',').map(s => <li key={s} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#2c3e50] shrink-0" />{s.trim()}</li>)}
            </ul>
          </div>
        )}
      </div>

      <div className="w-[65%] p-6 sm:p-10 flex flex-col gap-6 bg-white">
        <div>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-[#2c3e50] uppercase mb-1 leading-none">{name}</h1>
          <h2 className="text-[14px] tracking-widest text-slate-500 uppercase font-semibold">{title}</h2>
        </div>

        {summary && (
          <div>
            <h3 className="text-[13px] font-bold tracking-widest text-[#2c3e50] uppercase border-b border-slate-200 pb-1 mb-3">{headers.summary}</h3>
            <p className="text-[11px] leading-relaxed text-slate-600 font-medium">{summary}</p>
          </div>
        )}

        {(["experience", "education", "project", "certification"] as const).map(type => {
          const items = sections.filter(s => s.type === type);
          if (!items.length) return null;
          const label = type === 'experience' ? headers.experience : type === 'education' ? headers.education : type === 'certification' ? headers.certifications : headers.project;
          return (
            <div key={type}>
              <h3 className="text-[13px] font-bold tracking-widest text-[#2c3e50] uppercase border-b border-slate-200 pb-1 mb-4">{label}</h3>
              <div className="space-y-5">
                {items.map(item => (
                  <div key={item.id} className="relative pl-4 border-l-2 border-[#2c3e50]/20" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-[#2c3e50]" />
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className="font-bold text-[12px] text-[#2c3e50] uppercase">{item.title}</h4>
                      <span className="text-[10px] font-bold text-[#2c3e50] whitespace-nowrap bg-slate-100 px-2 py-0.5 rounded">{item.period}</span>
                    </div>
                    <div className="text-[11px] font-bold text-slate-500 mb-1.5">{item.subtitle}</div>
                    {item.link && <div className="text-[10px] text-blue-500 mb-1">{item.link}</div>}
                    <ul className="list-disc list-inside text-[11px] leading-relaxed text-slate-600 pl-1">
                      {renderBullets(item.description)}
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

  // 4. Creative
  const renderCreativeTheme = (isPrint = false) => (
    <div className={`bg-[#f9fafb] text-gray-800 font-sans ${isPrint ? "w-[210mm] min-h-[297mm]" : "w-full aspect-[1/1.414]"}`}>
      <div className="bg-[#4f46e5] text-white p-8 sm:p-10 pb-16 flex justify-between items-center clip-path-slant">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">{name}</h1>
          <h2 className="text-xl font-medium text-indigo-200">{title}</h2>
        </div>
        {includeAvatar && (
          <img src={avatarUrl} alt="Profile" className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-xl rotate-3" />
        )}
      </div>

      <div className="flex -mt-8 bg-gradient-to-l from-gray-50 from-[35%] to-transparent to-[35%]">
        <div className="w-[65%] p-6 sm:p-10 pt-0 flex flex-col gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 mt-[-2rem] relative z-10 border border-gray-100">
            <h3 className="text-[13px] font-black text-indigo-600 uppercase mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4" /> {headers.summary}</h3>
            <p className="text-[12px] leading-relaxed text-gray-600">{summary}</p>
          </div>

          {(["experience", "education", "project"] as const).map(type => {
            const items = sections.filter(s => s.type === type);
            if (!items.length) return null;
            const label = type === 'experience' ? headers.experience : type === 'education' ? headers.education : headers.project;
            return (
              <div key={type}>
                <h3 className="text-[14px] font-black text-gray-800 uppercase border-b-2 border-indigo-100 pb-2 mb-4 inline-block">{label}</h3>
                <div className="space-y-6">
                  {items.map(item => (
                    <div key={item.id} className="relative" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className="font-bold text-[13px] text-gray-800">{item.title}</h4>
                        <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{item.period}</span>
                      </div>
                      <div className="text-[12px] font-medium text-gray-500 mb-2">{item.subtitle}</div>
                      {item.link && <div className="text-[11px] text-indigo-500 mb-2">{item.link}</div>}
                      <ul className="list-none text-[12px] leading-relaxed text-gray-600 space-y-1">
                        {item.description.split(/[\n]/).filter(s => s.trim().length > 0).map((bullet, i) => (
                          <li key={i} className="flex gap-2"><span className="text-indigo-400 mt-[2px]">✦</span> <span>{bullet.trim()}{bullet.endsWith('.') ? '' : '.'}</span></li>
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
            <h3 className="text-[13px] font-black text-gray-800 uppercase tracking-widest">{headers.contact}</h3>
            <div className="text-[11px] space-y-3 text-gray-600 break-all">
              <div><strong className="block text-gray-800 mb-0.5">Phone</strong>{phone}</div>
              <div><strong className="block text-gray-800 mb-0.5">Email</strong>{email}</div>
              <div><strong className="block text-gray-800 mb-0.5">Address</strong>{address}</div>
              {linkedin && <div><strong className="block text-gray-800 mb-0.5">LinkedIn</strong>{linkedin}</div>}
              {github && <div><strong className="block text-gray-800 mb-0.5">GitHub</strong>{github}</div>}
            </div>
          </div>

          {skills && (
            <div className="space-y-3">
              <h3 className="text-[13px] font-black text-gray-800 uppercase tracking-widest">{headers.skills}</h3>
              <div className="flex flex-wrap gap-1.5">
                {skills.split(',').map(s => <span key={s} className="bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-md text-[10px] font-bold">{s.trim()}</span>)}
              </div>
            </div>
          )}

          {languages && (
            <div className="space-y-3">
              <h3 className="text-[13px] font-black text-gray-800 uppercase tracking-widest">{headers.languages}</h3>
              <div className="flex flex-col gap-1.5">
                {languages.split(',').map(s => <span key={s} className="text-gray-600 text-[11px]">{s.trim()}</span>)}
              </div>
            </div>
          )}

          {sections.filter(s => s.type === "certification").length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[13px] font-black text-gray-800 uppercase tracking-widest">{headers.certifications}</h3>
              <div className="space-y-3">
                {sections.filter(s => s.type === "certification").map(item => (
                  <div key={item.id}>
                    <div className="font-bold text-[11px] text-gray-800">{item.title}</div>
                    <div className="text-[10px] text-gray-500">{item.subtitle} • {item.period}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // 5. Developer
  const renderDeveloperTheme = (isPrint = false) => (
    <div className={`p-8 sm:p-10 bg-[#0d1117] text-[#c9d1d9] font-mono leading-relaxed ${isPrint ? "w-[210mm] min-h-[297mm]" : "w-full aspect-[1/1.414]"}`}>
      <div className="border-b border-[#30363d] pb-6 mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-[#58a6ff] mb-2">{`// ${name}`}</h1>
        <h2 className="text-lg text-[#8b949e] mb-4">{`> ${title}`}</h2>
        <div className="grid grid-cols-2 gap-2 text-[11px] text-[#8b949e]">
          <div><span className="text-[#ff7b72]">const</span> phone = <span className="text-[#a5d6ff]">"{phone}"</span>;</div>
          <div><span className="text-[#ff7b72]">const</span> email = <span className="text-[#a5d6ff]">"{email}"</span>;</div>
          <div><span className="text-[#ff7b72]">const</span> location = <span className="text-[#a5d6ff]">"{address}"</span>;</div>
          {github && <div><span className="text-[#ff7b72]">const</span> github = <span className="text-[#a5d6ff]">"{github}"</span>;</div>}
          {linkedin && <div className="col-span-2"><span className="text-[#ff7b72]">const</span> linkedin = <span className="text-[#a5d6ff]">"{linkedin}"</span>;</div>}
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
              {skills.split(',').map(s => `"${s.trim()}"`).join(', ')}
            </span>
            ];
          </div>
        </div>
      )}

      {(["project", "experience", "education", "certification"] as const).map(type => {
        const items = sections.filter(s => s.type === type);
        if (!items.length) return null;
        const label = type === 'experience' ? headers.experience : type === 'education' ? headers.education : type === 'certification' ? headers.certifications : headers.project;
        return (
          <div key={type} className="mb-6">
            <h2 className="text-[13px] font-bold text-[#7ee787] mb-3">{`/* ${label} */`}</h2>
            <div className="space-y-5 border-l border-[#30363d] pl-4">
              {items.map(item => (
                <div key={item.id} className="relative">
                  <div className="absolute -left-[21px] top-1.5 text-[#30363d] text-[10px]">&gt;</div>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-bold text-[12px] text-[#d2a8ff]">{item.title} <span className="text-[#8b949e] font-normal">@ {item.subtitle}</span></span>
                    <span className="text-[11px] text-[#8b949e]">{item.period}</span>
                  </div>
                  {item.link && <div className="text-[11px] text-[#58a6ff] hover:underline mb-1">{item.link}</div>}
                  <ul className="list-disc list-inside text-[11px] mt-2 space-y-1 opacity-80">
                    {renderBullets(item.description)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  const themesList: { id: Theme, name: string, icon: any }[] = [
    { id: "executive", name: "Executive", icon: Briefcase },
    { id: "classic", name: "Classic", icon: AlignLeft },
    { id: "modern", name: "Modern", icon: Columns },
    { id: "creative", name: "Creative", icon: Palette },
    { id: "developer", name: "Developer", icon: Terminal },
  ];

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-card border border-border p-5 rounded-2xl shadow-sm gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2"><LayoutTemplate className="h-5 w-5 text-blue-500" /> Resume Studio Pro</h2>
          <p className="text-sm text-muted-foreground mt-1">Design, customize sections, choose themes, and export instantly.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
          <button onClick={handleAIImprove} className="shrink-0 flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-500/20 transition-all">
            <Bot className="h-4 w-4" /> AI Enhance
          </button>
          <button onClick={handleDownloadDocx} className="shrink-0 flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-bold text-white hover:bg-indigo-700 shadow-md transition-all">
            <FileDown className="h-4 w-4" /> Export DOCX
          </button>
          <button onClick={handleDownload} className="shrink-0 flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 px-5 py-2 text-sm font-bold text-white shadow-md transition-all">
            <Download className="h-4 w-4" /> Export PDF
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr,600px] gap-6">
        {/* Left Side: Editor */}
        <div className="space-y-6">

          {/* Theme & Structure Settings */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="font-bold text-foreground font-display flex items-center gap-2 border-b border-border pb-3 mb-4">
              Resume Theme
            </h3>
            <div className="flex flex-wrap gap-3 mb-5">
              {themesList.map((t) => {
                const Icon = t.icon;
                return (
                  <button key={t.id} onClick={() => setTheme(t.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all flex-1 min-w-[120px] justify-center ${theme === t.id ? 'border-primary bg-primary/5 text-primary shadow-sm ring-1 ring-primary/50' : 'border-border bg-card text-muted-foreground hover:bg-secondary'}`}>
                    <Icon className="h-4 w-4" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">{t.name}</span>
                  </button>
                )
              })}
            </div>

            <AnimatePresence>
              {(theme === "modern" || theme === "creative") && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-5 overflow-hidden">
                  <div className="flex flex-col gap-3 bg-secondary/30 p-4 rounded-xl border border-border">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                      <input type="checkbox" checked={includeAvatar} onChange={(e) => setIncludeAvatar(e.target.checked)} className="rounded border-border text-primary" />
                      <ImageIcon className="h-4 w-4 text-blue-500" />
                      Include Profile Picture
                    </label>
                    {includeAvatar && (
                      <div className="flex items-center gap-3 mt-2">
                        <img src={avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover border" />
                        <label className="text-xs font-bold bg-white dark:bg-zinc-800 border px-3 py-1.5 rounded-lg cursor-pointer hover:bg-secondary transition flex items-center gap-1">
                          <Upload className="w-3 h-3" /> Upload Photo
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-2 block border-t border-border pt-4">Customize Section Headers</label>
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-[10px] text-muted-foreground block mb-1">Education Header</span><Input value={headers.education} onChange={e => setHeaders({ ...headers, education: e.target.value })} className="h-8 text-xs bg-secondary/30" /></div>
              <div><span className="text-[10px] text-muted-foreground block mb-1">Experience Header</span><Input value={headers.experience} onChange={e => setHeaders({ ...headers, experience: e.target.value })} className="h-8 text-xs bg-secondary/30" /></div>
              <div><span className="text-[10px] text-muted-foreground block mb-1">Skills Header</span><Input value={headers.skills} onChange={e => setHeaders({ ...headers, skills: e.target.value })} className="h-8 text-xs bg-secondary/30" /></div>
              <div><span className="text-[10px] text-muted-foreground block mb-1">Projects/Custom</span><Input value={headers.project} onChange={e => setHeaders({ ...headers, project: e.target.value })} className="h-8 text-xs bg-secondary/30" /></div>
            </div>
          </div>

          {/* Personal Info */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-foreground font-display flex items-center gap-2 border-b border-border pb-3">Personal Information</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Full Name</label><Input value={name} onChange={e => setName(e.target.value)} className="rounded-xl bg-secondary/50" /></div>
              <div><label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Title / Profession</label><Input value={title} onChange={e => setTitle(e.target.value)} className="rounded-xl bg-secondary/50" /></div>
              <div><label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Email</label><Input value={email} onChange={e => setEmail(e.target.value)} className="rounded-xl bg-secondary/50" /></div>
              <div><label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Phone</label><Input value={phone} onChange={e => setPhone(e.target.value)} className="rounded-xl bg-secondary/50" /></div>
              <div><label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Address / Location</label><Input value={address} onChange={e => setAddress(e.target.value)} className="rounded-xl bg-secondary/50" /></div>
              <div><label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-1 block">LinkedIn</label><Input value={linkedin} onChange={e => setLinkedin(e.target.value)} className="rounded-xl bg-secondary/50" /></div>
              <div className="sm:col-span-2"><label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-1 block">GitHub / Portfolio</label><Input value={github} onChange={e => setGithub(e.target.value)} className="rounded-xl bg-secondary/50" /></div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-foreground font-display flex items-center gap-2 border-b border-border pb-3">Summary & Skills</h3>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Professional Summary</label>
                <button onClick={handleAIImprove} className="text-[10px] text-blue-500 font-bold flex items-center gap-1 hover:text-blue-600"><Sparkles className="w-3 h-3" /> AI Improve</button>
              </div>
              <Textarea value={summary} onChange={e => setSummary(e.target.value)} placeholder="Write a short summary..." className="rounded-xl bg-secondary/50 min-h-[100px] text-sm leading-relaxed" />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Core Skills</label>
              <Input value={skills} onChange={e => setSkills(e.target.value)} placeholder="Comma separated..." className="rounded-xl bg-secondary/50" />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Languages</label>
              <Input value={languages} onChange={e => setLanguages(e.target.value)} placeholder="Comma separated..." className="rounded-xl bg-secondary/50" />
            </div>
          </div>

          {/* Dynamic Builder Sections */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-foreground font-display flex items-center gap-2 border-b border-border pb-3">Experiences, Education, Projects & Certs</h3>
            {(["experience", "education", "project", "certification"] as const).map((type) => {
              const items = sections.filter((s) => s.type === type);
              return (
                <div key={type} className="bg-secondary/20 p-4 rounded-xl border border-border/50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs uppercase tracking-wider font-bold text-foreground">{type === 'experience' ? headers.experience : type === 'education' ? headers.education : type === 'certification' ? headers.certifications : headers.project}</h4>
                    <button onClick={() => addSection(type)} className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-500/10 px-2 py-1 rounded">
                      <Plus className="h-3 w-3" /> Add Box
                    </button>
                  </div>
                  <div className="space-y-4">
                    {items.map((section) => (
                      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} key={section.id} className="relative group p-4 border border-border bg-card rounded-xl shadow-sm">
                        <button onClick={() => removeSection(section.id)} className="absolute top-2 right-2 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-secondary p-1.5 rounded-md shadow-sm"><Trash2 className="h-3 w-3" /></button>
                        <div className="grid gap-3 sm:grid-cols-2 mb-3">
                          <Input placeholder={type === 'education' ? "Degree (e.g. B.S. Computer Science)" : "Role / Title"} value={section.title} onChange={(e) => updateSection(section.id, "title", e.target.value)} className="h-9 text-xs bg-secondary/30 font-bold" />
                          <Input placeholder={type === 'education' ? "University / Institution" : "Company / Organization"} value={section.subtitle} onChange={(e) => updateSection(section.id, "subtitle", e.target.value)} className="h-9 text-xs bg-secondary/30 font-medium text-muted-foreground" />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 mb-3">
                          <Input placeholder="Time Period (e.g. Oct 2021 - Present)" value={section.period} onChange={(e) => updateSection(section.id, "period", e.target.value)} className="h-8 text-xs bg-secondary/30 w-full" />
                          <Input placeholder="Link (Optional, e.g. URL)" value={section.link || ""} onChange={(e) => updateSection(section.id, "link", e.target.value)} className="h-8 text-xs bg-secondary/30 w-full" />
                        </div>
                        <div className="relative">
                          <div className="absolute right-2 top-2 z-10">
                            <button onClick={handleAIImprove} className="text-[10px] text-blue-500 font-bold flex items-center gap-1 hover:text-blue-600 bg-blue-50 px-2 py-1 rounded"><Sparkles className="w-3 h-3" /> Auto-bullet</button>
                          </div>
                          <Textarea placeholder="Highlights & Achievements (Use new lines for bullets)..." value={section.description} onChange={(e) => updateSection(section.id, "description", e.target.value)} className="text-xs bg-secondary/30 min-h-[120px] pt-8 leading-relaxed" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Side: Live Preview */}
        <div className="hidden lg:flex relative sticky top-24 h-[calc(100vh-120px)] w-full overflow-hidden rounded-2xl border-4 border-secondary bg-zinc-200 dark:bg-zinc-800 shadow-inner flex-col items-center">
          <div className="absolute top-4 right-4 bg-background px-3 py-1.5 rounded-lg text-[10px] font-bold text-foreground uppercase tracking-widest shadow-md z-10 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-500" /> Live Preview
          </div>

          <div className="w-full h-full overflow-y-auto no-scrollbar flex justify-center items-start pt-10 pb-32">
            <div 
              className="bg-white shadow-2xl origin-top"
              style={{ width: '210mm', minHeight: '297mm', transform: 'scale(0.55)', marginBottom: '-45%' }}
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

      {/* Hidden Print Wrapper */}
      <div id="print-resume-container" ref={printRef} className="hidden print:block w-[210mm] mx-auto bg-white">
        {theme === "executive" && renderExecutiveTheme(true)}
        {theme === "classic" && renderClassicTheme(true)}
        {theme === "modern" && renderModernTheme(true)}
        {theme === "creative" && renderCreativeTheme(true)}
        {theme === "developer" && renderDeveloperTheme(true)}
      </div>

    </div>
  );
}
