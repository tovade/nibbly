import { Link, createFileRoute } from '@tanstack/react-router'
import {
  BarChart3,
  Check,
  Copy,
  Link2,
  MousePointerClick,
  Plus,
  Trash,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { RawLink } from '@/lib/api/links'
import { getShortUrl, useLinkDeletion, useUserLinks } from '@/lib/api/links'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export const Route = createFileRoute('/dashboard/links/')({
  component: RouteComponent,
})

function LinksSkeleton() {
  return (
    <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-between gap-4 px-5 py-4"
        >
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="h-3 w-full max-w-sm animate-pulse rounded bg-muted" />
          </div>
          <div className="h-8 w-20 animate-pulse rounded-full bg-muted" />
        </div>
      ))}
    </div>
  )
}
function RouteComponent() {
  const { data, isLoading, isError } = useUserLinks()
  const { mutateAsync } = useLinkDeletion()
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const copyToClipboard = async (shortCode: string, id: number) => {
    await navigator.clipboard.writeText(getShortUrl(shortCode))
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-semibold text-destructive">
          Failed to load links
        </h2>
        <p className="mt-2 text-muted-foreground">Please try again later.</p>
      </div>
    )
  }

  const deleteLink = async (slug: string) => {
    try {
      await mutateAsync({ slug })

      toast.success('Successfully deleted url!')
    } catch (err: any) {
      return toast.error(err)
    }
  }

  const links = data?.data as Array<RawLink>

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">Your links</h1>
          <p className="mt-2 text-muted-foreground">
            Manage and track all your shortened URLs.
          </p>
        </div>
        <Button asChild>
          <Link to="/links/create">
            <Plus /> New link
          </Link>
        </Button>
      </div>

      {isLoading && <LinksSkeleton />}

      {!isLoading &&
        (links.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-input bg-card px-6 py-16 text-center">
            <span className="mb-4 flex size-14 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <Link2 className="size-6" />
            </span>
            <h2 className="text-xl font-semibold">No links yet</h2>
            <p className="mt-1 max-w-xs text-muted-foreground">
              Create your first short link and its clicks will show up here.
            </p>
            <Button asChild className="mt-6">
              <Link to="/links/create">Create a link</Link>
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            {links.map((link) => (
              <li
                key={link.id}
                className="flex flex-col gap-4 px-5 py-4 transition-colors hover:bg-muted/60 sm:flex-row sm:items-center sm:gap-6"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link2 className="size-4 shrink-0 text-primary" />
                    <span className="truncate font-mono font-medium">
                      /{link.shortCode}
                    </span>
                  </div>
                  <a
                    href={link.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block truncate text-sm text-muted-foreground hover:text-foreground"
                    title={link.originalUrl}
                  >
                    {link.originalUrl}
                  </a>
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground"
                    title="Total clicks"
                  >
                    <MousePointerClick className="size-3.5" />
                    <span className="tabular-nums">{link.totalClicks}</span>
                  </span>

                  <div className="flex gap-1.5">
                    <Button
                      variant="outline"
                      size="icon"
                      asChild
                      title="View analytics"
                    >
                      <Link
                        to="/dashboard/links/$slug"
                        params={{ slug: link.shortCode }}
                        aria-label="View analytics"
                      >
                        <BarChart3 />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(link.shortCode, link.id)}
                      title="Copy link"
                      aria-label={
                        copiedId === link.id ? 'Link copied' : 'Copy link'
                      }
                    >
                      {copiedId === link.id ? (
                        <Check className="text-primary" />
                      ) : (
                        <Copy />
                      )}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="icon"
                          title="Delete link"
                          aria-label="Delete link"
                        >
                          <Trash />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete this short link.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteLink(link.shortCode)}
                          >
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ))}
    </div>
  )
}
