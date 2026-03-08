"use client"

import { useSyncExternalStore, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { API_URL } from '@/lib/config'

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
  const deviceUuid = useSyncExternalStore(subscribe, getDeviceUuidSnapshot, getServerSnapshot)

  useEffect(() => {
    if (!deviceUuid) return

    fetch(`${API_URL}/api/device/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceUuid }),
    })
      .then((res) => res.json())
      .then(() => setLoading(false))
      .catch(() => setLoading(false))
  }, [deviceUuid])

  return { deviceUuid, loading }
}
