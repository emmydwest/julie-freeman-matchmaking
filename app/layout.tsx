import type { Metadata, Viewport } from 'next'
import './globals.css'
import './compact.css'

export const metadata: Metadata = {
  title: 'Julie Ferman | Personal Matchmaking for Men',
  description: 'A personal alternative to dating apps for relationship-minded men, with thoughtful introductions from experienced matchmaker Julie Ferman.',
  metadataBase: new URL('https://julieferman.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: 'Julie Ferman Matchmaking',
    title: 'Julie Ferman | Personal Matchmaking for Men',
    description: 'Thoughtful introductions and personal matchmaking from Julie Ferman.',
    url: '/',
    images: [
      {
        url: '/julie-hero-landscape.jpg',
        width: 1280,
        height: 720,
        alt: 'Julie Ferman, personal matchmaker and dating coach',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Julie Ferman | Personal Matchmaking for Men',
    description: 'Thoughtful introductions and personal matchmaking from Julie Ferman.',
    images: ['/julie-hero-landscape.jpg'],
  },
  icons: {
    icon: '/icon.svg',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#fff3f6',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
