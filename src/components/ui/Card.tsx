import React from 'react'

interface CardProps {
    children: React.ReactNode
    className?: string
    onClick?: () => void // Tambahkan ini agar event klik bisa diterima
}

export default function Card({
    children,
    className = '',
    onClick
}: CardProps) {
    return (
        <div
            className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm transition-all ${onClick ? 'cursor-pointer hover:shadow-md' : ''} ${className}`}
            onClick={onClick} // Meneruskan fungsi klik ke div asli
        >
            {children}
        </div>
    )
}