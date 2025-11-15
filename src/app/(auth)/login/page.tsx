'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import InputError from '@/components/InputError'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useAuth } from '@/hooks/auth'
import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AuthSessionStatus from '@/app/(auth)/AuthSessionStatus'
import { Sparkles, LogIn } from 'lucide-react'
import type { AuthErrors } from '@/types'

const Login: React.FC = () => {
    const router = useRouter()

    const { login } = useAuth({
        middleware: 'guest',
        redirectIfAuthenticated: '/dashboard',
    })

    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [shouldRemember, setShouldRemember] = useState<boolean>(false)
    const [errors, setErrors] = useState<AuthErrors>({})
    const [status, setStatus] = useState<string | null>(null)

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const reset = urlParams.get('reset')
        if (reset && Object.keys(errors).length === 0) {
            setStatus(atob(reset))
        } else {
            setStatus(null)
        }
    }, [errors])

    const submitForm = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        login({
            email,
            password,
            remember: shouldRemember,
            setErrors,
            setStatus,
        })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="flex justify-center items-center mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white font-bold text-lg">BS</span>
                        </div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                            Beauty Salon Network
                        </h1>
                    </div>
                    <div className="flex justify-center items-center mb-4">
                        <Sparkles className="h-8 w-8 text-pink-500 mr-2" />
                        <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
                        <Sparkles className="h-8 w-8 text-pink-500 ml-2" />
                    </div>
                    <p className="text-gray-600 mb-8">
                        Sign in to your account to manage your beauty appointments
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <AuthSessionStatus className="mb-4" status={status} />

                    <form onSubmit={submitForm} className="space-y-6">
                        {/* Email Address */}
                        <div>
                            <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                className="block mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                                onChange={event => setEmail(event.target.value)}
                                required
                                autoFocus
                                placeholder="Enter your email"
                            />
                            <InputError messages={errors.email || []} className="mt-2" />
                        </div>

                        {/* Password */}
                        <div>
                            <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                className="block mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                                onChange={event => setPassword(event.target.value)}
                                required
                                autoComplete="current-password"
                                placeholder="Enter your password"
                            />
                            <InputError messages={errors.password || []} className="mt-2" />
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center justify-between">
                            <label htmlFor="remember_me" className="inline-flex items-center">
                                <input
                                    id="remember_me"
                                    type="checkbox"
                                    name="remember"
                                    className="rounded border-gray-300 text-pink-600 shadow-sm focus:border-pink-300 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                                    onChange={event => setShouldRemember(event.target.checked)}
                                />
                                <span className="ml-2 text-sm text-gray-600 font-medium">
                                    Remember me
                                </span>
                            </label>

                            <Link
                                href="/forgot-password"
                                className="text-sm text-pink-600 hover:text-pink-500 font-medium transition-colors">
                                Forgot password?
                            </Link>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center"
                        >
                            <LogIn className="h-5 w-5 mr-2" />
                            Sign In
                        </button>
                    </form>
                </div>

                {/* Register Link */}
                <div className="text-center">
                    <p className="text-gray-600">
                        Don't have an account?{' '}
                        <Link
                            href="/register"
                            className="text-pink-600 hover:text-pink-500 font-semibold transition-colors"
                        >
                            Create one here
                        </Link>
                    </p>
                </div>

                {/* Back to Home */}
                <div className="text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Login
