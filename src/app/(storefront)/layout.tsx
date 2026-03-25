import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { getSiteSettings } from '@/lib/payload-helpers'

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getSiteSettings()
  const logoUrl =
    settings.logo && typeof settings.logo === 'object' ? settings.logo.url : null

  return (
    <div className="flex min-h-screen flex-col">
      <Header storeName={settings.storeName} logoUrl={logoUrl} />
      <main className="flex-1">{children}</main>
      <Footer storeName={settings.storeName} whatsappNumber={settings.whatsappNumber} />
    </div>
  )
}
