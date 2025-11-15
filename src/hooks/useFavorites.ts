import { useState, useEffect } from 'react'
import axios from '@/lib/axios'
import { useAuth } from './auth'
import type { FavoriteService } from '@/types'

export const useFavorites = () => {
    const { user } = useAuth()
    const [favoriteServices, setFavoriteServices] = useState<number[]>([])
    const [favorites, setFavorites] = useState<FavoriteService[]>([])
    const [loading, setLoading] = useState(true)

    // Load favorites from backend on mount
    useEffect(() => {
        if (user) {
            loadFavoritesFromBackend()
        } else {
            loadFavoritesFromLocalStorage()
        }
    }, [user])

    const loadFavoritesFromBackend = async () => {
        try {
            const response = await axios.get('/api/favorites')
            console.log('Favorites API response:', response.data)
            if (response.data.success) {
                const favoriteIds = response.data.data.favorite_service_ids || []
                const favoritesData = response.data.data.favorites || []
                
                console.log('Setting favorite IDs:', favoriteIds)
                console.log('Setting favorites data:', favoritesData)
                
                setFavoriteServices(favoriteIds)
                setFavorites(favoritesData)
                
                // Also sync to localStorage for offline access
                localStorage.setItem(`favorites_${user?.id}`, JSON.stringify(favoriteIds))
            }
        } catch (error) {
            console.error('Error loading favorites from backend:', error)
            // Fallback to localStorage
            loadFavoritesFromLocalStorage()
        } finally {
            setLoading(false)
        }
    }

    const loadFavoritesFromLocalStorage = () => {
        const saved = localStorage.getItem(`favorites_${user?.id}`)
        if (saved) {
            const favoriteIds = JSON.parse(saved)
            setFavoriteServices(favoriteIds)
        }
        setLoading(false)
    }

    const syncFavoritesToBackend = async (favoriteIds: number[]) => {
        if (!user) return

        try {
            await axios.post('/api/favorites/sync', {
                service_ids: favoriteIds
            })
        } catch (error) {
            console.error('Error syncing favorites to backend:', error)
        }
    }

    const toggleFavorite = async (serviceId: number | string) => {
        const numId = Number(serviceId)
        const isCurrentlyFavorite = favoriteServices.includes(numId)
        
        // Optimistic update
        const newFavorites = isCurrentlyFavorite
            ? favoriteServices.filter(id => id !== numId)
            : [...favoriteServices, numId]

        setFavoriteServices(newFavorites)
        localStorage.setItem(`favorites_${user?.id}`, JSON.stringify(newFavorites))

        // Sync to backend if user is authenticated
        if (user) {
            try {
                const response = await axios.post('/api/favorites/toggle', {
                    service_id: numId
                })
                
                if (response.data.success) {
                    // Update the favorites list if we have detailed data
                    if (!isCurrentlyFavorite && response.data.data) {
                        setFavorites(prev => [...prev, response.data.data])
                    } else if (isCurrentlyFavorite) {
                        setFavorites(prev => prev.filter(fav => fav.service_id !== numId))
                    }
                }
            } catch (error) {
                console.error('Error toggling favorite on backend:', error)
                // Revert optimistic update on error
                setFavoriteServices(favoriteServices)
                localStorage.setItem(`favorites_${user?.id}`, JSON.stringify(favoriteServices))
            }
        }
    }

    const addFavorite = async (serviceId: number | string) => {
        const numId = Number(serviceId)
        
        if (favoriteServices.includes(numId)) {
            return // Already favorited
        }

        const newFavorites = [...favoriteServices, numId]
        setFavoriteServices(newFavorites)
        localStorage.setItem(`favorites_${user?.id}`, JSON.stringify(newFavorites))

        if (user) {
            try {
                const response = await axios.post('/api/favorites', {
                    service_id: numId
                })
                
                if (response.data.success && response.data.data) {
                    setFavorites(prev => [...prev, response.data.data])
                }
            } catch (error) {
                console.error('Error adding favorite:', error)
                // Revert on error
                setFavoriteServices(favoriteServices)
                localStorage.setItem(`favorites_${user?.id}`, JSON.stringify(favoriteServices))
            }
        }
    }

    const removeFavorite = async (serviceId: number | string) => {
        const numId = Number(serviceId)
        
        const newFavorites = favoriteServices.filter(id => id !== numId)
        setFavoriteServices(newFavorites)
        localStorage.setItem(`favorites_${user?.id}`, JSON.stringify(newFavorites))

        if (user) {
            try {
                await axios.delete(`/api/favorites/${numId}`)
                setFavorites(prev => prev.filter(fav => fav.service_id !== numId))
            } catch (error) {
                console.error('Error removing favorite:', error)
                // Revert on error
                setFavoriteServices(favoriteServices)
                localStorage.setItem(`favorites_${user?.id}`, JSON.stringify(favoriteServices))
            }
        }
    }

    const clearAllFavorites = async () => {
        const oldFavorites = [...favoriteServices]
        
        setFavoriteServices([])
        setFavorites([])
        localStorage.setItem(`favorites_${user?.id}`, JSON.stringify([]))

        if (user) {
            try {
                await axios.post('/api/favorites/sync', {
                    service_ids: []
                })
            } catch (error) {
                console.error('Error clearing favorites:', error)
                // Revert on error
                setFavoriteServices(oldFavorites)
                localStorage.setItem(`favorites_${user?.id}`, JSON.stringify(oldFavorites))
            }
        }
    }

    const isFavorite = (serviceId: number | string) => {
        return favoriteServices.includes(Number(serviceId))
    }

    return {
        favoriteServices,
        favorites,
        loading,
        toggleFavorite,
        addFavorite,
        removeFavorite,
        clearAllFavorites,
        isFavorite,
        syncFavoritesToBackend,
        refreshFavorites: loadFavoritesFromBackend
    }
}
