import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from './session-provider'
import { getCurrentSession } from '@/actions/auth/getCurrentSession'
import { AbilityProvider } from './ability-provider'
import { AuthenticationGuard } from '@/components/authz/AuthenticationGuard'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Signuis',
  description: 'Plateforme de signalement de nuisances',
}

export default async function RootLayout({children}: {children: React.ReactNode}) {
  const session = await getCurrentSession();
  return (
    <html lang="fr">
      <body className={inter.className}>
        <AuthenticationGuard>
        <SessionProvider session={session}>
          <AbilityProvider>
            {children}
          </AbilityProvider>
        </SessionProvider>
        </AuthenticationGuard>
      </body>
    </html>
  )
}
