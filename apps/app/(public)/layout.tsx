import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { Header } from '@/components/public/Header'
import { Footer } from '@/components/public/Footer'
import { PublicLayoutTransition } from '@/components/public-layout-transition'

export default async function PublicLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params
  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="relative flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <PublicLayoutTransition>{children}</PublicLayoutTransition>
        </main>
        <Footer />
      </div>
    </NextIntlClientProvider>
  )
}
