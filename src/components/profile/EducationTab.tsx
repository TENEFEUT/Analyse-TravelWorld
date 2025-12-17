"use client";

import { useState, useEffect } from "react";

export default function EducationTab() {
  const [education, setEducation] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    degree: "",
    fieldOfStudy: "",
    institution: "",
    country: "",
    startDate: "",
    endDate: "",
    isCurrently: false,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadEducation();
  }, []);

  async function loadEducation() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/profile/education", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setEducation(data.education);
      }
    } catch (error) {
      console.error("Error loading education:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/profile/education", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await loadEducation();
        setShowForm(false);
        setFormData({
          degree: "",
          fieldOfStudy: "",
          institution: "",
          country: "",
          startDate: "",
          endDate: "",
          isCurrently: false,
        });
      }
    } catch (error) {
      console.error("Error adding education:", error);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette formation ?")) return;

    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/profile/education?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadEducation();
    } catch (error) {
      console.error("Error deleting education:", error);
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
          Parcours académique
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="form-button"
        >
          {showForm ? "Annuler" : "+ Ajouter une formation"}
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
            Nouvelle formation
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Diplôme *</label>
                <select
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  required
                  className="form-input"
                >
                  <option value="">Sélectionnez...</option>
                  <option value="Baccalauréat">Baccalauréat</option>
                  <option value="BTS/DUT">BTS/DUT</option>
                  <option value="Licence">Licence</option>
                  <option value="Master">Master</option>
                  <option value="Doctorat">Doctorat</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Domaine d'études *</label>
                <input
                  type="text"
                  value={formData.fieldOfStudy}
                  onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
                  required
                  className="form-input"
                  placeholder="Génie logiciel"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Établissement *</label>
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  required
                  className="form-input"
                  placeholder="Université de..."
                />
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
                id="isCurrently"
                checked={formData.isCurrently}
                onChange={(e) => setFormData({ ...formData, isCurrently: e.target.checked, endDate: "" })}
                style={{ width: '18px', height: '18px', marginRight: '0.5rem', cursor: 'pointer' }}
              />
              <label htmlFor="isCurrently" style={{ fontSize: '0.875rem', color: '#262626', cursor: 'pointer' }}>
                Je suis actuellement inscrit(e) dans cet établissement
              </label>
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

      {/* Liste des formations */}
      {education.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎓</div>
          <p className="empty-state-text">Aucune formation ajoutée pour le moment</p>
          <p style={{ fontSize: '0.875rem', color: '#a0a0a0', margin: '0.5rem 0 0 0' }}>
            Cliquez sur "Ajouter une formation" pour commencer
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {education.map((edu) => (
            <div key={edu.id} className="item-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#262626', margin: '0 0 0.25rem 0' }}>
                    {edu.degree}
                  </h3>
                  <p style={{ fontSize: '1rem', color: '#0095f6', fontWeight: 600, margin: '0 0 0.5rem 0' }}>
                    {edu.fieldOfStudy}
                  </p>
                  <p style={{ fontSize: '0.9375rem', color: '#262626', margin: '0 0 0.25rem 0' }}>
                    {edu.institution}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#8e8e8e', margin: '0 0 0.5rem 0' }}>
                    {edu.country}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#8e8e8e', margin: 0 }}>
                    {new Date(edu.startDate).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                    {" - "}
                    {edu.isCurrently
                      ? "Aujourd'hui"
                      : new Date(edu.endDate).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(edu.id)}
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