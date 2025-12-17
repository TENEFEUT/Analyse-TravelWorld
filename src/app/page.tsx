import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container-custom relative py-20 md:py-32">
          <div className="max-w-3xl fade-in-up">
            <h1 className="text-white mb-6">
              Réalisez votre projet d'immigration en toute confiance
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Accompagnement personnalisé pour vos démarches d'études, travail, tourisme ou résidence permanente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/chatbot" className="btn-secondary text-center">
                Parler à notre IA
              </Link>
              <Link href="/auth/signup" className="btn-outline bg-white/10 border-white text-white hover:bg-white hover:text-blue-600 text-center">
                Créer mon compte
              </Link>
            </div>
          </div>
        </div>
        
        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Services Section */}
      <section className="section">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2>Nos Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Des outils et accompagnements pour chaque étape de votre projet
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center group hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors">
                <svg className="w-8 h-8 text-blue-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Chatbot IA</h3>
              <p className="text-gray-600 mb-4">
                Posez vos questions 24/7 à notre assistant intelligent spécialisé en immigration
              </p>
              <Link href="/chatbot" className="text-blue-600 font-semibold hover:underline">
                Essayer maintenant →
              </Link>
            </div>

            <div className="card text-center group hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-500 transition-colors">
                <svg className="w-8 h-8 text-amber-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Suivi de dossier</h3>
              <p className="text-gray-600 mb-4">
                Gérez vos démarches avec notre tableau de bord personnalisé et checklists
              </p>
              <Link href="/dashboard" className="text-blue-600 font-semibold hover:underline">
                Voir mon dashboard →
              </Link>
            </div>

            <div className="card text-center group hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-600 transition-colors">
                <svg className="w-8 h-8 text-green-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Analyse de faisabilité</h3>
              <p className="text-gray-600 mb-4">
                Évaluez vos chances de réussite avec notre outil d'analyse intelligent
              </p>
              <Link href="/chatbot" className="text-blue-600 font-semibold hover:underline">
                Analyser mon profil →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Destinations Section */}
      <section className="section-alt">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2>Destinations populaires</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Guides détaillés pour chaque pays et type de visa
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { name: "Canada", flag: "🇨🇦", href: "/pays/canada", color: "from-red-500 to-red-600" },
              { name: "France", flag: "🇫🇷", href: "/pays/france", color: "from-blue-500 to-blue-600" },
              { name: "USA", flag: "🇺🇸", href: "/pays/usa", color: "from-blue-600 to-red-600" },
              { name: "Royaume-Uni", flag: "🇬🇧", href: "/pays/uk", color: "from-blue-700 to-red-700" },
              { name: "Allemagne", flag: "🇩🇪", href: "/pays/allemagne", color: "from-gray-800 to-red-600" }
            ].map((country) => (
              <Link 
                key={country.name}
                href={country.href}
                className="card text-center hover:scale-105 transition-transform group"
              >
                <div className={`text-6xl mb-3 group-hover:scale-110 transition-transform`}>
                  {country.flag}
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600">
                  {country.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Types de visa Section */}
      <section className="section">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2>Types de projets</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Quel que soit votre objectif, nous vous guidons pas à pas
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "🎓", title: "Études", desc: "Visa étudiant, permis d'études, bourses" },
              { icon: "💼", title: "Travail", desc: "Permis de travail, visa entrepreneur" },
              { icon: "✈️", title: "Tourisme", desc: "Visa touristique, visa visiteur" },
              { icon: "🏠", title: "Résidence permanente", desc: "Immigration économique, regroupement familial" },
              { icon: "🛡️", title: "Asile & Refuge", desc: "Demande d'asile, protection internationale" },
              { icon: "🚀", title: "Entrepreneur", desc: "Visa startup, investisseur" }
            ].map((type, i) => (
              <div key={i} className="card hover:shadow-2xl transition-shadow">
                <div className="text-4xl mb-3">{type.icon}</div>
                <h3 className="text-xl font-bold mb-2">{type.title}</h3>
                <p className="text-gray-600">{type.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="container-custom text-center">
          <h2 className="text-white mb-4">Prêt à commencer votre projet ?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Créez votre compte gratuitement et bénéficiez de tous nos outils d'accompagnement
          </p>
          <Link href="/auth/signup" className="btn-secondary inline-block">
            Créer mon compte gratuitement
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section">
        <div className="container-custom">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">10k+</div>
              <p className="text-gray-600">Utilisateurs accompagnés</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">5</div>
              <p className="text-gray-600">Pays disponibles</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">95%</div>
              <p className="text-gray-600">Taux de satisfaction</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <p className="text-gray-600">Support disponible</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}