"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PersonalInfoTab from "@/components/profile/PersonalInfoTab";
import EducationTab from "@/components/profile/EducationTab";
import WorkExperienceTab from "@/components/profile/WorkExperienceTab";
import LanguagesTab from "@/components/profile/LanguagesTab";
import "./profile.css";

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("personal");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    try {
      const res = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        localStorage.removeItem("token");
        router.push("/auth/login");
        return;
      }

      const data = await res.json();
      setUser(data.user);
    } catch (error) {
      console.error("Auth error:", error);
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  }

  const tabs = [
    { id: "personal", name: "Informations personnelles", icon: "👤" },
    { id: "education", name: "Éducation", icon: "🎓" },
    { id: "work", name: "Expérience professionnelle", icon: "💼" },
    { id: "languages", name: "Langues", icon: "🌐" },
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="spinner"></div>
          <p className="loading-text">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-content">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
          </div>
          <div className="profile-info">
            <h1 className="profile-name">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.name || "Mon Profil"}
            </h1>
            <p className="profile-email">{user?.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          {/* Tab Headers */}
          <div className="tabs-header">
            <div className="tabs-nav">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
                >
                  <span className="tab-icon">{tab.icon}</span>
                  <span className="tab-name">{tab.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === "personal" && <PersonalInfoTab user={user} onUpdate={setUser} />}
            {activeTab === "education" && <EducationTab />}
            {activeTab === "work" && <WorkExperienceTab />}
            {activeTab === "languages" && <LanguagesTab />}
          </div>
        </div>
      </div>
    </div>
  );
}