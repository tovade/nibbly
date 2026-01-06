import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Link2, Zap, BarChart3, Shield, Globe, ArrowRight } from 'lucide-react'
import Header from '@/components/Header'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const [url, setUrl] = useState('')
  const navigate = useNavigate()
  const features = [
    {
      icon: <Zap className="w-10 h-10 text-primary" />,
      title: 'Lightning Fast',
      description:
        'Create short links in milliseconds. No delays, no waiting. Just instant, reliable redirects.',
    },
    {
      icon: <BarChart3 className="w-10 h-10 text-primary" />,
      title: (
        <p className="inline align-center">
          Detailed analytics{' '}
          <Badge className="inline h-5" variant={'outline'}>
            soon
          </Badge>
        </p>
      ),
      description:
        'Track clicks, geographic data, referrers, and devices. Understand your audience better.',
    },
    {
      icon: <Shield className="w-10 h-10 text-primary" />,
      title: 'Secure & Private',
      description:
        'Your links are protected with enterprise-grade security. We never sell your data.',
    },
    {
      icon: <Globe className="w-10 h-10 text-primary" />,
      title: 'Custom endpoints',
      description:
        'Want a branded link? Customize your short URLs to match your brand identity and boost recognition.',
    },
  ]

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
      <Header />
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-24 px-6 text-center overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-r from-primary/5 via-accent/5 to-primary/5"></div>
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>

          <div className="relative max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="bg-primary/20 rounded-xl">
                <img
                  src="/logo_rounded.svg"
                  alt="Nibbly Logo"
                  className="w-24 h-24"
                />
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tight font-sans">
                nibbly
              </h1>
            </div>
            <p className="text-2xl md:text-3xl text-muted-foreground mb-4 font-light">
              Short links,{' '}
              <span className="text-primary font-medium">big impact</span>
            </p>{' '}
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
              Transform long, unwieldy URLs into clean, memorable links. Track
              performance, customize your brand, and share with confidence.
            </p>
            {/* URL Shortener Form */}
            <form onSubmit={handleShorten} className="max-w-2xl mx-auto mb-8">
              <div className="flex flex-col sm:flex-row gap-3 p-2 bg-card rounded-xl border border-border shadow-lg">
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste your long URL here..."
                  required
                />
                <Button type="submit">
                  Shorten
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </form>
            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mt-16 text-center">
              <div>
                <p className="text-4xl font-bold text-foreground">10M+</p>
                <p className="text-muted-foreground">Links Created</p>
              </div>{' '}
              <div>
                <p className="text-4xl font-bold text-foreground">500M+</p>
                <p className="text-muted-foreground">Clicks Tracked</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-foreground">99.9%</p>
                <p className="text-muted-foreground">Uptime</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-4">
            Everything you need
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            Powerful features to help you manage, track, and optimize your links
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-card border border-border rounded-xl p-8 hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-lg"
              >
                <div className="mb-5 p-3 bg-primary/10 rounded-lg w-fit group-hover:bg-primary/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3 align-center">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center bg-linear-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl p-12 border border-border shadow-lg">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to get started?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of users who trust Nibbly for their link management
              needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth/register"
                className="px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors shadow-md"
              >
                Create Free Account
              </Link>
              <Link
                to="/links/create"
                className="px-8 py-4 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold rounded-lg transition-colors"
              >
                Create your first link
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 border-t border-border">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-primary" />
              <span className="text-foreground font-semibold">nibbly</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2026 Nibbly. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}
