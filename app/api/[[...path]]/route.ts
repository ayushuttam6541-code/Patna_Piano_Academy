import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import Razorpay from 'razorpay'
import db from '../../lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface RazorpayOrder {
  id: string
  amount: number
  currency: string
  receipt: string
  notes: Record<string, string>
}

// ---------- Razorpay ----------
const RZP_KEY = process.env.RAZORPAY_KEY_ID || ''
const RZP_SECRET = process.env.RAZORPAY_KEY_SECRET || ''
const RZP_MOCK = !RZP_KEY || RZP_KEY.includes('placeholder') || !RZP_SECRET || RZP_SECRET.includes('placeholder')

let rzp: any = null
if (!RZP_MOCK) {
  try { rzp = new Razorpay({ key_id: RZP_KEY, key_secret: RZP_SECRET }) } catch (e) { console.error('RZP init error', e) }
}

// ---------- Auth helpers ----------
const JWT_SECRET = process.env.JWT_SECRET || 'change_me'

function sign(user: any) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '30d' })
}

function getUser(request: Request) {
  const auth = request.headers.get('authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return null
  try { return jwt.verify(token, JWT_SECRET) as any } catch { return null }
}

function ok(data: any, status = 200) { return NextResponse.json(data, { status }) }
function fail(msg: string, status = 400) { return NextResponse.json({ error: msg }, { status }) }

// ---------- Seed classes and admin ----------
const DEFAULT_CLASSES = [
  { name: 'Beginner Piano', description: 'Learn piano fundamentals, notes, chords, rhythm and simple songs.', price: 500, duration: 45, availableModes: ['ONLINE', 'OFFLINE'], isActive: true, level: 'Beginner', emoji: '🎹' },
  { name: 'Kids Piano', description: 'Fun and engaging piano lessons specially designed for children.', price: 500, duration: 40, availableModes: ['ONLINE', 'OFFLINE'], isActive: true, level: 'Kids', emoji: '🎈' },
  { name: 'Intermediate Piano', description: 'Improve scales, chords, technique, sight reading and musical expression.', price: 700, duration: 60, availableModes: ['ONLINE', 'OFFLINE'], isActive: true, level: 'Intermediate', emoji: '🎼' },
  { name: 'Private One-to-One', description: 'Completely personalized lessons focused on your individual musical goals.', price: 800, duration: 60, availableModes: ['ONLINE', 'OFFLINE'], isActive: true, level: 'Personalized', emoji: '⭐' },
  { name: 'Online Piano', description: 'Live personalized piano lessons streamed to your home.', price: 500, duration: 45, availableModes: ['ONLINE'], isActive: true, level: 'All Levels', emoji: '🖥️' },
  { name: 'Offline Piano — Patna', description: 'Face-to-face personalized piano training at our studio in Patna.', price: 700, duration: 60, availableModes: ['OFFLINE'], isActive: true, level: 'All Levels', emoji: '📍' },
]

async function ensureSeed() {
  const database = await db()
  const classes = database.collection('classes')
  const users = database.collection('users')

  const count = await classes.countDocuments()
  if (count === 0) {
    const now = new Date()
    await classes.insertMany(DEFAULT_CLASSES.map(c => ({ ...c, id: uuidv4(), createdAt: now })))
  }

  const adminEmail = (process.env.ADMIN_EMAIL || 'maharajmanish16@gmail.com').toLowerCase()
  const existingAdmin = await users.findOne({ email: adminEmail })
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 10)
    await users.insertOne({
      id: uuidv4(),
      name: 'Piano Teacher',
      email: adminEmail,
      phone: process.env.NEXT_PUBLIC_TEACHER_PHONE || '7004695064',
      passwordHash,
      role: 'ADMIN',
      createdAt: new Date(),
    })
  }
}

