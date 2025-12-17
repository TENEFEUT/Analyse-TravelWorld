"use client";

import { useState, useEffect } from "react";

export default function WorkExperienceTab() {
  const [workExperience, setWorkExperience] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    jobTitle: "",
    company: "",
    country: "",
    startDate: "",
    endDate: "",
    isCurrently: false,
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadWorkExperience();
  }, []);

  async function loadWorkExperience() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/profile/work", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setWorkExperience(data.workExperience);
      }
    } catch (error) {
      console.error("Error loading work experience:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/profile/work", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await loadWorkExperience();
        setShowForm(false);
        setFormData({
          jobTitle: "",
          company: "",
          country: "",
          startDate: "",
          endDate: "",
          isCurrently: false,
          description: "",
        });
      }
    } catch (error) {
      console.error("Error adding work experience:", error);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette expérience ?")) return;

    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/profile/work?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadWorkExperience();
    } catch (error) {
      console.error("Error deleting work experience:", error);
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#8e8e8e' }}>
        Chargement...
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#262626', margin: 0 }}>
          Expérience professionnelle
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="form-button"
        >
          {showForm ? "Annuler" : "+ Ajouter une expérience"}
        </button>
      </div>

      {/* Formulaire d'ajout */}
      {showForm && (
        <div style={{ 
          background: '#fafafa', 
          border: '1px solid #dbdbdb', 
          borderRadius: '3px', 
          padding: '1.5rem', 
          marginBottom: '1.5rem' 
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#262626', marginBottom: '1rem' }}>
            Nouvelle expérience
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Poste occupé *</label>
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  required
                  className="form-input"
                  placeholder="Développeur Full Stack"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Entreprise *</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  required
                  className="form-input"
                  placeholder="TechCorp SA"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Pays *</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                required
                className="form-input"
                placeholder="Gabon"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Date de début *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date de fin</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  disabled={formData.isCurrently}
                  className="form-input"
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
              <input
                type="checkbox"
                id="isCurrentlyWork"
                checked={formData.isCurrently}
                onChange={(e) => setFormData({ ...formData, isCurrently: e.target.checked, endDate: "" })}
                style={{ width: '18px', height: '18px', marginRight: '0.5rem', cursor: 'pointer' }}
              />
              <label htmlFor="isCurrentlyWork" style={{ fontSize: '0.875rem', color: '#262626', cursor: 'pointer' }}>
                Je travaille actuellement dans cette entreprise
              </label>
            </div>

            <div className="form-group">
              <label className="form-label">Description (optionnel)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="form-input"
                style={{ resize: 'vertical', minHeight: '100px' }}
                placeholder="Décrivez vos responsabilités et réalisations..."
              />
            </div>

            <div className="action-buttons">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  fontSize: '0.875rem', 
                  fontWeight: 600,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="form-button"
              >
                {submitting ? "Ajout..." : "Ajouter"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des expériences */}
      {workExperience.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💼</div>
          <p className="empty-state-text">Aucune expérience professionnelle ajoutée</p>
          <p style={{ fontSize: '0.875rem', color: '#a0a0a0', margin: '0.5rem 0 0 0' }}>
            Cliquez sur "Ajouter une expérience" pour commencer
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {workExperience.map((work) => (
            <div key={work.id} className="item-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#262626', margin: '0 0 0.25rem 0' }}>
                    {work.jobTitle}
                  </h3>
                  <p style={{ fontSize: '1rem', color: '#0095f6', fontWeight: 600, margin: '0 0 0.25rem 0' }}>
                    {work.company}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#8e8e8e', margin: '0 0 0.5rem 0' }}>
                    {work.country}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#8e8e8e', margin: 0 }}>
                    {new Date(work.startDate).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                    {" - "}
                    {work.isCurrently
                      ? "Aujourd'hui"
                      : new Date(work.endDate).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                  </p>
                  {work.description && (
                    <p style={{ fontSize: '0.875rem', color: '#262626', lineHeight: 1.5, marginTop: '0.75rem' }}>
                      {work.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(work.id)}
                  style={{
                    color: '#ed4956',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    background: 'transparent',
                    border: 'none',
                    padding: '0.5rem',
                    cursor: 'pointer',
                    borderRadius: '3px',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#fef2f2'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}