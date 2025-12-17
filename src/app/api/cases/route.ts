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
      // Créer des étapes par défaut
      await createDefaultSteps(immigrationCase.id, country, visaType);
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

    return NextResponse.json({
      message: "Dossier créé avec succès",
      case: completeCase,
    });
  } catch (error) {
    console.error("Cases POST error:", error);
    return NextResponse.json(
      { message: "Erreur lors de la création du dossier" },
      { status: 500 }
    );
  }
}

// Fonction pour créer des étapes par défaut
async function createDefaultSteps(caseId: string, country: string, visaType: string) {
  const defaultSteps = getDefaultStepsForCountry(country, visaType);

  await Promise.all(
    defaultSteps.map((step, index) =>
      prisma.caseStep.create({
        data: {
          caseId,
          stepNumber: index + 1,
          title: step.title,
          description: step.description,
          status: "NOT_STARTED",
          requiresProof: step.requiresProof,
          proofType: step.proofType,
        },
      })
    )
  );
}

// Définir les étapes par défaut selon le pays et le type de visa
function getDefaultStepsForCountry(country: string, visaType: string) {
  // Étapes pour la France - Visa étudiant
  if (country === "France" && visaType === "STUDENT") {
    return [
      {
        title: "Création du compte Campus France",
        description:
          "Créez votre compte sur le site Campus France et remplissez votre dossier en ligne. Vous devrez fournir vos informations personnelles, académiques et votre projet d'études.",
        requiresProof: true,
        proofType: "SCREENSHOT",
      },
      {
        title: "Préparation des documents académiques",
        description:
          "Rassemblez tous vos diplômes, relevés de notes et attestations de réussite. Faites-les traduire si nécessaire et obtenez les certifications requises.",
        requiresProof: true,
        proofType: "DOCUMENT",
      },
      {
        title: "Obtention de l'attestation d'acceptation",
        description:
          "Recevez votre lettre d'acceptation de l'université française et téléchargez-la sur votre compte Campus France.",
        requiresProof: true,
        proofType: "DOCUMENT",
      },
      {
        title: "Justificatif de ressources financières",
        description:
          "Préparez les documents prouvant que vous disposez d'au moins 615€ par mois pour votre séjour en France (relevés bancaires, attestation de prise en charge, etc.).",
        requiresProof: true,
        proofType: "DOCUMENT",
      },
      {
        title: "Entretien Campus France",
        description:
          "Prenez rendez-vous et passez votre entretien pédagogique avec Campus France. Préparez-vous à expliquer votre projet d'études et vos motivations.",
        requiresProof: true,
        proofType: "CERTIFICATE",
      },
      {
        title: "Demande de visa",
        description:
          "Une fois validé par Campus France, prenez rendez-vous au consulat de France et déposez votre demande de visa avec tous les documents requis.",
        requiresProof: true,
        proofType: "SCREENSHOT",
      },
      {
        title: "Suivi du dossier",
        description:
          "Suivez l'avancement de votre demande de visa en ligne et attendez la décision. Le délai de traitement est généralement de 2 à 4 semaines.",
        requiresProof: false,
        proofType: null,
      },
    ];
  }

  // Étapes pour le Canada - Visa étudiant
  if (country === "Canada" && visaType === "STUDENT") {
    return [
      {
        title: "Lettre d'acceptation d'une université",
        description:
          "Obtenez une lettre d'acceptation d'un établissement d'enseignement désigné (EED) canadien.",
        requiresProof: true,
        proofType: "DOCUMENT",
      },
      {
        title: "Preuve de fonds suffisants",
        description:
          "Démontrez que vous disposez des fonds nécessaires pour payer vos frais de scolarité et subvenir à vos besoins au Canada.",
        requiresProof: true,
        proofType: "DOCUMENT",
      },
      {
        title: "Test de langue",
        description:
          "Passez un test de langue reconnu (IELTS, TEF Canada) et obtenez le score requis par votre programme.",
        requiresProof: true,
        proofType: "CERTIFICATE",
      },
      {
        title: "Examen médical",
        description:
          "Passez un examen médical auprès d'un médecin agréé par IRCC si requis pour votre pays d'origine.",
        requiresProof: true,
        proofType: "CERTIFICATE",
      },
      {
        title: "Création du compte IRCC",
        description:
          "Créez votre compte sur le portail d'Immigration, Réfugiés et Citoyenneté Canada (IRCC) et remplissez la demande en ligne.",
        requiresProof: true,
        proofType: "SCREENSHOT",
      },
      {
        title: "Soumission de la demande",
        description:
          "Téléchargez tous les documents requis et payez les frais de traitement (150 CAD).",
        requiresProof: true,
        proofType: "SCREENSHOT",
      },
      {
        title: "Données biométriques",
        description:
          "Prenez rendez-vous dans un centre de collecte de données biométriques et fournissez vos empreintes digitales et photo.",
        requiresProof: true,
        proofType: "CERTIFICATE",
      },
      {
        title: "Suivi et décision",
        description:
          "Suivez votre demande en ligne. Le délai de traitement varie selon votre pays (généralement 3-12 semaines).",
        requiresProof: false,
        proofType: null,
      },
    ];
  }

  // Étapes génériques par défaut
  return [
    {
      title: "Préparation des documents",
      description: "Rassemblez tous les documents nécessaires pour votre demande de visa.",
      requiresProof: false,
      proofType: null,
    },
    {
      title: "Création du dossier en ligne",
      description:
        "Créez votre compte sur la plateforme officielle et remplissez le formulaire de demande.",
      requiresProof: true,
      proofType: "SCREENSHOT",
    },
    {
      title: "Soumission de la demande",
      description: "Soumettez votre demande complète avec tous les documents requis.",
      requiresProof: true,
      proofType: "DOCUMENT",
    },
    {
      title: "Paiement des frais",
      description: "Payez les frais de traitement de votre demande de visa.",
      requiresProof: true,
      proofType: "SCREENSHOT",
    },
    {
      title: "Suivi du dossier",
      description: "Suivez l'avancement de votre demande et attendez la décision.",
      requiresProof: false,
      proofType: null,
    },
  ];
}