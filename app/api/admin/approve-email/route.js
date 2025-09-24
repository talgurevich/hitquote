import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'
import { approveEmail } from '../../../../lib/emailApproval'
import emailjs from '@emailjs/browser'

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin
    if (!session?.user?.email || session.user.email !== 'tal.gurevich@gmail.com') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { email } = await req.json()

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Approve email in database
    await approveEmail(email, session.user.email)

    // Send approval notification email
    try {
      await emailjs.send(
        'service_lp16xmn',
        'template_n9zej2e',
        {
          from_name: 'Hit Quote',
          from_email: 'tal.gurevich2@gmail.com',
          message: `שלום,

הגישה שלך למערכת Hit Quote אושרה בהצלחה!

כעת תוכל להתחבר למערכת ולהתחיל ליצור הצעות מחיר מקצועיות.

לכניסה למערכת: https://hitquote-3af50317cd73.herokuapp.com

בברכה,
צוות Hit Quote`,
          to_email: email
        },
        '_-y5PKj_iUMKpv97G'
      )
    } catch (emailError) {
      console.error('Error sending approval email:', emailError)
      // Don't fail the approval if email fails
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Email approved successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in approve-email:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}