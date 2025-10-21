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
        {/* Note: Telegraf is a commercial font. For production, either:
            1. License and self-host the font
            2. Use a similar alternative (e.g., Inter, Space Grotesk)
            3. The CSS already includes fallbacks */}
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

