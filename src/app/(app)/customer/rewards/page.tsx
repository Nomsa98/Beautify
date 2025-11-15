'use client'

import { useState } from 'react'
import useSWR from 'swr'
import axios from '@/lib/axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Gift, Users, Star, TrendingUp, Copy, Check, Share2, Mail, MessageSquare, Calendar, Percent, Award, Sparkles, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/auth'

interface Referral {
    id: number
    referred_email: string
    referred_name: string
    status: 'pending' | 'completed' | 'rewarded'
    reward_amount: number
    created_at: string
}

interface Reward {
    id: number
    type: 'referral' | 'loyalty' | 'promotion' | 'birthday'
    title: string
    description: string
    amount: number
    status: 'available' | 'used' | 'expired'
    expires_at: string | null
    created_at: string
}

export default function RewardsPage() {
    const { user } = useAuth({ middleware: 'auth' })
    const [copied, setCopied] = useState(false)
    const [activeTab, setActiveTab] = useState<'overview' | 'referrals' | 'rewards' | 'offers'>('overview')
    
    // Fetch real data from APIs
    const { data: statsData, error: statsError } = useSWR('/api/rewards/stats', () =>
        axios.get('/api/rewards/stats').then(res => res.data.data)
    )

    const { data: referralData, error: referralCodeError } = useSWR('/api/rewards/referral-code', () =>
        axios.get('/api/rewards/referral-code').then(res => res.data.data)
    )

    const { data: referrals, error: referralsError, mutate: mutateReferrals } = useSWR('/api/rewards/referrals', () =>
        axios.get('/api/rewards/referrals').then(res => res.data.data)
    )

    const { data: rewards, error: rewardsError, mutate: mutateRewards } = useSWR('/api/rewards', () =>
        axios.get('/api/rewards').then(res => res.data.data)
    )

    const stats = statsData || {
        total_referrals: 0,
        pending_rewards: 0,
        lifetime_savings: 0,
        loyalty_points: 0,
        available_rewards: 0
    }

    const referralCode = referralData?.code || 'Loading...'
    const referralLink = referralData?.link || ''

    const copyToClipboard = () => {
        if (referralLink) {
            navigator.clipboard.writeText(referralLink)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleUseReward = async (rewardId: number) => {
        try {
            await axios.post(`/api/rewards/${rewardId}/use`)
            mutateRewards()
        } catch (error) {
            console.error('Failed to use reward:', error)
        }
    }

    const isLoading = !statsData || !referralData || !referrals || !rewards

    const shareViaEmail = () => {
        if (referralLink) {
            const subject = 'Get R50 off your first salon booking!'
            const body = `Hi! I've been using this amazing salon booking platform and thought you'd love it too. Use my referral link to get R50 off your first booking: ${referralLink}`
            window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
        }
    }

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-12 w-12 animate-spin text-pink-600" />
                </div>
            </div>
        )
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'completed':
                return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'rewarded':
                return 'bg-green-100 text-green-800 border-green-200'
            case 'available':
                return 'bg-green-100 text-green-800 border-green-200'
            case 'used':
                return 'bg-gray-100 text-gray-800 border-gray-200'
            case 'expired':
                return 'bg-red-100 text-red-800 border-red-200'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const getRewardIcon = (type: string) => {
        switch (type) {
            case 'referral':
                return <Users className="h-5 w-5" />
            case 'loyalty':
                return <Star className="h-5 w-5" />
            case 'promotion':
                return <Percent className="h-5 w-5" />
            case 'birthday':
                return <Gift className="h-5 w-5" />
            default:
                return <Award className="h-5 w-5" />
        }
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                        Rewards & Offers
                    </h1>
                    <p className="text-gray-600 mt-1">Earn rewards and save on your bookings</p>
                </div>
                <div className="flex items-center gap-2">
                    <Sparkles className="h-8 w-8 text-yellow-500" />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Referrals</p>
                                <p className="text-2xl font-bold text-pink-600">{stats.total_referrals}</p>
                            </div>
                            <Users className="h-8 w-8 text-pink-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Pending Rewards</p>
                                <p className="text-2xl font-bold text-yellow-600">R{stats.pending_rewards.toFixed(2)}</p>
                            </div>
                            <Gift className="h-8 w-8 text-yellow-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Lifetime Savings</p>
                                <p className="text-2xl font-bold text-green-600">R{stats.lifetime_savings.toFixed(2)}</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Loyalty Points</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.loyalty_points}</p>
                            </div>
                            <Star className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Available Rewards</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.available_rewards}</p>
                            </div>
                            <Award className="h-8 w-8 text-purple-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b">
                {[
                    { id: 'overview', label: 'Overview', icon: Gift },
                    { id: 'referrals', label: 'Referrals', icon: Users },
                    { id: 'rewards', label: 'My Rewards', icon: Award },
                    { id: 'offers', label: 'Special Offers', icon: Percent }
                ].map((tab) => {
                    const Icon = tab.icon
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 font-medium transition-all ${
                                activeTab === tab.id
                                    ? 'text-pink-600 border-b-2 border-pink-600'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Referral Card */}
                    <Card className="border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-purple-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-6 w-6 text-pink-600" />
                                Refer Friends & Earn R50
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-gray-700">
                                Share your unique referral link with friends. When they book their first service, you both get R50 off!
                            </p>
                            
                            <div className="bg-white rounded-lg p-4 border border-pink-200">
                                <p className="text-sm text-gray-600 mb-2">Your Referral Code</p>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 bg-gray-100 px-4 py-2 rounded text-pink-600 font-mono font-bold">
                                        {referralCode}
                                    </code>
                                    <button
                                        onClick={copyToClipboard}
                                        className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-all flex items-center gap-2"
                                    >
                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        {copied ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-4 border border-pink-200">
                                <p className="text-sm text-gray-600 mb-2">Share Your Link</p>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={copyToClipboard}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                                    >
                                        <Share2 className="h-4 w-4" />
                                        Copy Link
                                    </button>
                                    <button
                                        onClick={shareViaEmail}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-all"
                                    >
                                        <Mail className="h-4 w-4" />
                                        Email
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-all">
                                        <MessageSquare className="h-4 w-4" />
                                        WhatsApp
                                    </button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* How It Works */}
                    <Card>
                        <CardHeader>
                            <CardTitle>How Rewards Work</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Users className="h-8 w-8 text-pink-600" />
                                    </div>
                                    <h3 className="font-semibold mb-2">1. Refer Friends</h3>
                                    <p className="text-sm text-gray-600">Share your referral link with friends and family</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Calendar className="h-8 w-8 text-purple-600" />
                                    </div>
                                    <h3 className="font-semibold mb-2">2. They Book</h3>
                                    <p className="text-sm text-gray-600">Your friend books and completes their first service</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Gift className="h-8 w-8 text-green-600" />
                                    </div>
                                    <h3 className="font-semibold mb-2">3. You Both Win</h3>
                                    <p className="text-sm text-gray-600">You both receive R50 credit to your wallet</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Referrals Tab */}
            {activeTab === 'referrals' && (
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Referrals</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {referrals.length === 0 ? (
                                <div className="text-center py-12">
                                    <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Referrals Yet</h3>
                                    <p className="text-gray-600">Start referring friends to earn rewards!</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {referrals.map((referral: Referral) => (
                                        <div key={referral.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                                    {referral.referred_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{referral.referred_name}</p>
                                                    <p className="text-sm text-gray-600">{referral.referred_email}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Referred on {new Date(referral.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge className={getStatusColor(referral.status)}>
                                                    {referral.status.toUpperCase()}
                                                </Badge>
                                                <p className="text-sm font-semibold text-green-600 mt-2">
                                                    R{referral.reward_amount.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Rewards Tab */}
            {activeTab === 'rewards' && (
                <div className="space-y-4">
                    {rewards.filter((r: Reward) => r.status === 'available').length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Available Rewards</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {rewards.filter((r: Reward) => r.status === 'available').map((reward: Reward) => (
                                        <div key={reward.id} className="p-4 border-2 border-green-200 bg-green-50 rounded-lg">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                                        {getRewardIcon(reward.type)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">{reward.title}</h3>
                                                        <p className="text-sm text-gray-600">{reward.description}</p>
                                                    </div>
                                                </div>
                                                <Badge className={getStatusColor(reward.status)}>
                                                    {reward.status.toUpperCase()}
                                                </Badge>
                                            </div>
                                            {reward.amount > 0 && (
                                                <p className="text-2xl font-bold text-green-600 mb-2">
                                                    R{reward.amount.toFixed(2)}
                                                </p>
                                            )}
                                            {reward.expires_at && (
                                                <p className="text-xs text-gray-500">
                                                    Expires: {new Date(reward.expires_at).toLocaleDateString()}
                                                </p>
                                            )}
                                            <button 
                                                onClick={() => handleUseReward(reward.id)}
                                                className="w-full mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                                            >
                                                Use Reward
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Reward History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {rewards.map((reward: Reward) => (
                                    <div key={reward.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                                                {getRewardIcon(reward.type)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{reward.title}</p>
                                                <p className="text-sm text-gray-600">{reward.description}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(reward.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge className={getStatusColor(reward.status)}>
                                                {reward.status.toUpperCase()}
                                            </Badge>
                                            {reward.amount > 0 && (
                                                <p className="text-sm font-semibold text-gray-900 mt-2">
                                                    R{reward.amount.toFixed(2)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Offers Tab */}
            {activeTab === 'offers' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                                    <Percent className="h-8 w-8 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-xl mb-2">First-Time Discount</h3>
                                    <p className="text-gray-600 mb-4">Get 20% off your first service booking</p>
                                    <Badge className="bg-purple-600 text-white">NEW CUSTOMER</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-red-50">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
                                    <Gift className="h-8 w-8 text-pink-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-xl mb-2">Birthday Special</h3>
                                    <p className="text-gray-600 mb-4">Enjoy 25% off during your birthday month</p>
                                    <Badge className="bg-pink-600 text-white">BIRTHDAY MONTH</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Star className="h-8 w-8 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-xl mb-2">Loyalty Rewards</h3>
                                    <p className="text-gray-600 mb-4">Earn 1 point for every R10 spent</p>
                                    <Badge className="bg-blue-600 text-white">ONGOING</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                    <Users className="h-8 w-8 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-xl mb-2">Refer & Earn</h3>
                                    <p className="text-gray-600 mb-4">Get R50 for each friend you refer</p>
                                    <Badge className="bg-green-600 text-white">UNLIMITED</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
