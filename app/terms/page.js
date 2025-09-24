'use client';

export default function TermsPage() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fdfdff 0%, rgba(98, 146, 158, 0.1) 100%)',
      padding: '40px 20px',
      direction: 'rtl'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 10px 30px rgba(98, 146, 158, 0.1)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#393d3f',
            marginBottom: '10px'
          }}>
            תנאי שימוש
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#62929e',
            margin: 0
          }}>
            Hit Quote - מערכת ניהול הצעות מחיר
          </p>
          <p style={{
            fontSize: '14px',
            color: '#666',
            margin: '10px 0 0 0'
          }}>
            עדכון אחרון: דצמבר 2024
          </p>
        </div>

        {/* Content */}
        <div style={{ fontSize: '16px', lineHeight: '1.8', color: '#393d3f' }}>
          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#62929e', marginBottom: '15px' }}>
              1. הסכמה לתנאים
            </h2>
            <p style={{ marginBottom: '15px' }}>
              על ידי גישה ושימוש במערכת Hit Quote ("השירות"), אתם מסכימים להיות כבולים בתנאי השימוש הללו. 
              אם אינכם מסכימים לכל התנאים, אנא הימנעו מהשימוש בשירות.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#62929e', marginBottom: '15px' }}>
              2. תיאור השירות
            </h2>
            <p style={{ marginBottom: '15px' }}>
              Hit Quote הוא שירות אינטרנט המיועד לעסקים קטנים ובינוניים ליצירת וניהול הצעות מחיר, 
              ניהול קטלוג מוצרים וחתימה דיגיטלית על מסמכים. השירות מאפשר:
            </p>
            <ul style={{ paddingRight: '20px', marginBottom: '15px' }}>
              <li>יצירת הצעות מחיר מקצועיות</li>
              <li>ניהול קטלוג מוצרים אישי</li>
              <li>חתימה דיגיטלית מאובטחת</li>
              <li>ניהול פרטי לקוחות</li>
              <li>ייצוא קבצי PDF</li>
            </ul>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#62929e', marginBottom: '15px' }}>
              3. זכויות וחובות המשתמש
            </h2>
            <p style={{ marginBottom: '15px' }}>
              כמשתמש בשירות, אתם מתחייבים:
            </p>
            <ul style={{ paddingRight: '20px', marginBottom: '15px' }}>
              <li>לספק מידע אמין ומעודכן</li>
              <li>לא להשתמש בשירות למטרות בלתי חוקיות</li>
              <li>לשמור על סודיות פרטי הגישה שלכם</li>
              <li>לכבד זכויות קניין רוחני</li>
              <li>לא לפגוע בתפעול השירות</li>
            </ul>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#62929e', marginBottom: '15px' }}>
              4. פרטיות ואבטחת מידע
            </h2>
            <p style={{ marginBottom: '15px' }}>
              אנו מחויבים להגנה על פרטיותכם ולאבטחת המידע שלכם. השימוש במידע האישי שלכם מבוצע 
              בהתאם למדיניות הפרטיות שלנו. המידע שלכם מוצפן ומוגן בסטנדרטים הגבוהים ביותר.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#62929e', marginBottom: '15px' }}>
              5. מגבלות אחריות
            </h2>
            <p style={{ marginBottom: '15px' }}>
              השירות מסופק "כמות שהוא" ללא אחריות מפורשת או משתמעת. אנו לא נישא באחריות לנזקים 
              ישירים או עקיפים הנובעים מהשימוש בשירות. עם זאת, אנו עושים מאמצים להבטיח 
              זמינות ואמינות השירות.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#62929e', marginBottom: '15px' }}>
              6. שינוי תנאים
            </h2>
            <p style={{ marginBottom: '15px' }}>
              אנו שומרים לעצמנו את הזכות לשנות תנאי שימוש אלה בכל עת. שינויים יפורסמו באתר 
              ויכנסו לתוקף מיידית. המשך השימוש בשירות מהווה הסכמה לתנאים המעודכנים.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#62929e', marginBottom: '15px' }}>
              7. דין חל ויישוב סכסוכים
            </h2>
            <p style={{ marginBottom: '15px' }}>
              תנאי השימוש כפופים לדיני מדינת ישראל. כל מחלוקת תיושב בבתי המשפט המוסמכים בישראל.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#62929e', marginBottom: '15px' }}>
              8. צור קשר
            </h2>
            <p style={{ marginBottom: '15px' }}>
              לשאלות או הבהרות בנוגע לתנאי השימוש, ניתן לפנות אלינו דרך:
            </p>
            <ul style={{ paddingRight: '20px', marginBottom: '15px' }}>
              <li>כתובת: ברכה צפירה, עכו</li>
              <li>LinkedIn: <a href="https://www.linkedin.com/in/talgurevich/" target="_blank" rel="noopener noreferrer" style={{ color: '#62929e', textDecoration: 'none' }}>Tal Gurevich</a></li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid #e0e0e0',
          paddingTop: '20px',
          textAlign: 'center',
          marginTop: '40px'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#666',
            margin: 0
          }}>
            © 2024 Hit Quote. כל הזכויות שמורות.
          </p>
          <div style={{ marginTop: '15px' }}>
            <a 
              href="/"
              style={{
                color: '#62929e',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              ← חזרה לעמוד הבית
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}