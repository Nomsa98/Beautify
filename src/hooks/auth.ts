'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import useSWR from 'swr'
import axios from '@/lib/axios'
import type {
    User,
    AuthErrors,
    LoginProps,
    RegisterProps,
    ForgotPasswordProps,
    ResetPasswordProps,
    ResendEmailVerificationProps,
    UseAuthProps,
    AuthHook
} from '@/types'

export const useAuth = ({ middleware, redirectIfAuthenticated }: UseAuthProps = {}): AuthHook => {
    const router = useRouter()
    const params = useParams()

    const { data: user, error, mutate } = useSWR<User>('/api/user', () =>
        axios
            .get('/api/user')
            .then(res => res.data)
            .catch(error => {
                if (error.response.status !== 409) throw error

                // Temporarily disable auto-redirect to verify-email
                // router.push('/verify-email')
            }),
    )

    const csrf = () => axios.get('/sanctum/csrf-cookie')

    const register = async ({ setErrors, ...props }: RegisterProps) => {
        await csrf()

        setErrors({})

        return axios
            .post('/register', props)
            .then((response) => {
                // For service providers with pending approval, return the response
                if (response.data?.status === 'pending_approval') {
                    return response.data
                }
                mutate()
                return response.data
            })
            .catch(error => {
                if (error.response.status !== 422) throw error

                setErrors(error.response.data.errors)
                throw error
            })
    }

    const login = async ({ setErrors, setStatus, ...props }: LoginProps) => {
        await csrf()

        setErrors({})
        setStatus?.(null)

        axios
            .post('/login', props)
            .then(() => mutate())
            .catch(error => {
                if (error.response.status !== 422) throw error

                setErrors(error.response.data.errors)
            })
    }

    const forgotPassword = async ({ setErrors, setStatus, email }: ForgotPasswordProps) => {
        await csrf()

        setErrors({})
        setStatus(null)

        axios
            .post('/forgot-password', { email })
            .then(response => setStatus(response.data.status))
            .catch(error => {
                if (error.response.status !== 422) throw error

                setErrors(error.response.data.errors)
            })
    }

    const resetPassword = async ({ setErrors, setStatus, ...props }: ResetPasswordProps) => {
        await csrf()

        setErrors({})
        setStatus(null)

        axios
            .post('/reset-password', { token: params.token, ...props })
            .then(response =>
                router.push('/login?reset=' + btoa(response.data.status)),
            )
            .catch(error => {
                if (error.response.status !== 422) throw error

                setErrors(error.response.data.errors)
            })
    }

    const resendEmailVerification = async ({ setStatus }: ResendEmailVerificationProps) => {
        await axios
            .post('/email/verification-notification')
            .then(response => setStatus(response.data.status))
    }

    const logout = async () => {
        if (!error) {
            await axios.post('/logout').then(() => mutate())
        }

        window.location.pathname = '/login'
    }

    useEffect(() => {
        if (middleware === 'guest' && redirectIfAuthenticated && user)
            router.push(redirectIfAuthenticated)

        // Check if user has Guest role - if so, treat as unauthorized
        // Guest users should not have access to authenticated areas
        if (middleware === 'auth' && user && user.roles?.includes('Guest')) {
            logout()
            return
        }

        // Temporarily disable email verification redirect
        // if (middleware === 'auth' && (user && !user.email_verified_at))
        //     router.push('/verify-email')

        // Always redirect away from verify-email page since verification is disabled
        if (window.location.pathname === '/verify-email')
            router.push(redirectIfAuthenticated || '/dashboard')
        if (middleware === 'auth' && error) logout()
    }, [user, error])

    return {
        user,
        register,
        login,
        forgotPassword,
        resetPassword,
        resendEmailVerification,
        logout,
    }
}

export default useAuth
