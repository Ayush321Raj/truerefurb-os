import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'TrueRefurb OS | Enterprise Refurbished Electronics Operations Platform',
  description: 'Industrial-grade operating system for refurbished electronics intake, automated diagnostic suites, optical grading, and multi-channel inventory distribution.',
  keywords: ['refurbished electronics', 'device grading', 'repair management', 'reverse logistics', 'diagnostic testing', 'TrueRefurb OS'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <div className="ambient-glow" aria-hidden="true" />
        <div className="app-container">
          {children}
        </div>
      </body>
    </html>
  );
}
