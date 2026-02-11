export default function Card({ children, className = '' }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-soft ${className}`}>
            {children}
        </div>
    )
}