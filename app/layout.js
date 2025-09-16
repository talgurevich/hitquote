import Providers from './providers';

export const metadata = {
  title: 'הצעות מחיר - תחנת לחם',
  description: 'מערכת הצעות מחיר מקצועית',
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
