import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-orange-50 via-white to-slate-50 p-6">
      <Card className="w-full max-w-md border-slate-200 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
          <CardDescription>
            We've sent you a verification link. Please check your inbox and click the link to verify your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-slate-600 mb-4">
            After verifying your email, you can sign in to access your dashboard.
          </p>
          <Link href="/auth/login" className="text-sm font-medium text-orange-600 hover:text-orange-700">
            Return to sign in
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
