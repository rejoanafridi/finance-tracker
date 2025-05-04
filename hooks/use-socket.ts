"use client"

import { useEffect, useState } from "react"
import { io, type Socket } from "socket.io-client"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    if (!session?.user) return

    // Initialize socket connection
    const socketInit = async () => {
      try {
        await fetch("/api/socket")

        const newSocket = io({
          path: "/api/socket",
          auth: {
            token: session.user.token,
          },
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
        })

        newSocket.on("connect", () => {
          console.log("Socket connected")
          setIsConnected(true)
        })

        newSocket.on("disconnect", () => {
          console.log("Socket disconnected")
          setIsConnected(false)
        })

        newSocket.on("connect_error", (err) => {
          console.error("Socket connection error:", err)
          toast.error("Real-time connection failed. Some features may be limited.")
        })

        setSocket(newSocket)

        return () => {
          newSocket.disconnect()
        }
      } catch (error) {
        console.error("Socket initialization error:", error)
        toast.error("Failed to initialize real-time connection")
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
