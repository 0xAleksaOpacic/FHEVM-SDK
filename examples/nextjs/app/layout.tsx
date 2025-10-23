import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'FHEVM SDK - Next.js Example',
  description: 'Build confidential applications with Fully Homomorphic Encryption',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

