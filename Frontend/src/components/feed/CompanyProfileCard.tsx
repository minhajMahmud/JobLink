import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCompanyProfile } from "@/features/employer/api/employerApi";
import { Building2, MapPin, Users, Briefcase, Edit2 } from "lucide-react";

interface CompanyProfile {
    name: string;
    logo: string;
    industry: string;
    size: string;
    headquarters: string;
    description: string;
}

export default function CompanyProfileCard() {
    const navigate = useNavigate();
    const [company, setCompany] = useState<CompanyProfile>({
        name: "Your Company",
        logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=200&fit=crop",
        industry: "Technology",
        size: "51-200",
        headquarters: "San Francisco, CA",
        description: "Leading company in our industry",
    });

    useEffect(() => {
        const loadCompany = async () => {
            try {
                const response = await getCompanyProfile();
                if (response?.data) {
                    setCompany((prev) => ({ ...prev, ...response.data }));
                }
            } catch (error) {
                console.error("Failed to load company profile:", error);
            }
        };
        loadCompany();
    }, []);

    return (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-card">
            {/* Header with gradient */}
            <div className="h-20 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />

            {/* Company Info */}
            <div className="px-4 pb-4 -mt-10">
                <div className="relative">
                    <img
                        src={company.logo}
                        alt={company.name}
                        className="h-20 w-20 rounded-2xl border-4 border-card object-cover bg-white shadow-lg"
                    />
                </div>

                <div className="mt-3">
                    <h3 className="text-base font-bold font-display text-foreground">
                        {company.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {company.description}
                    </p>
                </div>

                {/* Company Stats */}
                <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Briefcase className="h-3.5 w-3.5 text-amber-600" />
                        <span>{company.industry}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="h-3.5 w-3.5 text-amber-600" />
                        <span>{company.size} employees</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 text-amber-600" />
                        <span>{company.headquarters}</span>
                    </div>
                </div>

                {/* View Profile Button */}
                <button
                    onClick={() => navigate("/employer/profile")}
                    className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-amber-600 hover:to-orange-600 transition-all"
                >
                    <Building2 className="h-4 w-4" />
                    View Company Profile
                </button>

                <button
                    onClick={() => navigate("/employer/profile")}
                    className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary/80 transition-all"
                >
                    <Edit2 className="h-3.5 w-3.5" />
                    Edit Profile
                </button>
            </div>
        </div>
    );
}
