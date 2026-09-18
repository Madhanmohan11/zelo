import React, { useState, useEffect, useRef } from 'react'
import { ZoomIn, ZoomOut, RotateCcw, Check, X, Move, Loader2 } from 'lucide-react'
import { Button } from './Button'

export const ImageCropModal = ({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
  isLoading = false
}) => {
  const containerRef = useRef(null)
  const imageRef = useRef(null)

  const [imgElement, setImgElement] = useState(null)
  const [zoom, setZoom] = useState(1.0)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isProcessing, setIsProcessing] = useState(false)

  // Container dimensions
  const CONTAINER_SIZE = 300 // 300px x 300px box
  const CROP_DIAMETER = 240 // 240px circular cutout

  // Load image element whenever imageSrc changes
  useEffect(() => {
    if (!imageSrc || !isOpen) {
      setImgElement(null)
      return
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = typeof imageSrc === 'string' ? imageSrc : URL.createObjectURL(imageSrc)

    img.onload = () => {
      setImgElement(img)
      setZoom(1.0)
      setOffset({ x: 0, y: 0 })
    }

    img.onerror = (err) => {
      console.error('Failed to load image for cropping:', err)
    }

    return () => {
      if (typeof imageSrc !== 'string' && img.src.startsWith('blob:')) {
        URL.revokeObjectURL(img.src)
      }
    }
  }, [imageSrc, isOpen])

  // Calculate base scale to ensure image covers crop diameter
  let baseScale = 1.0
  let imgWidth = 300
  let imgHeight = 300

  if (imgElement) {
    imgWidth = imgElement.naturalWidth || imgElement.width || 300
    imgHeight = imgElement.naturalHeight || imgElement.height || 300
    baseScale = Math.max(CROP_DIAMETER / imgWidth, CROP_DIAMETER / imgHeight)
  }

  const currentScale = baseScale * zoom
  const dispWidth = imgWidth * currentScale
  const dispHeight = imgHeight * currentScale

  // Constrain offsets so image always covers circular crop box
  const maxOffsetX = Math.max(0, (dispWidth - CROP_DIAMETER) / 2)
  const maxOffsetY = Math.max(0, (dispHeight - CROP_DIAMETER) / 2)

  const clampedX = Math.min(maxOffsetX, Math.max(-maxOffsetX, offset.x))
  const clampedY = Math.min(maxOffsetY, Math.max(-maxOffsetY, offset.y))

  // Mouse & Touch Drag Handlers
  const handlePointerDown = (e) => {
    if (!imgElement) return
    setIsDragging(true)
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    setDragStart({ x: clientX - clampedX, y: clientY - clampedY })
  }

  const handlePointerMove = (e) => {
    if (!isDragging) return
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const newX = clientX - dragStart.x
    const newY = clientY - dragStart.y
    setOffset({ x: newX, y: newY })
  }

  const handlePointerUp = () => {
    setIsDragging(false)
  }

  // Wheel Zoom Handler
  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY < 0 ? 0.1 : -0.1
    setZoom((prev) => Math.min(3.0, Math.max(1.0, parseFloat((prev + delta).toFixed(2)))))
  }

  // Reset Adjustments
  const handleReset = () => {
    setZoom(1.0)
    setOffset({ x: 0, y: 0 })
  }

  // Crop & Export to WebP Blob (512x512 output)
  const handleApplyCrop = async () => {
    if (!imgElement) return
    setIsProcessing(true)

    try {
      // Calculate crop box in natural image pixel coordinates
      const imgXInDisp = (dispWidth - CROP_DIAMETER) / 2 - clampedX
      const imgYInDisp = (dispHeight - CROP_DIAMETER) / 2 - clampedY

      const cropX = imgXInDisp / currentScale
      const cropY = imgYInDisp / currentScale
      const cropSize = CROP_DIAMETER / currentScale

      const canvas = document.createElement('canvas')
      canvas.width = 512
      canvas.height = 512
      const ctx = canvas.getContext('2d')

      // Draw high-quality cropped area onto 512x512 output canvas
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(
        imgElement,
        cropX,
        cropY,
        cropSize,
        cropSize,
        0,
        0,
        512,
        512
      )

      canvas.toBlob(
        async (blob) => {
          if (blob) {
            await onCropComplete(blob)
          } else {
            console.error('Canvas blob conversion failed')
          }
          setIsProcessing(false)
        },
        'image/webp',
        0.9
      )
    } catch (err) {
      console.error('Failed to process cropped avatar:', err)
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Crop Profile Photo</h3>
            <p className="text-xs font-semibold text-slate-500">Drag to center face & adjust zoom</p>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing || isLoading}
            className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Interactive Canvas Area */}
        <div className="p-6 flex flex-col items-center gap-5 bg-slate-950">
          <div
            ref={containerRef}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
            onWheel={handleWheel}
            style={{ width: CONTAINER_SIZE, height: CONTAINER_SIZE }}
            className="relative rounded-2xl overflow-hidden select-none touch-none cursor-grab active:cursor-grabbing border border-slate-800 flex items-center justify-center shadow-inner"
          >
            {/* Display Image */}
            {imgElement && (
              <img
                ref={imageRef}
                src={imgElement.src}
                alt="Crop preview"
                draggable={false}
                style={{
                  width: dispWidth,
                  height: dispHeight,
                  maxWidth: 'none',
                  maxHeight: 'none',
                  transform: `translate(${clampedX}px, ${clampedY}px)`,
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                }}
                className="absolute object-cover pointer-events-none"
              />
            )}

            {/* Circular Mask Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Outer Darkened Mask with Circular Cutout */}
              <div
                style={{
                  width: CONTAINER_SIZE,
                  height: CONTAINER_SIZE,
                  boxShadow: `0 0 0 9999px rgba(15, 23, 42, 0.75)`
                }}
                className="absolute rounded-full border-2 border-emerald-400/90 shadow-lg"
              />

              {/* Center Drag Icon Hint */}
              {!isDragging && zoom === 1.0 && offset.x === 0 && offset.y === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-slate-900/70 text-white/90 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-xs flex items-center gap-1.5 shadow-md border border-white/20">
                    <Move className="w-3.5 h-3.5 text-emerald-400" /> Pan & Zoom Face
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Zoom & Adjustment Controls */}
          <div className="w-full space-y-3 px-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setZoom((prev) => Math.max(1.0, parseFloat((prev - 0.2).toFixed(1))))}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />

              <button
                type="button"
                onClick={() => setZoom((prev) => Math.min(3.0, parseFloat((prev + 0.2).toFixed(1))))}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
                title="Reset Position"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isProcessing || isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={isProcessing || isLoading ? Loader2 : Check}
            isLoading={isProcessing || isLoading}
            onClick={handleApplyCrop}
            className="flex-1"
          >
            Save Photo
          </Button>
        </div>
      </div>
    </div>
  )
}
