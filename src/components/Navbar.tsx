"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">TW</span>
            </div>
            <span className="font-bold text-xl text-gray-900 hidden sm:block">
              TravelWorld
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              href="/dashboard" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              href="/chatbot" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Chatbot IA
            </Link>
            
            {/* Dropdown Pays */}
            <div className="relative group">
              <button className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Destinations ▾
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <Link href="/pays/canada" className="block px-4 py-2 hover:bg-blue-50 rounded-t-lg">
                  🇨🇦 Canada
                </Link>
                <Link href="/pays/france" className="block px-4 py-2 hover:bg-blue-50">
                  🇫🇷 France
                </Link>
                <Link href="/pays/usa" className="block px-4 py-2 hover:bg-blue-50">
                  🇺🇸 USA
                </Link>
                <Link href="/pays/uk" className="block px-4 py-2 hover:bg-blue-50">
                  🇬🇧 Royaume-Uni
                </Link>
                <Link href="/pays/allemagne" className="block px-4 py-2 hover:bg-blue-50 rounded-b-lg">
                  🇩🇪 Allemagne
                </Link>
              </div>
            </div>

            <Link 
              href="/profil" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Profil
            </Link>
            
            <Link href="/auth/login" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg transition-all text-sm">
              Connexion
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <svg
              className="w-6 h-6"
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
          <div className="md:hidden py-4 border-t border-gray-100">
            <Link 
              href="/dashboard" 
              className="block py-2 text-gray-700 hover:text-blue-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              href="/chatbot" 
              className="block py-2 text-gray-700 hover:text-blue-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Chatbot IA
            </Link>
            <div className="py-2">
              <p className="font-semibold text-gray-900 mb-2">Destinations</p>
              <Link href="/pays/canada" className="block pl-4 py-1 text-gray-600 hover:text-blue-600">
                🇨🇦 Canada
              </Link>
              <Link href="/pays/france" className="block pl-4 py-1 text-gray-600 hover:text-blue-600">
                🇫🇷 France
              </Link>
              <Link href="/pays/usa" className="block pl-4 py-1 text-gray-600 hover:text-blue-600">
                🇺🇸 USA
              </Link>
              <Link href="/pays/uk" className="block pl-4 py-1 text-gray-600 hover:text-blue-600">
                🇬🇧 Royaume-Uni
              </Link>
              <Link href="/pays/allemagne" className="block pl-4 py-1 text-gray-600 hover:text-blue-600">
                🇩🇪 Allemagne
              </Link>
            </div>
            <Link 
              href="/profil" 
              className="block py-2 text-gray-700 hover:text-blue-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Profil
            </Link>
            <Link 
              href="/auth/login" 
              className="block mt-4 text-center btn-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Connexion
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}