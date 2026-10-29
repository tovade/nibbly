import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { Check, CircleCheck, CircleQuestionMark, Copy, X } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { getShortUrl, useLinkCreation } from '@/lib/api/links'
import { authClient } from '@/lib/auth-client'
import { LoadingSwap } from '@/components/ui/loading-swap'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export const Route = createFileRoute('/links/create')({
  component: RouteComponent,
  validateSearch: z.object({
    link: z.string().optional(),
  }),
})

const linkSchema = z.object({
  slug: z.string().optional(),
  link: z.url('Please enter a valid url'),
})
function RouteComponent() {
  const { data } = authClient.useSession()
  const { link } = Route.useSearch()
  const { mutateAsync, isPending } = useLinkCreation()
  const [shortUrl, setShortUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const { handleSubmit, control, setValue } = useForm<
    z.infer<typeof linkSchema>
  >({
    resolver: zodResolver(linkSchema),
  })

  useEffect(() => {
    if (link) {
      setValue('link', link)
    }
  }, [link, setValue])

  const onSubmit = async (dataForm: z.infer<typeof linkSchema>) => {
    try {
      const resp = await mutateAsync(dataForm)

      setShortUrl(getShortUrl(resp.data?.shortCode as string))
      setCopied(false)
      toast.success(`Created a bite with the code: ${resp.data?.shortCode}`)
    } catch (err: any) {
      return toast.error(err)
    }
  }

  const copy = async () => {
    if (!shortUrl) return
    await navigator.clipboard.writeText(shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center gap-4 bg-background px-4 py-10">
      {shortUrl && (
        <Alert className="w-full max-w-md shadow-lg animate-in fade-in-0 slide-in-from-top-2">
          <CircleCheck />
          <AlertTitle>Your short link is ready</AlertTitle>
          <AlertDescription className="w-full">
            <div className="flex w-full items-center gap-2">
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 flex-1 truncate font-mono text-foreground hover:underline"
                title={shortUrl}
              >
                {shortUrl}
              </a>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={copy}
                aria-label={copied ? 'Copied' : 'Copy short link'}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setShortUrl(null)}
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle>
            <h1 className="text-3xl font-bold">Create a short link</h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FieldGroup>
              <FieldGroup>
                <Controller
                  name="link"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="form-link">Link</FieldLabel>
                      <Input
                        {...field}
                        type="url"
                        id="form-link"
                        placeholder="https://example.com"
                        required
                      />{' '}
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                {data?.user && (
                  <Controller
                    name="slug"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="form-slug">
                          <Tooltip>
                            Bite{' '}
                            <TooltipTrigger asChild>
                              <CircleQuestionMark size={16} />
                            </TooltipTrigger>
                            <TooltipContent>
                              A bite (aka slug) refers to the part of the url
                              eg: /my_account
                            </TooltipContent>
                          </Tooltip>
                        </FieldLabel>
                        <Input {...field} id="form-slug" placeholder="google" />{' '}
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                )}
              </FieldGroup>
            </FieldGroup>

            <Button type="submit" className="w-full" variant={'default'}>
              <LoadingSwap isLoading={isPending}>Create link</LoadingSwap>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
