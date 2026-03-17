import { Capacitor } from '@capacitor/core'

export interface CameraResult {
  base64: string
  mimeType: 'image/jpeg'
}

const MAX_WIDTH = 1024
const JPEG_QUALITY = 0.7

export async function capturePhoto(): Promise<CameraResult | null> {
  if (Capacitor.isNativePlatform()) {
    return captureNative()
  }
  return captureWeb()
}

async function captureNative(): Promise<CameraResult | null> {
  try {
    const { Camera, CameraResultType, CameraSource } = await import(
      '@capacitor/camera'
    )
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
      quality: 70,
      width: MAX_WIDTH,
    })
    if (!photo.base64String) return null
    return { base64: photo.base64String, mimeType: 'image/jpeg' }
  } catch {
    // User cancelled or permission denied
    return null
  }
}

function captureWeb(): Promise<CameraResult | null> {
  return new Promise((resolve) => {
    let resolved = false
    const done = (result: CameraResult | null) => {
      if (resolved) return
      resolved = true
      clearTimeout(timer)
      input.remove()
      resolve(result)
    }

    // Fallback: resolve null after 60s if file dialog never completes
    const timer = setTimeout(() => done(null), 60_000)

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment'
    input.style.position = 'fixed'
    input.style.left = '-9999px'

    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) {
        done(null)
        return
      }
      try {
        const result = await compressImage(file)
        done(result)
      } catch {
        done(null)
      }
    }

    // Resolve immediately when user dismisses file picker without selecting
    input.addEventListener('cancel', () => done(null))

    // Append to DOM before clicking — iOS Safari ignores click() on
    // detached inputs, preventing the file picker from opening.
    document.body.appendChild(input)
    input.click()
  })
}

async function compressImage(file: File): Promise<CameraResult> {
  // createImageBitmap respects EXIF orientation, preventing rotated
  // photos on mobile devices (especially older Android WebViews).
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' })

  let width = bmp.width
  let height = bmp.height
  if (width > MAX_WIDTH) {
    height = Math.round((height * MAX_WIDTH) / width)
    width = MAX_WIDTH
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bmp.close()
    throw new Error('Canvas not supported')
  }
  ctx.drawImage(bmp, 0, 0, width, height)
  bmp.close()

  const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY)
  // Release canvas GPU memory on mobile
  canvas.width = 0
  canvas.height = 0
  const idx = dataUrl.indexOf(',')
  if (idx < 0) throw new Error('Invalid data URL')
  return { base64: dataUrl.substring(idx + 1), mimeType: 'image/jpeg' }
}
