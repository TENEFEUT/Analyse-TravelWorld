import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const decoded = verifyToken(token) as { userId: string };
    const { message, conversationHistory } = await req.json();

    // Récupérer le contexte complet de l'utilisateur
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
        cases: {
          include: {
            steps: {
              orderBy: { stepNumber: "asc" },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        analyses: {
          include: {
            recommendations: true,
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    // Préparer le contexte
    const context = buildUserContext(user);

    // Appeler OpenAI
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
      return NextResponse.json({
        response:
          "Je suis désolé, le service de chat n'est pas disponible actuellement. Veuillez réessayer plus tard.",
      });
    }

    const messages = [
      {
        role: "system",
        content: `Tu es un assistant expert en immigration internationale pour TravelWorld. Tu aides les utilisateurs avec leurs projets d'immigration.

CONTEXTE DE L'UTILISATEUR:
${context}

INSTRUCTIONS:
- Utilise les informations du contexte pour personnaliser tes réponses
- Si l'utilisateur a des dossiers en cours, aide-le spécifiquement sur ces procédures
- Sois précis, professionnel et encourageant
- Fournis des conseils pratiques et actionnables
- Si une information manque, demande poliment à l'utilisateur de compléter son profil
- Réponds en français de manière claire et concise`,
      },
      ...(conversationHistory || []),
      {
        role: "user",
        content: message,
      },
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: messages,
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      throw new Error("OpenAI API error");
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error("AI Chat error:", error);
    return NextResponse.json(
      {
        response:
          "Je suis désolé, une erreur s'est produite. Veuillez réessayer dans quelques instants.",
      },
      { status: 500 }
    );
  }
}

function buildUserContext(user: any): string {
  let context = `Nom: ${user.firstName || "Non renseigné"} ${user.lastName || ""}\n`;
  context += `Email: ${user.email}\n`;
  context += `Nationalité: ${user.nationality || "Non renseignée"}\n`;
  context += `Pays actuel: ${user.currentCountry || "Non renseigné"}\n\n`;

  // Éducation
  if (user.profile?.education?.length > 0) {
    context += `PARCOURS ACADÉMIQUE:\n`;
    user.profile.education.forEach((edu: any) => {
      context += `- ${edu.degree} en ${edu.fieldOfStudy} à ${edu.institution} (${edu.country})\n`;
    });
    context += `\n`;
  }

  // Expérience
  if (user.profile?.workExperience?.length > 0) {
    context += `EXPÉRIENCE PROFESSIONNELLE:\n`;
    user.profile.workExperience.forEach((work: any) => {
      context += `- ${work.jobTitle} chez ${work.company} (${work.country})\n`;
    });
    context += `\n`;
  }

  // Langues
  if (user.profile?.languages?.length > 0) {
    context += `COMPÉTENCES LINGUISTIQUES:\n`;
    user.profile.languages.forEach((lang: any) => {
      context += `- ${lang.language}: ${lang.level}${
        lang.hasCertificate ? ` (Certifié: ${lang.certificateName})` : ""
      }\n`;
    });
    context += `\n`;
  }

  // Dossiers en cours
  if (user.cases?.length > 0) {
    context += `DOSSIERS EN COURS:\n`;
    user.cases.forEach((c: any) => {
      const completedSteps = c.steps.filter(
        (s: any) => s.status === "COMPLETED"
      ).length;
      const totalSteps = c.steps.length;
      context += `- ${c.country} (${c.visaType}): ${completedSteps}/${totalSteps} étapes complétées\n`;

      // Étape actuelle
      const currentStep = c.steps.find(
        (s: any) => s.status === "IN_PROGRESS" || s.status === "NOT_STARTED"
      );
      if (currentStep) {
        context += `  Étape actuelle: ${currentStep.title}\n`;
      }
    });
    context += `\n`;
  }

  // Dernière analyse
  if (user.analyses?.length > 0) {
    const analysis = user.analyses[0];
    context += `DERNIÈRE ANALYSE DE FAISABILITÉ:\n`;
    context += `Pays recommandés: `;
    context += analysis.recommendations
      .slice(0, 3)
      .map((r: any) => `${r.country} (${r.score}%)`)
      .join(", ");
    context += `\n\n`;
  }

  return context;
}