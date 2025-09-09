export const metadata = {
  title: 'הצעות מחיר - אל יזמות ופיתוח',
  description: 'מערכת הצעות מחיר',
};
export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
