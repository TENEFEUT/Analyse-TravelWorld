import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// GET - Récupérer tous les dossiers de l'utilisateur
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const decoded = verifyToken(token) as { userId: string };

    const cases = await prisma.immigrationCase.findMany({
      where: { userId: decoded.userId },
      include: {
        steps: {
          orderBy: { stepNumber: "asc" },
        },
        documents: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ cases });
  } catch (error) {
    console.error("Cases GET error:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Créer un nouveau dossier
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const decoded = verifyToken(token) as { userId: string };
    const { country, visaType, description } = await req.json();

    console.log("📁 [CASE] Création dossier:", country, visaType);

    // Récupérer le profil utilisateur pour personnaliser les étapes
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        profile: {
          include: {
            education: true,
            workExperience: true,
            languages: true,
          },
        },
      },
    });

    // Créer le dossier
    const immigrationCase = await prisma.immigrationCase.create({
      data: {
        userId: decoded.userId,
        country,
        visaType,
        description,
        status: "PENDING",
      },
    });

    console.log("✅ [CASE] Dossier créé:", immigrationCase.id);

    // Chercher un template correspondant
    const template = await prisma.procedureTemplate.findFirst({
      where: {
        country,
        visaType,
        isActive: true,
      },
      include: {
        steps: {
          orderBy: { stepNumber: "asc" },
        },
      },
    });

    // Si un template existe, créer les étapes
    if (template && template.steps.length > 0) {
      console.log("📋 [CASE] Template trouvé, création des étapes");
      await Promise.all(
        template.steps.map((templateStep) =>
          prisma.caseStep.create({
            data: {
              caseId: immigrationCase.id,
              stepNumber: templateStep.stepNumber,
              title: templateStep.title,
              description: templateStep.description,
              status: "NOT_STARTED",
              requiresProof: templateStep.requiresProof,
              proofType: templateStep.proofType,
            },
          })
        )
      );
    } else {
      // Créer des étapes personnalisées selon le profil
      console.log("🎯 [CASE] Création d'étapes personnalisées");
      await createPersonalizedSteps(immigrationCase.id, country, visaType, user);
    }

    // Récupérer le dossier complet avec les étapes
    const completeCase = await prisma.immigrationCase.findUnique({
      where: { id: immigrationCase.id },
      include: {
        steps: {
          orderBy: { stepNumber: "asc" },
        },
      },
    });

    console.log("✅ [CASE] Dossier complet créé avec", completeCase?.steps.length, "étapes");

    return NextResponse.json({
      message: "Dossier créé avec succès",
      case: completeCase,
    });
  } catch (error) {
    console.error("❌ [CASE] Erreur:", error);
    return NextResponse.json(
      { message: "Erreur lors de la création du dossier" },
      { status: 500 }
    );
  }
}

// Fonction pour créer des étapes personnalisées selon le profil
async function createPersonalizedSteps(
  caseId: string,
  country: string,
  visaType: string,
  user: any
) {
  const steps = getPersonalizedSteps(country, visaType, user);

  let stepNumber = 1;
  for (const mainStep of steps) {
    // Créer l'étape principale
    await prisma.caseStep.create({
      data: {
        caseId,
        stepNumber: stepNumber++,
        title: mainStep.title,
        description: mainStep.description,
        status: "NOT_STARTED",
        requiresProof: mainStep.requiresProof,
        proofType: mainStep.proofType,
      },
    });

    // Créer les sous-étapes si elles existent
    if (mainStep.subSteps && mainStep.subSteps.length > 0) {
      for (const subStep of mainStep.subSteps) {
        await prisma.caseStep.create({
          data: {
            caseId,
            stepNumber: stepNumber++,
            title: `   └─ ${subStep.title}`,
            description: subStep.description,
            status: "NOT_STARTED",
            requiresProof: subStep.requiresProof,
            proofType: subStep.proofType,
          },
        });
      }
    }
  }
}

