import './globals.css';

export const metadata = { title: 'Tableau de bord du MJ' };

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}