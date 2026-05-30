import { Inter } from 'next/font/google'
import './globals.css'


const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata = {
  title: 'Android Forwarder Web',
  description: 'Manage and sync notifications from Android'
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-[#f0f2f5]">
        {children}
      </body>
    </html>
  )
}
