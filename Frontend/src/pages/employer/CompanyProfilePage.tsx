import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { getCompanyProfile, updateCompanyProfile } from "@/features/employer/api/employerApi";
import {
    Building2,
    MapPin,
    Users,
    Globe,
    Linkedin,
    Twitter,
    Mail,
    Phone,
    Edit2,
    Save,
    Briefcase,
    TrendingUp,
    Award,
    Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface CompanyProfile {
    name: string;
    logo: string;
    industry: string;
    size: string;
    headquarters: string;
    founded: string;
    website: string;
    linkedin: string;
    twitter: string;
    email: string;
    phone: string;
    description: string;
    mission: string;
    culture: string;
    benefits: string[];
}

export default function CompanyProfilePage() {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState<CompanyProfile>({
        name: "CloudScale Technologies",
        logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=200&fit=crop",
        industry: "Technology",
        size: "201-500 employees",
        headquarters: "San Francisco, CA",
        founded: "2018",
        website: "https://cloudscale.com",
        linkedin: "https://linkedin.com/company/cloudscale",
        twitter: "https://twitter.com/cloudscale",
        email: "contact@cloudscale.com",
        phone: "+1 (555) 123-4567",
        description: "CloudScale is a leading technology company specializing in cloud infrastructure and enterprise solutions. We help businesses scale their operations with cutting-edge technology.",
        mission: "To empower businesses worldwide with scalable, reliable, and innovative cloud solutions.",
        culture: "We foster a culture of innovation, collaboration, and continuous learning. Our team is passionate about technology and committed to excellence.",
        benefits: [
            "Competitive salary and equity",
            "Health, dental, and vision insurance",
            "401(k) matching",
            "Flexible work arrangements",
            "Professional development budget",
            "Unlimited PTO",
        ],
    });

    useEffect(() => {
        loadCompanyProfile();
    }, []);

    const loadCompanyProfile = async () => {
        try {
            const response = await getCompanyProfile();
            if (response?.data) {
                setProfile((prev) => ({ ...prev, ...response.data }));
            }
        } catch (error) {
            console.error("Failed to load company profile:", error);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateCompanyProfile(profile);
            toast.success("Company profile updated successfully!");
            setIsEditing(false);
        } catch (error) {
            toast.error("Failed to update company profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 py-8 px-4">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="relative h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                    </div>

                    <div className="relative px-8 pb-8">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 -mt-20">
                            <div className="flex items-end gap-6">
                                <div className="relative">
                                    <img
                                        src={profile.logo}
                                        alt={profile.name}
                                        className="w-32 h-32 rounded-2xl border-4 border-white dark:border-slate-800 shadow-xl object-cover bg-white"
                                    />
                                    {isEditing && (
                                        <button className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                            <Edit2 className="w-6 h-6 text-white" />
                                        </button>
                                    )}
                                </div>

                                <div className="pb-2">
                                    {isEditing ? (
                                        <Input
                                            value={profile.name}
                                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                            className="text-3xl font-bold mb-2"
                                        />
                                    ) : (
                                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{profile.name}</h1>
                                    )}
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mt-2">
                                        <span className="flex items-center gap-1">
                                            <Briefcase className="w-4 h-4" />
                                            {profile.industry}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            {profile.size}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            {profile.headquarters}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            Founded {profile.founded}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {isEditing ? (
                                    <>
                                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleSave} disabled={loading}>
                                            <Save className="w-4 h-4 mr-2" />
                                            {loading ? "Saving..." : "Save Changes"}
                                        </Button>
                                    </>
                                ) : (
                                    <Button onClick={() => setIsEditing(true)}>
                                        <Edit2 className="w-4 h-4 mr-2" />
                                        Edit Profile
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* About */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-blue-600" />
                                About Company
                            </h2>
                            {isEditing ? (
                                <Textarea
                                    value={profile.description}
                                    onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                                    rows={4}
                                    className="w-full"
                                />
                            ) : (
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{profile.description}</p>
                            )}
                        </div>

                        {/* Mission */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-emerald-600" />
                                Our Mission
                            </h2>
                            {isEditing ? (
                                <Textarea
                                    value={profile.mission}
                                    onChange={(e) => setProfile({ ...profile, mission: e.target.value })}
                                    rows={3}
                                    className="w-full"
                                />
                            ) : (
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{profile.mission}</p>
                            )}
                        </div>

                        {/* Culture */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Award className="w-5 h-5 text-purple-600" />
                                Company Culture
                            </h2>
                            {isEditing ? (
                                <Textarea
                                    value={profile.culture}
                                    onChange={(e) => setProfile({ ...profile, culture: e.target.value })}
                                    rows={3}
                                    className="w-full"
                                />
                            ) : (
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{profile.culture}</p>
                            )}
                        </div>

                        {/* Benefits */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Employee Benefits</h2>
                            <div className="grid sm:grid-cols-2 gap-3">
                                {profile.benefits.map((benefit, index) => (
                                    <div key={index} className="flex items-start gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-600 mt-2" />
                                        <span className="text-slate-600 dark:text-slate-300">{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Contact Info */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Contact Information</h2>
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-xs text-slate-500 dark:text-slate-400">Website</Label>
                                    {isEditing ? (
                                        <Input
                                            value={profile.website}
                                            onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                                            className="mt-1"
                                        />
                                    ) : (
                                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mt-1">
                                            <Globe className="w-4 h-4" />
                                            <span className="text-sm truncate">{profile.website}</span>
                                        </a>
                                    )}
                                </div>

                                <div>
                                    <Label className="text-xs text-slate-500 dark:text-slate-400">Email</Label>
                                    {isEditing ? (
                                        <Input
                                            value={profile.email}
                                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                            className="mt-1"
                                        />
                                    ) : (
                                        <a href={`mailto:${profile.email}`} className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 mt-1">
                                            <Mail className="w-4 h-4" />
                                            <span className="text-sm truncate">{profile.email}</span>
                                        </a>
                                    )}
                                </div>

                                <div>
                                    <Label className="text-xs text-slate-500 dark:text-slate-400">Phone</Label>
                                    {isEditing ? (
                                        <Input
                                            value={profile.phone}
                                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                            className="mt-1"
                                        />
                                    ) : (
                                        <a href={`tel:${profile.phone}`} className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 mt-1">
                                            <Phone className="w-4 h-4" />
                                            <span className="text-sm">{profile.phone}</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Social Media</h2>
                            <div className="space-y-3">
                                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/30 transition-colors">
                                    <Linkedin className="w-5 h-5 text-blue-600" />
                                    <span className="text-sm font-medium text-slate-900 dark:text-white">LinkedIn</span>
                                </a>
                                <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-sky-50 dark:bg-sky-950/20 hover:bg-sky-100 dark:hover:bg-sky-950/30 transition-colors">
                                    <Twitter className="w-5 h-5 text-sky-600" />
                                    <span className="text-sm font-medium text-slate-900 dark:text-white">Twitter</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
