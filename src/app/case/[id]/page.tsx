"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import "./case.css";

export default function CaseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const caseId = params.id as string;

  const [immigrationCase, setImmigrationCase] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingProof, setUploadingProof] = useState<string | null>(null);

  useEffect(() => {
    loadCase();
  }, [caseId]);

  async function loadCase() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/cases", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        const foundCase = data.cases.find((c: any) => c.id === caseId);
        setImmigrationCase(foundCase);
      }
    } catch (error) {
      console.error("Error loading case:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateStepStatus(stepId: string, newStatus: string) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/cases/${caseId}/steps?stepId=${stepId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        await loadCase();
      }
    } catch (error) {
      console.error("Error updating step:", error);
    }
  }

  async function uploadProof(stepId: string, file: File, notes: string) {
    setUploadingProof(stepId);
    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "OTHER");
      formData.append("description", `Preuve pour étape - ${notes}`);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!uploadRes.ok) {
        alert("Erreur lors de l'upload");
        return;
      }

      const uploadData = await uploadRes.json();

      const updateRes = await fetch(`/api/cases/${caseId}/steps?stepId=${stepId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "PENDING_VALIDATION",
          proofUrl: uploadData.document.fileUrl,
          proofNotes: notes,
        }),
      });

      if (updateRes.ok) {
        await loadCase();
        alert("Preuve uploadée avec succès !");
      }
    } catch (error) {
      alert("Erreur lors de l'upload");
    } finally {
      setUploadingProof(null);
    }
  }

  function handleProofUpload(stepId: string) {
    const notes = prompt("Ajoutez une note pour cette preuve (optionnel) :");
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,.pdf";
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        uploadProof(stepId, file, notes || "");
      }
    };
    input.click();
  }

  function getStepStatusColor(status: string) {
    const colors: { [key: string]: { bg: string; text: string } } = {
      NOT_STARTED: { bg: '#f3f4f6', text: '#4b5563' },
      IN_PROGRESS: { bg: '#dbeafe', text: '#1e40af' },
      PENDING_VALIDATION: { bg: '#fef3c7', text: '#92400e' },
      COMPLETED: { bg: '#dcfce7', text: '#166534' },
      BLOCKED: { bg: '#fee2e2', text: '#991b1b' },
    };
    return colors[status] || colors.NOT_STARTED;
  }

  function getStepStatusLabel(status: string) {
    const labels: { [key: string]: string } = {
      NOT_STARTED: "Non commencé",
      IN_PROGRESS: "En cours",
      PENDING_VALIDATION: "En attente de validation",
      COMPLETED: "✓ Terminé",
      BLOCKED: "Bloqué",
    };
    return labels[status] || status;
  }

  function calculateProgress() {
    if (!immigrationCase || !immigrationCase.steps) return 0;
    const completed = immigrationCase.steps.filter(
      (s: any) => s.status === "COMPLETED"
    ).length;
    return Math.round((completed / immigrationCase.steps.length) * 100);
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="spinner"></div>
          <p className="loading-text">Chargement du dossier...</p>
        </div>
      </div>
    );
  }

  if (!immigrationCase) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <p className="not-found-text">Dossier introuvable</p>
          <Link href="/dashboard" className="back-link">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();

  return (
    <div className="case-container">
      <div className="case-content">
        {/* Header */}
        <div className="case-header-section">
          <Link href="/dashboard" className="back-button">
            ← Retour au tableau de bord
          </Link>

          <div className="case-header-card">
            <div className="case-header-top">
              <div className="case-info">
                <h1 className="case-country">{immigrationCase.country}</h1>
                <p className="case-visa">{immigrationCase.visaType}</p>
                {immigrationCase.description && (
                  <p className="case-description">{immigrationCase.description}</p>
                )}
              </div>
              <span className={`case-status ${immigrationCase.status.toLowerCase()}`}>
                {immigrationCase.status}
              </span>
            </div>

            {/* Barre de progression */}
            <div className="progress-section">
              <div className="progress-header">
                <span className="progress-label">Progression globale</span>
                <span className="progress-value">{progress}%</span>
              </div>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Checklist des étapes */}
        <div className="steps-card">
          <h2 className="steps-title">📋 Checklist de votre procédure</h2>

          <div className="steps-list">
            {immigrationCase.steps.map((step: any, index: number) => {
              const statusColor = getStepStatusColor(step.status);
              return (
                <div key={step.id} className="step-item">
                  <div className="step-content">
                    {/* Numéro d'étape */}
                    <div className={`step-number ${step.status === "COMPLETED" ? "completed" : ""}`}>
                      {step.status === "COMPLETED" ? "✓" : index + 1}
                    </div>

                    <div className="step-details">
                      {/* Titre et statut */}
                      <div className="step-header">
                        <h3 className="step-title">{step.title}</h3>
                        <span 
                          className="step-status"
                          style={{ 
                            background: statusColor.bg, 
                            color: statusColor.text 
                          }}
                        >
                          {getStepStatusLabel(step.status)}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="step-description">{step.description}</p>

                      {/* Preuve uploadée */}
                      {step.proofUrl && (
                        <div className="proof-card">
                          <div className="proof-header">
                            <span>📎</span>
                            <span className="proof-label">Preuve fournie</span>
                          </div>
                          <a
                            href={step.proofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="proof-link"
                          >
                            Voir le document →
                          </a>
                          {step.proofNotes && (
                            <p className="proof-notes">Note : {step.proofNotes}</p>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="step-actions">
                        {step.status === "NOT_STARTED" && (
                          <button
                            onClick={() => updateStepStatus(step.id, "IN_PROGRESS")}
                            className="btn-start"
                          >
                            Commencer cette étape
                          </button>
                        )}

                        {step.status === "IN_PROGRESS" && step.requiresProof && (
                          <>
                            <button
                              onClick={() => handleProofUpload(step.id)}
                              disabled={uploadingProof === step.id}
                              className="btn-upload"
                            >
                              {uploadingProof === step.id ? "Upload..." : "📎 Uploader une preuve"}
                            </button>
                            <button
                              onClick={() => updateStepStatus(step.id, "COMPLETED")}
                              className="btn-complete-outline"
                            >
                              Marquer comme terminé
                            </button>
                          </>
                        )}

                        {step.status === "IN_PROGRESS" && !step.requiresProof && (
                          <button
                            onClick={() => updateStepStatus(step.id, "COMPLETED")}
                            className="btn-complete"
                          >
                            ✓ Marquer comme terminé
                          </button>
                        )}

                        {step.status === "PENDING_VALIDATION" && (
                          <div className="pending-message">
                            ⏳ En attente de validation par notre équipe
                          </div>
                        )}

                        {step.status === "COMPLETED" && (
                          <button
                            onClick={() => updateStepStatus(step.id, "IN_PROGRESS")}
                            className="btn-reopen"
                          >
                            Rouvrir cette étape
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Besoin d'aide */}
        <div className="help-card">
          <h3 className="help-title">Besoin d'aide ? 💬</h3>
          <p className="help-text">
            Notre assistant IA est disponible 24/7 pour répondre à toutes vos questions
            sur votre procédure.
          </p>
          <Link href="/chatbot" className="help-button">
            Discuter avec l'assistant IA →
          </Link>
        </div>
      </div>
    </div>
  );
}