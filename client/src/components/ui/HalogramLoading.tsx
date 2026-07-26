import { useEffect, useState } from 'react'

type LoadingSize = 'sm' | 'md' | 'lg'

interface HalogramLoadingProps {
  size?: LoadingSize
  text?: string
  showText?: boolean
  className?: string
}

const sizeConfig: Record<LoadingSize, { dot: string; text: string; gap: string }> = {
  sm: { dot: 'w-1.5 h-1.5', text: 'text-xs', gap: 'gap-1' },
  md: { dot: 'w-2.5 h-2.5', text: 'text-sm', gap: 'gap-1.5' },
  lg: { dot: 'w-3 h-3', text: 'text-base', gap: 'gap-2' },
}

const Dot: React.FC<{ delay: number; size: LoadingSize }> = ({ delay, size }) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <span
      className={`rounded-full ${sizeConfig[size].dot} transition-all duration-500 ${
        visible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
      }`}
      style={{
        background: 'linear-gradient(90deg, #ff66c4, #ffde59)',
      }}
    />
  )
}

const HalogramLoading: React.FC<HalogramLoadingProps> = ({
  size = 'md',
  text,
  showText = true,
  className = '',
}) => {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 4)
    }, 400)
    return () => clearInterval(interval)
  }, [])

  const displayText = text ?? (size === 'sm' ? '' : 'Đang tải...')

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Đang tải"
      className={`flex flex-col items-center justify-center ${className}`}
    >
      <div className={`flex ${sizeConfig[size].gap}`}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`rounded-full ${sizeConfig[size].dot} transition-all duration-300`}
            style={{
              background: 'linear-gradient(90deg, #ff66c4, #ffde59)',
              opacity: step === i ? 1 : 0.25,
              transform: step === i ? 'scale(1.2)' : 'scale(1)',
            }}
          />
        ))}
      </div>
      {showText && displayText && (
        <p
          className={`mt-2 font-medium text-gray-400 ${sizeConfig[size].text}`}
          style={{
            background: 'linear-gradient(90deg, #ff66c4, #ffde59)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {displayText}
        </p>
      )}
    </div>
  )
}

export default HalogramLoading
