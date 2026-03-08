// src/modules/trainer/service.ts
import { prisma } from '../../config/prisma'
import { authenticator } from 'otplib'
import QRCode from 'qrcode'

export class TrainerService {
  private static AUTHORIZED_TRAINERS = ['trainer@ipssi.fr', 'admin@ipssi.fr']

  // Demander un code OTP (générer un magic link si nécessaire)
  async requestOTP(email: string): Promise<{ success: boolean; message: string; qrCode?: string }> {
    const trainer = await prisma.trainer.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!trainer) {
      return {
        success: false,
        message: 'Trainer non trouvé',
      }
    }

    // Si le trainer doit réinitialiser son TOTP ou n'a pas de secret
    if (trainer.resetTotp || !trainer.totpSecret) {
      // Si pas de magic link, en générer un
      let magicLink = trainer.magicLink
      if (!magicLink) {
        magicLink = TrainerService.generateMagicLink()
        await prisma.trainer.update({
          where: { id: trainer.id },
          data: { magicLink },
        })
      }

      // Utiliser la logique existante pour générer le QR code à partir du magic link
      const result = await TrainerService.validateMagicLink(magicLink)
      return {
        success: result.success,
        message: result.success 
          ? 'Veuillez scanner le code QR pour configurer votre application TOTP.' 
          : result.message,
        qrCode: result.qrCode,
      }
    }