// Fonction principale qui retourne les étapes personnalisées
function getPersonalizedSteps(country: string, visaType: string, user: any) {
  // Déterminer les tests de langue requis
  const hasEnglishTest = user?.profile?.languages?.some(
    (l: any) => l.language === "ENGLISH" && l.hasCertificate
  );
  const hasFrenchTest = user?.profile?.languages?.some(
    (l: any) => l.language === "FRENCH" && l.hasCertificate
  );
  const hasGermanTest = user?.profile?.languages?.some(
    (l: any) => l.language === "GERMAN" && l.hasCertificate
  );

  // Déterminer le niveau d'études
  const hasUniversityDegree = user?.profile?.education?.some(
    (e: any) => e.degree === "Master" || e.degree === "Doctorat" || e.degree === "Licence"
  );

  // FRANCE - Visa Étudiant
  if (country === "France" && visaType === "STUDENT") {
    return [
      {
        title: "Phase 1 : Préparation du dossier académique",
        description: "Rassemblez tous vos documents académiques et préparez votre projet d'études",
        requiresProof: false,
        proofType: null,
        subSteps: [
          {
            title: "Diplômes et relevés de notes",
            description: "Scannez tous vos diplômes, relevés de notes et attestations de réussite en haute qualité",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
          {
            title: "Traduction officielle",
            description: "Faites traduire vos documents par un traducteur assermenté si nécessaire",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
          {
            title: "CV académique français",
            description: "Rédigez un CV au format français détaillant votre parcours académique et professionnel",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
        ],
      },
      {
        title: "Phase 2 : Inscription Campus France",
        description: "Créez votre dossier sur la plateforme Campus France",
        requiresProof: true,
        proofType: "SCREENSHOT",
        subSteps: [
          {
            title: "Création du compte",
            description: "Inscrivez-vous sur le site Campus France de votre pays",
            requiresProof: true,
            proofType: "SCREENSHOT",
          },
          {
            title: "Remplissage du formulaire",
            description: "Complétez toutes les sections : informations personnelles, parcours académique, projet d'études",
            requiresProof: true,
            proofType: "SCREENSHOT",
          },
          {
            title: "Choix des formations",
            description: "Sélectionnez jusqu'à 7 formations qui correspondent à votre projet",
            requiresProof: true,
            proofType: "SCREENSHOT",
          },
        ],
      },
      {
        title: hasFrenchTest
          ? "Phase 3 : Test de langue (Validé ✓)"
          : "Phase 3 : Test de langue française",
        description: hasFrenchTest
          ? "Votre certification française est enregistrée"
          : "Passez un test de français reconnu (TCF, DELF, DALF)",
        requiresProof: !hasFrenchTest,
        proofType: hasFrenchTest ? null : "CERTIFICATE",
        subSteps: hasFrenchTest
          ? []
          : [
              {
                title: "Inscription au test",
                description: "Inscrivez-vous à une session TCF TP, DELF ou DALF. Niveau B2 minimum recommandé",
                requiresProof: true,
                proofType: "SCREENSHOT",
              },
              {
                title: "Préparation",
                description: "Préparez-vous avec des cours en ligne, manuels ou cours particuliers",
                requiresProof: false,
                proofType: null,
              },
              {
                title: "Passage du test",
                description: "Passez le test et attendez les résultats (2-4 semaines)",
                requiresProof: true,
                proofType: "CERTIFICATE",
              },
            ],
      },
      {
        title: "Phase 4 : Candidatures aux universités",
        description: "Postulez auprès des établissements français",
        requiresProof: false,
        proofType: null,
        subSteps: [
          {
            title: "Lettres de motivation",
            description: "Rédigez une lettre de motivation personnalisée pour chaque formation",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
          {
            title: "Envoi des candidatures",
            description: "Soumettez vos dossiers via Campus France ou directement aux universités",
            requiresProof: true,
            proofType: "SCREENSHOT",
          },
          {
            title: "Obtention de l'admission",
            description: "Recevez votre lettre d'acceptation de l'université",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
        ],
      },
      {
        title: "Phase 5 : Justificatifs financiers",
        description: "Prouvez que vous disposez de ressources suffisantes (615€/mois minimum)",
        requiresProof: true,
        proofType: "DOCUMENT",
        subSteps: [
          {
            title: "Relevés bancaires",
            description: "Fournissez vos relevés bancaires des 3 derniers mois",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
          {
            title: "Attestation de prise en charge",
            description: "Si applicable, obtenez une attestation notariée d'un garant en France",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
        ],
      },
      {
        title: "Phase 6 : Entretien Campus France",
        description: "Passez votre entretien pédagogique",
        requiresProof: true,
        proofType: "CERTIFICATE",
        subSteps: [
          {
            title: "Prise de rendez-vous",
            description: "Réservez un créneau sur votre compte Campus France",
            requiresProof: true,
            proofType: "SCREENSHOT",
          },
          {
            title: "Préparation de l'entretien",
            description: "Préparez-vous à présenter votre projet d'études et vos motivations",
            requiresProof: false,
            proofType: null,
          },
          {
            title: "Passage de l'entretien",
            description: "Présentez-vous à l'entretien avec tous vos documents originaux",
            requiresProof: true,
            proofType: "CERTIFICATE",
          },
        ],
      },
      {
        title: "Phase 7 : Demande de visa",
        description: "Déposez votre demande de visa au consulat de France",
        requiresProof: true,
        proofType: "SCREENSHOT",
        subSteps: [
          {
            title: "Prise de rendez-vous consulat",
            description: "Prenez RDV sur France-Visas après validation Campus France",
            requiresProof: true,
            proofType: "SCREENSHOT",
          },
          {
            title: "Préparation du dossier visa",
            description: "Rassemblez tous les documents requis (liste fournie par le consulat)",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
          {
            title: "Dépôt au consulat",
            description: "Présentez-vous au consulat avec votre dossier complet et payez les frais (99€)",
            requiresProof: true,
            proofType: "SCREENSHOT",
          },
          {
            title: "Suivi et récupération",
            description: "Suivez votre demande en ligne et récupérez votre passeport visé (délai: 2-4 semaines)",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
        ],
      },
    ];
  }

  // CANADA - Visa Étudiant
  if (country === "Canada" && visaType === "STUDENT") {
    return [
      {
        title: "Phase 1 : Admission universitaire",
        description: "Obtenez une lettre d'acceptation d'un EED (Établissement d'Enseignement Désigné)",
        requiresProof: true,
        proofType: "DOCUMENT",
        subSteps: [
          {
            title: "Recherche d'universités",
            description: "Identifiez les programmes et universités qui correspondent à votre profil",
            requiresProof: false,
            proofType: null,
          },
          {
            title: "Candidatures",
            description: "Postulez directement auprès des universités canadiennes",
            requiresProof: true,
            proofType: "SCREENSHOT",
          },
          {
            title: "Lettre d'acceptation",
            description: "Recevez votre lettre d'acceptation officielle",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
        ],
      },
      {
        title: hasEnglishTest
          ? "Phase 2 : Test de langue (Validé ✓)"
          : "Phase 2 : Test de langue",
        description: hasEnglishTest
          ? "Votre certification anglaise est enregistrée"
          : "Passez le test IELTS ou CELPIP (anglais) / TEF Canada (français)",
        requiresProof: !hasEnglishTest,
        proofType: hasEnglishTest ? null : "CERTIFICATE",
        subSteps: hasEnglishTest
          ? []
          : [
              {
                title: "Inscription au test",
                description: "Inscrivez-vous à IELTS Academic (score minimum 6.5) ou TEF Canada",
                requiresProof: true,
                proofType: "SCREENSHOT",
              },
              {
                title: "Passage du test",
                description: "Passez le test et envoyez les résultats à votre université",
                requiresProof: true,
                proofType: "CERTIFICATE",
              },
            ],
      },
      {
        title: "Phase 3 : Preuve de fonds",
        description: "Démontrez vos capacités financières (10 000 CAD minimum + frais de scolarité)",
        requiresProof: true,
        proofType: "DOCUMENT",
        subSteps: [
          {
            title: "Relevés bancaires",
            description: "Fournissez des relevés bancaires des 4 derniers mois",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
          {
            title: "Certificat de placement garanti (CPG)",
            description: "Option recommandée : Ouvrez un CPG de 10 000 CAD auprès d'une banque canadienne",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
        ],
      },
      {
        title: "Phase 4 : Documents administratifs",
        description: "Rassemblez tous les documents requis",
        requiresProof: false,
        proofType: null,
        subSteps: [
          {
            title: "Passeport valide",
            description: "Assurez-vous que votre passeport est valide pendant toute la durée de vos études",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
          {
            title: "Certificat de police",
            description: "Obtenez un certificat de police (casier judiciaire) de votre pays",
            requiresProof: true,
            proofType: "CERTIFICATE",
          },
          {
            title: "Photos d'identité",
            description: "Préparez des photos récentes aux normes canadiennes",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
        ],
      },
      {
        title: "Phase 5 : Examen médical",
        description: "Passez l'examen médical auprès d'un médecin agréé par IRCC",
        requiresProof: true,
        proofType: "CERTIFICATE",
        subSteps: [
          {
            title: "Trouver un médecin agréé",
            description: "Consultez la liste sur le site d'IRCC et prenez rendez-vous",
            requiresProof: true,
            proofType: "SCREENSHOT",
          },
          {
            title: "Passage de l'examen",
            description: "Passez l'examen médical complet (radio, tests sanguins, examen général)",
            requiresProof: true,
            proofType: "CERTIFICATE",
          },
        ],
      },
      {
        title: "Phase 6 : Demande en ligne",
        description: "Créez votre compte et soumettez votre demande sur le portail IRCC",
        requiresProof: true,
        proofType: "SCREENSHOT",
        subSteps: [
          {
            title: "Création du compte",
            description: "Inscrivez-vous sur le portail IRCC et créez votre profil",
            requiresProof: true,
            proofType: "SCREENSHOT",
          },
          {
            title: "Remplissage du formulaire IMM 1294",
            description: "Complétez le formulaire de demande de permis d'études",
            requiresProof: true,
            proofType: "SCREENSHOT",
          },
          {
            title: "Téléchargement des documents",
            description: "Uploadez tous vos documents au format PDF",
            requiresProof: true,
            proofType: "SCREENSHOT",
          },
          {
            title: "Paiement des frais",
            description: "Payez les frais de traitement (150 CAD)",
            requiresProof: true,
            proofType: "SCREENSHOT",
          },
        ],
      },
      {
        title: "Phase 7 : Données biométriques",
        description: "Fournissez vos empreintes digitales et votre photo",
        requiresProof: true,
        proofType: "CERTIFICATE",
        subSteps: [
          {
            title: "Lettre d'instructions biométriques",
            description: "Attendez de recevoir la lettre d'IRCC (BIL) par email",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
          {
            title: "Rendez-vous VAC",
            description: "Prenez RDV dans un centre de collecte de données biométriques (frais: 85 CAD)",
            requiresProof: true,
            proofType: "SCREENSHOT",
          },
          {
            title: "Collecte des données",
            description: "Présentez-vous au centre avec votre passeport et la lettre BIL",
            requiresProof: true,
            proofType: "CERTIFICATE",
          },
        ],
      },
      {
        title: "Phase 8 : Suivi et décision",
        description: "Suivez votre demande et recevez la décision",
        requiresProof: false,
        proofType: null,
        subSteps: [
          {
            title: "Suivi en ligne",
            description: "Vérifiez régulièrement le statut de votre demande sur votre compte IRCC",
            requiresProof: false,
            proofType: null,
          },
          {
            title: "Réception de la décision",
            description: "Recevez la lettre d'introduction pour le permis d'études (délai: 4-12 semaines)",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
        ],
      },
    ];
  }

  // BELGIQUE - Visa Étudiant
  if (country === "Belgique" && visaType === "STUDENT") {
    return [
      {
        title: "Phase 1 : Inscription dans une université belge",
        description: "Obtenez une attestation d'inscription dans un établissement d'enseignement supérieur",
        requiresProof: true,
        proofType: "DOCUMENT",
        subSteps: [
          {
            title: "Équivalence du diplôme",
            description: "Demandez l'équivalence de votre diplôme auprès de la Fédération Wallonie-Bruxelles",
            requiresProof: true,
            proofType: "CERTIFICATE",
          },
          {
            title: "Candidature universitaire",
            description: "Postulez auprès des universités belges (ULB, UCLouvain, ULiège, etc.)",
            requiresProof: true,
            proofType: "SCREENSHOT",
          },
          {
            title: "Attestation d'inscription",
            description: "Obtenez votre attestation d'inscription ou pré-inscription",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
        ],
      },
      {
        title: "Phase 2 : Preuve de ressources financières",
        description: "Prouvez que vous disposez de 700€/mois (8 400€/an minimum)",
        requiresProof: true,
        proofType: "DOCUMENT",
        subSteps: [
          {
            title: "Attestation de prise en charge",
            description: "Option 1: Obtenez une annexe 32 d'un garant en Belgique",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
          {
            title: "Relevés bancaires",
            description: "Option 2: Montrez des relevés bancaires attestant de fonds suffisants",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
        ],
      },
      {
        title: "Phase 3 : Documents administratifs",
        description: "Rassemblez tous les documents requis",
        requiresProof: false,
        proofType: null,
        subSteps: [
          {
            title: "Extrait de casier judiciaire",
            description: "Obtenez un extrait de casier judiciaire de moins de 6 mois",
            requiresProof: true,
            proofType: "CERTIFICATE",
          },
          {
            title: "Certificat médical",
            description: "Passez un examen médical et obtenez un certificat de bonne santé",
            requiresProof: true,
            proofType: "CERTIFICATE",
          },
          {
            title: "Assurance maladie",
            description: "Souscrivez à une assurance santé couvrant tous les risques en Belgique",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
        ],
      },
      {
        title: "Phase 4 : Demande de visa",
        description: "Déposez votre demande à l'ambassade de Belgique",
        requiresProof: true,
        proofType: "SCREENSHOT",
        subSteps: [
          {
            title: "Prise de rendez-vous",
            description: "Prenez RDV à l'ambassade ou au consulat de Belgique dans votre pays",
            requiresProof: true,
            proofType: "SCREENSHOT",
          },
          {
            title: "Dépôt du dossier",
            description: "Déposez votre dossier complet avec tous les documents originaux",
            requiresProof: true,
            proofType: "SCREENSHOT",
          },
          {
            title: "Suivi de la demande",
            description: "Attendez la décision (délai: 2-4 mois)",
            requiresProof: false,
            proofType: null,
          },
        ],
      },
    ];
  }

  // ALLEMAGNE - Visa Étudiant
  if (country === "Allemagne" && visaType === "STUDENT") {
    return [
      {
        title: "Phase 1 : Admission universitaire",
        description: "Obtenez une admission (Zulassung) d'une université allemande",
        requiresProof: true,
        proofType: "DOCUMENT",
        subSteps: [
          {
            title: "Recherche de programmes",
            description: "Trouvez des programmes sur DAAD ou les sites universitaires",
            requiresProof: false,
            proofType: null,
          },
          {
            title: "Candidature via Uni-Assist",
            description: "Postulez via la plateforme Uni-Assist pour la reconnaissance de vos diplômes",
            requiresProof: true,
            proofType: "SCREENSHOT",
          },
          {
            title: "Lettre d'admission",
            description: "Recevez votre Zulassungsbescheid (lettre d'admission)",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
        ],
      },
      {
        title: hasGermanTest
          ? "Phase 2 : Test de langue allemande (Validé ✓)"
          : "Phase 2 : Certification linguistique",
        description: hasGermanTest
          ? "Votre certification allemande est enregistrée"
          : "Prouvez votre niveau d'allemand (TestDaF, DSH ou Goethe-Zertifikat C1)",
        requiresProof: !hasGermanTest,
        proofType: hasGermanTest ? null : "CERTIFICATE",
        subSteps: hasGermanTest
          ? []
          : [
              {
                title: "Choix du test",
                description: "TestDaF (niveau 4 dans les 4 sections) ou DSH-2 minimum",
                requiresProof: false,
                proofType: null,
              },
              {
                title: "Passage du test",
                description: "Inscrivez-vous et passez le test de langue",
                requiresProof: true,
                proofType: "CERTIFICATE",
              },
            ],
      },
      {
        title: "Phase 3 : Preuve financière (Sperrkonto)",
        description: "Bloquez 11 208€ sur un compte bloqué allemand",
        requiresProof: true,
        proofType: "DOCUMENT",
        subSteps: [
          {
            title: "Ouverture du Sperrkonto",
            description: "Ouvrez un compte bloqué auprès de Deutsche Bank, Fintiba ou X-patrio",
            requiresProof: true,
            proofType: "SCREENSHOT",
          },
          {
            title: "Versement des fonds",
            description: "Versez 11 208€ (934€/mois pour 12 mois) sur le compte",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
          {
            title: "Confirmation bancaire",
            description: "Obtenez la confirmation de blocage (Sperrbestätigung)",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
        ],
      },
      {
        title: "Phase 4 : Assurance santé",
        description: "Souscrivez à une assurance santé reconnue en Allemagne",
        requiresProof: true,
        proofType: "DOCUMENT",
        subSteps: [
          {
            title: "Choix de l'assurance",
            description: "TK, AOK, DAK ou assurance privée pour étudiants",
            requiresProof: false,
            proofType: null,
          },
          {
            title: "Attestation d'assurance",
            description: "Obtenez l'attestation de couverture santé",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
        ],
      },
      {
        title: "Phase 5 : Demande de visa",
        description: "Déposez votre demande à l'ambassade d'Allemagne",
        requiresProof: true,
        proofType: "SCREENSHOT",
        subSteps: [
          {
            title: "Prise de rendez-vous",
            description: "Prenez RDV sur le site de l'ambassade (Terminbuchung)",
            requiresProof: true,
            proofType: "SCREENSHOT",
          },
          {
            title: "Remplissage du formulaire",
            description: "Complétez le formulaire de demande de visa national",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
          {
            title: "Dépôt du dossier",
            description: "Présentez-vous avec tous les documents (frais: 75€)",
            requiresProof: true,
            proofType: "SCREENSHOT",
          },
          {
            title: "Suivi et récupération",
            description: "Suivez votre demande et récupérez votre visa (délai: 6-12 semaines)",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
        ],
      },
    ];
  }

  // USA - Visa F-1 Étudiant
  if (country === "USA" && visaType === "STUDENT") {
    return [
      {
        title: "Phase 1 : Admission universitaire",
        description: "Obtenez une admission dans une université américaine accréditée SEVP",
        requiresProof: true,
        proofType: "DOCUMENT",
        subSteps: [
          {
            title: "Tests standardisés",
            description: "Passez le SAT/ACT (undergraduate) ou GRE/GMAT (graduate) selon le programme",
            requiresProof: true,
            proofType: "CERTIFICATE",
          },
          {
            title: "Candidatures universitaires",
            description: "Postulez via Common App ou directement sur les sites universitaires",
            requiresProof: true,
            proofType: "SCREENSHOT",
          },
          {
            title: "Lettre d'acceptation",
            description: "Recevez votre lettre d'acceptation officielle",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
        ],
      },
      {
        title: hasEnglishTest
          ? "Phase 2 : Test d'anglais (Validé ✓)"
          : "Phase 2 : Test d'anglais TOEFL/IELTS",
        description: hasEnglishTest
          ? "Votre certification anglaise est enregistrée"
          : "Passez le TOEFL iBT (score min. 80) ou IELTS Academic (score min. 6.5)",
        requiresProof: !hasEnglishTest,
        proofType: hasEnglishTest ? null : "CERTIFICATE",
        subSteps: hasEnglishTest
          ? []
          : [
              {
                title: "Inscription au test",
                description: "Inscrivez-vous sur ets.org (TOEFL) ou ielts.org",
                requiresProof: true,
                proofType: "SCREENSHOT",
              },
              {
                title: "Passage du test",
                description: "Passez le test et envoyez les scores directement aux universités",
                requiresProof: true,
                proofType: "CERTIFICATE",
              },
            ],
      },
      {
        title: "Phase 3 : Formulaire I-20",
        description: "Recevez votre formulaire I-20 de votre université",
        requiresProof: true,
        proofType: "DOCUMENT",
        subSteps: [
          {
            title: "Preuve financière",
            description: "Envoyez à l'université la preuve de fonds suffisants (frais de scolarité + 10 000$ minimum)",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
          {
            title: "Réception du I-20",
            description: "Recevez le formulaire I-20 signé par le DSO de votre université",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
        ],
      },
      {
        title: "Phase 4 : Frais SEVIS",
        description: "Payez les frais SEVIS I-901 (350$)",
        requiresProof: true,
        proofType: "SCREENSHOT",
        subSteps: [
          {
            title: "Paiement en ligne",
            description: "Payez sur fmjfee.com avec votre numéro SEVIS du formulaire I-20",
            requiresProof: true,
            proofType: "SCREENSHOT",
          },
          {
            title: "Reçu de paiement",
            description: "Imprimez le reçu de paiement SEVIS",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
        ],
      },
      {
        title: "Phase 5 : Formulaire DS-160",
        description: "Complétez la demande de visa en ligne",
        requiresProof: true,
        proofType: "SCREENSHOT",
        subSteps: [
          {
            title: "Remplissage du DS-160",
            description: "Complétez le formulaire sur ceac.state.gov/genniv",
            requiresProof: true,
            proofType: "SCREENSHOT",
          },
          {
            title: "Page de confirmation",
            description: "Imprimez la page de confirmation avec le code-barres",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
          {
            title: "Photo format américain",
            description: "Préparez une photo 5x5 cm aux normes américaines",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
        ],
      },
      {
        title: "Phase 6 : Prise de rendez-vous",
        description: "Prenez RDV pour l'entretien à l'ambassade",
        requiresProof: true,
        proofType: "SCREENSHOT",
        subSteps: [
          {
            title: "Paiement des frais MRV",
            description: "Payez les frais de demande de visa (185$) via le système MRV",
            requiresProof: true,
            proofType: "SCREENSHOT",
          },
          {
            title: "Réservation de l'entretien",
            description: "Prenez RDV sur le site de l'ambassade américaine",
            requiresProof: true,
            proofType: "SCREENSHOT",
          },
        ],
      },
      {
        title: "Phase 7 : Entretien consulaire",
        description: "Passez l'entretien à l'ambassade ou au consulat",
        requiresProof: true,
        proofType: "CERTIFICATE",
        subSteps: [
          {
            title: "Préparation des documents",
            description: "Rassemblez tous vos documents originaux (I-20, DS-160, passeport, relevés bancaires, etc.)",
            requiresProof: false,
            proofType: null,
          },
          {
            title: "Passage de l'entretien",
            description: "Présentez-vous à l'entretien et répondez aux questions de l'officier consulaire",
            requiresProof: true,
            proofType: "CERTIFICATE",
          },
          {
            title: "Récupération du passeport",
            description: "Récupérez votre passeport visé dans les 3-7 jours",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
        ],
      },
    ];
  }

  // LUXEMBOURG - Visa Étudiant
  if (country === "Luxembourg" && visaType === "STUDENT") {
    return [
      {
        title: "Phase 1 : Inscription à l'Université du Luxembourg",
        description: "Obtenez une lettre d'admission",
        requiresProof: true,
        proofType: "DOCUMENT",
        subSteps: [
          {
            title: "Candidature en ligne",
            description: "Postulez sur le portail de l'Université du Luxembourg",
            requiresProof: true,
            proofType: "SCREENSHOT",
          },
          {
            title: "Lettre d'acceptation",
            description: "Recevez votre confirmation d'admission",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
        ],
      },
      {
        title: "Phase 2 : Preuve de ressources",
        description: "Prouvez que vous disposez de 1 000€/mois minimum",
        requiresProof: true,
        proofType: "DOCUMENT",
        subSteps: [
          {
            title: "Relevés bancaires",
            description: "Fournissez des relevés bancaires des 3 derniers mois",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
          {
            title: "Attestation de bourse",
            description: "Si applicable, fournissez votre attestation de bourse",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
        ],
      },
      {
        title: "Phase 3 : Logement",
        description: "Prouvez que vous avez un hébergement au Luxembourg",
        requiresProof: true,
        proofType: "DOCUMENT",
        subSteps: [
          {
            title: "Contrat de bail ou attestation",
            description: "Fournissez un contrat de location ou une attestation de la résidence universitaire",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
        ],
      },
      {
        title: "Phase 4 : Demande de visa/autorisation de séjour",
        description: "Déposez votre demande au MAEE Luxembourg",
        requiresProof: true,
        proofType: "SCREENSHOT",
        subSteps: [
          {
            title: "Formulaire de demande",
            description: "Complétez le formulaire de demande d'autorisation de séjour temporaire étudiant",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
          {
            title: "Dépôt à l'ambassade",
            description: "Déposez votre dossier à l'ambassade du Luxembourg dans votre pays",
            requiresProof: true,
            proofType: "SCREENSHOT",
          },
          {
            title: "Suivi de la demande",
            description: "Attendez la décision (délai: 3-8 semaines)",
            requiresProof: false,
            proofType: null,
          },
        ],
      },
    ];
  }

  // SUISSE - Visa Étudiant
  if (country === "Suisse" && visaType === "STUDENT") {
    return [
      {
        title: "Phase 1 : Admission universitaire",
        description: "Obtenez une admission dans une université suisse",
        requiresProof: true,
        proofType: "DOCUMENT",
        subSteps: [
          {
            title: "Candidature universitaire",
            description: "Postulez auprès d'universités suisses (ETH Zurich, EPFL, Universités cantonales)",
            requiresProof: true,
            proofType: "SCREENSHOT",
          },
          {
            title: "Confirmation d'admission",
            description: "Recevez votre attestation d'inscription",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
        ],
      },
      {
        title: "Phase 2 : Preuve de ressources financières",
        description: "Prouvez que vous disposez de 21 000 CHF/an minimum",
        requiresProof: true,
        proofType: "DOCUMENT",
        subSteps: [
          {
            title: "Garantie bancaire",
            description: "Fournissez une attestation bancaire ou une garantie de prise en charge",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
          {
            title: "Relevés bancaires",
            description: "Relevés des 6 derniers mois montrant les fonds disponibles",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
        ],
      },
      {
        title: "Phase 3 : Logement",
        description: "Prouvez que vous avez un hébergement en Suisse",
        requiresProof: true,
        proofType: "DOCUMENT",
        subSteps: [
          {
            title: "Contrat de bail",
            description: "Fournissez un contrat de location ou une attestation de la résidence universitaire",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
        ],
      },
      {
        title: "Phase 4 : Assurance maladie",
        description: "Souscrivez à une assurance maladie suisse",
        requiresProof: true,
        proofType: "DOCUMENT",
        subSteps: [
          {
            title: "Choix de l'assurance",
            description: "CSS, Helsana, Swica ou autre assurance reconnue",
            requiresProof: false,
            proofType: null,
          },
          {
            title: "Attestation d'assurance",
            description: "Obtenez l'attestation de couverture santé",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
        ],
      },
      {
        title: "Phase 5 : Demande de visa",
        description: "Déposez votre demande à l'ambassade de Suisse",
        requiresProof: true,
        proofType: "SCREENSHOT",
        subSteps: [
          {
            title: "Formulaire de demande",
            description: "Remplissez le formulaire de demande de visa D (études)",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
          {
            title: "Prise de rendez-vous",
            description: "Prenez RDV à l'ambassade suisse",
            requiresProof: true,
            proofType: "SCREENSHOT",
          },
          {
            title: "Dépôt du dossier",
            description: "Déposez votre dossier complet (frais variables selon le canton)",
            requiresProof: true,
            proofType: "SCREENSHOT",
          },
          {
            title: "Autorisation cantonale",
            description: "Attendez l'approbation du canton où se trouve votre université (délai: 8-12 semaines)",
            requiresProof: false,
            proofType: null,
          },
        ],
      },
    ];
  }

  // ITALIE - Visa Étudiant
  if (country === "Italie" && visaType === "STUDENT") {
    return [
      {
        title: "Phase 1 : Pré-inscription Universitaly",
        description: "Pré-inscription obligatoire sur la plateforme Universitaly",
        requiresProof: true,
        proofType: "SCREENSHOT",
        subSteps: [
          {
            title: "Création du compte",
            description: "Inscrivez-vous sur universitaly.it",
            requiresProof: true,
            proofType: "SCREENSHOT",
          },
          {
            title: "Pré-inscription",
            description: "Complétez la pré-inscription pour vos universités choisies",
            requiresProof: true,
            proofType: "SCREENSHOT",
          },
        ],
      },
      {
        title: "Phase 2 : Déclaration de valeur (Dichiarazione di Valore)",
        description: "Obtenez la légalisation de vos diplômes",
        requiresProof: true,
        proofType: "DOCUMENT",
        subSteps: [
          {
            title: "Traduction assermentée",
            description: "Faites traduire vos diplômes par un traducteur assermenté",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
          {
            title: "Légalisation",
            description: "Demandez la Dichiarazione di Valore au consulat italien",
            requiresProof: true,
            proofType: "CERTIFICATE",
          },
        ],
      },
      {
        title: "Phase 3 : Admission universitaire",
        description: "Obtenez la lettre d'acceptation",
        requiresProof: true,
        proofType: "DOCUMENT",
        subSteps: [
          {
            title: "Test d'admission",
            description: "Passez le test d'entrée si requis par votre programme",
            requiresProof: true,
            proofType: "CERTIFICATE",
          },
          {
            title: "Lettre d'acceptation",
            description: "Recevez votre lettre d'admission de l'université italienne",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
        ],
      },
      {
        title: "Phase 4 : Preuve de ressources",
        description: "Prouvez que vous disposez de 460€/mois minimum (5 889€/an)",
        requiresProof: true,
        proofType: "DOCUMENT",
        subSteps: [
          {
            title: "Relevés bancaires",
            description: "Fournissez vos relevés bancaires des 6 derniers mois",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
        ],
      },
      {
        title: "Phase 5 : Demande de visa",
        description: "Déposez votre demande au consulat italien",
        requiresProof: true,
        proofType: "SCREENSHOT",
        subSteps: [
          {
            title: "Prise de rendez-vous",
            description: "Prenez RDV sur le site du consulat italien",
            requiresProof: true,
            proofType: "SCREENSHOT",
          },
          {
            title: "Formulaire de demande",
            description: "Remplissez le formulaire de demande de visa national type D",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
          {
            title: "Dépôt du dossier",
            description: "Déposez votre dossier complet au consulat (frais: 50€)",
            requiresProof: true,
            proofType: "SCREENSHOT",
          },
          {
            title: "Nulla Osta",
            description: "Attendez l'approbation du Nulla Osta du ministère italien (délai: 30-60 jours)",
            requiresProof: false,
            proofType: null,
          },
        ],
      },
    ];
  }

  // ESPAGNE - Visa Étudiant
  if (country === "Espagne" && visaType === "STUDENT") {
    return [
      {
        title: "Phase 1 : Admission universitaire",
        description: "Obtenez une lettre d'acceptation d'une université espagnole",
        requiresProof: true,
        proofType: "DOCUMENT",
        subSteps: [
          {
            title: "Homologation du diplôme",
            description: "Faites homologuer votre diplôme auprès du ministère espagnol de l'Éducation si nécessaire",
            requiresProof: true,
            proofType: "CERTIFICATE",
          },
          {
            title: "Candidature universitaire",
            description: "Postulez directement auprès des universités espagnoles",
            requiresProof: true,
            proofType: "SCREENSHOT",
          },
          {
            title: "Carta de admisión",
            description: "Recevez votre lettre d'acceptation",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
        ],
      },
      {
        title: "Phase 2 : Preuve de ressources",
        description: "Prouvez que vous disposez de 600€/mois (IPREM 2024)",
        requiresProof: true,
        proofType: "DOCUMENT",
        subSteps: [
          {
            title: "Relevés bancaires",
            description: "Fournissez des relevés bancaires des 3-6 derniers mois",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
          {
            title: "Lettre de prise en charge",
            description: "Si applicable, obtenez une carta de invitación d'un résident espagnol",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
        ],
      },
      {
        title: "Phase 3 : Assurance santé",
        description: "Souscrivez à une assurance santé valide en Espagne",
        requiresProof: true,
        proofType: "DOCUMENT",
        subSteps: [
          {
            title: "Assurance privée",
            description: "Sanitas, Adeslas ou assurance internationale couvrant l'Espagne",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
        ],
      },
      {
        title: "Phase 4 : Documents administratifs",
        description: "Rassemblez tous les documents requis",
        requiresProof: false,
        proofType: null,
        subSteps: [
          {
            title: "Certificat médical",
            description: "Obtenez un certificat médical attestant que vous n'avez pas de maladie contagieuse",
            requiresProof: true,
            proofType: "CERTIFICATE",
          },
          {
            title: "Certificat de casier judiciaire",
            description: "Obtenez un certificat de casier judiciaire vierge et faites-le apostiller",
            requiresProof: true,
            proofType: "CERTIFICATE",
          },
        ],
      },
      {
        title: "Phase 5 : Demande de visa",
        description: "Déposez votre demande au consulat d'Espagne",
        requiresProof: true,
        proofType: "SCREENSHOT",
        subSteps: [
          {
            title: "Formulaire de demande",
            description: "Remplissez le formulaire national de demande de visa étudiant",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
          {
            title: "Prise de rendez-vous",
            description: "Prenez RDV au consulat d'Espagne",
            requiresProof: true,
            proofType: "SCREENSHOT",
          },
          {
            title: "Dépôt du dossier",
            description: "Déposez votre dossier complet au consulat (frais: 60€)",
            requiresProof: true,
            proofType: "SCREENSHOT",
          },
          {
            title: "Suivi de la demande",
            description: "Attendez la décision (délai: 1-3 mois)",
            requiresProof: false,
            proofType: null,
          },
        ],
      },
    ];
  }

  // CHINE - Visa Étudiant (X1 ou X2)
  if (country === "Chine" && visaType === "STUDENT") {
    return [
      {
        title: "Phase 1 : Admission universitaire",
        description: "Obtenez une admission dans une université chinoise",
        requiresProof: true,
        proofType: "DOCUMENT",
        subSteps: [
          {
            title: "Candidature en ligne",
            description: "Postulez via le site de l'université ou le portail Study in China",
            requiresProof: true,
            proofType: "SCREENSHOT",
          },
          {
            title: "Admission Letter",
            description: "Recevez votre lettre d'admission officielle",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
          {
            title: "Formulaire JW201 ou JW202",
            description: "Obtenez le formulaire officiel délivré par l'université (obligatoire pour le visa)",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
        ],
      },
      {
        title: "Phase 2 : Examen médical",
        description: "Passez l'examen médical obligatoire (Physical Examination Form)",
        requiresProof: true,
        proofType: "CERTIFICATE",
        subSteps: [
          {
            title: "Rendez-vous médical",
            description: "Prenez RDV dans un hôpital agréé par l'ambassade de Chine",
            requiresProof: true,
            proofType: "SCREENSHOT",
          },
          {
            title: "Examens requis",
            description: "Radio des poumons, tests sanguins, ECG, examen général (valide 6 mois)",
            requiresProof: true,
            proofType: "CERTIFICATE",
          },
        ],
      },
      {
        title: "Phase 3 : Certificat de non-condamnation",
        description: "Obtenez un certificat de casier judiciaire vierge",
        requiresProof: true,
        proofType: "CERTIFICATE",
        subSteps: [
          {
            title: "Demande au service de police",
            description: "Demandez un extrait de casier judiciaire",
            requiresProof: true,
            proofType: "CERTIFICATE",
          },
          {
            title: "Authentification",
            description: "Faites authentifier le document par le ministère des Affaires étrangères et l'ambassade de Chine",
            requiresProof: true,
            proofType: "CERTIFICATE",
          },
        ],
      },
      {
        title: "Phase 4 : Formulaire de demande de visa",
        description: "Complétez le formulaire de visa chinois en ligne",
        requiresProof: true,
        proofType: "SCREENSHOT",
        subSteps: [
          {
            title: "Remplissage en ligne",
            description: "Complétez le formulaire sur le site du Centre de visa chinois (CVASC)",
            requiresProof: true,
            proofType: "SCREENSHOT",
          },
          {
            title: "Photo d'identité",
            description: "Préparez une photo récente (33x48 mm, fond blanc)",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
        ],
      },
      {
        title: "Phase 5 : Dépôt de la demande",
        description: "Déposez votre dossier au CVASC ou à l'ambassade",
        requiresProof: true,
        proofType: "SCREENSHOT",
        subSteps: [
          {
            title: "Prise de rendez-vous",
            description: "Prenez RDV au Centre de visa chinois (frais: variables selon durée)",
            requiresProof: true,
            proofType: "SCREENSHOT",
          },
          {
            title: "Dépôt du dossier complet",
            description: "Présentez-vous avec : passeport, formulaire, JW201/JW202, admission letter, certificat médical, casier judiciaire",
            requiresProof: true,
            proofType: "SCREENSHOT",
          },
          {
            title: "Suivi et récupération",
            description: "Suivez votre demande et récupérez votre visa (délai: 4-7 jours ouvrables)",
            requiresProof: true,
            proofType: "DOCUMENT",
          },
        ],
      },
      {
        title: "Phase 6 : Enregistrement en Chine",
        description: "Une fois en Chine, enregistrez-vous auprès des autorités",
        requiresProof: false,
        proofType: null,
        subSteps: [
          {
            title: "Enregistrement de résidence",
            description: "Dans les 24h après l'arrivée, enregistrez-vous au poste de police local",
            requiresProof: false,
            proofType: null,
          },
          {
            title: "Residence Permit",
            description: "Dans les 30 jours, demandez votre permis de résidence auprès du PSB (frais: 400-800 RMB)",
            requiresProof: false,
            proofType: null,
          },
        ],
      },
    ];
  }

  // Étapes génériques par défaut
  return [
    {
      title: "Phase 1 : Préparation des documents",
      description: "Rassemblez tous les documents nécessaires pour votre demande",
      requiresProof: false,
      proofType: null,
      subSteps: [
        {
          title: "Documents d'identité",
          description: "Passeport valide, photos d'identité, acte de naissance",
          requiresProof: true,
          proofType: "DOCUMENT",
        },
        {
          title: "Documents académiques",
          description: "Diplômes, relevés de notes, certificats",
          requiresProof: true,
          proofType: "DOCUMENT",
        },
      ],
    },
    {
      title: "Phase 2 : Création du dossier en ligne",
      description: "Inscrivez-vous sur la plateforme officielle",
      requiresProof: true,
      proofType: "SCREENSHOT",
      subSteps: [
        {
          title: "Compte en ligne",
          description: "Créez votre compte sur le portail officiel",
          requiresProof: true,
          proofType: "SCREENSHOT",
        },
        {
          title: "Formulaire de demande",
          description: "Remplissez le formulaire en ligne",
          requiresProof: true,
          proofType: "SCREENSHOT",
        },
      ],
    },
    {
      title: "Phase 3 : Soumission de la demande",
      description: "Soumettez votre demande complète",
      requiresProof: true,
      proofType: "DOCUMENT",
      subSteps: [],
    },
    {
      title: "Phase 4 : Paiement des frais",
      description: "Payez les frais de traitement",
      requiresProof: true,
      proofType: "SCREENSHOT",
      subSteps: [],
    },
    {
      title: "Phase 5 : Suivi du dossier",
      description: "Suivez l'avancement de votre demande",
      requiresProof: false,
      proofType: null,
      subSteps: [],
    },
  ];
}