import { type Request, type Response, type NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET ?? 'wolves-secret'

export type AuthPayload = {
  sub: number
  email: string
  iat?: number
  exp?: number
}

type AuthenticatedRequest = Request & {
  user?: AuthPayload
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token não fornecido' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    if (typeof payload === 'string' || !payload.sub || !payload.email) {
      return res.status(401).json({ message: 'Token inválido' })
    }

    ;(req as AuthenticatedRequest).user = {
      sub: Number(payload.sub),
      email: payload.email as string,
      iat: payload.iat,
      exp: payload.exp,
    }

    return next()
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido ou expirado' })
  }
}
