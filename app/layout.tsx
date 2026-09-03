import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from './components/ui/sonner'

export const metadata: Metadata = {
  title: 'Patna Piano Academy - Premium Piano Lessons in Patna',
  description: 'Master the piano with personalized lessons from professional teachers. Online and offline classes available for beginners, kids, and advanced learners in Patna, Bihar.',
  keywords: 'Piano Classes in Patna, Piano Teacher in Patna, Piano Classes Patna, Best Piano Teacher in Patna, Learn Piano in Patna, Online Piano Classes, Offline Piano Classes in Patna',
  openGraph: {
    title: 'Patna Piano Academy - Premium Piano Lessons',
    description: 'Master the piano with personalized lessons from professional teachers. Online and offline classes available.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}