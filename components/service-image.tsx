import Image from 'next/image'

interface ServiceImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

export function ServiceImage({ 
  src, 
  alt, 
  width = 400, 
  height = 300, 
  className = "",
  priority = false 
}: ServiceImageProps) {
  return (
    <div className={`relative ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className="rounded-lg object-cover"
        style={{
          backgroundColor: 'var(--bg)',
        }}
      />
    </div>
  )
}

