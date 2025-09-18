import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { name, email, phone } = await request.json();
    
    // Basic validation
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'כל השדות נדרשים' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'כתובת אימייל לא תקינה' },
        { status: 400 }
      );
    }
    
    // Log the contact form submission
    console.log('=== פניה חדשה מטופס יצירת קשר ===');
    console.log(`שם: ${name}`);
    console.log(`אימייל: ${email}`);
    console.log(`טלפון: ${phone}`);
    console.log(`תאריך: ${new Date().toLocaleDateString('he-IL')} בשעה ${new Date().toLocaleTimeString('he-IL')}`);
    console.log('=====================================');
    
    // For now, just log to console until email credentials are set up
    // TODO: Set up EMAIL_USER and EMAIL_PASS environment variables for actual email sending
    
    return NextResponse.json({ 
      success: true, 
      message: 'ההודעה נשלחה בהצלחה' 
    });
    
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'שגיאה בשליחת ההודעה. אנא נסה שוב.' },
      { status: 500 }
    );
  }
}