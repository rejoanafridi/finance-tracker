"use client"

import { useEffect, useState } from "react"
import { io, type Socket } from "socket.io-client"
import { useSession } from "next-auth/react"

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    if (!session?.user) return

    // Initialize socket connection
    const socketInit = async () => {
      await fetch("/api/socket")

      const newSocket = io({
        path: "/api/socket",
        auth: {
          token: session.user.token,
        },
      })

      newSocket.on("connect", () => {
        console.log("Socket connected")
        setIsConnected(true)
      })

      newSocket.on("disconnect", () => {
        console.log("Socket disconnected")
        setIsConnected(false)
      })

      setSocket(newSocket)

      return () => {
        newSocket.disconnect()
      }
    }

    const socketCleanup = socketInit()

    return () => {
      socketCleanup.then((cleanup) => {
        if (cleanup) cleanup()
      })
    }
  }, [session])

  return { socket, isConnected }
}
