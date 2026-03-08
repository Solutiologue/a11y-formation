import { NextRequest, NextResponse } from 'next/server'
import { SessionService } from './service'

export class SessionController {
  private sessionService: SessionService

  constructor() {
    this.sessionService = new SessionService()
  }

  async validate(req: NextRequest): Promise<NextResponse> {
    try {
      const { code, email, id } = await req.json()
      
      let result;
      if (id) {
        // Recherche par ID direct (usage interne profil)
        result = await this.sessionService.getSessionById(id)
      } else {
        if (!code || code.length !== 8) {
          return NextResponse.json({ success: false, error: 'Code invalide' }, { status: 400 })
        }
        result = await this.sessionService.validateSessionCode(code, email)
      }
      
      return NextResponse.json({
        success: true,
        data: result
      })
    } catch (error) {
       console.error('Validation error:', error)
       return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
    }
  }
}
