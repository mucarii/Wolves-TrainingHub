import { Router } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { findUserByEmail } from '../repositories/userRepository'

const router = Router()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
})

const JWT_SECRET = process.env.JWT_SECRET ?? 'wolves-secret'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1d'

router.post('/login', (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Credenciais inválidas' })
    return
  }

  const user = findUserByEmail(parsed.data.email)
  if (!user) {
    res.status(401).json({ message: 'Email ou senha incorretos' })
    return
  }

  const passwordMatches = bcrypt.compareSync(parsed.data.password, user.password_hash)
  if (!passwordMatches) {
    res.status(401).json({ message: 'Email ou senha incorretos' })
    return
  }

  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    },
  )

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  })
})

export default router
