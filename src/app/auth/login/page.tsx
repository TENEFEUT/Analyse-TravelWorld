"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./login.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, type: "login" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Une erreur est survenue");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch (err) {
      setError("Erreur de connexion au serveur");
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-box">
          {/* Logo & Title */}
          <div className="login-header">
            <div className="logo-wrapper">
              <div className="logo">
                <span>TW</span>
              </div>
            </div>
            <h1 className="title">TravelWorld</h1>
            <p className="subtitle">
              Connectez-vous pour gérer votre projet d'immigration
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
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
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              required
              disabled={loading}
              className="form-input"
            />

            <button
              type="submit"
              disabled={loading}
              className="submit-button"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          {/* Divider */}
          <div className="divider">
            <div className="divider-line"></div>
            <span className="divider-text">OU</span>
            <div className="divider-line"></div>
          </div>

          {/* Forgot Password */}
          <div className="forgot-password">
            <Link href="/auth/forgot-password">
              Mot de passe oublié ?
            </Link>
          </div>
        </div>

        {/* Signup Card */}
        <div className="signup-box">
          <p>
            Vous n'avez pas de compte ?{" "}
            <Link href="/auth/signup">Inscrivez-vous</Link>
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