import { useState, type ImgHTMLAttributes } from 'react'

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
    src: string
    alt?: string
    className?: string
    wrapperClassName?: string
}

const LazyImage = ({
    src,
    alt = 'image',
    className = '',
    wrapperClassName = 'relative h-full w-full',
    onLoad,
    ...props
}: LazyImageProps) => {
    const [loaded, setLoaded] = useState(false)

    const handleLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
        setLoaded(true)
        onLoad?.(event)
    }

    return (
        <div className={wrapperClassName}>
            {!loaded && (
                <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700" />
            )}

            <img
                {...props}
                src={src}
                alt={alt}
                loading="lazy"
                decoding="async"
                onLoad={handleLoad}
                className={`h-full w-full object-cover transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`.trim()}
            />
        </div>
    )
}

export default LazyImage