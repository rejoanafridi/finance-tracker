import { MainNav } from "@/components/layout/main-nav"
import { MobileNav } from "@/components/layout/mobile-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/layout/user-nav"

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container m-auto flex h-16 items-center justify-between py-4">
        <MainNav />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserNav />
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
