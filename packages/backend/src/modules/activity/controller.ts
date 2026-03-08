import { NextRequest, NextResponse } from 'next/server'
import { ActivityLogService } from './service'

export class ActivityLogController {
  private service: ActivityLogService

  constructor() {
    this.service = new ActivityLogService()
  }

  async create(req: NextRequest) {
    try {
      const body = await req.json()
      const { type, traineeId, sessionId, metadata } = body

      if (!type || !traineeId || !sessionId) {
        return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 })
      }

      const log = await this.service.create({ type, traineeId, sessionId, metadata })
      return NextResponse.json({ success: true, data: log })
    } catch (error) {
      console.error('Error creating activity log:', error)
      return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
    }
  }

  async getBySession(req: NextRequest, { params }: { params: { sessionId: string } }) {
    try {
      const { sessionId } = params
      const logs = await this.service.getBySession(sessionId)
      return NextResponse.json({ success: true, data: logs })
    } catch (error) {
      console.error('Error fetching activity logs:', error)
      return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
    }
  }
}
