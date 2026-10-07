import { Link } from '@tanstack/react-router'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { authClient } from '@/lib/auth-client'

export default function Header() {
  const { theme, setTheme } = useTheme()
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const { data } = authClient.useSession()

  const logOut = async () => {
    await authClient.signOut()
    window.location.reload()
  }

  const themeToggle = (
    <Button
      onClick={toggleTheme}
      variant="ghost"
      size="icon"
      className="text-muted-foreground"
      aria-label={
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      }
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </Button>
  )

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <img src="/logo_rounded.svg" alt="" className="size-10" />
            <span className="font-display text-xl font-bold tracking-tight">
              Nibbly
            </span>
          </Link>
          {data?.user && (
            <nav className="hidden items-center gap-1 sm:flex">
              <Link
                to="/dashboard/links"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                activeProps={{ className: 'bg-secondary text-foreground' }}
              >
                Your links
              </Link>
              <Link
                to="/links/create"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                activeProps={{ className: 'bg-secondary text-foreground' }}
              >
                New link
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {themeToggle}
          {data?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1 outline-none transition-colors hover:bg-secondary focus-visible:ring-[3px] focus-visible:ring-ring/50">
                <span className="flex size-8 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                  {data.user.name.charAt(0).toUpperCase()}
                </span>
                {data.user.name && (
                  <span className="hidden text-sm font-medium sm:block">
                    {data.user.name}
                  </span>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-48">
                <Link to="/dashboard">
                  <DropdownMenuItem className="cursor-pointer">
                    View dashboard
                  </DropdownMenuItem>
                </Link>
                <Link to="/dashboard/links">
                  <DropdownMenuItem className="cursor-pointer">
                    Manage links
                  </DropdownMenuItem>
                </Link>
                <Link to="/links/create">
                  <DropdownMenuItem className="cursor-pointer">
                    Create link
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logOut}
                  className="cursor-pointer text-destructive"
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/auth/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link to="/auth/register">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
