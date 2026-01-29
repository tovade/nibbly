import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { CircleQuestionMark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useLinkCreation } from '@/lib/api/links'
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

      toast.success(`Created a bite with the code: ${resp.data?.shortCode}`)
    } catch (err: any) {
      return toast.error(err)
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>
            <h1 className="text-3xl font-bold">Create shorturl</h1>
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
              <LoadingSwap isLoading={isPending}>Generate url</LoadingSwap>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
