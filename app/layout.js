import Providers from './providers';

export const metadata = {
  title: 'Hit Quote',
  description: 'Professional Quote Management System',
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
