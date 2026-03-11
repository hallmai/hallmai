"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import { VoiceClient, type VoiceState } from '@/lib/voice-client'

export function useVoice(deviceUuid: string | null) {
  const [state, setState] = useState<VoiceState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [silenceWarning, setSilenceWarning] = useState(false)
  const clientRef = useRef<VoiceClient | null>(null)
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const client = new VoiceClient({
      onStateChange: setState,
      onError: (msg) => {
        setError(msg)
        if (errorTimerRef.current) clearTimeout(errorTimerRef.current)
        errorTimerRef.current = setTimeout(() => setError(null), 3000)
      },
      onSilenceWarning: () => {
        setSilenceWarning(true)
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
        silenceTimerRef.current = setTimeout(() => setSilenceWarning(false), 5000)
      },
    })
    clientRef.current = client

    return () => {
      client.disconnect()
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current)
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
    }
  }, [])

  const start = useCallback(async () => {
    if (!deviceUuid) return
    setError(null)
    setSilenceWarning(false)
    await clientRef.current?.connect(deviceUuid)
  }, [deviceUuid])

  const stop = useCallback(async () => {
    await clientRef.current?.disconnect()
  }, [])

  return { state, error, silenceWarning, start, stop }
}
