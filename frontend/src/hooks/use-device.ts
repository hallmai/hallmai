"use client"

import { useSyncExternalStore, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { API_URL } from '@/lib/config'

interface DeviceRegisterResponse {
  data:
    | { linked: true; nickname: string | null; linkedAt: string }
    | { linked: false; code: string; expiresAt: string }
}

function getOrCreateDeviceUuid(): string {
  const stored = localStorage.getItem('seniorDeviceUuid')
  if (stored) return stored
  const uuid = uuidv4()
  localStorage.setItem('seniorDeviceUuid', uuid)
  return uuid
}

function getDeviceUuidSnapshot(): string | null {
  if (typeof window === 'undefined') return null
  return getOrCreateDeviceUuid()
}

function getServerSnapshot(): string | null {
  return null
}

function subscribe(): () => void {
  return () => {}
}

export function useDevice() {
  const [loading, setLoading] = useState(true)
  const [linkCode, setLinkCode] = useState<string | null>(null)
  const [linked, setLinked] = useState(false)
  const deviceUuid = useSyncExternalStore(subscribe, getDeviceUuidSnapshot, getServerSnapshot)

  useEffect(() => {
    if (!deviceUuid) return
    let timer: ReturnType<typeof setTimeout> | null = null
    let cancelled = false

    const fetchCode = () => {
      fetch(`${API_URL}/api/device/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceUuid }),
      })
        .then((res) => res.json())
        .then((json: DeviceRegisterResponse) => {
          if (cancelled) return
          if (json.data.linked) {
            setLinked(true)
            setLinkCode(null)
          } else {
            setLinked(false)
            setLinkCode(json.data.code)
            const ms = new Date(json.data.expiresAt).getTime() - Date.now() - 60_000
            timer = setTimeout(fetchCode, Math.max(ms || 10_000, 10_000))
          }
          setLoading(false)
        })
        .catch(() => {
          if (!cancelled) {
            setLoading(false)
            timer = setTimeout(fetchCode, 30_000)
          }
        })
    }

    fetchCode()

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [deviceUuid])

  return { deviceUuid, linkCode, linked, loading }
}
