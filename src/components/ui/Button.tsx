import React from 'react'

interface ButtonProps {
    children: React.ReactNode
    variant?: 'primary' | 'secondary' | 'outline'
    fullWidth?: boolean
    onClick?: () => void
    className?: string // Tambahkan ini agar tidak error
}

export default function Button({
    children,
    variant = 'primary',
    fullWidth = false,
    onClick,
    className = '' // Beri default string kosong
}: ButtonProps) {
    const variants = {
        primary: 'bg-pink-500 text-white hover:bg-pink-600',
        secondary: 'bg-blue-500 text-white hover:bg-blue-600',
        outline: 'border-2 border-pink-500 text-pink-500 hover:bg-pink-50'
    }

    return (
        <button
            className={`${variants[variant]} px-6 py-3 rounded-full font-medium transition-all ${fullWidth ? 'w-full' : ''} ${className}`}
            onClick={onClick}
        >
            {children}
        </button>
    )
}