interface ButtonProps {
    children: React.ReactNode
    variant?: 'primary' | 'secondary' | 'outline'
    fullWidth?: boolean
    onClick?: () => void
}

export default function Button({
    children,
    variant = 'primary',
    fullWidth = false,
    onClick
}: ButtonProps) {
    const variants = {
        primary: 'bg-pink-500 text-white hover:bg-pink-600',
        secondary: 'bg-blue-500 text-white hover:bg-blue-600',
        outline: 'border-2 border-pink-500 text-pink-500 hover:bg-pink-50'
    }

    return (
        <button
            className={`${variants[variant]} px-6 py-3 rounded-full font-medium transition-all ${fullWidth ? 'w-full' : ''}`}
            onClick={onClick}
        >
            {children}
        </button>
    )
}