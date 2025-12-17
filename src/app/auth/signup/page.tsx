"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./signup.css";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          password, 
          firstName,
          lastName,
          type: "signup" 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Une erreur est survenue");
        setLoading(false);
        return;
      }

      if (data.requiresVerification) {
        setSuccess(true);
      } else {
        localStorage.setItem("token", data.token);
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur");
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="signup-container">
        <div className="signup-card">
          <div className="success-box">
            <div className="success-icon">
              <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="success-title">Compte créé !</h2>
            <p className="success-message">
              Un email de vérification a été envoyé à <strong>{email}</strong>
            </p>
            <div className="success-info">
              <p>📧 Vérifiez votre boîte mail (et les spams)</p>
            </div>
            <Link href="/auth/login" className="back-link">
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-box">
          {/* Logo & Title */}
          <div className="signup-header">
            <div className="logo-wrapper">
              <div className="logo">
                <span>TW</span>
              </div>
            </div>
            <h1 className="title">TravelWorld</h1>
            <p className="subtitle">
              Inscrivez-vous pour démarrer votre projet d'immigration
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="signup-form">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Adresse email"
              required
              disabled={loading}
              className="form-input"
            />

            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Prénom"
              required
              disabled={loading}
              className="form-input"
            />

            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Nom de famille"
              required
              disabled={loading}
              className="form-input"
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              required
              disabled={loading}
              className="form-input"
            />

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmer le mot de passe"
              required
              disabled={loading}
              className="form-input"
            />

            {/* Password strength */}
            {password && (
              <div className="password-strength">
                <div className="strength-bars">
                  <div className={password.length >= 6 ? "bar active" : "bar"}></div>
                  <div className={password.length >= 8 ? "bar active" : "bar"}></div>
                  <div className={/[A-Z]/.test(password) && /[0-9]/.test(password) ? "bar active" : "bar"}></div>
                </div>
                <p className="strength-text">
                  {password.length < 6 && "Minimum 6 caractères"}
                  {password.length >= 6 && password.length < 8 && "Mot de passe acceptable"}
                  {password.length >= 8 && "Mot de passe fort"}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="submit-button"
            >
              {loading ? "Inscription..." : "S'inscrire"}
            </button>
          </form>

          {/* Terms */}
          <div className="terms">
            <p>
              En vous inscrivant, vous acceptez nos{" "}
              <a href="#">Conditions générales</a>
              {". "}Découvrez comment nous collectons, utilisons et partageons vos données en lisant notre{" "}
              <a href="#">Politique de confidentialité</a>
              {" "}et comment nous utilisons les cookies en consultant notre{" "}
              <a href="#">Politique d'utilisation des cookies</a>.
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="login-box-link">
          <p>
            Vous avez un compte ?{" "}
            <Link href="/auth/login">Connectez-vous</Link>
          </p>
        </div>

        {/* Footer */}
        <div className="footer">
          <Link href="/">← Retour à l'accueil</Link>
        </div>
      </div>
    </div>
  );
}