// ---------- Router ----------
async function handle(request: Request, method: string) {
  await ensureSeed()

  const url = new URL(request.url)
  const parts = url.pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean)
  const [r0, r1, r2] = parts
  const database = await db()

  // Health
  if (method === 'GET' && r0 === 'health') return ok({ ok: true, mock: RZP_MOCK })

  // -------- Auth --------
  if (method === 'POST' && r0 === 'auth' && r1 === 'signup') {
    const body = await request.json()
    const { name, email, phone, password } = body || {}
    if (!name || !email || !phone || !password) return fail('All fields are required')
    const users = database.collection('users')
    const existing = await users.findOne({ email: email.toLowerCase() })
    if (existing) return fail('Email already registered', 409)
    const passwordHash = await bcrypt.hash(password, 10)
    const user = { id: uuidv4(), name, email: email.toLowerCase(), phone, passwordHash, role: 'STUDENT', createdAt: new Date() }
    await users.insertOne(user)
    const token = sign(user)
    return ok({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } })
  }

  if (method === 'POST' && r0 === 'auth' && r1 === 'login') {
    const body = await request.json()
    const { email, password } = body || {}
    if (!email || !password) return fail('Email and password required')
    const users = database.collection('users')
    const user = await users.findOne({ email: (email || '').toLowerCase() })
    if (!user) return fail('Invalid credentials', 401)
    const okPass = await bcrypt.compare(password, user.passwordHash)
    if (!okPass) return fail('Invalid credentials', 401)
    const token = sign(user)
    return ok({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } })
  }

  if (method === 'GET' && r0 === 'auth' && r1 === 'me') {
    const u = getUser(request)
    if (!u) return fail('Unauthorized', 401)
    const users = database.collection('users')
    const user = await users.findOne({ id: (u as any).id })
    if (!user) return fail('Unauthorized', 401)
    return ok({ user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, createdAt: user.createdAt } })
  }

  if (method === 'PUT' && r0 === 'auth' && r1 === 'profile') {
    const u = getUser(request)
    if (!u) return fail('Unauthorized', 401)
    const body = await request.json()
    const { name, phone } = body || {}
    await database.collection('users').updateOne({ id: (u as any).id }, { $set: { name, phone } })
    return ok({ ok: true })
  }

  // -------- Classes --------
  if (method === 'GET' && r0 === 'classes') {
    const list = await database.collection('classes').find({}).sort({ price: 1 }).toArray()
    return ok({ classes: list.map(({ _id, ...c }) => c) })
  }

  if (method === 'POST' && r0 === 'classes') {
    const u = getUser(request); if (!u || (u as any).role !== 'ADMIN') return fail('Forbidden', 403)
    const body = await request.json()
    const c = { id: uuidv4(), createdAt: new Date(), isActive: true, ...body }
    await database.collection('classes').insertOne(c)
    return ok({ class: { ...c, _id: undefined } })
  }

  if (method === 'PUT' && r0 === 'classes' && r1) {
    const u = getUser(request); if (!u || (u as any).role !== 'ADMIN') return fail('Forbidden', 403)
    const body = await request.json()
    await database.collection('classes').updateOne({ id: r1 }, { $set: body })
    return ok({ ok: true })
  }

  if (method === 'DELETE' && r0 === 'classes' && r1) {
    const u = getUser(request); if (!u || (u as any).role !== 'ADMIN') return fail('Forbidden', 403)
    await database.collection('classes').deleteOne({ id: r1 })
    return ok({ ok: true })
  }

  // -------- Bookings --------
  if (method === 'POST' && r0 === 'bookings' && r1 === 'create-order') {
    const u = getUser(request); if (!u) return fail('Please login to book a class', 401)
    const body = await request.json()
    const { classId, mode, date, time, age, message, phone } = body || {}
    if (!classId || !mode || !date || !time) return fail('Missing booking fields')
    const cls = await database.collection('classes').findOne({ id: classId })
    if (!cls) return fail('Class not found', 404)
    if (!cls.availableModes.includes(mode)) return fail('Selected mode not available for this class')

    const amount = cls.price
    const amountPaise = amount * 100
    const bookingId = uuidv4()

    let orderId, keyId
    if (RZP_MOCK) {
      orderId = 'order_mock_' + crypto.randomBytes(8).toString('hex')
      keyId = 'rzp_test_mock'
    } else {
      const order = await rzp.orders.create({
        amount: amountPaise,
        currency: 'INR',
        receipt: 'ppa_' + bookingId.slice(0, 20),
        notes: { bookingId, classId, userId: u.id },
      } as any)
      orderId = order.id
      keyId = RZP_KEY
    }

    const booking = {
      id: bookingId,
      userId: u.id,
      userName: u.name,
      userEmail: u.email,
      userPhone: phone || '',
      age: age || '',
      studentMessage: message || '',
      classId,
      className: cls.name,
      classEmoji: cls.emoji,
      mode,
      date,
      time,
      amount,
      razorpayOrderId: orderId,
      razorpayPaymentId: null,
      razorpaySignature: null,
      paymentStatus: 'PENDING',
      bookingStatus: 'PENDING',
      createdAt: new Date(),
    }
    await database.collection('bookings').insertOne(booking)
    return ok({ bookingId, orderId, amount: amountPaise, currency: 'INR', keyId, mock: RZP_MOCK, className: cls.name })
  }

  if (method === 'POST' && r0 === 'bookings' && r1 === 'verify') {
    const u = getUser(request); if (!u) return fail('Unauthorized', 401)
    const body = await request.json()
    const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body || {}
    if (!bookingId) return fail('Missing bookingId')
    const bookings = database.collection('bookings')
    const bk = await bookings.findOne({ id: bookingId, userId: u.id })
    if (!bk) return fail('Booking not found', 404)

    if (RZP_MOCK) {
      await bookings.updateOne({ id: bookingId }, { $set: {
        paymentStatus: 'PAID',
        bookingStatus: 'CONFIRMED',
        razorpayPaymentId: 'pay_mock_' + crypto.randomBytes(8).toString('hex'),
        razorpaySignature: 'mock_signature',
        paidAt: new Date(),
      } })
      const updated = await bookings.findOne({ id: bookingId })
      if (!updated) return fail('Booking not found', 404)
      const { _id, ...clean } = updated as any
      return ok({ booking: clean, mock: true })
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return fail('Incomplete payment response')
    const payload = `${bk.razorpayOrderId}|${razorpay_payment_id}`
    const expected = crypto.createHmac('sha256', RZP_SECRET).update(payload).digest('hex')
    const a = Buffer.from(expected, 'hex')
    const b = Buffer.from(razorpay_signature, 'hex')
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return fail('Signature verification failed', 400)
    await bookings.updateOne({ id: bookingId }, { $set: {
      paymentStatus: 'PAID',
      bookingStatus: 'CONFIRMED',
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paidAt: new Date(),
    } })
    const updated = await bookings.findOne({ id: bookingId })
    if (!updated) return fail('Booking not found', 404)
    const { _id, ...clean } = updated as any
    return ok({ booking: clean })
  }

  if (method === 'GET' && r0 === 'bookings' && r1 === 'mine') {
    const u = getUser(request); if (!u) return fail('Unauthorized', 401)
    const list = await database.collection('bookings').find({ userId: u.id }).sort({ createdAt: -1 }).toArray()
    return ok({ bookings: list.map(({ _id, ...b }) => b) })
  }

  if (method === 'GET' && r0 === 'bookings' && r1 === 'all') {
    const u = getUser(request); if (!u || (u as any).role !== 'ADMIN') return fail('Forbidden', 403)
    const list = await database.collection('bookings').find({}).sort({ createdAt: -1 }).toArray()
    return ok({ bookings: list.map(({ _id, ...b }) => b) })
  }

  if (method === 'PUT' && r0 === 'bookings' && r1 && r2 === 'status') {
    const u = getUser(request); if (!u || (u as any).role !== 'ADMIN') return fail('Forbidden', 403)
    const body = await request.json()
    const { status } = body || {}
    if (!['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].includes(status)) return fail('Invalid status')
    await database.collection('bookings').updateOne({ id: r1 }, { $set: { bookingStatus: status } })
    return ok({ ok: true })
  }

  if (method === 'PUT' && r0 === 'bookings' && r1 && r2 === 'cancel') {
    const u = getUser(request); if (!u) return fail('Unauthorized', 401)
    const bk = await database.collection('bookings').findOne({ id: r1 })
    if (!bk || bk.userId !== u.id) return fail('Booking not found', 404)
    await database.collection('bookings').updateOne({ id: r1 }, { $set: { bookingStatus: 'CANCELLED' } })
    return ok({ ok: true })
  }

  // -------- Admin stats & students --------
  if (method === 'GET' && r0 === 'admin' && r1 === 'stats') {
    const u = getUser(request); if (!u || (u as any).role !== 'ADMIN') return fail('Forbidden', 403)
    const bookings = database.collection('bookings')
    const users = database.collection('users')
    const [totalStudents, totalBookings, pending, confirmed, paid] = await Promise.all([
      users.countDocuments({ role: 'STUDENT' }),
      bookings.countDocuments(),
      bookings.countDocuments({ bookingStatus: 'PENDING' }),
      bookings.countDocuments({ bookingStatus: 'CONFIRMED' }),
      bookings.find({ paymentStatus: 'PAID' }).toArray(),
    ])
    const revenue = paid.reduce((s: number, b: any) => s + (b.amount || 0), 0)
    const days: any = {}
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const k = d.toISOString().slice(0, 10)
      days[k] = 0
    }
    paid.forEach((b: any) => {
      const k = new Date(b.createdAt).toISOString().slice(0, 10)
      if (k in days) days[k] += b.amount || 0
    })
    return ok({
      totalStudents, totalBookings, pending, confirmed,
      revenue,
      chart: Object.entries(days).map(([date, amount]) => ({ date, amount })),
    })
  }

  if (method === 'GET' && r0 === 'admin' && r1 === 'students') {
    const u = getUser(request); if (!u || (u as any).role !== 'ADMIN') return fail('Forbidden', 403)
    const users = await database.collection('users').find({ role: 'STUDENT' }).sort({ createdAt: -1 }).toArray()
    const bookings = await database.collection('bookings').find({}).toArray()
    const list = users.map(({ passwordHash, _id, ...u }: any) => {
      const mine = bookings.filter((b: any) => b.userId === u.id)
      return {
        ...u,
        totalBookings: mine.length,
        totalSpent: mine.filter((b: any) => b.paymentStatus === 'PAID').reduce((s: number, b: any) => s + (b.amount || 0), 0),
      }
    })
    return ok({ students: list })
  }

  // -------- Contact --------
  if (method === 'POST' && r0 === 'contact') {
    const body = await request.json()
    const { name, email, phone, message } = body || {}
    if (!name || !email || !message) return fail('Missing required fields')
    await database.collection('contact_messages').insertOne({ id: uuidv4(), name, email, phone: phone || '', message, createdAt: new Date() })
    return ok({ ok: true })
  }

  return fail('Not found', 404)
}

export async function GET(request: Request) { try { return await handle(request, 'GET') } catch (e) { console.error(e); return fail('Server error', 500) } }
export async function POST(request: Request) { try { return await handle(request, 'POST') } catch (e) { console.error(e); return fail('Server error', 500) } }
export async function PUT(request: Request) { try { return await handle(request, 'PUT') } catch (e) { console.error(e); return fail('Server error', 500) } }
export async function DELETE(request: Request) { try { return await handle(request, 'DELETE') } catch (e) { console.error(e); return fail('Server error', 500) } }