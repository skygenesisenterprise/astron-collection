import { AuthForm } from '@/components/auth/auth-form'

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col px-6 py-8 sm:px-10">
      <header className="flex items-center gap-2.5">
        <span className="text-lg font-semibold tracking-tight">Kami-Sama</span>
      </header>

      <div className="flex flex-1 items-center justify-center py-10">
        <AuthForm />
      </div>

      <footer className="text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Kami-Sama. All rights reserved.
      </footer>
    </main>
  )
}
