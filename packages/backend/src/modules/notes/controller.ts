import { NextRequest, NextResponse } from 'next/server'
import { NoteService } from './service'

export class NoteController {
  private noteService: NoteService

  constructor() {
    this.noteService = new NoteService()
  }

  async getMyNotes(req: NextRequest): Promise<NextResponse> {
    try {
      const traineeId = req.nextUrl.searchParams.get('traineeId')
      const sessionId = req.nextUrl.searchParams.get('sessionId')

      if (!traineeId) {
        return NextResponse.json(
          { success: false, error: 'traineeId requis' },
          { status: 400 }
        )
      }

      let notes
      if (sessionId) {
        notes = await this.noteService.getNotesByTraineeAndSession(traineeId, sessionId)
      } else {
        notes = await this.noteService.getAllNotesByTrainee(traineeId)
      }

      return NextResponse.json({
        success: true,
        data: notes
      })
    } catch (error) {
      console.error('Error in getMyNotes:', error)
      return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
    }
  }

  async saveNote(req: NextRequest): Promise<NextResponse> {
    try {
      const body = await req.json()
      const { traineeId, slideId, content } = body

      if (!traineeId || !slideId) {
        return NextResponse.json(
          { success: false, error: 'Données manquantes' },
          { status: 400 }
        )
      }

      const note = await this.noteService.upsertNote(traineeId, slideId, content)

      return NextResponse.json({
        success: true,
        data: note
      })
    } catch (error) {
      console.error('Error in saveNote:', error)
      return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
    }
  }
}
