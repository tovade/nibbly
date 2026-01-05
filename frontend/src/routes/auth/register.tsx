import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import z from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircleIcon } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const Route = createFileRoute('/auth/register')({
  component: RouteComponent,
})

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters long'),
    username: z.string().min(2, 'Username must be at least 2 characters long'),
    email: z.email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
  })

function RouteComponent() {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  })
  const navigate = useNavigate()

  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
    const result = await authClient.signUp.email(data)

    if (result.error) {
      return toast.error(`Error: ${result.error.message}`)
    }
    toast.success(`Registered successfully, redirecting soon!`)

    return setTimeout(() => {
      navigate({ to: '/' })
    }, 3000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {/* error banner */}
          {errors && Object.keys(errors).length > 0 && (
            <Alert variant={'destructive'} className="mb-2">
              <AlertCircleIcon />
              <AlertTitle>Error during validation!</AlertTitle>
              <AlertDescription>
                {Object.values(errors).map((error, index) => (
                  <div key={index}>{error?.message}</div>
                ))}
              </AlertDescription>
            </Alert>
          )}
          <CardTitle>
            <h1 className="text-3xl font-bold">Create account</h1>
          </CardTitle>
          <p>Sign up to get started</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FieldGroup>
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-name">Your Name</FieldLabel>
                    <Input
                      {...field}
                      type="text"
                      id="form-name"
                      placeholder="John Doe"
                      required
                    />{' '}
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="username"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-username">
                      Your Username
                    </FieldLabel>
                    <Input
                      {...field}
                      type="text"
                      id="form-username"
                      placeholder="yourusername"
                      required
                    />{' '}
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="email"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-email">
                      Your Email Address
                    </FieldLabel>
                    <Input
                      {...field}
                      type="email"
                      id="form-email"
                      placeholder="you@example.com"
                      required
                    />{' '}
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="password"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-password">Password</FieldLabel>
                    <PasswordInput
                      {...field}
                      id="form-password"
                      placeholder="••••••••"
                      required
                    />{' '}
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="confirmPassword"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-confirm-password">
                      Confirm Password
                    </FieldLabel>
                    <PasswordInput
                      {...field}
                      id="form-confirm-password"
                      placeholder="••••••••"
                      required
                    />{' '}
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>

            <div className="flex items-start">
              <label className="flex items-start gap-2">
                <Controller
                  name="acceptTerms"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="accept-terms"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />{' '}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  I agree to the{' '}
                  <Link
                    to="/"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    to="/"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </div>

            <Button type="submit" className="w-full" variant={'default'}>
              Create Account
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              to="/auth/login"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
