"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import "./analysis.css";

export default function AnalysisResultPage() {
  const router = useRouter();
  const params = useParams();
  const analysisId = params.id as string;

  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadAnalysis();
  }, [analysisId]);

  async function loadAnalysis() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/analysis", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        const foundAnalysis = data.analyses.find((a: any) => a.id === analysisId);
        setAnalysis(foundAnalysis);
      }
    } catch (error) {
      console.error("Error loading analysis:", error);
    } finally {
      setLoading(false);
    }
  }

  async function createCase(recommendation: any) {
    setCreating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          country: recommendation.country,
          visaType: recommendation.visaType,
          description: recommendation.reasoning,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/case/${data.case.id}`);
      } else {
        alert("Erreur lors de la création du dossier");
      }
    } catch (error) {
      alert("Erreur de connexion");
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="spinner"></div>
          <p className="loading-text">Chargement des résultats...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <p className="not-found-text">Analyse introuvable</p>
          <Link href="/dashboard" className="back-link">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="analysis-container">
      <div className="analysis-content">
        {/* Header */}
        <div className="analysis-header">
          <Link href="/dashboard" className="back-button">
            ← Retour au tableau de bord
          </Link>
          <h1 className="analysis-title">Résultats de votre analyse 🎯</h1>
          <p className="analysis-subtitle">
            Basé sur votre profil, voici les destinations recommandées pour votre projet
            d'immigration
          </p>
        </div>

        {/* Résumé de l'analyse */}
        {analysis.aiAnalysis && (
          <div className="summary-card">
            <h2 className="summary-title">📊 Résumé de l'analyse</h2>
            <p className="summary-text">{analysis.aiAnalysis}</p>
          </div>
        )}

        {/* Liste des recommandations */}
        <div className="recommendations-list">
          {analysis.recommendations.map((rec: any, index: number) => (
            <div key={rec.id} className="recommendation-item">
              <div className="recommendation-header">
                <div className="recommendation-left">
                  <div className="recommendation-rank">#{index + 1}</div>
                  <div>
                    <h3 className="recommendation-country">{rec.country}</h3>
                    <p className="recommendation-visa">{rec.visaType}</p>
                  </div>
                </div>
                <div className="recommendation-score-box">
                  <div className="score-value">{rec.score}%</div>
                  <p className="score-label">Compatibilité</p>
                </div>
              </div>

              {/* Barre de score */}
              <div className="score-bar-container">
                <div className="score-bar-bg">
                  <div
                    className="score-bar-fill"
                    style={{ width: `${rec.score}%` }}
                  ></div>
                </div>
              </div>

              {/* Justification */}
              <div className="reasoning-section">
                <h4 className="section-subtitle">💡 Pourquoi ce pays ?</h4>
                <p className="reasoning-text">{rec.reasoning}</p>
              </div>

              {/* Informations pratiques */}
              <div className="info-grid">
                <div className="info-card duration">
                  <h4 className="info-title">⏱️ Durée estimée</h4>
                  <p className="info-value">{rec.estimatedDuration}</p>
                </div>
                <div className="info-card cost">
                  <h4 className="info-title">💰 Coût estimé</h4>
                  <p className="info-value">{rec.estimatedCost}</p>
                </div>
              </div>

              {/* Exigences */}
              <div className="requirements-section">
                <h4 className="section-subtitle">📋 Documents et exigences</h4>
                <ul className="requirements-list">
                  {rec.requirements.map((req: string, i: number) => (
                    <li key={i} className="requirement-item">
                      <span className="requirement-check">✓</span>
                      <span className="requirement-text">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bouton d'action */}
              <button
                onClick={() => createCase(rec)}
                disabled={creating}
                className="create-case-button"
              >
                {creating ? "Création en cours..." : `🚀 Créer mon dossier pour ${rec.country}`}
              </button>
            </div>
          ))}
        </div>

        {/* Actions supplémentaires */}
        <div className="actions-card">
          <h3 className="actions-title">Et maintenant ?</h3>
          <div className="actions-grid">
            <Link href="/chatbot" className="action-button primary">
              💬 Discuter avec notre assistant IA
            </Link>
            <Link href="/dashboard" className="action-button secondary">
              📊 Retour au tableau de bord
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}