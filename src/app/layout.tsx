import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { FirebaseClientProvider } from '@/firebase';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { Landmark } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Patrimonio',
  description: 'Sistema de gestão de estoque e patrimônio.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2334A7A7' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M22 18.5V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1.5'/><path d='m22 12-10-9-10 9'/><path d='M8 22v-8h8v8'/><path d='M10 9.5V4h4v5.5'/></svg>" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('font-body antialiased')}>
        <FirebaseClientProvider>
          {children}
          <FirebaseErrorListener />
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
