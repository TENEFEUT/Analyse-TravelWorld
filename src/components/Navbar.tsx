"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./navbar.css";

export default function Navbar() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    router.push("/auth/login");
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          {/* Logo */}
          <Link href="/" className="navbar-logo">
            <div className="logo-icon">
              <span className="logo-text">TW</span>
            </div>
            <span className="logo-name">TravelWorld</span>
          </Link>

          {/* Desktop Menu */}
          <div className="desktop-menu">
            <Link href="/dashboard" className="nav-link">
              Dashboard
            </Link>
            <Link href="/chatbot" className="nav-link">
              Chatbot IA
            </Link>
            
            {/* Dropdown Pays */}
            <div className="nav-dropdown">
              <button className="nav-link dropdown-trigger">
                Destinations ▾
              </button>
              <div className="dropdown-menu">
                <Link href="/pays/canada" className="dropdown-item">
                  🇨🇦 Canada
                </Link>
                <Link href="/pays/france" className="dropdown-item">
                  🇫🇷 France
                </Link>
                <Link href="/pays/usa" className="dropdown-item">
                  🇺🇸 USA
                </Link>
                <Link href="/pays/uk" className="dropdown-item">
                  🇬🇧 Royaume-Uni
                </Link>
                <Link href="/pays/allemagne" className="dropdown-item">
                  🇩🇪 Allemagne
                </Link>
              </div>
            </div>

            <Link href="/profil" className="nav-link">
              Profil
            </Link>
            
            {isAuthenticated ? (
              <button onClick={handleLogout} className="nav-button logout">
                Déconnexion
              </button>
            ) : (
              <Link href="/auth/login" className="nav-button primary">
                Connexion
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-button"
            aria-label="Menu"
          >
            <svg
              className="menu-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            <Link 
              href="/dashboard" 
              className="mobile-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              href="/chatbot" 
              className="mobile-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Chatbot IA
            </Link>
            <div className="mobile-dropdown">
              <p className="mobile-dropdown-title">Destinations</p>
              <Link 
                href="/pays/canada" 
                className="mobile-dropdown-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                🇨🇦 Canada
              </Link>
              <Link 
                href="/pays/france" 
                className="mobile-dropdown-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                🇫🇷 France
              </Link>
              <Link 
                href="/pays/usa" 
                className="mobile-dropdown-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                🇺🇸 USA
              </Link>
              <Link 
                href="/pays/uk" 
                className="mobile-dropdown-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                🇬🇧 Royaume-Uni
              </Link>
              <Link 
                href="/pays/allemagne" 
                className="mobile-dropdown-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                🇩🇪 Allemagne
              </Link>
            </div>
            <Link 
              href="/profil" 
              className="mobile-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Profil
            </Link>
            {isAuthenticated ? (
              <button 
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="mobile-button logout"
              >
                Déconnexion
              </button>
            ) : (
              <Link 
                href="/auth/login" 
                className="mobile-button primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Connexion
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}