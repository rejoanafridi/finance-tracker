import type { Server as NetServer } from "http"
import { Server as SocketIOServer } from "socket.io"
import type { NextApiRequest } from "next"
import type { NextApiResponse } from "next"
import { getToken } from "next-auth/jwt"

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function SocketHandler(req: NextApiRequest, res: NextApiResponse) {
  if (res.socket.server.io) {
    console.log("Socket is already running")
    res.end()
    return
  }

  const httpServer: NetServer = res.socket.server as any
  const io = new SocketIOServer(httpServer, {
    path: "/api/socket",
    addTrailingSlash: false,
  })

  // Authentication middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) {
      return next(new Error("Authentication error"))
    }

    try {
      const user = await getToken({ req: { headers: { cookie: `next-auth.session-token=${token}` } } as any })
      if (!user) {
        return next(new Error("Authentication error"))
      }
      socket.data.user = user
      next()
    } catch (error) {
      next(new Error("Authentication error"))
    }
  })

  // Socket events
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`)

    // Join user-specific room
    const userId = socket.data.user.id
    socket.join(`user:${userId}`)

    // Handle transaction events
    socket.on("transaction:create", (data) => {
      socket.to(`user:${userId}`).emit("transaction:created", data)
    })

    socket.on("transaction:update", (data) => {
      socket.to(`user:${userId}`).emit("transaction:updated", data)
    })

    socket.on("transaction:delete", (data) => {
      socket.to(`user:${userId}`).emit("transaction:deleted", data)
    })

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`)
    })
  })

  res.socket.server.io = io
  console.log("Socket server initialized")
  res.end()
}
