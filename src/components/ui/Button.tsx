import React from 'react'

interface ButtonProps {
    children: React.ReactNode
    variant?: 'primary' | 'secondary' | 'outline'
    fullWidth?: boolean
    onClick?: () => void
    className?: string
    // Properti tambahan untuk menangani form dan state loading
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
}

export default function Button({
    children,
    variant = 'primary',
    fullWidth = false,
    onClick,
    className = '',
    type = 'button', // Default ke 'button' agar tidak memicu submit secara tidak sengaja
    disabled = false  // Default tombol aktif
}: ButtonProps) {
    const variants = {
        primary: 'bg-pink-500 text-white hover:bg-pink-600 disabled:bg-pink-300',
        secondary: 'bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300',
        outline: 'border-2 border-pink-500 text-pink-500 hover:bg-pink-50 disabled:border-pink-200 disabled:text-pink-200'
    }

    return (
        <button
            type={type} // Atribut HTML type
            disabled={disabled} // Atribut HTML disabled
            className={`${variants[variant]} px-6 py-3 rounded-full font-medium transition-all ${fullWidth ? 'w-full' : ''} ${className} disabled:cursor-not-allowed`}
            onClick={onClick}
        >
            {children}
        </button>
    )
}