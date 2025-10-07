import React from 'react'

interface ChatMateIconProps {
  className?: string
  size?: number
}

export function ChatMateIcon({ className = "", size = 32 }: ChatMateIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 24C8 20.6863 10.6863 18 14 18H18C21.3137 18 24 20.6863 24 24V26C24 26.5523 23.5523 27 23 27H15C11.6863 27 9 24.3137 9 20.5V8C9 5.23858 11.2386 3 14 3H18C20.7614 3 23 5.23858 23 8V10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Chat bubble tail */}
      <path
        d="M21 24L23 26L21 28"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

