import * as brevo from "@getbrevo/brevo";

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY || ""
);

// Mode DEBUG : affiche les liens dans la console si l'envoi échoue
const DEBUG_MODE = true;

export async function sendVerificationEmail(
  to: string,
  name: string,
  verificationToken: string
) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${verificationToken}`;

  console.log("📧 [EMAIL] Tentative d'envoi à:", to);
  console.log("🔗 [EMAIL] Lien de vérification:", verificationUrl);

  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.subject = "Vérifiez votre compte TravelWorld";
    sendSmtpEmail.to = [{ email: to, name: name }];
    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌍 TravelWorld</h1>
            </div>
            <div class="content">
              <h2>Bienvenue ${name} ! 👋</h2>
              <p>Merci de vous être inscrit sur TravelWorld, votre partenaire pour vos projets d'immigration.</p>
              <p>Pour activer votre compte, veuillez cliquer sur le bouton ci-dessous :</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">✅ Vérifier mon email</a>
              </div>
              <p style="margin-top: 20px; font-size: 14px; color: #666;">
                Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
                <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
              </p>
              <p style="margin-top: 20px; font-size: 14px; color: #999;">
                Ce lien expire dans 24 heures.
              </p>
            </div>
            <div class="footer">
              <p>Vous avez reçu cet email car vous vous êtes inscrit sur TravelWorld.</p>
              <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    sendSmtpEmail.sender = {
      name: "TravelWorld",
      email: process.env.EMAIL_FROM || "noreply@travelworld.com",
    };

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ [EMAIL] Email envoyé avec succès:", data);
    return { success: true };
  } catch (error: any) {
    console.error("❌ [EMAIL] Échec de l'envoi de l'email :", error);
    
    if (DEBUG_MODE) {
      console.log("");
      console.log("═══════════════════════════════════════════════════════════");
      console.log("🔧 MODE DEBUG - EMAIL NON ENVOYÉ");
      console.log("═══════════════════════════════════════════════════════════");
      console.log("📧 Destinataire:", to);
      console.log("👤 Nom:", name);
      console.log("🔗 LIEN DE VÉRIFICATION:");
      console.log("");
      console.log("    " + verificationUrl);
      console.log("");
      console.log("📝 Instructions:");
      console.log("   1. Copiez le lien ci-dessus");
      console.log("   2. Collez-le dans votre navigateur");
      console.log("   3. Votre compte sera activé !");
      console.log("");
      console.log("⚠️  Pour recevoir de vrais emails:");
      console.log("   - Vérifiez votre clé API Brevo sur https://app.brevo.com/settings/keys/api");
      console.log("   - Vérifiez que l'email expéditeur est validé sur https://app.brevo.com/senders/list");
      console.log("═══════════════════════════════════════════════════════════");
      console.log("");
    }
    
    // On ne throw pas l'erreur pour que l'inscription continue
    return { 
      success: false, 
      error: error.message,
      verificationUrl: DEBUG_MODE ? verificationUrl : undefined 
    };
  }
}

export async function sendWelcomeEmail(to: string, name: string) {
  console.log("📧 [EMAIL] Tentative d'envoi du mail de bienvenue à:", to);

  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.subject = "Bienvenue sur TravelWorld ! 🎉";
    sendSmtpEmail.to = [{ email: to, name: name }];
    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Bienvenue sur TravelWorld !</h1>
            </div>
            <div class="content">
              <h2>Félicitations ${name} ! 🎊</h2>
              <p>Votre compte est maintenant activé ! Vous pouvez commencer à explorer nos services :</p>
              <ul style="line-height: 2;">
                <li>📊 <strong>Analyse de faisabilité</strong> : Découvrez les pays qui correspondent à votre profil</li>
                <li>📋 <strong>Gestion de dossiers</strong> : Suivez vos démarches étape par étape</li>
                <li>💬 <strong>Assistant IA</strong> : Posez vos questions 24/7</li>
                <li>📄 <strong>Gestion de documents</strong> : Centralisez tous vos documents</li>
              </ul>
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">🚀 Accéder à mon tableau de bord</a>
              </div>
            </div>
            <div class="footer">
              <p>Besoin d'aide ? Notre équipe est là pour vous accompagner !</p>
            </div>
          </div>
        </body>
      </html>
    `;
    sendSmtpEmail.sender = {
      name: "TravelWorld",
      email: process.env.EMAIL_FROM || "noreply@travelworld.com",
    };

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ [EMAIL] Email de bienvenue envoyé:", data);
    return { success: true };
  } catch (error: any) {
    console.error("❌ [EMAIL] Échec de l'envoi de l'email de bienvenue:", error);
    
    if (DEBUG_MODE) {
      console.log("🔧 [DEBUG] Email de bienvenue non envoyé, mais l'utilisateur peut continuer");
    }
    
    // On ne throw pas l'erreur pour que la vérification continue
    return { success: false, error: error.message };
  }
}