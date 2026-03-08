import { NoteController } from '@/modules/notes/controller'
import { NextRequest } from 'next/server'

const noteController = new NoteController()

export async function GET(request: NextRequest) {
  return noteController.getMyNotes(request)
}

export async function POST(request: NextRequest) {
  return noteController.saveNote(request)
}
