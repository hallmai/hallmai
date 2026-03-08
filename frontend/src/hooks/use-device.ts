"use client"

import { useEffect, useMemo, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

function getOrCreateDeviceUuid(): string {
  const stored = localStorage.getItem('seniorDeviceUuid')
  if (stored) return stored
  const uuid = uuidv4()
  localStorage.setItem('seniorDeviceUuid', uuid)
  return uuid
}

export function useDevice() {
  const [loading, setLoading] = useState(true)
  const deviceUuid = useMemo(() => {
    if (typeof window === 'undefined') return null
    return getOrCreateDeviceUuid()
  }, [])

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
