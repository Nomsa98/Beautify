'use client'

import { useState } from 'react'
import axios from '@/lib/axios'
import type {
    SearchFilters,
    SearchSuggestion,
    GlobalSearchResult,
    PopularSearches
} from '@/types'

export const useSearch = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const searchServices = async (params: any) => {
        setLoading(true)
        setError(null)
        try {
            const response = await axios.get('/api/search/services', { params })
            return response.data
        } catch (err: any) {
            const message = err.response?.data?.message || 'Search failed'
            setError(message)
            throw new Error(message)
        } finally {
            setLoading(false)
        }
    }

    const getSearchSuggestions = async (query: string) => {
        setLoading(true)
        setError(null)
        try {
            const response = await axios.get(`/api/search/suggestions?query=${query}`)
            return response.data
        } catch (err: any) {
            const message = err.response?.data?.message || 'Failed to get suggestions'
            setError(message)
            throw new Error(message)
        } finally {
            setLoading(false)
        }
    }

    const getPopularSearches = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await axios.get('/api/search/popular')
            return response.data
        } catch (err: any) {
            const message = err.response?.data?.message || 'Failed to get popular searches'
            setError(message)
            throw new Error(message)
        } finally {
            setLoading(false)
        }
    }

    const globalSearch = async (query: string, limit: number = 10): Promise<GlobalSearchResult[]> => {
        if (!query.trim()) return []
        
        setLoading(true)
        setError(null)
        try {
            const response = await axios.get('/api/search/global', { 
                params: { query, limit } 
            })
            return response.data.results || []
        } catch (err: any) {
            const message = err.response?.data?.message || 'Global search failed'
            setError(message)
            // Return empty array on error to prevent UI breaks
            return []
        } finally {
            setLoading(false)
        }
    }

    const searchAppointments = async (query: string, limit: number = 5) => {
        setLoading(true)
        setError(null)
        try {
            const response = await axios.get('/api/appointments/search', { 
                params: { query, limit } 
            })
            return response.data.data || []
        } catch (err: any) {
            const message = err.response?.data?.message || 'Appointment search failed'
            setError(message)
            return []
        } finally {
            setLoading(false)
        }
    }

    const searchClients = async (query: string, limit: number = 5) => {
        setLoading(true)
        setError(null)
        try {
            const response = await axios.get('/api/clients/search', { 
                params: { query, limit } 
            })
            return response.data.data || []
        } catch (err: any) {
            const message = err.response?.data?.message || 'Client search failed'
            setError(message)
            return []
        } finally {
            setLoading(false)
        }
    }

    return {
        loading,
        error,
        searchServices,
        getSearchSuggestions,
        getPopularSearches,
        globalSearch,
        searchAppointments,
        searchClients,
    }
}
