// app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import AmbientBackground from '@/components/AmbientBackground';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata = {
  title: 'THINKCLEAR',
  description: 'Structured cognition for night thinkers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        {/* Subconscious layer */}
        <AmbientBackground />

        {/* Conscious layer */}
        <div className="app-foreground">
          {children}
        </div>

        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}