    return {
      success: true,
      message: 'Veuillez saisir le code OTP de votre application.',
    }
  }

  // Valider magic link et retourner le QR code
  static async validateMagicLink(magicLink: string): Promise<{ success: boolean; trainer?: any; qrCode?: string; message: string }> {
    const trainer = await prisma.trainer.findUnique({
      where: { magicLink },
    })

    if (!trainer) {
      return {
        success: false,
        message: 'Lien magic invalide ou expiré',
      }
    }

    // Générer une clé TOTP secrète si elle n'existe pas
    let secret = trainer.totpSecret
    
    if (!secret || trainer.resetTotp) {
      // Générer une nouvelle clé secrète utilisant otplib (authenticator)
      secret = authenticator.generateSecret()
      
      // Sauvegarder la clé secrète
      await prisma.trainer.update({
        where: { id: trainer.id },
        data: { totpSecret: secret },
      })
    }

    // Générer l'URL d'authentification
    const otpauthUrl = authenticator.keyuri(
      trainer.email,
      'A11Y Formation',
      secret
    )

    try {
      const qrCode = await QRCode.toDataURL(otpauthUrl)
      
      console.log(`TOTP setup for ${trainer.email}: QR code generated`)

      return {
        success: true,
        trainer: {
          id: trainer.id,
          email: trainer.email,
          firstname: trainer.firstname,
          lastname: trainer.lastname,
          name: `${trainer.firstname} ${trainer.lastname}`,
        },
        qrCode,
        message: 'Scannez le code QR avec FreeOTP',
      }
    } catch (error) {
      console.error('QR Code generation error:', error)
      return {
        success: false,
        message: 'Erreur lors de la génération du code QR',
      }
    }
  }

  // Finaliser la setup du TOTP après validation du code OTP
  static async setupTotp(email: string, otpCode: string, magicLink: string): Promise<{ success: boolean; message: string; token?: string }> {
    // Vérifier le magic link
    const trainer = await prisma.trainer.findUnique({
      where: { magicLink },
    })

    if (!trainer) {
      return {
        success: false,
        message: 'Lien magic invalide ou expiré',
      }
    }

    if (trainer.email.toLowerCase() !== email.toLowerCase()) {
      return {
        success: false,
        message: 'Email ne correspond pas au lien magic',
      }
    }

    // Vérifier si le trainer a une clé TOTP
    if (!trainer.totpSecret) {
      return {
        success: false,
        message: 'Pas de clé TOTP configurée',
      }
    }

    // Valider le code TOTP avec otplib (authenticator par défaut utilise window 1)
    authenticator.options = { window: [2, 2] } // Tolère 1 minute de décalage avant/après
    const isValidToken = authenticator.check(otpCode, trainer.totpSecret)

    if (!isValidToken) {
      console.log(`TOTP check failed for ${email}. Secret: ${trainer.totpSecret.substring(0, 4)}... Input: ${otpCode} (Time: ${new Date().toISOString()})`)
      return {
        success: false,
        message: 'Code TOTP incorrect ou expiré. Vérifiez que l\'heure de votre téléphone est synchronisée.',
      }
    }

    console.log(`TOTP validated for ${email} (First time/Reset)`)

    // Finaliser la setup
    await prisma.trainer.update({
      where: { id: trainer.id },
      data: {
        resetTotp: false,
        magicLink: null, // Effacer le magic link après validation
      },
    })

    // Générer un JWT token
    const trainerInfo = {
      id: trainer.id,
      email: trainer.email,
      firstname: trainer.firstname,
      lastname: trainer.lastname,
      name: `${trainer.firstname} ${trainer.lastname}`,
      sessionId: trainer.sessionId,
    }
    const token = this.generateToken(trainerInfo)

    return {
      success: true,
      message: 'TOTP configuré avec succès',
      data: {
        trainer: trainerInfo,
        token,
      },
      token, // Garder pour compatibilité temporaire
      trainer: trainerInfo, // Garder pour compatibilité temporaire
    }
  }

  // Login avec TOTP (après setup initial)
  static async validateOTP(
    email: string,
    otpCode: string
  ): Promise<{ success: boolean; trainer?: any; token?: string; message: string }> {
    // Récupérer le trainer en base de données
    const trainer = await prisma.trainer.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!trainer) {
      return {
        success: false,
        message: 'Trainer non trouvé',
      }
    }

    // Vérifier si le trainer doit initialiser TOTP
    if (trainer.resetTotp || trainer.magicLink) {
      return {
        success: false,
        message: 'Veuillez d\'abord configurer TOTP via le lien magic',
      }
    }

    // Vérifier si le trainer a une clé TOTP
    if (!trainer.totpSecret) {
      return {
        success: false,
        message: 'Pas de clé TOTP configurée',
      }
    }

    // Valider le code TOTP avec otplib (authenticator par défaut utilise window 1)
    authenticator.options = { window: [2, 2] } // Tolère 1 minute de décalage avant/après
    const isValidToken = authenticator.check(otpCode, trainer.totpSecret)

    if (!isValidToken) {
      console.log(`TOTP check failed for ${email}. Secret: ${trainer.totpSecret.substring(0, 4)}... Input: ${otpCode}`)
      return {
        success: false,
        message: 'Code TOTP incorrect ou expiré. Vérifiez que l\'heure de votre téléphone est synchronisée.',
      }
    }

    // Code valide, retourner les infos du trainer
    const trainerInfo = {
      id: trainer.id,
      email: trainer.email,
      firstname: trainer.firstname,
      lastname: trainer.lastname,
      name: `${trainer.firstname} ${trainer.lastname}`,
      sessionId: trainer.sessionId,
    }

    // Générer un JWT token
    const token = this.generateToken(trainerInfo)

    return {
      success: true,
      trainer: trainerInfo,
      token,
      message: 'Authentification réussie',
    }
  }

  private static generateToken(trainer: any): string {
    // Code simplifié - en production, utiliser jsonwebtoken avec une clé secrète
    const payload = {
      id: trainer.id,
      email: trainer.email,
      name: trainer.name,
      iat: Date.now(),
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24h expiry
    }
    return Buffer.from(JSON.stringify(payload)).toString('base64')
  }

  private static generateMagicLink(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let token = ''
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return token
  }

  // Révoquer l'accès TOTP et générer un nouveau magic link
  static async revokeTotp(email: string): Promise<{ success: boolean; magicLink?: string; message: string }> {
    const trainer = await prisma.trainer.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!trainer) {
      return {
        success: false,
        message: 'Trainer non trouvé',
      }
    }

    // Générer un nouveau magic link
    const newMagicLink = this.generateMagicLink()

    // Révoquer le TOTP secret
    await prisma.trainer.update({
      where: { id: trainer.id },
      data: {
        totpSecret: null,
        resetTotp: true,
        magicLink: newMagicLink,
      },
    })

    console.log(`TOTP revoked for ${email}. New magic link generated.`)

    return {
      success: true,
      magicLink: newMagicLink,
      message: 'Code QR révoqué. Un nouveau lien magic a été généré.',
    }
  }
}
