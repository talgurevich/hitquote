'use client';

export default function PrivacyPage() {
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
            מדיניות פרטיות
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
              1. מבוא
            </h2>
            <p style={{ marginBottom: '15px' }}>
              אנו ב-Hit Quote מחויבים להגנה על פרטיותכם ולשמירה על בטחון המידע האישי שלכם. 
              מדיניות פרטיות זו מסבירה כיצד אנו אוספים, משתמשים ומגינים על המידע שלכם 
              במסגרת השימוש במערכת ניהול הצעות המחיר שלנו.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#62929e', marginBottom: '15px' }}>
              2. איסוף מידע
            </h2>
            <p style={{ marginBottom: '15px' }}>
              אנו אוספים סוגי מידע הבאים:
            </p>
            <ul style={{ paddingRight: '20px', marginBottom: '15px' }}>
              <li><strong>מידע זיהוי אישי:</strong> שם, כתובת דואר אלקטרוני, פרטי החברה</li>
              <li><strong>מידע עסקי:</strong> פרטי הצעות מחיר, קטלוג מוצרים, פרטי לקוחות</li>
              <li><strong>מידע טכני:</strong> כתובת IP, סוג דפדפן, זמני גישה למערכת</li>
              <li><strong>אימות:</strong> פרטים מחשבון Google לצורכי כניסה מאובטחת</li>
            </ul>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#62929e', marginBottom: '15px' }}>
              3. שימוש במידע
            </h2>
            <p style={{ marginBottom: '15px' }}>
              אנו משתמשים במידע שלכם למטרות הבאות:
            </p>
            <ul style={{ paddingRight: '20px', marginBottom: '15px' }}>
              <li>מתן שירותי המערכת - יצירת הצעות מחיר וניהול קטלוג</li>
              <li>שיפור ופיתוח השירות</li>
              <li>אבטחה ומניעת שימוש בלתי מורשה</li>
              <li>יצירת קשר בנושאים טכניים או עסקיים</li>
              <li>עמידה בדרישות חוקיות</li>
            </ul>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#62929e', marginBottom: '15px' }}>
              4. שיתוף מידע עם צדדים שלישיים
            </h2>
            <p style={{ marginBottom: '15px' }}>
              אנו לא מוכרים או מעבירים את המידע האישי שלכם לצדדים שלישיים למטרות מסחריות. 
              עם זאת, אנו עשויים לשתף מידע במקרים הבאים:
            </p>
            <ul style={{ paddingRight: '20px', marginBottom: '15px' }}>
              <li>עם ספקי שירות טכניים להפעלת המערכת (Google Cloud, Heroku)</li>
              <li>כאשר נדרש על פי חוק או צו בית משפט</li>
              <li>להגנה על זכויותינו או בטחון המשתמשים</li>
              <li>בהסכמתכם המפורשת</li>
            </ul>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#62929e', marginBottom: '15px' }}>
              5. אבטחת מידע
            </h2>
            <p style={{ marginBottom: '15px' }}>
              אנו נוקטים באמצעי אבטחה מתקדמים להגנה על המידע שלכם:
            </p>
            <ul style={{ paddingRight: '20px', marginBottom: '15px' }}>
              <li>הצפנת מידע בהעברה ובאחסון</li>
              <li>אימות דו-שלבי באמצעות Google OAuth</li>
              <li>מעקב ובקרה על גישה למערכת</li>
              <li>גיבוי קבוע של נתונים</li>
              <li>עדכונים אבטחה שוטפים</li>
            </ul>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#62929e', marginBottom: '15px' }}>
              6. זכויותיכם
            </h2>
            <p style={{ marginBottom: '15px' }}>
              יש לכם הזכויות הבאות לגבי המידע האישי שלכם:
            </p>
            <ul style={{ paddingRight: '20px', marginBottom: '15px' }}>
              <li>זכות עיון - צפייה במידע האישי הנשמר עליכם</li>
              <li>זכות תיקון - עדכון מידע שגוי או לא מדויק</li>
              <li>זכות מחיקה - מחיקת חשבונכם והמידע הקשור אליו</li>
              <li>זכות הגבלה - הגבלת עיבוד מידע בנסיבות מסוימות</li>
              <li>זכות ניידות - קבלת העתק מהמידע שלכם</li>
            </ul>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#62929e', marginBottom: '15px' }}>
              7. שמירה על מידע
            </h2>
            <p style={{ marginBottom: '15px' }}>
              אנו שומרים את המידע האישי שלכם כל עוד חשבונכם פעיל או לפי הצורך למתן השירות. 
              לאחר מחיקת החשבון, המידע יימחק תוך 30 יום, למעט מידע הנדרש לשמירה על פי חוק.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#62929e', marginBottom: '15px' }}>
              8. קובצי Cookie
            </h2>
            <p style={{ marginBottom: '15px' }}>
              אנו משתמשים בקובצי Cookie לשיפור חווית השימוש ולתפעול תקין של המערכת. 
              ניתן לחסום קובצי Cookie בדפדפן, אך זה עלול להשפיע על תפעול המערכת.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#62929e', marginBottom: '15px' }}>
              9. עדכונים למדיניות
            </h2>
            <p style={{ marginBottom: '15px' }}>
              אנו עשויים לעדכן מדיניות פרטיות זו מעת לעת. עדכונים יפורסמו באתר עם ציון 
              תאריך העדכון. המשך השימוש בשירות לאחר עדכון מהווה הסכמה למדיניות המעודכנת.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#62929e', marginBottom: '15px' }}>
              10. צור קשר
            </h2>
            <p style={{ marginBottom: '15px' }}>
              לשאלות או בקשות בנוגע למדיניות הפרטיות, ניתן לפנות אלינו:
            </p>
            <ul style={{ paddingRight: '20px', marginBottom: '15px' }}>
              <li>כתובת: ברכה צפירה, עכו</li>
              <li>LinkedIn: <a href="https://www.linkedin.com/in/talgurevich/" target="_blank" rel="noopener noreferrer" style={{ color: '#62929e', textDecoration: 'none' }}>Tal Gurevich</a></li>
            </ul>
            <p style={{ marginBottom: '15px' }}>
              אנו מתחייבים לענות לפניותיכם תוך 14 יום עסקים.
            </p>
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