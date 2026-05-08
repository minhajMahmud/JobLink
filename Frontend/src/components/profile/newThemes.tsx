import React from "react";

// ─────────────────────────────────────────────
// Types (duplicated from ResumeBuilder to avoid import cycle)
// ─────────────────────────────────────────────
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

export interface ThemeRenderProps {
  name: string;
  jobTitle: string;
  phone: string;
  email: string;
  address: string;
  linkedin: string;
  github: string;
  summary: string;
  skills: string;
  languages: string;
  headers: ResumeHeaders;
  sections: ResumeSection[];
  renderBullets: (text: string) => React.ReactNode;
  isPrint?: boolean;
  includeAvatar?: boolean;
  avatarUrl?: string;
}

// ─────────────────────────────────────────────
// NEW THEMES (10 more professional templates)
// ─────────────────────────────────────────────

export const newThemeRenderers: Record<string, (p: ThemeRenderProps) => React.ReactNode> = {
  // 6. Minimalist
  minimal: ({ name, jobTitle, phone, email, address, linkedin, github, summary, skills, languages, headers, sections, renderBullets, isPrint }) => (
    <div className={`bg-white text-gray-800 font-sans leading-relaxed ${isPrint ? "w-[210mm] min-h-[297mm]" : "w-full aspect-[1/1.414]"} p-10`}>
      <div className="mb-6">
        <h1 className="text-2xl font-light text-gray-900 mb-1">{name}</h1>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-widest">{jobTitle}</h2>
        <div className="text-[10px] text-gray-400 mt-2 space-x-2">
          <span>{phone}</span><span>|</span><span>{email}</span><span>|</span><span>{address}</span>
        </div>
      </div>
      {summary && <div className="mb-5 text-[11px] text-gray-600 leading-relaxed">{summary}</div>}
      {(["experience", "education", "project", "certification"] as const).map(type => {
        const items = sections.filter(s => s.type === type);
        if (!items.length) return null;
        const label = type === "experience" ? headers.experience : type === "education" ? headers.education : type === "certification" ? headers.certifications : headers.project;
        return (
          <div key={type} className="mb-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">{label}</h3>
            {items.map(item => (
              <div key={item.id} className="mb-3">
                <div className="flex justify-between items-baseline">
                  <span className="font-medium text-[11px] text-gray-900">{item.title}</span>
                  <span className="text-[10px] text-gray-400">{item.period}</span>
                </div>
                {item.subtitle && <div className="text-[10px] text-gray-500 italic mb-1">{item.subtitle}</div>}
                <ul className="list-disc text-[10px] text-gray-600 pl-4 space-y-0.5">{renderBullets(item.description)}</ul>
              </div>
            ))}
          </div>
        );
      })}
      {skills && <div className="border-t border-gray-100 pt-3 mt-4 text-[10px] text-gray-600"><span className="font-medium">Skills: </span>{skills}</div>}
    </div>
  ),

  // 7. Professional Blue
  professional: ({ name, jobTitle, phone, email, address, linkedin, github, summary, skills, languages, headers, sections, renderBullets, isPrint }) => (
    <div className={`bg-white text-gray-800 font-sans ${isPrint ? "w-[210mm] min-h-[297mm]" : "w-full aspect-[1/1.414]"}`}>
      <div className="bg-[#1e3a5f] text-white p-8">
        <h1 className="text-2xl font-bold">{name}</h1>
        <h2 className="text-sm text-blue-200 mt-1">{jobTitle}</h2>
        <div className="text-[10px] text-blue-200 mt-3 flex flex-wrap gap-x-3">{phone && <span>{phone}</span>}{email && <span>{email}</span>}{address && <span>{address}</span>}</div>
      </div>
      <div className="p-8">
        {summary && <div className="mb-5 text-[11px] text-gray-600 leading-relaxed">{summary}</div>}
        {(["experience", "education", "project", "certification"] as const).map(type => {
          const items = sections.filter(s => s.type === type);
          if (!items.length) return null;
          const label = type === "experience" ? headers.experience : type === "education" ? headers.education : type === "certification" ? headers.certifications : headers.project;
          return (
            <div key={type} className="mb-4">
              <h3 className="text-[11px] font-bold text-[#1e3a5f] uppercase border-b-2 border-[#1e3a5f]/20 pb-1 mb-3">{label}</h3>
              {items.map(item => (
                <div key={item.id} className="mb-3">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-[11px] text-[#1e3a5f]">{item.title}</span>
                    <span className="text-[10px] text-gray-400">{item.period}</span>
                  </div>
                  {item.subtitle && <div className="text-[10px] text-gray-500 mb-1">{item.subtitle}</div>}
                  <ul className="list-disc text-[10px] text-gray-600 pl-4 space-y-0.5">{renderBullets(item.description)}</ul>
                </div>
              ))}
            </div>
          );
        })}
        {skills && <div className="text-[11px] text-gray-600 border-t border-gray-100 pt-3"><span className="font-bold text-[#1e3a5f]">Skills: </span>{skills}</div>}
      </div>
    </div>
  ),

  // 8. Elegant Serif
  elegant: ({ name, jobTitle, phone, email, address, linkedin, github, summary, skills, languages, headers, sections, renderBullets, isPrint }) => (
    <div className={`bg-white text-gray-900 font-serif leading-relaxed ${isPrint ? "w-[210mm] min-h-[297mm]" : "w-full aspect-[1/1.414]"} p-10`}>
      <div className="text-center border-b border-gray-200 pb-4 mb-5">
        <h1 className="text-[22px] font-bold tracking-wide text-gray-900">{name}</h1>
        <h2 className="text-[12px] italic text-gray-500 mt-1">{jobTitle}</h2>
        <div className="text-[10px] text-gray-400 mt-2 space-x-2">{phone && <span>{phone}</span>}<span>|</span>{email && <span>{email}</span>}</div>
      </div>
      {summary && <div className="mb-5 text-[11px] italic text-gray-600 leading-relaxed">{summary}</div>}
      {(["experience", "education", "project", "certification"] as const).map(type => {
        const items = sections.filter(s => s.type === type);
        if (!items.length) return null;
        const label = type === "experience" ? headers.experience : type === "education" ? headers.education : type === "certification" ? headers.certifications : headers.project;
        return (
          <div key={type} className="mb-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200 pb-1 mb-3">{label}</h3>
            {items.map(item => (
              <div key={item.id} className="mb-3">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-[11px] text-gray-800">{item.title}</span>
                  <span className="text-[10px] italic text-gray-400">{item.period}</span>
                </div>
                {item.subtitle && <div className="text-[10px] text-gray-500">{item.subtitle}</div>}
                <ul className="list-disc text-[10px] text-gray-600 pl-4 mt-1 space-y-0.5">{renderBullets(item.description)}</ul>
              </div>
            ))}
          </div>
        );
      })}
      {skills && <div className="text-[11px] text-gray-700 border-t border-gray-200 pt-3 mt-4"><span className="font-bold">Skills: </span>{skills}</div>}
    </div>
  ),

  // 9. Two-Column Corporate
  corporate: ({ name, jobTitle, phone, email, address, linkedin, github, summary, skills, languages, headers, sections, renderBullets, isPrint, includeAvatar, avatarUrl }) => (
    <div className={`flex bg-white text-gray-800 font-sans ${isPrint ? "w-[210mm] min-h-[297mm]" : "w-full aspect-[1/1.414]"}`}>
      <div className="w-[30%] bg-[#2c3e50] text-white p-6 flex flex-col gap-5">
        {includeAvatar && avatarUrl && (
          <img src={avatarUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-white/50 mx-auto" />
        )}
        <div>
          <h4 className="text-[9px] uppercase tracking-widest text-gray-300 mb-2">Contact</h4>
          <div className="text-[10px] space-y-1.5 text-gray-200">{phone}<br />{email}<br />{address}<br />{linkedin}<br />{github}</div>
        </div>
        {skills && <div><h4 className="text-[9px] uppercase tracking-widest text-gray-300 mb-2">{headers.skills}</h4><div className="flex flex-wrap gap-1">{skills.split(",").map(s => <span key={s} className="text-[9px] bg-white/10 px-2 py-0.5 rounded">{s.trim()}</span>)}</div></div>}
        {languages && <div><h4 className="text-[9px] uppercase tracking-widest text-gray-300 mb-2">{headers.languages}</h4><div className="text-[10px] text-gray-200">{languages}</div></div>}
      </div>
      <div className="w-[70%] p-6 flex flex-col gap-4">
        <div className="mb-2">
          <h1 className="text-xl font-bold text-[#2c3e50]">{name}</h1>
          <h2 className="text-[11px] text-gray-500 uppercase tracking-widest">{jobTitle}</h2>
        </div>
        {summary && <p className="text-[10px] text-gray-600 leading-relaxed">{summary}</p>}
        {(["experience", "education", "project", "certification"] as const).map(type => {
          const items = sections.filter(s => s.type === type);
          if (!items.length) return null;
          const label = type === "experience" ? headers.experience : type === "education" ? headers.education : type === "certification" ? headers.certifications : headers.project;
          return (
            <div key={type}>
              <h3 className="text-[10px] font-bold text-[#2c3e50] uppercase tracking-widest border-b border-gray-200 pb-1 mb-2">{label}</h3>
              {items.map(item => (
                <div key={item.id} className="mb-2">
                  <div className="flex justify-between"><span className="font-semibold text-[10px] text-[#2c3e50]">{item.title}</span><span className="text-[9px] text-gray-400">{item.period}</span></div>
                  {item.subtitle && <div className="text-[9px] text-gray-500">{item.subtitle}</div>}
                  <ul className="list-disc text-[9px] text-gray-600 pl-3">{renderBullets(item.description)}</ul>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  ),

  // 10. Clean Sans (modern clean look)
  clean: ({ name, jobTitle, phone, email, address, linkedin, github, summary, skills, languages, headers, sections, renderBullets, isPrint }) => (
    <div className={`bg-white text-gray-800 font-sans ${isPrint ? "w-[210mm] min-h-[297mm]" : "w-full aspect-[1/1.414]"}`}>
      <div className="bg-gray-900 text-white px-8 py-6">
        <h1 className="text-[22px] font-light tracking-wide">{name}</h1>
        <h2 className="text-[11px] font-light text-gray-300 mt-0.5">{jobTitle}</h2>
        <div className="text-[9px] text-gray-400 mt-2 flex gap-3">{phone && <span>{phone}</span>}{email && <span>{email}</span>}{address && <span>{address}</span>}</div>
      </div>
      <div className="px-8 py-5">
        {summary && <div className="text-[11px] text-gray-600 leading-relaxed mb-5">{summary}</div>}
        {(["experience", "education", "project", "certification"] as const).map(type => {
          const items = sections.filter(s => s.type === type);
          if (!items.length) return null;
          const label = type === "experience" ? headers.experience : type === "education" ? headers.education : type === "certification" ? headers.certifications : headers.project;
          return (
            <div key={type} className="mb-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{label}</h3>
              {items.map(item => (
                <div key={item.id} className="mb-2 pl-3 border-l-2 border-gray-100">
                  <div className="flex justify-between"><span className="font-medium text-[11px]">{item.title}</span><span className="text-[9px] text-gray-400">{item.period}</span></div>
                  {item.subtitle && <div className="text-[9px] text-gray-500">{item.subtitle}</div>}
                  <ul className="list-disc text-[10px] text-gray-600 pl-3 mt-0.5">{renderBullets(item.description)}</ul>
                </div>
              ))}
            </div>
          );
        })}
        {skills && <div className="border-t border-gray-100 pt-3 text-[10px] text-gray-600"><span className="font-medium">Skills: </span>{skills}</div>}
      </div>
    </div>
  ),

  // 11. Compact (space-saver for experienced candidates)
  compact: ({ name, jobTitle, phone, email, address, linkedin, github, summary, skills, languages, headers, sections, renderBullets, isPrint }) => (
    <div className={`bg-white text-gray-800 font-sans leading-tight ${isPrint ? "w-[210mm] min-h-[297mm]" : "w-full aspect-[1/1.414]"} p-6`}>
      <div className="flex justify-between items-end border-b border-gray-200 pb-2 mb-3">
        <div>
          <h1 className="text-lg font-bold">{name}</h1>
          <h2 className="text-[10px] text-gray-500">{jobTitle}</h2>
        </div>
        <div className="text-[9px] text-gray-400 text-right">{phone && <div>{phone}</div>}{email && <div>{email}</div>}{address && <div>{address}</div>}</div>
      </div>
      {summary && <p className="text-[10px] text-gray-600 mb-3">{summary}</p>}
      {(["experience", "education", "project", "certification"] as const).map(type => {
        const items = sections.filter(s => s.type === type);
        if (!items.length) return null;
        const label = type === "experience" ? headers.experience : type === "education" ? headers.education : type === "certification" ? headers.certifications : headers.project;
        return (
          <div key={type} className="mb-2">
            <h3 className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">{label}</h3>
            {items.map(item => (
              <div key={item.id} className="mb-1.5">
                <div className="flex justify-between items-baseline"><span className="font-medium text-[10px]">{item.title}</span><span className="text-[8px] text-gray-400">{item.period}</span></div>
                {item.subtitle && <div className="text-[9px] text-gray-500">{item.subtitle}</div>}
                <ul className="list-disc text-[9px] text-gray-600 pl-3">{renderBullets(item.description)}</ul>
              </div>
            ))}
          </div>
        );
      })}
      {skills && <div className="text-[9px] text-gray-600 border-t border-gray-100 pt-1"><span className="font-medium">Skills: </span>{skills}</div>}
    </div>
  ),

  // 12. Creative Modern (gradient accent)
  "creative-modern": ({ name, jobTitle, phone, email, address, linkedin, github, summary, skills, languages, headers, sections, renderBullets, isPrint, includeAvatar, avatarUrl }) => (
    <div className={`bg-white text-gray-800 font-sans ${isPrint ? "w-[210mm] min-h-[297mm]" : "w-full aspect-[1/1.414]"}`}>
      <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white p-8 flex items-end gap-6">
        {includeAvatar && avatarUrl && <img src={avatarUrl} alt="" className="w-20 h-20 rounded-full border-2 border-white/50 object-cover" />}
        <div>
          <h1 className="text-2xl font-black tracking-tight">{name}</h1>
          <h2 className="text-sm font-light text-white/80 mt-1">{jobTitle}</h2>
          <div className="text-[10px] text-white/60 mt-2 flex gap-3">{phone}<span>|</span>{email}</div>
        </div>
      </div>
      <div className="p-8">
        {summary && <div className="text-[11px] text-gray-600 leading-relaxed mb-5">{summary}</div>}
        {(["experience", "education", "project", "certification"] as const).map(type => {
          const items = sections.filter(s => s.type === type);
          if (!items.length) return null;
          const label = type === "experience" ? headers.experience : type === "education" ? headers.education : type === "certification" ? headers.certifications : headers.project;
          return (
            <div key={type} className="mb-4">
              <h3 className="text-[10px] font-bold text-violet-600 uppercase tracking-widest mb-2">{label}</h3>
              {items.map(item => (
                <div key={item.id} className="mb-2 pl-3 border-l-2 border-violet-200">
                  <div className="flex justify-between"><span className="font-semibold text-[11px]">{item.title}</span><span className="text-[9px] text-gray-400">{item.period}</span></div>
                  {item.subtitle && <div className="text-[9px] text-gray-500">{item.subtitle}</div>}
                  <ul className="list-disc text-[10px] text-gray-600 pl-3">{renderBullets(item.description)}</ul>
                </div>
              ))}
            </div>
          );
        })}
        {skills && <div className="text-[10px] text-gray-600 border-t border-violet-100 pt-3"><span className="font-bold text-violet-600">Skills: </span>{skills}</div>}
      </div>
    </div>
  ),

  // 13. Academic (for research/education roles)
  academic: ({ name, jobTitle, phone, email, address, linkedin, github, summary, skills, languages, headers, sections, renderBullets, isPrint }) => (
    <div className={`bg-white text-gray-800 font-serif ${isPrint ? "w-[210mm] min-h-[297mm]" : "w-full aspect-[1/1.414]"} p-10`}>
      <div className="text-center mb-6">
        <h1 className="text-[20px] font-bold text-gray-900">{name}</h1>
        <h2 className="text-[12px] text-gray-500 italic mt-1">{jobTitle}</h2>
        <div className="text-[10px] text-gray-400 mt-2">{email} | {phone} | {address}</div>
      </div>
      {summary && <div className="mb-5 text-[11px] text-gray-600 leading-relaxed text-center italic">{summary}</div>}
      {(["education", "experience", "project", "certification"] as const).map(type => {
        const items = sections.filter(s => s.type === type);
        if (!items.length) return null;
        const label = type === "education" ? headers.education : type === "experience" ? headers.experience : type === "certification" ? headers.certifications : headers.project;
        return (
          <div key={type} className="mb-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-700 border-b border-gray-300 pb-1 mb-3">{label}</h3>
            {items.map(item => (
              <div key={item.id} className="mb-3">
                <div className="flex justify-between"><span className="font-bold text-[11px]">{item.title}</span><span className="text-[10px] text-gray-400">{item.period}</span></div>
                {(item.subtitle || item.link) && <div className="text-[10px] text-gray-500">{item.subtitle}{item.link ? ` — ${item.link}` : ""}</div>}
                <ul className="list-disc text-[10px] text-gray-600 pl-4 mt-1">{renderBullets(item.description)}</ul>
              </div>
            ))}
          </div>
        );
      })}
      {skills && <div className="text-[10px] text-gray-600 border-t border-gray-200 pt-2"><span className="font-bold">Skills: </span>{skills}</div>}
    </div>
  ),

  // 14. Bold Header
  bold: ({ name, jobTitle, phone, email, address, linkedin, github, summary, skills, languages, headers, sections, renderBullets, isPrint }) => (
    <div className={`bg-white text-gray-800 font-sans ${isPrint ? "w-[210mm] min-h-[297mm]" : "w-full aspect-[1/1.414]"}`}>
      <div className="bg-black text-white p-8">
        <h1 className="text-3xl font-black tracking-tight uppercase">{name}</h1>
        <h2 className="text-sm font-medium text-gray-300 mt-1 uppercase tracking-widest">{jobTitle}</h2>
      </div>
      <div className="p-8 border-b-4 border-black">
        <div className="text-[10px] text-gray-500 flex flex-wrap gap-x-4">{phone && <span>{phone}</span>}{email && <span>{email}</span>}{address && <span>{address}</span>}</div>
      </div>
      <div className="p-8">
        {summary && <div className="text-[11px] font-medium text-gray-700 mb-5 leading-relaxed">{summary}</div>}
        {(["experience", "education", "project", "certification"] as const).map(type => {
          const items = sections.filter(s => s.type === type);
          if (!items.length) return null;
          const label = type === "experience" ? headers.experience : type === "education" ? headers.education : type === "certification" ? headers.certifications : headers.project;
          return (
            <div key={type} className="mb-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-900 mb-2">{label}</h3>
              {items.map(item => (
                <div key={item.id} className="mb-2">
                  <div className="flex justify-between items-baseline"><span className="font-bold text-[11px]">{item.title}</span><span className="text-[9px] font-bold text-gray-400">{item.period}</span></div>
                  {item.subtitle && <div className="text-[9px] text-gray-500">{item.subtitle}</div>}
                  <ul className="list-disc text-[10px] text-gray-600 pl-3">{renderBullets(item.description)}</ul>
                </div>
              ))}
            </div>
          );
        })}
        {skills && <div className="text-[10px] text-gray-700 border-t-2 border-black pt-3 mt-4 font-medium"><span className="font-black">Skills: </span>{skills}</div>}
      </div>
    </div>
  ),

  // 15. Sidebar Color (two-tone)
  sidebar: ({ name, jobTitle, phone, email, address, linkedin, github, summary, skills, languages, headers, sections, renderBullets, isPrint, includeAvatar, avatarUrl }) => (
    <div className={`flex bg-white font-sans ${isPrint ? "w-[210mm] min-h-[297mm]" : "w-full aspect-[1/1.414]"}`}>
      <div className="w-[32%] bg-teal-700 text-white p-5 flex flex-col gap-4">
        {includeAvatar && avatarUrl && <img src={avatarUrl} alt="" className="w-20 h-20 rounded-lg object-cover border-2 border-white/40 mx-auto" />}
        {!includeAvatar && <div className="text-center"><h1 className="text-sm font-bold">{name}</h1></div>}
        <div><h4 className="text-[8px] uppercase tracking-widest text-teal-200 mb-2">Contact</h4><div className="text-[9px] text-teal-100 space-y-1">{phone}<br />{email}<br />{address}</div></div>
        {skills && <div><h4 className="text-[8px] uppercase tracking-widest text-teal-200 mb-2">{headers.skills}</h4><div className="flex flex-wrap gap-1">{skills.split(",").map(s => <span key={s} className="text-[8px] bg-teal-600 px-1.5 py-0.5 rounded">{s.trim()}</span>)}</div></div>}
        {languages && <div><h4 className="text-[8px] uppercase tracking-widest text-teal-200 mb-2">{headers.languages}</h4><div className="text-[9px] text-teal-100">{languages}</div></div>}
        {linkedin && <div className="text-[9px] text-teal-200">{linkedin}</div>}
        {github && <div className="text-[9px] text-teal-200">{github}</div>}
      </div>
      <div className="w-[68%] p-5 flex flex-col gap-4">
        {includeAvatar && <h1 className="text-lg font-bold text-gray-800">{name}</h1>}
        <h2 className="text-[10px] text-teal-600 font-semibold uppercase tracking-widest">{jobTitle}</h2>
        {summary && <p className="text-[10px] text-gray-600 leading-relaxed">{summary}</p>}
        {(["experience", "education", "project", "certification"] as const).map(type => {
          const items = sections.filter(s => s.type === type);
          if (!items.length) return null;
          const label = type === "experience" ? headers.experience : type === "education" ? headers.education : type === "certification" ? headers.certifications : headers.project;
          return (
            <div key={type}>
              <h3 className="text-[9px] font-bold text-teal-700 uppercase tracking-widest border-b border-teal-100 pb-1 mb-2">{label}</h3>
              {items.map(item => (
                <div key={item.id} className="mb-2">
                  <div className="flex justify-between"><span className="font-semibold text-[10px]">{item.title}</span><span className="text-[8px] text-gray-400">{item.period}</span></div>
                  {item.subtitle && <div className="text-[9px] text-gray-500">{item.subtitle}</div>}
                  <ul className="list-disc text-[9px] text-gray-600 pl-3">{renderBullets(item.description)}</ul>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  ),
};

export interface ThemeRenderProps {
  name: string;
  jobTitle: string;
  phone: string;
  email: string;
  address: string;
  linkedin: string;
  github: string;
  summary: string;
  skills: string;
  languages: string;
  headers: ResumeHeaders;
  sections: ResumeSection[];
  renderBullets: (text: string) => React.ReactNode;
  isPrint?: boolean;
  includeAvatar?: boolean;
  avatarUrl?: string;
}