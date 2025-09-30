export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head><title>Customs Vision Pro</title></head>
      <body>{children}</body>
    </html>
  );
}
