import { createFileRoute } from '@tanstack/react-router'
import { BarChart3, Copy, Link2, Trash } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { RawLink } from '@/lib/api/links'
import { useLinkDeletion, useUserLinks } from '@/lib/api/links'
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

export const Route = createFileRoute('/dashboard/links')({
  component: RouteComponent,
})

function LinksSkeleton() {
  return (
    <div className="grid gap-4">
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="grid grid-cols-12 gap-4 border-b border-border px-6 py-3 text-sm font-medium text-muted-foreground">
          <div className="col-span-3">Short URL</div>
          <div className="col-span-5">Original URL</div>
          <div className="col-span-2 text-center">Clicks</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-12 gap-4 items-center border-b border-border px-6 py-4 last:border-b-0"
          >
            <div className="col-span-3">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-muted animate-pulse" />
                <div className="h-4 w-24 rounded bg-muted animate-pulse" />
              </div>
            </div>

            <div className="col-span-5">
              <div className="h-4 w-full max-w-xs rounded bg-muted animate-pulse" />
            </div>

            <div className="col-span-2 flex justify-center">
              <div className="h-7 w-16 rounded-full bg-muted animate-pulse" />
            </div>

            <div className="col-span-2 flex justify-end gap-2">
              <div className="h-9 w-9 rounded-md bg-muted animate-pulse" />
              <div className="h-9 w-9 rounded-md bg-muted animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-4">
        <div className="h-4 w-24 rounded bg-muted animate-pulse" />
      </div>
    </div>
  )
}
function RouteComponent() {
  const { data, isLoading, isError } = useUserLinks()
  const { mutateAsync } = useLinkDeletion()
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const copyToClipboard = async (shortCode: string, id: number) => {
    const url = `${window.location.origin}/${shortCode}`
    await navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-destructive text-lg font-medium">
          Failed to load links
        </div>
        <p className="text-muted-foreground mt-2">Please try again later.</p>
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Your Links</h1>
        <p className="text-muted-foreground mt-2">
          Manage and track all your shortened URLs
        </p>
      </div>

      {isLoading && <LinksSkeleton />}

      {!isLoading &&
        (links.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card py-16">
            <Link2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground">
              No links yet
            </h3>
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
                      href={link.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground truncate block text-sm"
                      title={link.originalUrl}
                    >
                      {link.originalUrl}
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
                    <Button
                      variant={'outline'}
                      onClick={() => copyToClipboard(link.shortCode, link.id)}
                      title="Copy link"
                    >
                      <Copy className="h-4 w-4" />
                      {copiedId === link.id && (
                        <span className="absolute -mt-8 rounded bg-foreground px-2 py-1 text-xs text-background">
                          Copied!
                        </span>
                      )}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant={'destructive'}>
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
              ))}
            </div>
          </div>
        ))}
    </div>
  )
}
