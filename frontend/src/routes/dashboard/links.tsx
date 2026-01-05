import { linkAPI, RawLink } from '@/lib/api/links'
import { authClient } from '@/lib/auth-client'
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { Link2, ExternalLink, Copy, BarChart3 } from 'lucide-react'
import { useState } from 'react'

const serverFn = createServerFn({ method: 'GET' }).handler(async () => {
  const headers = await getRequestHeaders()
  return headers
})

export const Route = createFileRoute('/dashboard/links')({
  component: RouteComponent,
  loader: async () => {
    const headers = await serverFn()
    const session = authClient.getSession({ fetchOptions: { headers } })

    const { data, request } = await linkAPI.getAllLinks(
      (await session).data?.user.id as string,
    )

    return {
      ok: request.ok,
      data,
    }
  },
})

function RouteComponent() {
  const { ok, data } = Route.useLoaderData()
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const copyToClipboard = async (shortCode: string, id: number) => {
    const url = `${window.location.origin}/${shortCode}`
    await navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (!ok || 'error' in data) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-destructive text-lg font-medium">
          Failed to load links
        </div>
        <p className="text-muted-foreground mt-2">Please try again later.</p>
      </div>
    )
  }

  const links = data.data as RawLink[]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Your Links</h1>
        <p className="text-muted-foreground mt-2">
          Manage and track all your shortened URLs
        </p>
      </div>

      {links.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card py-16">
          <Link2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground">No links yet</h3>
          <p className="text-muted-foreground mt-1">
            Create your first shortened link to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          <div className="rounded-lg border border-border bg-card shadow-sm">
            <div className="grid grid-cols-12 gap-4 border-b border-border px-6 py-3 text-sm font-medium text-muted-foreground">
              <div className="col-span-3">Short URL</div>
              <div className="col-span-5">Original URL</div>
              <div className="col-span-2 text-center">Clicks</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {links.map((link) => (
              <div
                key={link.id}
                className="grid grid-cols-12 gap-4 items-center border-b border-border px-6 py-4 last:border-b-0 hover:bg-muted/50 transition-colors"
              >
                <div className="col-span-3">
                  <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-medium text-foreground truncate">
                      /{link.shortCode}
                    </span>
                  </div>
                </div>

                <div className="col-span-5">
                  <a
                    href={link.orginalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground truncate block text-sm"
                    title={link.orginalUrl}
                  >
                    {link.orginalUrl}
                  </a>
                </div>

                <div className="col-span-2 text-center">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1">
                    <BarChart3 className="h-3.5 w-3.5 text-secondary-foreground" />
                    <span className="text-sm font-medium text-secondary-foreground">
                      {link.clickCount}
                    </span>
                  </div>
                </div>

                <div className="col-span-2 flex justify-end gap-2">
                  <button
                    onClick={() => copyToClipboard(link.shortCode, link.id)}
                    className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors"
                    title="Copy link"
                  >
                    <Copy className="h-4 w-4" />
                    {copiedId === link.id && (
                      <span className="absolute -mt-8 rounded bg-foreground px-2 py-1 text-xs text-background">
                        Copied!
                      </span>
                    )}
                  </button>
                  <a
                    href={link.orginalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors"
                    title="Open original"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="text-sm text-muted-foreground text-center mt-4">
            Total: {links.length} link{links.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  )
}
