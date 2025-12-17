import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// POST - Créer une nouvelle analyse
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const decoded = verifyToken(token) as { userId: string };

    // Récupérer le profil complet de l'utilisateur
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
        documents: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    // Vérifier que le profil est complet
    if (!user.profile || user.profile.education.length === 0) {
      return NextResponse.json(
        { message: "Veuillez compléter votre profil avant de demander une analyse" },
        { status: 400 }
      );
    }

    // Créer l'analyse
    const analysis = await prisma.feasibilityAnalysis.create({
      data: {
        userId: decoded.userId,
        status: "IN_PROGRESS",
      },
    });

    // Appeler l'IA pour générer les recommandations
    const aiAnalysis = await generateAIAnalysis(user);

    // Créer les recommandations de pays
    const recommendations = await Promise.all(
      aiAnalysis.recommendations.map((rec: any) =>
        prisma.countryRecommendation.create({
          data: {
            analysisId: analysis.id,
            country: rec.country,
            visaType: rec.visaType,
            score: rec.score,
            reasoning: rec.reasoning,
            requirements: rec.requirements,
            estimatedDuration: rec.estimatedDuration,
            estimatedCost: rec.estimatedCost,
          },
        })
      )
    );

    // Mettre à jour l'analyse avec le résultat de l'IA
    const updatedAnalysis = await prisma.feasibilityAnalysis.update({
      where: { id: analysis.id },
      data: {
        status: "COMPLETED",
        aiAnalysis: aiAnalysis.summary,
        completedAt: new Date(),
      },
      include: {
        recommendations: true,
      },
    });

    return NextResponse.json({
      message: "Analyse créée avec succès",
      analysis: updatedAnalysis,
    });
  } catch (error) {
    console.error("Analysis POST error:", error);
    return NextResponse.json(
      { message: "Erreur lors de la création de l'analyse" },
      { status: 500 }
    );
  }
}

