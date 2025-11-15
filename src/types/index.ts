// Re-export all types from their respective modules
export * from './auth'
export * from './components'
export * from './service'
export * from './appointment'
export * from './payment'
export * from './rewards'
export * from './review'
export * from './hooks'

// Common utility types
export type SetState<T> = React.Dispatch<React.SetStateAction<T>>

// API Response types
export interface ApiResponse<T = any> {
    data: T
    message?: string
    errors?: Record<string, string[]>
    success?: boolean
}

// Form event types
export type FormSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => void
export type InputChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => void
export type ButtonClickHandler = (event: React.MouseEvent<HTMLButtonElement>) => void
