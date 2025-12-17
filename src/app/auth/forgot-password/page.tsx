"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import "./forgot-password.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.message || "Une erreur est survenue");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="forgot-container">
        <div className="forgot-card">
          <div className="success-box">
            <div className="icon-wrapper success">
              <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="success-title">Email envoyé ! 📧</h1>
            <p className="success-message">
              Un lien de réinitialisation a été envoyé à <strong>{email}</strong>
            </p>
            <div className="info-box">
              <p>Vérifiez votre boîte mail (et les spams) pour réinitialiser votre mot de passe</p>
            </div>
            <Link href="/auth/login" className="back-button">
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        <div className="forgot-box">
          {/* Logo & Title */}
          <div className="forgot-header">
            <div className="logo-wrapper">
              <div className="logo">
                <span className="lock-icon"></span>
              </div>
            </div>
            <h1 className="title">Problème de connexion ?</h1>
            <p className="subtitle">
              Entrez votre adresse email et nous vous enverrons un lien pour récupérer votre compte.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="forgot-form">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Adresse email"
              required
              disabled={loading}
              className="form-input"
            />

            <button
              type="submit"
              disabled={loading}
              className="submit-button"
            >
              {loading ? "Envoi en cours..." : "Envoyer le lien de connexion"}
            </button>
          </form>

          {/* Divider */}
          <div className="divider">
            <div className="divider-line"></div>
            <span className="divider-text">OU</span>
            <div className="divider-line"></div>
          </div>

          {/* Create account link */}
          <div className="create-account">
            <Link href="/auth/signup">
              Créer un compte
            </Link>
          </div>
        </div>

        {/* Back to login */}
        <div className="back-box">
          <Link href="/auth/login">
            Retour à la connexion
          </Link>
        </div>

        {/* Info */}
        <div className="info-card">
          <p> Le lien de réinitialisation expirera dans <strong>1 heure</strong></p>
        </div>
      </div>
    </div>
  );
}