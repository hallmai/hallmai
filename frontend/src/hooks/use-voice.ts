"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import { VoiceClient, type VoiceState } from '@/lib/voice-client'

export function useVoice(deviceUuid: string | null) {
  const [state, setState] = useState<VoiceState>('idle')
  const [error, setError] = useState<string | null>(null)
  const clientRef = useRef<VoiceClient | null>(null)

  useEffect(() => {
    const client = new VoiceClient({
      onStateChange: setState,
      onError: (msg) => setError(msg),
    })
    clientRef.current = client

    return () => {
      client.disconnect()
    }
  }, [])

  const start = useCallback(async () => {
    if (!deviceUuid) return
    setError(null)
    await clientRef.current?.connect(deviceUuid)
  }, [deviceUuid])

  const stop = useCallback(async () => {
    await clientRef.current?.disconnect()
  }, [])

  return { state, error, start, stop }
}