// GET - Récupérer les analyses de l'utilisateur
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const decoded = verifyToken(token) as { userId: string };

    const analyses = await prisma.feasibilityAnalysis.findMany({
      where: { userId: decoded.userId },
      include: {
        recommendations: {
          orderBy: { score: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ analyses });
  } catch (error) {
    console.error("Analysis GET error:", error);
    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// Fonction pour générer l'analyse IA
async function generateAIAnalysis(user: any) {
  // Préparer les données du profil
  const profileData = {
    name: `${user.firstName} ${user.lastName}`,
    nationality: user.nationality,
    currentCountry: user.currentCountry,
    age: user.birthDate
      ? new Date().getFullYear() - new Date(user.birthDate).getFullYear()
      : null,
    education: user.profile.education.map((edu: any) => ({
      degree: edu.degree,
      field: edu.fieldOfStudy,
      country: edu.country,
    })),
    workExperience: user.profile.workExperience.map((work: any) => ({
      title: work.jobTitle,
      years: work.endDate
        ? (new Date(work.endDate).getTime() - new Date(work.startDate).getTime()) /
          (1000 * 60 * 60 * 24 * 365)
        : null,
    })),
    languages: user.profile.languages.map((lang: any) => ({
      language: lang.language,
      level: lang.level,
      hasCertificate: lang.hasCertificate,
    })),
  };

  // Appeler l'API OpenAI
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  
  if (!OPENAI_API_KEY) {
    // Mode sans IA - génération basique
    return generateBasicRecommendations(profileData);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Tu es un expert en immigration internationale. Analyse le profil de l'utilisateur et recommande les 5 meilleurs pays et types de visa adaptés à son profil. Pour chaque recommandation, fournis un score sur 100, une justification détaillée, les exigences principales, la durée estimée et le coût approximatif. Réponds UNIQUEMENT en format JSON.`,
          },
          {
            role: "user",
            content: `Voici le profil de l'utilisateur : ${JSON.stringify(profileData)}`,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error("OpenAI API error");
    }

    const data = await response.json();
    const aiResponse = JSON.parse(data.choices[0].message.content);

    return {
      summary: aiResponse.summary || "Analyse complétée avec succès",
      recommendations: aiResponse.recommendations,
    };
  } catch (error) {
    console.error("OpenAI error:", error);
    // Fallback vers les recommandations basiques
    return generateBasicRecommendations(profileData);
  }
}

// Génération de recommandations basiques (sans IA)
function generateBasicRecommendations(profileData: any) {
  const recommendations = [];

  // Logique basique basée sur le niveau d'éducation
  const highestDegree = profileData.education[0]?.degree || "";
  const hasLanguages = profileData.languages.length > 0;

  // Canada
  if (highestDegree.includes("Licence") || highestDegree.includes("Master")) {
    recommendations.push({
      country: "Canada",
      visaType: "STUDENT",
      score: 85,
      reasoning:
        "Excellent choix pour les études supérieures. Le Canada offre des programmes de qualité et des opportunités de résidence permanente après les études.",
      requirements: [
        "Lettre d'acceptation d'une université canadienne",
        "Preuve de fonds suffisants",
        "Test de langue (IELTS ou TEF)",
        "Examen médical",
      ],
      estimatedDuration: "3-6 mois",
      estimatedCost: "150-200 CAD (frais de visa)",
    });
  }

  // France
  if (
    profileData.languages.some((l: any) => l.language === "FRENCH" && l.level >= "B1")
  ) {
    recommendations.push({
      country: "France",
      visaType: "STUDENT",
      score: 80,
      reasoning:
        "Votre niveau de français est adapté pour des études en France. Système éducatif reconnu internationalement.",
      requirements: [
        "Inscription via Campus France",
        "Attestation d'acceptation universitaire",
        "Justificatif de ressources (615€/mois minimum)",
        "Assurance santé",
      ],
      estimatedDuration: "2-4 mois",
      estimatedCost: "99 EUR (frais Campus France + visa)",
    });
  }

  // USA
  recommendations.push({
    country: "États-Unis",
    visaType: "STUDENT",
    score: 75,
    reasoning:
      "Les États-Unis offrent de nombreuses opportunités académiques, mais le processus est plus complexe et coûteux.",
    requirements: [
      "Formulaire I-20 d'une université américaine",
      "Preuve de fonds importants",
      "Test TOEFL ou IELTS",
      "Entretien à l'ambassade",
    ],
    estimatedDuration: "3-8 mois",
    estimatedCost: "160-510 USD (frais SEVIS + visa)",
  });

  // Belgique
  recommendations.push({
    country: "Belgique",
    visaType: "STUDENT",
    score: 78,
    reasoning:
      "Processus relativement simple pour les étudiants africains. Frais de scolarité abordables.",
    requirements: [
      "Préinscription universitaire",
      "Équivalence de diplômes",
      "Preuve de moyens de subsistance (700€/mois)",
      "Assurance maladie",
    ],
    estimatedDuration: "2-5 mois",
    estimatedCost: "200-350 EUR",
  });

  // Allemagne
  if (hasLanguages) {
    recommendations.push({
      country: "Allemagne",
      visaType: "STUDENT",
      score: 82,
      reasoning:
        "Éducation de qualité avec de nombreux programmes gratuits ou à faible coût. Bonnes perspectives d'emploi après les études.",
      requirements: [
        "Admission dans une université allemande",
        "Compte bloqué (11,208 EUR minimum)",
        "Assurance santé",
        "Preuve de compétences linguistiques (allemand ou anglais)",
      ],
      estimatedDuration: "6-12 semaines",
      estimatedCost: "75-100 EUR",
    });
  }

  return {
    summary: `Basé sur votre profil avec ${profileData.education.length} formation(s) et ${profileData.languages.length} langue(s), nous vous recommandons ${recommendations.length} destinations adaptées.`,
    recommendations: recommendations.slice(0, 5), // Max 5 recommandations
  };
}