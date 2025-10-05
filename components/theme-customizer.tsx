"use client"

import { useState, useEffect } from "react"

export function ThemeCustomizer() {
  const [isOpen, setIsOpen] = useState(false)
  const [bgColor, setBgColor] = useState("#000000")
  const [accentColor, setAccentColor] = useState("#FF9100")

  useEffect(() => {
    // Load from localStorage
    const savedBg = localStorage.getItem("theme-bg")
    const savedAccent = localStorage.getItem("theme-accent")

    if (savedBg) {
      setBgColor(savedBg)
      document.documentElement.style.setProperty("--bg", savedBg)
    }
    if (savedAccent) {
      setAccentColor(savedAccent)
      document.documentElement.style.setProperty("--accent", savedAccent)
    }
  }, [])

  const handleBgChange = (color: string) => {
    setBgColor(color)
    document.documentElement.style.setProperty("--bg", color)
    localStorage.setItem("theme-bg", color)
  }

  const handleAccentChange = (color: string) => {
    setAccentColor(color)
    document.documentElement.style.setProperty("--accent", color)
    localStorage.setItem("theme-accent", color)
  }

  const resetToDefaults = () => {
    const defaultBg = "#000000"
    const defaultAccent = "#FF9100"

    setBgColor(defaultBg)
    setAccentColor(defaultAccent)
    document.documentElement.style.setProperty("--bg", defaultBg)
    document.documentElement.style.setProperty("--accent", defaultAccent)
    localStorage.setItem("theme-bg", defaultBg)
    localStorage.setItem("theme-accent", defaultAccent)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`bg-card border border-border rounded-lg shadow-lg mb-2 transition-all ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`}
      >
        <div className="p-4 space-y-4 w-64">
          <div>
            <label className="block text-sm font-medium mb-2">Background Color</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => handleBgChange(e.target.value)}
                className="w-12 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={bgColor}
                onChange={(e) => handleBgChange(e.target.value)}
                className="flex-1 px-3 py-2 bg-background border border-border rounded text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Accent Color</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => handleAccentChange(e.target.value)}
                className="w-12 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={accentColor}
                onChange={(e) => handleAccentChange(e.target.value)}
                className="flex-1 px-3 py-2 bg-background border border-border rounded text-sm font-mono"
              />
            </div>
          </div>

          <button
            onClick={resetToDefaults}
            className="w-full px-3 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded transition-colors"
          >
            Reset to Defaults
          </button>
        </div>
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-card border border-border rounded-lg shadow-lg hover:bg-card/80 transition-colors text-sm font-medium"
      >
        {isOpen ? "Close" : "Theme"}
      </button>
    </div>
  )
}
