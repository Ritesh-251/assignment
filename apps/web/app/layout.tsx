import './globals.css';
import { ClientLayout } from '../components/ClientLayout';

export const metadata = {
  title: 'Bento Web App',
  description: 'Unified Architecture Demo',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
