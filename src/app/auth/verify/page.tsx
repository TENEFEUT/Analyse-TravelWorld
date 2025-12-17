"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import "./verify.css";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [authToken, setAuthToken] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token de vérification manquant");
      return;
    }

    async function verifyEmail() {
      try {
        console.log("[VERIFY] Vérification du token...");
        console.log("   Token:", token ? token.substring(0, 20) + "..." : "null");

        const res = await fetch(`/api/auth/verify?token=${token}`);
        const data = await res.json();

        console.log("[VERIFY] Réponse reçue:", data);

        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Email vérifié avec succès !");
          setAuthToken(data.token);
          
          // Stocker le token et rediriger
          if (data.token) {
            localStorage.setItem("token", data.token);
            setTimeout(() => {
              router.push("/dashboard");
            }, 2000);
          }
        } else {
          setStatus("error");
          setMessage(data.message || "Erreur lors de la vérification");
          console.error("[VERIFY] Erreur:", data);
        }
      } catch (error) {
        console.error("[VERIFY] Exception:", error);
        setStatus("error");
        setMessage("Erreur de connexion au serveur");
      }
    }

    verifyEmail();
  }, [token, router]);

  if (status === "loading") {
    return (
      <div className="verify-container">
        <div className="verify-card">
          <div className="verify-box">
            <div className="icon-wrapper loading">
              <svg className="spinner" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle className="spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h1 className="verify-title">Vérification en cours...</h1>
            <p className="verify-message">
              Veuillez patienter pendant que nous vérifions votre email.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="verify-container">
        <div className="verify-card">
          <div className="verify-box">
            <div className="icon-wrapper success">
              <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="verify-title">Email vérifié ! 🎉</h1>
            <p className="verify-message">{message}</p>
            <div className="info-box success-info">
              <p>Votre compte est maintenant actif. Redirection en cours...</p>
            </div>
            <Link href="/dashboard" className="verify-button">
              Accéder au tableau de bord
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Status = "error"
  return (
    <div className="verify-container">
      <div className="verify-card">
        <div className="verify-box">
          <div className="icon-wrapper error">
            <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="verify-title">Erreur de vérification</h1>
          <p className="verify-message">{message}</p>
          <div className="info-box error-info">
            <p>Le lien de vérification est peut-être expiré ou invalide.</p>
          </div>
          <div className="button-group">
            <Link href="/auth/signup" className="verify-button">
              Créer un nouveau compte
            </Link>
            <Link href="/auth/login" className="verify-link">
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}