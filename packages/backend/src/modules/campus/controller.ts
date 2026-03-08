import { NextRequest, NextResponse } from 'next/server'
import { CampusService } from './service'

const campusService = new CampusService()

export class CampusController {
  async getBySchool(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url)
      const school = searchParams.get('school')

      if (!school) {
        return NextResponse.json(
          { success: false, error: 'School not specified' },
          { status: 400 }
        )
      }

      const campuses = await campusService.getBySchool(school)
      return NextResponse.json({
        success: true,
        data: campuses
      })
    } catch (error) {
      console.error('Erreur CampusController:', error)
      return NextResponse.json(
        { success: false, error: 'Error retrieving campuses' },
        { status: 500 }
      )
    }
  }
}
