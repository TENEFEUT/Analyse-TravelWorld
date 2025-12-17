"use client";

import { useState, useEffect } from "react";

interface PersonalInfoTabProps {
  user: any;
  onUpdate: (user: any) => void;
}

export default function PersonalInfoTab({ user, onUpdate }: PersonalInfoTabProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    birthDate: "",
    birthPlace: "",
    nationality: "",
    currentCountry: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        gender: user.gender || "",
        birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : "",
        birthPlace: user.birthPlace || "",
        nationality: user.nationality || "",
        currentCountry: user.currentCountry || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Erreur lors de la mise à jour");
        setLoading(false);
        return;
      }

      setSuccess(true);
      onUpdate(data.user);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#262626', marginBottom: '1.5rem' }}>
        Informations personnelles
      </h2>
      
      {success && (
        <div style={{ 
          marginBottom: '1.5rem', 
          padding: '1rem', 
          background: '#f0fdf4', 
          border: '1px solid #86efac',
          borderRadius: '3px'
        }}>
          <p style={{ color: '#166534', fontSize: '0.875rem', margin: 0 }}>
            ✓ Profil mis à jour avec succès !
          </p>
        </div>
      )}

      {error && (
        <div style={{ 
          marginBottom: '1.5rem', 
          padding: '1rem', 
          background: '#fef2f2', 
          border: '1px solid #fecaca',
          borderRadius: '3px'
        }}>
          <p style={{ color: '#991b1b', fontSize: '0.875rem', margin: 0 }}>
            ✗ {error}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Nom et Prénom */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Prénom *</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
              disabled={loading}
              className="form-input"
              placeholder="Jean"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Nom de famille *</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
              disabled={loading}
              className="form-input"
              placeholder="Dupont"
            />
          </div>
        </div>

        {/* Genre et Date de naissance */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Genre *</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              required
              disabled={loading}
              className="form-input"
            >
              <option value="">Sélectionnez...</option>
              <option value="MALE">Homme</option>
              <option value="FEMALE">Femme</option>
              <option value="OTHER">Autre</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Date de naissance *</label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              required
              disabled={loading}
              className="form-input"
            />
          </div>
        </div>

        {/* Lieu de naissance */}
        <div className="form-group">
          <label className="form-label">Lieu de naissance *</label>
          <input
            type="text"
            value={formData.birthPlace}
            onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
            required
            disabled={loading}
            className="form-input"
            placeholder="Paris, France"
          />
        </div>

        {/* Nationalité et Pays actuel */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Nationalité *</label>
            <input
              type="text"
              value={formData.nationality}
              onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
              required
              disabled={loading}
              className="form-input"
              placeholder="Française"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Pays de résidence actuel *</label>
            <input
              type="text"
              value={formData.currentCountry}
              onChange={(e) => setFormData({ ...formData, currentCountry: e.target.value })}
              required
              disabled={loading}
              className="form-input"
              placeholder="Gabon"
            />
          </div>
        </div>

        {/* Téléphone */}
        <div className="form-group">
          <label className="form-label">Numéro de téléphone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            disabled={loading}
            className="form-input"
            placeholder="+241 XX XX XX XX"
          />
        </div>

        {/* Bouton de soumission */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button
            type="submit"
            disabled={loading}
            className="form-button"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {loading && (
              <svg 
                style={{ animation: 'spin 1s linear infinite' }} 
                width="20" 
                height="20" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {loading ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </div>
      </form>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}