'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/auth'
import type { AuthErrors } from '@/types'
import InputError from '@/components/InputError'
import React, { useState, FormEvent, useEffect } from 'react'
import { Sparkles, UserPlus, Building2, User, Gift } from 'lucide-react'

type UserType = 'customer' | 'service_provider'

const Page: React.FC = () => {
    const { register } = useAuth({
        middleware: 'guest',
        redirectIfAuthenticated: '/dashboard',
    })

    const searchParams = useSearchParams()
    const [userType, setUserType] = useState<UserType>('customer')
    const [name, setName] = useState<string>('')
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [passwordConfirmation, setPasswordConfirmation] = useState<string>('')
    const [phone, setPhone] = useState<string>('')
    const [referralCode, setReferralCode] = useState<string>('')

    // Service Provider fields
    const [businessName, setBusinessName] = useState<string>('')
    const [businessAddress, setBusinessAddress] = useState<string>('')
    const [businessPhone, setBusinessPhone] = useState<string>('')
    const [businessDescription, setBusinessDescription] = useState<string>('')
    const [businessLicense, setBusinessLicense] = useState<string>('')
    const [taxId, setTaxId] = useState<string>('')

    const [errors, setErrors] = useState<AuthErrors>({})
    const [registrationSuccess, setRegistrationSuccess] = useState(false)

    // Get referral code from URL parameter
    useEffect(() => {
        const refCode = searchParams?.get('ref')
        if (refCode) {
            setReferralCode(refCode)
        }
    }, [searchParams])

    const submitForm = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const registrationData = {
            name,
            email,
            password,
            password_confirmation: passwordConfirmation,
            phone,
            user_type: userType,
            role: userType === 'customer' ? 'Customer' : 'Owner',
            company: userType === 'service_provider' ? businessName : 'N/A',
            referral_code: referralCode || undefined,
            setErrors,
            ...(userType === 'service_provider' && {
                business_name: businessName,
                business_address: businessAddress,
                business_phone: businessPhone,
                business_description: businessDescription,
                business_license: businessLicense,
                tax_id: taxId,
            })
        }

        register(registrationData).then((response: any) => {
            // Handle service provider registration success
            if (response?.status === 'pending_approval') {
                setRegistrationSuccess(true)
            }
        }).catch((error: any) => {
            console.error('Registration error:', error)
        })
    }

    // Success message for service providers
    if (registrationSuccess && userType === 'service_provider') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl w-full">
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
                        <div className="mb-6">
                            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Registration Successful!</h2>
                        <p className="text-lg text-gray-600 mb-6">
                            Thank you for registering your business with us. Your application is now pending approval from our administrators.
                        </p>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                            <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
                            <ul className="text-left text-blue-800 space-y-2">
                                <li className="flex items-start">
                                    <span className="mr-2">1.</span>
                                    <span>Our team will review your application within 24-48 hours</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2">2.</span>
                                    <span>You'll receive an email notification once your account is approved</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2">3.</span>
                                    <span>After approval, you can login and start managing your salon</span>
                                </li>
                            </ul>
                        </div>
                        <div className="space-y-3">
                            <Link
                                href="/login"
                                className="block w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                Go to Login Page
                            </Link>
                            <Link
                                href="/"
                                className="block w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-all duration-200"
                            >
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl w-full space-y-8">
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
                        <h2 className="text-3xl font-bold text-gray-900">Join Our Network</h2>
                        <Sparkles className="h-8 w-8 text-pink-500 ml-2" />
                    </div>
                    <p className="text-gray-600 mb-8">
                        Create your account to book appointments or manage your salon business
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <form onSubmit={submitForm} className="space-y-6">
                        {/* User Type Selection */}
                        <div>
                            <Label htmlFor="userType" className="text-gray-700 font-medium text-lg mb-4 block">Choose Your Account Type:</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 ${
                                    userType === 'customer'
                                        ? 'border-pink-500 bg-pink-50 ring-2 ring-pink-200'
                                        : 'border-gray-200 hover:border-pink-300 hover:bg-pink-25'
                                }`}>
                                    <input
                                        id="customer"
                                        name="userType"
                                        type="radio"
                                        value="customer"
                                        checked={userType === 'customer'}
                                        onChange={(e) => setUserType(e.target.value as UserType)}
                                        className="sr-only"
                                    />
                                    <label htmlFor="customer" className="cursor-pointer">
                                        <div className="flex items-center mb-2">
                                            <User className="h-6 w-6 text-pink-500 mr-2" />
                                            <span className="text-lg font-semibold text-gray-900">Customer</span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Book appointments and discover beauty services from our partner salons
                                        </p>
                                    </label>
                                </div>

                                <div className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 ${
                                    userType === 'service_provider'
                                        ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                                }`}>
                                    <input
                                        id="service_provider"
                                        name="userType"
                                        type="radio"
                                        value="service_provider"
                                        checked={userType === 'service_provider'}
                                        onChange={(e) => setUserType(e.target.value as UserType)}
                                        className="sr-only"
                                    />
                                    <label htmlFor="service_provider" className="cursor-pointer">
                                        <div className="flex items-center mb-2">
                                            <Building2 className="h-6 w-6 text-purple-500 mr-2" />
                                            <span className="text-lg font-semibold text-gray-900">Service Provider</span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Manage your salon/spa business and connect with customers
                                        </p>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Personal Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Name */}
                            <div>
                                <Label htmlFor="name" className="text-gray-700 font-medium">Full Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={name}
                                    className="block mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                                    onChange={event => setName(event.target.value)}
                                    required
                                    autoFocus
                                    placeholder="Enter your full name"
                                />
                                <InputError messages={errors.name} className="mt-2" />
                            </div>

                            {/* Phone */}
                            <div>
                                <Label htmlFor="phone" className="text-gray-700 font-medium">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={phone}
                                    className="block mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                                    onChange={event => setPhone(event.target.value)}
                                    required
                                    placeholder="Enter your phone number"
                                />
                                <InputError messages={errors.phone} className="mt-2" />
                            </div>
                        </div>

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
                                placeholder="Enter your email address"
                            />
                            <InputError messages={errors.email} className="mt-2" />
                        </div>

                        {/* Referral Code (Optional) */}
                        {userType === 'customer' && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                                <div className="flex items-center mb-4">
                                    <Gift className="h-5 w-5 text-green-600 mr-2" />
                                    <h3 className="text-lg font-semibold text-gray-900">Have a Referral Code?</h3>
                                </div>
                                <p className="text-sm text-gray-600 mb-4">
                                    Enter a friend's referral code to get <span className="font-bold text-green-600">R50 off</span> your first booking!
                                </p>
                                <div>
                                    <Label htmlFor="referralCode" className="text-gray-700 font-medium">Referral Code (Optional)</Label>
                                    <Input
                                        id="referralCode"
                                        type="text"
                                        value={referralCode}
                                        className="block mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white uppercase"
                                        onChange={event => setReferralCode(event.target.value.toUpperCase())}
                                        placeholder="e.g., SALONTESABCD"
                                        maxLength={20}
                                    />
                                    {referralCode && (
                                        <p className="mt-2 text-sm text-green-600 flex items-center">
                                            <Gift className="h-4 w-4 mr-1" />
                                            You'll receive R50 credit when you complete your first booking!
                                        </p>
                                    )}
                                    <InputError messages={errors.referral_code} className="mt-2" />
                                </div>
                            </div>
                        )}

                        {/* Service Provider Fields */}
                        {userType === 'service_provider' && (
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Building2 className="h-5 w-5 text-purple-500 mr-2" />
                                    Business Information
                                </h3>

                                <div className="space-y-4">
                                    {/* Business Name & Address */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="businessName" className="text-gray-700 font-medium">Business Name</Label>
                                            <Input
                                                id="businessName"
                                                type="text"
                                                value={businessName}
                                                className="block mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white"
                                                onChange={event => setBusinessName(event.target.value)}
                                                required
                                                placeholder="Your salon/spa name"
                                            />
                                            <InputError messages={errors.business_name} className="mt-2" />
                                        </div>

                                        <div>
                                            <Label htmlFor="businessPhone" className="text-gray-700 font-medium">Business Phone</Label>
                                            <Input
                                                id="businessPhone"
                                                type="tel"
                                                value={businessPhone}
                                                className="block mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white"
                                                onChange={event => setBusinessPhone(event.target.value)}
                                                required
                                                placeholder="Business contact number"
                                            />
                                            <InputError messages={errors.business_phone} className="mt-2" />
                                        </div>
                                    </div>

                                    {/* Business Address */}
                                    <div>
                                        <Label htmlFor="businessAddress" className="text-gray-700 font-medium">Business Address</Label>
                                        <Input
                                            id="businessAddress"
                                            type="text"
                                            value={businessAddress}
                                            className="block mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white"
                                            onChange={event => setBusinessAddress(event.target.value)}
                                            required
                                            placeholder="Full business address"
                                        />
                                        <InputError messages={errors.business_address} className="mt-2" />
                                    </div>

                                    {/* Business Description */}
                                    <div>
                                        <Label htmlFor="businessDescription" className="text-gray-700 font-medium">Business Description</Label>
                                        <textarea
                                            id="businessDescription"
                                            value={businessDescription}
                                            className="block mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white"
                                            onChange={event => setBusinessDescription(event.target.value)}
                                            rows={3}
                                            placeholder="Describe your salon/spa services..."
                                        />
                                        <InputError messages={errors.business_description} className="mt-2" />
                                    </div>

                                    {/* Business License & Tax ID */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="businessLicense" className="text-gray-700 font-medium">Business License (Optional)</Label>
                                            <Input
                                                id="businessLicense"
                                                type="text"
                                                value={businessLicense}
                                                className="block mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white"
                                                onChange={event => setBusinessLicense(event.target.value)}
                                                placeholder="License number"
                                            />
                                            <InputError messages={errors.business_license} className="mt-2" />
                                        </div>

                                        <div>
                                            <Label htmlFor="taxId" className="text-gray-700 font-medium">Tax ID (Optional)</Label>
                                            <Input
                                                id="taxId"
                                                type="text"
                                                value={taxId}
                                                className="block mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white"
                                                onChange={event => setTaxId(event.target.value)}
                                                placeholder="Tax identification"
                                            />
                                            <InputError messages={errors.tax_id} className="mt-2" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Password Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                    autoComplete="new-password"
                                    placeholder="Create a password"
                                />
                                <InputError messages={errors.password} className="mt-2" />
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <Label htmlFor="passwordConfirmation" className="text-gray-700 font-medium">
                                    Confirm Password
                                </Label>
                                <Input
                                    id="passwordConfirmation"
                                    type="password"
                                    value={passwordConfirmation}
                                    className="block mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                                    onChange={event => setPasswordConfirmation(event.target.value)}
                                    required
                                    placeholder="Confirm your password"
                                />
                                <InputError messages={errors.password_confirmation} className="mt-2" />
                            </div>
                        </div>

                        {/* Register Button */}
                        <button
                            type="submit"
                            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center ${
                                userType === 'customer'
                                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white'
                                    : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white'
                            }`}
                        >
                            <UserPlus className="h-5 w-5 mr-2" />
                            Create {userType === 'customer' ? 'Customer' : 'Business'} Account
                        </button>
                    </form>
                </div>

                {/* Login Link */}
                <div className="text-center">
                    <p className="text-gray-600">
                        Already have an account?{' '}
                        <Link
                            href="/login"
                            className="text-pink-600 hover:text-pink-500 font-semibold transition-colors"
                        >
                            Sign in here
                        </Link>
                    </p>
                    {referralCode && (
                        <p className="text-sm text-green-600 mt-2">
                            🎉 Referral code <span className="font-mono font-bold">{referralCode}</span> will be applied!
                        </p>
                    )}
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

export default Page
