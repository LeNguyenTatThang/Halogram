import { useEffect, useState } from 'react'

const HalogramLoadingPage: React.FC = () => {
  const [dot, setDot] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setDot((prev) => (prev + 1) % 3)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Đang tải nội dung"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-black transition-colors duration-300"
    >
      <div className="relative mb-8">
        <h1
          className="text-4xl md:text-5xl font-bold tracking-widest select-none"
          style={{
            background: 'linear-gradient(90deg, #ff66c4, #ffde59)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'gradient-shift 3s ease infinite',
          }}
        >
          HALOGRAM
        </h1>
      </div>

      <div className="flex gap-3 mb-6">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-3 h-3 rounded-full transition-all duration-500"
            style={{
              background: i === dot
                ? 'linear-gradient(90deg, #ff66c4, #ffde59)'
                : '#e5e7eb',
              transform: i === dot ? 'scale(1.3)' : 'scale(1)',
              opacity: i === dot ? 1 : 0.4,
            }}
          />
        ))}
      </div>

      <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
        Đang tải nội dung...
      </p>

      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  )
}

export default HalogramLoadingPage
