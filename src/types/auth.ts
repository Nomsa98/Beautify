export interface Role {
    id: number
    name: string
    guard_name: string
    created_at: string
    updated_at: string
}

export interface Permission {
    id: number
    name: string
    guard_name: string
    created_at: string
    updated_at: string
}

export interface Tenant {
    id: number
    name: string
    license_id?: number
    license_status?: string
    extra_license_count?: number
    domain?: string | null
    database?: string | null
    is_active?: boolean
    license_key?: string | null
    license_expires_at?: string | null
    created_at: string
    updated_at: string
    deleted_at?: string | null
}

export interface User {
    id: number
    name: string
    email: string
    phone?: string | null
    email_verified_at?: string | null | undefined
    tenant_id?: number | null
    is_active?: boolean
    created_at: string
    updated_at: string
    
    // Role information (can be string[] or Role[])
    roles?: string[] | Role[]
    permissions?: string[] | Permission[]
    
    // Staff specific
    specialization?: string | null
    hire_date?: string | null
    salary?: string | number | null
    commission_rate?: string | number | null
    
    // Legacy fields
    license?: any[]
    tenant?: Tenant
}

export interface AuthErrors {
    [key: string]: string[] | undefined
}

export interface LoginProps {
    email: string
    password: string
    remember?: boolean
    setErrors: (errors: AuthErrors) => void
    setStatus?: (status: string | null) => void
}

export interface RegisterProps {
    name: string
    email: string
    password: string
    password_confirmation: string
    company: string
    setErrors: (errors: AuthErrors) => void
}

export interface ForgotPasswordProps {
    email: string
    setErrors: (errors: AuthErrors) => void
    setStatus: (status: string | null) => void
}

export interface ResetPasswordProps {
    email: string
    password: string
    password_confirmation: string
    setErrors: (errors: AuthErrors) => void
    setStatus: (status: string | null) => void
}

export interface ResendEmailVerificationProps {
    setStatus: (status: string) => void
}

export interface UseAuthProps {
    middleware?: 'auth' | 'guest'
    redirectIfAuthenticated?: string
}

export interface AuthHook {
    user: User | undefined
    register: (props: RegisterProps) => Promise<void>
    login: (props: LoginProps) => Promise<void>
    forgotPassword: (props: ForgotPasswordProps) => Promise<void>
    resetPassword: (props: ResetPasswordProps) => Promise<void>
    resendEmailVerification: (props: ResendEmailVerificationProps) => Promise<void>
    logout: () => Promise<void>
}
