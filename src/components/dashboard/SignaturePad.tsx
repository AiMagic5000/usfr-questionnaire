'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { X, RotateCcw, Check, Type, PenTool } from 'lucide-react'

interface SignaturePadProps {
  onComplete: (signature: string) => void
  onCancel: () => void
}

export function SignaturePad({ onComplete, onCancel }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [mode, setMode] = useState<'draw' | 'type'>('draw')
  const [typedName, setTypedName] = useState('')
  const [selectedFont, setSelectedFont] = useState(0)

  const fonts = [
    { name: 'Elegant', style: 'italic 48px "Brush Script MT", cursive' },
    { name: 'Classic', style: 'italic 42px Georgia, serif' },
    { name: 'Modern', style: '44px "Lucida Handwriting", cursive' },
    { name: 'Simple', style: 'italic 40px "Times New Roman", serif' },
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * 2
    canvas.height = rect.height * 2
    ctx.scale(2, 2)

    // Set drawing style
    ctx.strokeStyle = '#1a365d'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Fill white background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, rect.width, rect.height)
  }, [])

  const getPosition = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    let clientX, clientY

    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    }
  }, [])

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    setIsDrawing(true)
    const pos = getPosition(e)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
  }, [getPosition])

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    if (!isDrawing) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    const pos = getPosition(e)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    setHasSignature(true)
  }, [isDrawing, getPosition])

  const stopDrawing = useCallback(() => {
    setIsDrawing(false)
  }, [])

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return

    const rect = canvas.getBoundingClientRect()
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, rect.width, rect.height)
    setHasSignature(false)
  }

  const renderTypedSignature = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas || !typedName) return

    const rect = canvas.getBoundingClientRect()

    // Clear canvas
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Draw typed signature
    ctx.fillStyle = '#1a365d'
    ctx.font = fonts[selectedFont].style
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(typedName, rect.width / 2, rect.height / 2)

    setHasSignature(true)
  }

  useEffect(() => {
    if (mode === 'type' && typedName) {
      renderTypedSignature()
    }
  }, [typedName, selectedFont, mode])

  const handleComplete = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const signature = canvas.toDataURL('image/png')
    onComplete(signature)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-usfr-dark">Add Your Signature</h3>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex border-b">
          <button
            onClick={() => {
              setMode('draw')
              clearCanvas()
            }}
            className={`flex-1 py-3 flex items-center justify-center gap-2 font-medium transition-colors ${
              mode === 'draw'
                ? 'text-usfr-primary border-b-2 border-usfr-primary bg-usfr-primary/5'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <PenTool className="w-4 h-4" />
            Draw
          </button>
          <button
            onClick={() => {
              setMode('type')
              clearCanvas()
            }}
            className={`flex-1 py-3 flex items-center justify-center gap-2 font-medium transition-colors ${
              mode === 'type'
                ? 'text-usfr-primary border-b-2 border-usfr-primary bg-usfr-primary/5'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Type className="w-4 h-4" />
            Type
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {mode === 'type' && (
            <div className="mb-4 space-y-4">
              <input
                type="text"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="Type your full legal name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-usfr-secondary focus:border-transparent text-lg"
              />
              <div className="flex gap-2">
                {fonts.map((font, index) => (
                  <button
                    key={font.name}
                    onClick={() => setSelectedFont(index)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      selectedFont === index
                        ? 'bg-usfr-primary text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Signature Canvas */}
          <div className="relative">
            <canvas
              ref={canvasRef}
              className={`w-full h-48 sm:h-40 border-2 rounded-lg ${
                mode === 'draw' ? 'border-gray-300 cursor-crosshair' : 'border-gray-200'
              }`}
              style={{ touchAction: 'none' }}
              onMouseDown={mode === 'draw' ? startDrawing : undefined}
              onMouseMove={mode === 'draw' ? draw : undefined}
              onMouseUp={mode === 'draw' ? stopDrawing : undefined}
              onMouseLeave={mode === 'draw' ? stopDrawing : undefined}
              onTouchStart={mode === 'draw' ? startDrawing : undefined}
              onTouchMove={mode === 'draw' ? draw : undefined}
              onTouchEnd={mode === 'draw' ? stopDrawing : undefined}
              onTouchCancel={mode === 'draw' ? stopDrawing : undefined}
            />
            {mode === 'draw' && !hasSignature && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-gray-400">Draw your signature here</p>
              </div>
            )}
          </div>

          {/* Helper Text */}
          <p className="text-sm text-gray-500 mt-3 text-center">
            {mode === 'draw'
              ? 'Use your mouse or finger to sign'
              : 'Your typed name will appear as a signature'}
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 bg-gray-50 border-t">
          <button
            onClick={clearCanvas}
            className="flex-1 py-3 flex items-center justify-center gap-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            Clear
          </button>
          <button
            onClick={handleComplete}
            disabled={!hasSignature}
            className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-lg font-medium transition-colors ${
              hasSignature
                ? 'bg-usfr-accent text-white hover:bg-usfr-accent/90'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4" />
            Accept Signature
          </button>
        </div>

        {/* Legal Notice */}
        <div className="px-6 py-3 bg-blue-50 border-t border-blue-100">
          <p className="text-xs text-blue-700 text-center">
            By signing, you agree that this electronic signature is legally binding and equivalent to your handwritten signature.
          </p>
        </div>
      </div>
    </div>
  )
}
