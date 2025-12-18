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

    console.log("💬 [CHATBOT] Message reçu:", message);

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

    const context = buildUserContext(user);
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
      console.error("[CHATBOT] Clé API OpenAI manquante");
      return NextResponse.json({
        response:
          "Le service de chat n'est pas configuré. Veuillez vérifier la clé API OpenAI dans le fichier .env",
      });
    }

    console.log("[CHATBOT] Clé API présente");

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
- Réponds en français de manière claire et concise
- Utilise des émojis pour rendre tes réponses plus engageantes`,
      },
      ...(conversationHistory || []),
      {
        role: "user",
        content: message,
      },
    ];

    console.log("🤖 [CHATBOT] Appel à OpenAI...");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // Utilisez gpt-4 si vous avez accès
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    console.log("[CHATBOT] Statut OpenAI:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("[CHATBOT] Erreur OpenAI:", response.status, errorData);

      // Messages d'erreur spécifiques
      if (response.status === 401) {
        return NextResponse.json({
          response:
            "Erreur d'authentification avec OpenAI. Votre clé API est invalide ou expirée. Veuillez la vérifier sur https://platform.openai.com/api-keys",
        });
      }

      if (response.status === 429) {
        return NextResponse.json({
          response:
            "Le quota OpenAI est dépassé. Veuillez ajouter des crédits sur https://platform.openai.com/account/billing\n\nPour continuer à tester l'application, vous pouvez activer le mode DEMO en attendant.",
        });
      }

      if (response.status === 404) {
        return NextResponse.json({
          response:
            "Le modèle GPT demandé n'est pas accessible avec votre compte OpenAI. Essayez de changer 'gpt-3.5-turbo' dans le code.",
        });
      }

      if (response.status === 500 || response.status === 503) {
        return NextResponse.json({
          response:
            "OpenAI rencontre des problèmes techniques. Veuillez réessayer dans quelques instants.",
        });
      }

      return NextResponse.json({
        response:
          "Une erreur est survenue lors de la communication avec OpenAI. Vérifiez vos crédits et votre clé API.",
      });
    }

    const data = await response.json();
    console.log("[CHATBOT] Réponse OpenAI reçue");
    
    const aiResponse = data.choices[0].message.content;

    return NextResponse.json({ response: aiResponse });
  } catch (error: any) {
    console.error("[CHATBOT] Erreur:", error.message);
    console.error("Stack:", error.stack);

    return NextResponse.json(
      {
        response:
          "Je suis désolé, une erreur technique s'est produite. Veuillez réessayer dans quelques instants.",
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