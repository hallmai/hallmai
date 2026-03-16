"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  VoiceClient,
  type VoiceState,
  type YoutubePlayData
} from '@/lib/voice-client'

export function useVoice(deviceUuid: string | null) {
  const [state, setState] = useState<VoiceState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [silenceWarning, setSilenceWarning] = useState(false)
  const [youtubeVideo, setYoutubeVideo] = useState<{
    videoId: string
    title: string
  } | null>(null)
  const volumeRef = useRef(0)
  const clientRef = useRef<VoiceClient | null>(null)
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resumeFromRef = useRef<number | null>(null)

  useEffect(() => {
    const client = new VoiceClient({
      onStateChange: setState,
      onError: (msg) => {
        setError(msg)
        if (errorTimerRef.current) clearTimeout(errorTimerRef.current)
        errorTimerRef.current = setTimeout(() => setError(null), 3000)
      },
      onVolume: (level) => {
        volumeRef.current = level
      },
      onToolActivity: (data) => {
        console.debug('[voice] tool_activity', data)
      },
      onSilenceWarning: () => {
        setSilenceWarning(true)
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
        silenceTimerRef.current = setTimeout(() => setSilenceWarning(false), 5000)
      },
      onYoutubePlay: (data: YoutubePlayData) => {
        setYoutubeVideo({ videoId: data.videoId, title: data.title })
        resumeFromRef.current = data.conversationId
        client.disconnect()
      },
    })
    clientRef.current = client

    return () => {
      client.disconnect()
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current)
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
    }
  }, [])

  const start = useCallback(
    async (options?: {
      resumeFrom?: number
      photoBase64?: string
      photoMimeType?: string
    }) => {
      if (!deviceUuid) return
      setError(null)
      setSilenceWarning(false)
      await clientRef.current?.connect(deviceUuid, options)
    },
    [deviceUuid]
  )

  const stop = useCallback(async () => {
    await clientRef.current?.disconnect()
  }, [])

  const interrupt = useCallback(() => {
    clientRef.current?.interrupt()
  }, [])

  const triggerHotkey = useCallback((prompt: string) => {
    clientRef.current?.sendHotkey(prompt)
  }, [])

  const closeYoutube = useCallback(async () => {
    setYoutubeVideo(null)
    const resumeId = resumeFromRef.current
    resumeFromRef.current = null
    // Wait for disconnect to fully complete before reconnecting
    await clientRef.current?.disconnect()
    await start({ resumeFrom: resumeId ?? undefined })
  }, [start])

  return { state, error, silenceWarning, volumeRef, youtubeVideo, start, stop, interrupt, closeYoutube, triggerHotkey }
}
