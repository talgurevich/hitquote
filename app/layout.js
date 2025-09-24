import Providers from './providers';

export const metadata = {
  title: 'הצעות מחיר | Hit Quote - מערכת ניהול הצעות מחיר מקצועית',
  description: 'מערכת מתקדמת לניהול הצעות מחיר, יצירת הצעות מחיר אונליין, ניהול קטלוג מוצרים וחתימה דיגיטלית. פתרון מקצועי לעסקים קטנים ובינוניים בישראל.',
  keywords: 'הצעות מחיר, הצעת מחיר, יצירת הצעות מחיר, מערכת הצעות מחיר, הצעת מחיר אונליין, ניהול הצעות מחיר, הצעת מחיר דיגיטלית, חתימה דיגיטלית, קטלוג מוצרים, מערכת CRM',
  authors: [{ name: 'Hit Quote' }],
  creator: 'Hit Quote',
  publisher: 'Hit Quote',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'הצעות מחיר | Hit Quote - מערכת ניהול הצעות מחיר מקצועית',
    description: 'מערכת מתקדמת לניהול הצעות מחיר, יצירת הצעות מחיר אונליין, ניהול קטלוג מוצרים וחתימה דיגיטלית. פתרון מקצועי לעסקים בישראל.',
    url: 'https://hitquote-3af50317cd73.herokuapp.com',
    siteName: 'Hit Quote',
    locale: 'he_IL',
    type: 'website',
    images: [
      {
        url: 'https://hitquote-3af50317cd73.herokuapp.com/logo2.png',
        width: 1200,
        height: 630,
        alt: 'Hit Quote - מערכת הצעות מחיר',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'הצעות מחיר | Hit Quote - מערכת ניהול הצעות מחיר מקצועית',
    description: 'מערכת מתקדמת לניהול הצעות מחיר, יצירת הצעות מחיר אונליין, ניהול קטלוג מוצרים וחתימה דיגיטלית.',
    images: ['https://hitquote-3af50317cd73.herokuapp.com/logo2.png'],
  },
  alternates: {
    canonical: 'https://hitquote-3af50317cd73.herokuapp.com',
  },
  other: {
    'google-site-verification': 'your-google-verification-code-here', // You'll need to add this from Google Search Console
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body style={{ margin: 0 }}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
