'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

interface PromotionCountdownProps {
    timeRemaining: number
    className?: string
}

export default function PromotionCountdown({ timeRemaining, className = '' }: PromotionCountdownProps) {
    const [timeLeft, setTimeLeft] = useState<number>(timeRemaining || 0)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        if (timeRemaining) {
            setTimeLeft(timeRemaining)
        }
    }, [timeRemaining])

    useEffect(() => {
        if (!mounted || timeLeft <= 0) return

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [mounted, timeLeft])

    if (!mounted || timeLeft <= 0) {
        return null
    }

    const formatTime = (seconds: number) => {
        const days = Math.floor(seconds / 86400)
        const hours = Math.floor((seconds % 86400) / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60

        if (days > 0) {
            return `${days}d ${hours}h ${minutes}m`
        } else if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`
        } else {
            return `${secs}s`
        }
    }

    const getUrgencyColor = (seconds: number) => {
        const hours = seconds / 3600
        if (hours <= 1) return 'text-red-600 bg-red-50 border-red-200'
        if (hours <= 24) return 'text-orange-600 bg-orange-50 border-orange-200'
        return 'text-blue-600 bg-blue-50 border-blue-200'
    }

    return (
        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full border text-xs font-medium ${getUrgencyColor(timeLeft)} ${className}`}>
            <Clock className="w-3 h-3" />
            <span>{formatTime(timeLeft)}</span>
        </div>
    )
}
