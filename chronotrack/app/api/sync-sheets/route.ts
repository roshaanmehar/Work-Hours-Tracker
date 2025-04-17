import { NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function POST(request: Request) {
  try {
    const { spreadsheetId, data } = await request.json()
    
    // Get credentials from environment variables
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}')
    
    // Create a JWT client
    const auth = new google.auth.JWT(
      credentials.client_email,
      undefined,
      credentials.private_key,
      ['https://www.googleapis.com/auth/spreadsheets']
    )
    
    // Create Google Sheets client
    const sheets = google.sheets({ version: 'v4', auth })
    
    // Format data for Google Sheets
    const values = data.map((entry: any) => [
      entry.date,
      entry.startTime,
      entry.endTime,
      entry.duration,
      entry.notes
    ])
    
    // Add headers if this is the first sync
    const headerRow = ['Date', 'Start Time', 'End Time', 'Duration', 'Notes']
    
    // Check if the sheet exists and has data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A1:E1',
    })
    
    if (!response.data.values || response.data.values.length === 0) {
      // Sheet is empty, add headers
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Sheet1!A1:E1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [headerRow]
        }
      })
    }
    
    // Clear existing data (except headers)
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'Sheet1!A2:E1000',
    })
    
    // Add new data
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Sheet1!A2',
      valueInputOption: 'RAW',
      requestBody: {
        values
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Data synced successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error syncing with Google Sheets:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to sync with Google Sheets' },
      { status: 500 }
    )
  }
}
