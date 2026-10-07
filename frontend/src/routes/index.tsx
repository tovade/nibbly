import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowRight, BarChart3, Globe, Shield, Zap } from 'lucide-react'
import Header from '@/components/Header'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({ component: App })

const features = [
  {
    icon: Zap,
    title: 'Instant links',
    description:
      'Paste a URL and get a short link back right away. Redirects stay quick, too.',
  },
  {
    icon: BarChart3,
    title: 'Clear analytics',
    description:
      'See clicks, countries, referrers and devices for every link, without digging through reports.',
  },
  {
    icon: Shield,
    title: 'Private by default',
    description:
      'Visitor IP addresses are never stored, and we never sell your data.',
  },
  {
    icon: Globe,
    title: 'Custom bites',
    description:
      'Pick your own ending, like /summer-menu, so your links are easy to read, remember and trust.',
  },
]

function App() {
  const [url, setUrl] = useState('')
  const navigate = useNavigate()

  const handleShorten = (e: React.FormEvent) => {
    e.preventDefault()
    navigate({
      to: '/links/create',
      search: {
        link: url,
      },
    })
  }

  return (
    <>
      <div className="relative isolate overflow-x-clip bg-background">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[44rem] bg-[radial-gradient(60rem_34rem_at_88%_-8%,color-mix(in_oklch,var(--accent)_75%,transparent),transparent_70%)] dark:bg-[radial-gradient(60rem_34rem_at_88%_-8%,color-mix(in_oklch,var(--accent)_40%,transparent),transparent_70%)]"
        />
        <Header />
        <main className="min-h-screen">
          {/* Hero */}
          <section>
            <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-14 pb-20 md:px-6 md:pt-24 md:pb-28 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
              <div>
                <h1 className="text-5xl leading-[1.02] font-bold sm:text-6xl lg:text-7xl">
                  Small bites, big links.
                </h1>
                <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
                  Turn long, clumsy URLs into short links that are easy to
                  share, then see who clicks them.
                </p>

                <form onSubmit={handleShorten} className="mt-10 max-w-xl">
                  <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-2 shadow-md sm:flex-row">
                    <label htmlFor="hero-url" className="sr-only">
                      Long URL
                    </label>
                    <Input
                      id="hero-url"
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="Paste a long URL here"
                      className="h-12 border-none bg-transparent shadow-none focus-visible:ring-0"
                      required
                    />
                    <Button type="submit" size="lg">
                      Shorten
                      <ArrowRight />
                    </Button>
                  </div>
                </form>
              </div>

              {/* A long link, nibbled down */}
              <div className="bite relative rounded-2xl border border-border bg-card p-7 shadow-xl sm:p-9">
                <div className="space-y-1.5">
                  <p className="text-sm text-muted-foreground">Before</p>
                  <p className="font-mono text-sm break-all text-muted-foreground line-through decoration-primary/60 decoration-2">
                    https://www.example.com/blog/2026/summer/menu-launch?utm_source=newsletter&utm_medium=email&utm_campaign=june
                  </p>
                </div>

                <div className="nibble-in mt-8 space-y-2">
                  <p className="text-sm text-muted-foreground">After</p>
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-accent px-5 py-4">
                    <p className="font-mono text-xl font-medium text-accent-foreground sm:text-2xl">
                      /summer-menu
                    </p>
                    <span className="rounded-full bg-card/70 px-3 py-1 text-sm font-medium text-accent-foreground">
                      128 clicks
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
              <div className="lg:sticky lg:top-28 lg:self-start">
                <h2 className="text-3xl font-bold md:text-4xl">
                  Everything a short link needs
                </h2>
                <p className="mt-4 max-w-sm leading-relaxed text-muted-foreground">
                  Create, customize and track your links from one calm place.
                </p>
              </div>

              <ul className="divide-y divide-border border-y border-border">
                {features.map(({ icon: Icon, title, description }) => (
                  <li key={title} className="flex gap-5 py-7">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold">{title}</h3>
                      <p className="mt-1.5 max-w-md leading-relaxed text-muted-foreground">
                        {description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Call to action */}
          <section className="mx-auto max-w-6xl px-4 pb-20 md:px-6 md:pb-28">
            <div className="bite rounded-2xl bg-accent px-6 py-14 sm:px-12 md:py-16">
              <h2 className="max-w-md text-3xl font-bold text-accent-foreground md:text-4xl">
                Ready for your first bite?
              </h2>
              <p className="mt-3 max-w-md text-accent-foreground/80">
                Create a free account to keep all your links and their stats in
                one place.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild>
                  <Link to="/auth/register">Create free account</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/links/create">Make a link without one</Link>
                </Button>
              </div>
            </div>
          </section>

          <footer className="border-t border-border">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 md:flex-row md:px-6">
              <div className="flex items-center gap-2">
                <img src="/logo_rounded.svg" alt="" className="size-8" />
                <span className="font-display font-bold">Nibbly</span>
              </div>
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Nibbly. All rights reserved.
              </p>
            </div>
          </footer>
        </main>
      </div>
    </>
  )
}
