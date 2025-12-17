"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./dashboard.css";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    try {
      // Charger le profil utilisateur
      const userRes = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!userRes.ok) {
        localStorage.removeItem("token");
        router.push("/auth/login");
        return;
      }

      const userData = await userRes.json();
      setUser(userData.user);

      // Charger les analyses
      const analysisRes = await fetch("/api/analysis", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (analysisRes.ok) {
        const analysisData = await analysisRes.json();
        setAnalyses(analysisData.analyses);
      }

      // Charger les dossiers
      const casesRes = await fetch("/api/cases", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (casesRes.ok) {
        const casesData = await casesRes.json();
        setCases(casesData.cases || []);
      }

      // Charger les documents
      const docsRes = await fetch("/api/upload", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (docsRes.ok) {
        const docsData = await docsRes.json();
        setDocuments(docsData.documents);
      }
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function startAnalysis() {
    setAnalyzing(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/analysis", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/analysis/${data.analysis.id}`);
      } else {
        const error = await res.json();
        alert(error.message);
      }
    } catch (error) {
      alert("Erreur lors du lancement de l'analyse");
    } finally {
      setAnalyzing(false);
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="spinner"></div>
          <p className="loading-text">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    );
  }

  const profileComplete = user?.profile?.education?.length > 0;
  const latestAnalysis = analyses[0];

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">
            Bienvenue, {user?.firstName || user?.name || "Utilisateur"} 👋
          </h1>
          <p className="dashboard-subtitle">
            Gérez vos projets d'immigration et suivez vos dossiers
          </p>
        </div>

        {/* Alerte profil incomplet */}
        {!profileComplete && (
          <div className="alert-box">
            <svg className="alert-icon" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div className="alert-content">
              <h3 className="alert-title">Complétez votre profil</h3>
              <p className="alert-text">
                Pour obtenir une analyse de faisabilité personnalisée, veuillez d'abord
                compléter votre profil avec vos informations académiques et professionnelles.
              </p>
              <Link href="/profil" className="alert-button">
                Compléter mon profil →
              </Link>
            </div>
          </div>
        )}

        {/* Actions rapides */}
        <div className="quick-actions">
          <Link href="/profil" className="action-card">
            <div className="action-icon blue">
              <span>👤</span>
            </div>
            <h3 className="action-title">Mon Profil</h3>
            <p className="action-text">
              Gérez vos informations personnelles, éducation et expérience
            </p>
          </Link>

          <button
            onClick={startAnalysis}
            disabled={!profileComplete || analyzing}
            className={`action-card ${!profileComplete ? "disabled" : ""}`}
          >
            <div className="action-icon green">
              <span>{analyzing ? "⏳" : "🔍"}</span>
            </div>
            <h3 className="action-title">
              {analyzing ? "Analyse en cours..." : "Analyse de faisabilité"}
            </h3>
            <p className="action-text">
              {analyzing
                ? "Veuillez patienter..."
                : "Découvrez les pays compatibles avec votre profil"}
            </p>
          </button>

          <Link href="/chatbot" className="action-card">
            <div className="action-icon purple">
              <span>💬</span>
            </div>
            <h3 className="action-title">Chatbot IA</h3>
            <p className="action-text">Posez vos questions à notre assistant intelligent</p>
          </Link>
        </div>

        {/* Résumé des analyses */}
        {analyses.length > 0 && (
          <div className="section-card">
            <div className="section-header">
              <h2 className="section-title">Dernière analyse de faisabilité</h2>
              <Link href={`/analysis/${latestAnalysis.id}`} className="section-link">
                Voir les détails →
              </Link>
            </div>

            <div className="recommendations-grid">
              {latestAnalysis.recommendations.slice(0, 3).map((rec: any) => (
                <div key={rec.id} className="recommendation-card">
                  <div className="recommendation-header">
                    <h3 className="recommendation-country">{rec.country}</h3>
                    <span className="recommendation-score">{rec.score}%</span>
                  </div>
                  <p className="recommendation-visa">{rec.visaType}</p>
                  <p className="recommendation-text">{rec.reasoning.slice(0, 100)}...</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dossiers en cours */}
        <div className="section-card">
          <div className="section-header">
            <h2 className="section-title">Mes dossiers</h2>
            {analyses.length > 0 && (
              <Link href={`/analysis/${analyses[0].id}`} className="create-button">
                + Créer un nouveau dossier
              </Link>
            )}
          </div>

          {cases.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📁</div>
              <p className="empty-title">Aucun dossier créé pour le moment</p>
              <p className="empty-text">Commencez par faire une analyse de faisabilité</p>
            </div>
          ) : (
            <div className="cases-list">
              {cases.map((c: any) => (
                <Link key={c.id} href={`/case/${c.id}`} className="case-item">
                  <div className="case-info">
                    <div className="case-avatar">
                      <span>🌍</span>
                    </div>
                    <div>
                      <h3 className="case-title">
                        {c.country} - {c.visaType}
                      </h3>
                      <p className="case-date">
                        Créé le {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                  <span className={`case-status ${c.status.toLowerCase()}`}>
                    {c.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Documents */}
        <div className="section-card">
          <div className="section-header">
            <h2 className="section-title">Mes documents</h2>
            <Link href="/documents" className="section-link">
              Gérer mes documents →
            </Link>
          </div>

          {documents.length === 0 ? (
            <div className="empty-state small">
              <div className="empty-icon small">📄</div>
              <p className="empty-title">Aucun document uploadé</p>
            </div>
          ) : (
            <div className="documents-grid">
              {documents.slice(0, 4).map((doc: any) => (
                <div key={doc.id} className="document-card">
                  <div className="document-icon">📄</div>
                  <p className="document-name">{doc.name}</p>
                  <p className="document-type">{doc.type}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}