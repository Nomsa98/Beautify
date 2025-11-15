import { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, LabelHTMLAttributes } from 'react'

// Button Component Types
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string
}

// Input Component Types
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    className?: string
}

// Label Component Types
export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
    children: ReactNode
    className?: string
}

// InputError Component Types
export interface InputErrorProps {
    messages?: string[]
    className?: string
}

// Navigation Component Types
export interface NavLinkProps {
    active?: boolean
    children: ReactNode
    href: string
    [key: string]: any
}

export interface ResponsiveNavLinkProps {
    active?: boolean
    children: ReactNode
    href: string
    [key: string]: any
}

export interface ResponsiveNavButtonProps {
    [key: string]: any
}

// Dropdown Component Types
export interface DropdownProps {
    align?: 'left' | 'right'
    width?: string | number
    contentClasses?: string
    trigger: ReactNode
    children: ReactNode
}

export interface DropdownLinkProps {
    children: ReactNode
    href: string
    [key: string]: any
}

export interface DropdownButtonProps {
    children: ReactNode
    [key: string]: any
}

// Layout Component Types
export interface LayoutProps {
    children: ReactNode
}

export interface RootLayoutProps {
    children: ReactNode
}

// Auth Component Types
export interface AuthCardProps {
    logo: ReactNode
    children: ReactNode
}

export interface AuthSessionStatusProps {
    status?: string | null
    className?: string
    [key: string]: any
}

export interface HeaderProps {
    title: string
}

import type { User } from './auth'

export interface NavigationProps {
    user: User
}
