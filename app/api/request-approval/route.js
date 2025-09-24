import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'
import { createPendingRequest } from '../../../lib/emailApproval'

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { email } = await req.json()

    // Validate that the email matches the session user's email
    if (email !== session.user.email) {
      return new Response(JSON.stringify({ error: 'Email mismatch' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Create pending request in database
    await createPendingRequest(email)

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Approval request created successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in request-approval:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}