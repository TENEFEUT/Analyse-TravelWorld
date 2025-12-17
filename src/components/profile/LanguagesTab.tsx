"use client";

import { useState, useEffect } from "react";

export default function LanguagesTab() {
  const [languages, setLanguages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    language: "",
    level: "",
    hasCertificate: false,
    certificateName: "",
    score: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const languageOptions = [
    { value: "FRENCH", label: "🇫🇷 Français" },
    { value: "ENGLISH", label: "🇬🇧 Anglais" },
    { value: "SPANISH", label: "🇪🇸 Espagnol" },
    { value: "GERMAN", label: "🇩🇪 Allemand" },
    { value: "CHINESE", label: "🇨🇳 Chinois" },
    { value: "ARABIC", label: "🇸🇦 Arabe" },
    { value: "PORTUGUESE", label: "🇵🇹 Portugais" },
    { value: "OTHER", label: "🌐 Autre" },
  ];

  const levelOptions = [
    { value: "A1", label: "A1 - Débutant", description: "Niveau élémentaire" },
    { value: "A2", label: "A2 - Élémentaire", description: "Niveau de survie" },
    { value: "B1", label: "B1 - Intermédiaire", description: "Niveau seuil" },
    { value: "B2", label: "B2 - Intermédiaire avancé", description: "Niveau indépendant" },
    { value: "C1", label: "C1 - Avancé", description: "Niveau autonome" },
    { value: "C2", label: "C2 - Maîtrise", description: "Niveau maîtrise" },
    { value: "NATIVE", label: "Langue maternelle", description: "Natif" },
  ];

  useEffect(() => {
    loadLanguages();
  }, []);

  async function loadLanguages() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/profile/languages", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setLanguages(data.languages);
      }
    } catch (error) {
      console.error("Error loading languages:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/profile/languages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await loadLanguages();
        setShowForm(false);
        setFormData({
          language: "",
          level: "",
          hasCertificate: false,
          certificateName: "",
          score: "",
        });
      }
    } catch (error) {
      console.error("Error adding language:", error);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette langue ?")) return;

    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/profile/languages?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadLanguages();
    } catch (error) {
      console.error("Error deleting language:", error);
    }
  }

  function getLanguageLabel(value: string) {
    return languageOptions.find((l) => l.value === value)?.label || value;
  }

  function getLevelColor(level: string) {
    const colors: { [key: string]: { bg: string; text: string } } = {
      A1: { bg: '#fee2e2', text: '#991b1b' },
      A2: { bg: '#fed7aa', text: '#9a3412' },
      B1: { bg: '#fef08a', text: '#854d0e' },
      B2: { bg: '#d9f99d', text: '#365314' },
      C1: { bg: '#bbf7d0', text: '#166534' },
      C2: { bg: '#a7f3d0', text: '#065f46' },
      NATIVE: { bg: '#dbeafe', text: '#1e40af' },
    };
    return colors[level] || { bg: '#f3f4f6', text: '#4b5563' };
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
          Compétences linguistiques
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="form-button"
        >
          {showForm ? "Annuler" : "+ Ajouter une langue"}
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
            Nouvelle langue
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Langue *</label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  required
                  className="form-input"
                >
                  <option value="">Sélectionnez...</option>
                  {languageOptions.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Niveau *</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  required
                  className="form-input"
                >
                  <option value="">Sélectionnez...</option>
                  {levelOptions.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Certificat */}
            <div style={{ 
              background: 'white', 
              border: '1px solid #dbdbdb', 
              borderRadius: '3px', 
              padding: '1rem', 
              marginBottom: '1.5rem' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: formData.hasCertificate ? '1rem' : '0' }}>
                <input
                  type="checkbox"
                  id="hasCertificate"
                  checked={formData.hasCertificate}
                  onChange={(e) => setFormData({ ...formData, hasCertificate: e.target.checked })}
                  style={{ width: '18px', height: '18px', marginRight: '0.5rem', cursor: 'pointer' }}
                />
                <label htmlFor="hasCertificate" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#262626', cursor: 'pointer' }}>
                  J'ai un certificat de langue
                </label>
              </div>

              {formData.hasCertificate && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Nom du certificat</label>
                    <input
                      type="text"
                      value={formData.certificateName}
                      onChange={(e) => setFormData({ ...formData, certificateName: e.target.value })}
                      className="form-input"
                      placeholder="TOEFL, IELTS, DELF..."
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Score</label>
                    <input
                      type="text"
                      value={formData.score}
                      onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                      className="form-input"
                      placeholder="90/120, B2..."
                    />
                  </div>
                </div>
              )}
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

      {/* Liste des langues */}
      {languages.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🌐</div>
          <p className="empty-state-text">Aucune langue ajoutée</p>
          <p style={{ fontSize: '0.875rem', color: '#a0a0a0', margin: '0.5rem 0 0 0' }}>
            Cliquez sur "Ajouter une langue" pour commencer
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {languages.map((lang) => {
            const levelColor = getLevelColor(lang.level);
            return (
              <div key={lang.id} className="item-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#262626', margin: 0 }}>
                    {getLanguageLabel(lang.language)}
                  </h3>
                  <button
                    onClick={() => handleDelete(lang.id)}
                    style={{
                      color: '#ed4956',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      background: 'transparent',
                      border: 'none',
                      padding: '0.25rem',
                      cursor: 'pointer',
                      borderRadius: '3px',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#fef2f2'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                     Supprimer
                  </button>
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.375rem 0.875rem',
                    borderRadius: '12px',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    background: levelColor.bg,
                    color: levelColor.text
                  }}>
                    {lang.level}
                  </span>
                </div>

                {lang.hasCertificate && (
                  <div style={{ 
                    background: '#eff6ff', 
                    border: '1px solid #bfdbfe',
                    borderRadius: '3px', 
                    padding: '0.75rem' 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span>📜</span>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1e40af' }}>
                        Certificat
                      </span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: '#1e40af', margin: '0 0 0.25rem 0' }}>
                      {lang.certificateName}
                    </p>
                    {lang.score && (
                      <p style={{ fontSize: '0.875rem', color: '#2563eb', fontWeight: 500, margin: 0 }}>
                        Score: {lang.score}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}