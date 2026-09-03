// @ts-nocheck
'use client'

import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { Textarea } from './components/ui/textarea'
import {
  Piano, Music, Music2, Music3, Music4, Menu, X, Star, Clock, MapPin, GraduationCap,
  Calendar, CreditCard, User as UserIcon, LogOut, Home as HomeIcon, BookOpen, History,
  CheckCircle2, Phone, MessageCircle, Mail, Instagram, Facebook, Youtube, ChevronRight,
  ChevronLeft, Award, Users as UsersIcon, TrendingUp, DollarSign, Sparkles,
  LayoutDashboard, ListChecks, Wallet, Settings, Plus, Trash2, Edit3, ArrowRight,
  Shield, HeartHandshake, Headphones, Monitor, Building2, ChevronDown, PlayCircle
} from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './components/ui/accordion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

// Type declaration for Razorpay
declare global {
  interface Window {
    Razorpay: any
  }
}

// ============ IMAGES ============
const IMG = {
  hero: 'https://images.unsplash.com/photo-1589666606904-b01a2b7f522a?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600',
  grand: 'https://images.unsplash.com/photo-1632008341003-5c6767c7d237?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
  studio: 'https://images.unsplash.com/photo-1512733596533-7b00ccf8ebaf?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
  teacher: 'https://images.unsplash.com/photo-1513883049090-d0b7439799bf?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000',
  lesson: 'https://images.unsplash.com/photo-1612016410921-264f6afed556?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
  classical: 'https://images.unsplash.com/photo-1552422535-c45813c61732?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
}

const WHATSAPP = process.env.NEXT_PUBLIC_TEACHER_WHATSAPP || '7004695064'
const PHONE = process.env.NEXT_PUBLIC_TEACHER_PHONE || '+917004695064'
const EMAIL = process.env.NEXT_PUBLIC_TEACHER_EMAIL || 'maharajmanish16@gmail.com'
const RZP_PUBLIC_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder'
const WA_MSG = encodeURIComponent('Hello, I found your piano classes website and I am interested in booking a piano class. Please share the available timings.')
const WA_URL = `https://wa.me/${WHATSAPP}?text=${WA_MSG}`

// Default classes fallback (same as backend)
const DEFAULT_CLASSES = [
  { id: '1', name: 'Beginner Piano', description: 'Learn piano fundamentals, notes, chords, rhythm and simple songs.', price: 500, duration: 45, availableModes: ['ONLINE', 'OFFLINE'], isActive: true, level: 'Beginner', emoji: '🎹' },
  { id: '2', name: 'Kids Piano', description: 'Fun and engaging piano lessons specially designed for children.', price: 500, duration: 40, availableModes: ['ONLINE', 'OFFLINE'], isActive: true, level: 'Kids', emoji: '🎈' },
  { id: '3', name: 'Intermediate Piano', description: 'Improve scales, chords, technique, sight reading and musical expression.', price: 700, duration: 60, availableModes: ['ONLINE', 'OFFLINE'], isActive: true, level: 'Intermediate', emoji: '🎼' },
  { id: '4', name: 'Private One-to-One', description: 'Completely personalized lessons focused on your individual musical goals.', price: 800, duration: 60, availableModes: ['ONLINE', 'OFFLINE'], isActive: true, level: 'Personalized', emoji: '⭐' },
  { id: '5', name: 'Online Piano', description: 'Live personalized piano lessons streamed to your home.', price: 500, duration: 45, availableModes: ['ONLINE'], isActive: true, level: 'All Levels', emoji: '🖥️' },
  { id: '6', name: 'Offline Piano — Patna', description: 'Face-to-face personalized piano training at our studio in Patna.', price: 700, duration: 60, availableModes: ['OFFLINE'], isActive: true, level: 'All Levels', emoji: '📍' },
]

// ============ API HELPER ============
async function api(path: string, { method = 'GET', body, token }: { method?: string; body?: any; token?: string } = {}) {
  const res = await fetch(`/api/${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

function loadRazorpay() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false)
    if (window.Razorpay) return resolve(true)
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
}

// ============ SHARED UI ============
function Logo({ small }: { small?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`${small ? 'h-8 w-8' : 'h-10 w-10'} rounded-lg bg-gradient-to-br from-[#E8D28A] to-[#D4AF37] flex items-center justify-center shadow-lg`}>
        <Piano className={`${small ? 'h-4 w-4' : 'h-5 w-5'} text-[#0B0B0D]`} strokeWidth={2.5} />
      </div>
      <div className="leading-tight">
        <div className={`${small ? 'text-sm' : 'text-base'} font-display font-semibold tracking-wide text-[#F5F1E8]`}>PATNA PIANO</div>
        <div className={`${small ? 'text-[9px]' : 'text-[10px]'} tracking-[0.25em] text-gold`}>ACADEMY</div>
      </div>
    </div>
  )
}

function Navbar({ view, setView, user, logout }: { view: string; setView: (v: string) => void; user: any; logout: () => void }) {
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const nav = [
    ['Home', 'home'], ['About', 'about'], ['Classes', 'classes'],
    ['How It Works', 'how'], ['Testimonials', 'testimonials'], ['Contact', 'contact']
  ]
  const go = (v: string) => { setView(v); setOpen(false); setProfileOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  return (
    <header className="sticky top-0 z-50 border-b border-pp bg-[#0B0B0D]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <button onClick={() => go('home')} className="flex items-center"><Logo /></button>

        <nav className="hidden lg:flex items-center gap-8">
          {nav.map(([label, v]) => (
            <button key={v} onClick={() => go(v)} className={`text-sm tracking-wide transition-colors ${view === v ? 'text-gold' : 'text-[#F5F1E8]/80 hover:text-gold'}`}>
              {label}
            </button>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          {!user ? (
            <>
              <button onClick={() => go('login')} className="text-sm text-[#F5F1E8]/80 hover:text-gold">Login</button>
              <button onClick={() => go('book')} className="btn-gold px-5 py-2 rounded-md text-sm">Book a Class</button>
            </>
          ) : (
            <div className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 border border-pp rounded-full pl-1 pr-3 py-1 hover:border-[#D4AF37]/50">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#E8D28A] to-[#D4AF37] flex items-center justify-center text-[#0B0B0D] font-semibold text-sm">{user.name?.[0]?.toUpperCase()}</div>
                <span className="text-sm">{user.name?.split(' ')[0]}</span>
                <ChevronDown className="h-4 w-4 opacity-60" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-card-pp border border-pp rounded-lg shadow-2xl overflow-hidden">
                  {user.role === 'ADMIN' ? (
                    <>
                      <MenuItem icon={LayoutDashboard} label="Admin Dashboard" onClick={() => go('adminDashboard')} />
                      <MenuItem icon={ListChecks} label="Manage Bookings" onClick={() => go('adminBookings')} />
                      <MenuItem icon={BookOpen} label="Manage Classes" onClick={() => go('adminClasses')} />
                      <MenuItem icon={UsersIcon} label="Students" onClick={() => go('adminStudents')} />
                    </>
                  ) : (
                    <>
                      <MenuItem icon={LayoutDashboard} label="Dashboard" onClick={() => go('dashboard')} />
                      <MenuItem icon={ListChecks} label="My Bookings" onClick={() => go('myBookings')} />
                      <MenuItem icon={Wallet} label="Payment History" onClick={() => go('paymentHistory')} />
                      <MenuItem icon={UserIcon} label="Profile" onClick={() => go('profile')} />
                    </>
                  )}
                  <div className="border-t border-pp" />
                  <MenuItem icon={LogOut} label="Logout" onClick={() => { logout(); setProfileOpen(false); go('home') }} danger />
                </div>
              )}
            </div>
          )}
        </div>

        <button className="lg:hidden text-[#F5F1E8]" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-pp bg-[#0B0B0D]">
          <div className="px-4 py-4 space-y-2">
            {nav.map(([label, v]) => (
              <button key={v} onClick={() => go(v)} className={`block w-full text-left py-2 text-sm ${view === v ? 'text-gold' : 'text-[#F5F1E8]/80'}`}>{label}</button>
            ))}
            <div className="border-t border-pp my-2" />
            {!user ? (
              <>
                <button onClick={() => go('login')} className="block w-full text-left py-2 text-sm text-[#F5F1E8]/80">Login</button>
                <button onClick={() => go('book')} className="btn-gold w-full py-2 rounded-md text-sm mt-2">Book a Class</button>
              </>
            ) : (
              <>
                {user.role === 'ADMIN' ? (
                  <>
                    <button onClick={() => go('adminDashboard')} className="block w-full text-left py-2 text-sm">Admin Dashboard</button>
                    <button onClick={() => go('adminBookings')} className="block w-full text-left py-2 text-sm">Manage Bookings</button>
                    <button onClick={() => go('adminClasses')} className="block w-full text-left py-2 text-sm">Manage Classes</button>
                    <button onClick={() => go('adminStudents')} className="block w-full text-left py-2 text-sm">Students</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => go('dashboard')} className="block w-full text-left py-2 text-sm">Dashboard</button>
                    <button onClick={() => go('myBookings')} className="block w-full text-left py-2 text-sm">My Bookings</button>
                    <button onClick={() => go('paymentHistory')} className="block w-full text-left py-2 text-sm">Payment History</button>
                    <button onClick={() => go('profile')} className="block w-full text-left py-2 text-sm">Profile</button>
                  </>
                )}
                <button onClick={() => { logout(); go('home') }} className="block w-full text-left py-2 text-sm text-red-400">Logout</button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

function MenuItem({ icon: Icon, label, onClick, danger }: { icon: any; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[#242427] transition-colors ${danger ? 'text-red-400' : 'text-[#F5F1E8]'}`}>
      <Icon className="h-4 w-4" /> {label}
    </button>
  )
}

function Footer({ setView }) {
  return (
    <footer className="border-t border-pp bg-[#0B0B0D] mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid md:grid-cols-4 gap-10">
          <div>
            <Logo />
            <p className="mt-4 text-sm text-muted-pp">Master the Piano. Create Your Own Music.</p>
            <p className="mt-3 text-xs text-muted-pp">Premium personalized piano lessons in Patna and online.</p>
          </div>
          <div>
            <h4 className="font-display text-gold text-sm tracking-wide mb-4">EXPLORE</h4>
            <ul className="space-y-2 text-sm">
              {[['Home','home'],['About','about'],['Classes','classes'],['Booking','book'],['Contact','contact'],['Login','login']].map(([l,v]) => (
                <li key={v}><button onClick={() => setView(v)} className="text-[#F5F1E8]/80 hover:text-gold">{l}</button></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-display text-gold text-sm tracking-wide mb-4">CONTACT</h4>
           <ul className="space-y-3 text-sm text-[#F5F1E8]/80">
  <li className="flex items-center gap-2">
    <MapPin className="h-4 w-4 text-gold" />
    Patna, Bihar, India
  </li>

  <li className="flex items-center gap-2">
    <Phone className="h-4 w-4 text-gold" />
    <a
      href="tel:+917004695064"
      className="hover:text-gold transition-colors"
    >
      +91 7004695064
    </a>
  </li>

  <li className="flex items-center gap-2">
    <MessageCircle className="h-4 w-4 text-gold" />
    <a
      href="https://wa.me/917004695064"
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-gold transition-colors"
    >
      WhatsApp
    </a>
  </li>

  <li className="flex items-center gap-2">
    <Mail className="h-4 w-4 text-gold" />
    <a
      href="mailto:maharajmanish16@gmail.com"
      className="hover:text-gold transition-colors"
    >
      maharajmanish16@gmail.com
    </a>
  </li>
</ul>
          </div>
          <div>
            <h4 className="font-display text-gold text-sm tracking-wide mb-4">FOLLOW</h4>
<div className="flex items-center gap-3">
  <a
    className="h-10 w-10 rounded-full border border-pp hover:border-gold hover:text-gold flex items-center justify-center transition-colors"
    href="https://www.instagram.com/manishmaharaj988?igsi=MTZlOGNvcWRjYWp6Mg=="
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Instagram"
  >
    <Instagram className="h-4 w-4" />
  </a>

  <a
    className="h-10 w-10 rounded-full border border-pp hover:border-gold hover:text-gold flex items-center justify-center transition-colors"
    href="https://www.facebook.com/share/1EJGGyRij1/"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Facebook"
  >
    <Facebook className="h-4 w-4" />
  </a>

  <a
    className="h-10 w-10 rounded-full border border-pp hover:border-gold hover:text-gold flex items-center justify-center transition-colors"
    href="https://youtube.com/@manishmaharaj4554?si=vZV_w8tvTMpBXvvp"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="YouTube"
  >
    <Youtube className="h-4 w-4" />
  </a>
</div>
          </div>
        </div>
        <div className="divider-gold my-10" />
        <p className="text-center text-xs text-muted-pp">© 2026 Patna Piano Academy. All rights reserved.</p>
      </div>
    </footer>
  )
}

function FloatingButtons() {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
      <a href={`tel:${PHONE}`} className="lg:hidden h-14 w-14 rounded-full bg-[#18181B] border border-gold flex items-center justify-center shadow-2xl hover:scale-105 transition">
        <Phone className="h-5 w-5 text-gold" />
      </a>
      <a href={WA_URL} target="_blank" rel="noreferrer" className="h-14 w-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-2xl hover:scale-105 transition">
        <MessageCircle className="h-6 w-6 text-white" />
      </a>
    </div>
  )
}

// ============ HOME ============
function Home({ setView, setBookingClass, classes }) {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={IMG.hero} alt="Grand piano" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0D] via-[#0B0B0D]/85 to-transparent" />
          <div className="absolute inset-0 hero-vignette" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="max-w-3xl fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/40 bg-gold/5 text-gold text-[11px] tracking-[0.2em] mb-6">
              <Sparkles className="h-3 w-3" /> ONLINE & OFFLINE LESSONS AVAILABLE
            </div>
            <h1 className="font-display text-5xl md:text-7xl leading-[1.05] font-semibold">
              Master the Piano. <br /> <span className="gold-gradient-text italic">Create Your Own Music.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-pp max-w-2xl">
              Personalized piano lessons for beginners, kids, intermediate learners and passionate musicians — available online and offline in Patna.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <button onClick={() => setView('book')} className="btn-gold px-8 py-3.5 rounded-md text-sm tracking-wide">Book a Class</button>
              <button onClick={() => setView('classes')} className="btn-gold-outline px-8 py-3.5 rounded-md text-sm tracking-wide">Explore Classes</button>
            </div>
            <div className="mt-12 flex items-center gap-8 text-sm text-muted-pp">
              <div className="flex items-center gap-2"><Star className="h-4 w-4 fill-gold text-gold" /> <span>4.9/5 Rating</span></div>
              <div className="flex items-center gap-2"><UsersIcon className="h-4 w-4 text-gold" /> <span>200+ Students</span></div>
              <div className="flex items-center gap-2"><Award className="h-4 w-4 text-gold" /> <span>5+ Years</span></div>
            </div>
          </div>
        </div>
        <div className="piano-keys-decoration" />
      </section>

      {/* Trust */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            [Music, 'Personalized Learning', 'Lessons designed around your goals and skill level.'],
            [Clock, 'Flexible Scheduling', 'Choose a convenient date and time.'],
            [MapPin, 'Patna + Online', 'Learn face-to-face in Patna or from anywhere online.'],
            [GraduationCap, 'Professional Guidance', 'Structured lessons from beginner to advanced level.'],
          ].map(([Icon, title, desc], i) => (
            <div key={i} className="card-pp rounded-xl p-6 slide-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="h-12 w-12 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-gold" />
              </div>
              <h3 className="font-display text-xl mb-2">{title}</h3>
              <p className="text-sm text-muted-pp">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured classes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-gold text-xs tracking-[0.3em] mb-2">OUR LESSONS</p>
            <h2 className="font-display text-4xl md:text-5xl">Choose Your Learning Path</h2>
          </div>
          <button onClick={() => setView('classes')} className="hidden md:flex items-center gap-2 text-sm text-gold hover:gap-3 transition-all">View all <ArrowRight className="h-4 w-4"/></button>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.slice(0, 6).map(c => (
            <ClassCard key={c.id} c={c} onBook={() => { setBookingClass(c); setView('book') }} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <HowItWorks />

      {/* Testimonials */}
      <Testimonials />

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative rounded-2xl overflow-hidden border border-gold/30">
          <img src={IMG.classical} alt="Piano" className="absolute inset-0 w-full h-full object-cover opacity-25" />
          <div className="relative p-10 md:p-16 text-center">
            <h2 className="font-display text-4xl md:text-5xl">Ready to Begin Your Musical Journey?</h2>
            <p className="mt-4 text-muted-pp max-w-2xl mx-auto">Join hundreds of students who have discovered the joy of playing piano with personalized guidance.</p>
            <button onClick={() => setView('book')} className="btn-gold mt-8 px-10 py-3.5 rounded-md">Book Your First Class</button>
          </div>
        </div>
      </section>

      <FAQ />
    </>
  )
}

function ClassCard({ c, onBook }) {
  return (
    <div className="card-pp rounded-xl p-6 flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="text-3xl">{c.emoji}</div>
        <div className="text-right">
          <div className="text-2xl font-display text-gold">₹{c.price}</div>
          <div className="text-[10px] tracking-widest text-muted-pp">/ CLASS</div>
        </div>
      </div>
      <h3 className="font-display text-2xl mb-2">{c.name}</h3>
      <p className="text-sm text-muted-pp mb-5 flex-1">{c.description}</p>
      <div className="flex items-center gap-3 mb-5 text-xs text-muted-pp">
        <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-gold" /> {c.duration} min</span>
        <span>·</span>
        <span>{c.availableModes.join(' / ')}</span>
      </div>
      <button onClick={onBook} className="btn-gold-outline py-2.5 rounded-md text-sm hover:btn-gold w-full">Book Now</button>
    </div>
  )
}

// ============ ABOUT ============
function About({ setView }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        <div className="relative rounded-2xl overflow-hidden">
          <img src={IMG.teacher} alt="Piano Teacher" className="w-full h-[540px] object-cover" />
          <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-[#0B0B0D] to-transparent">
            <div className="text-gold text-xs tracking-[0.3em]">FOUNDER · TEACHER</div>
            <div className="font-display text-2xl">Patna Piano Academy</div>
          </div>
        </div>
        <div>
          <p className="text-gold text-xs tracking-[0.3em] mb-3">ABOUT</p>
          <h1 className="font-display text-4xl md:text-5xl leading-tight">Meet Your <span className="gold-gradient-text italic">Piano Teacher</span></h1>
          <p className="mt-6 text-muted-pp leading-relaxed">
            With years of experience in piano education, our teaching approach combines strong fundamentals, practical exercises and enjoyable music practice. Every student receives personalized guidance according to their pace, goals and experience.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-8">
            {[['5+','Years Experience'],['200+','Students Taught'],['1000+','Lessons Completed'],['4.9/5','Student Rating']].map(([v,l],i) => (
              <div key={i} className="card-pp rounded-xl p-5">
                <div className="text-3xl font-display text-gold">{v}</div>
                <div className="text-xs tracking-widest text-muted-pp mt-1">{l}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 p-6 rounded-xl border border-gold/30 bg-gold/5">
            <div className="text-gold text-xs tracking-[0.3em] mb-2">TEACHING PHILOSOPHY</div>
            <p className="font-display text-xl italic">"Learn the fundamentals. Practice with purpose. Play with confidence."</p>
          </div>
          <button onClick={() => setView('book')} className="btn-gold mt-8 px-8 py-3.5 rounded-md">Book Your First Class</button>
        </div>
      </div>
    </div>
  )
}

// ============ CLASSES PAGE ============
function ClassesPage({ classes, setView, setBookingClass }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="text-center mb-14">
        <p className="text-gold text-xs tracking-[0.3em] mb-3">OUR CLASSES</p>
        <h1 className="font-display text-4xl md:text-6xl">Choose Your <span className="gold-gradient-text italic">Learning Path</span></h1>
        <p className="mt-4 text-muted-pp max-w-2xl mx-auto">Six unique piano programs, each crafted to guide you from your first note to your first performance.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map(c => (
          <ClassCard key={c.id} c={c} onBook={() => { setBookingClass(c); setView('book') }} />
        ))}
      </div>
    </div>
  )
}

// ============ HOW IT WORKS ============
function HowItWorks() {
  const steps = [
    ['01', 'Choose Your Class', 'Select the piano lesson that matches your level.', BookOpen],
    ['02', 'Choose Your Mode', 'Select Online or Offline.', Monitor],
    ['03', 'Choose Date & Time', 'Select your preferred schedule.', Calendar],
    ['04', 'Pay & Confirm', 'Complete secure Razorpay payment and receive booking confirmation.', Shield],
  ]
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-14">
        <p className="text-gold text-xs tracking-[0.3em] mb-3">HOW IT WORKS</p>
        <h2 className="font-display text-4xl md:text-5xl">Book a Lesson in <span className="gold-gradient-text italic">4 Steps</span></h2>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map(([n, t, d, Icon], i) => (
          <div key={i} className="card-pp rounded-xl p-7 relative">
            <div className="font-display text-6xl text-gold/20 absolute top-4 right-5">{n}</div>
            <Icon className="h-6 w-6 text-gold mb-4" />
            <h3 className="font-display text-xl mb-2">{t}</h3>
            <p className="text-sm text-muted-pp">{d}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ============ TESTIMONIALS ============
function Testimonials() {
  const t = [
    { q: "Very patient and supportive teacher. I started as a complete beginner and can now confidently play several songs.", a: 'Rahul', c: 'Patna' },
    { q: "I wanted piano lessons for my child and the teaching style is excellent. My daughter really enjoys every class.", a: 'Priya', c: 'Patna' },
    { q: "The online classes are just as good as being there in person. Highly recommend for anyone starting piano.", a: 'Aditya', c: 'Online Student' },
    { q: "Structured lessons and real progress in just a few months. The best decision I made was joining this academy.", a: 'Neha', c: 'Patna' },
  ]
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-14">
        <p className="text-gold text-xs tracking-[0.3em] mb-3">TESTIMONIALS</p>
        <h2 className="font-display text-4xl md:text-5xl">What Our <span className="gold-gradient-text italic">Students Say</span></h2>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {t.map((x, i) => (
          <div key={i} className="card-pp rounded-xl p-7">
            <div className="flex gap-1 mb-4">{Array.from({length:5}).map((_,j) => <Star key={j} className="h-4 w-4 fill-gold text-gold" />)}</div>
            <p className="font-display text-lg leading-relaxed">"{x.q}"</p>
            <div className="mt-5 text-sm"><span className="text-gold">— {x.a}</span><span className="text-muted-pp">, {x.c}</span></div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ============ FAQ ============
function FAQ() {
  const items = [
    ['Do you teach complete beginners?', 'Absolutely. Our beginner program is specifically designed for students starting from zero. No prior experience is required.'],
    ['Are online classes available?', 'Yes. We offer live personalized online piano lessons that you can attend from anywhere.'],
    ['Where are offline classes conducted?', 'Offline classes are held at our music studio in Patna, Bihar. Exact location details are shared upon booking.'],
    ['How long is each lesson?', 'Lessons range from 40 to 60 minutes depending on the level and format you choose.'],
    ['Can I choose my preferred timing?', 'Yes. You can select a date and time slot that suits your schedule during the booking process.'],
    ['Do children need previous piano experience?', 'No. Our Kids Piano program is designed for children with zero prior experience in a fun and engaging way.'],
    ['How do I book a class?', 'Simply click Book a Class, choose your class, mode, date and time, then complete secure Razorpay payment.'],
    ['What happens after payment?', 'You receive an immediate booking confirmation with all details. You can also view it in your dashboard.'],
  ]
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-10">
        <p className="text-gold text-xs tracking-[0.3em] mb-3">FAQ</p>
        <h2 className="font-display text-4xl md:text-5xl">Frequently Asked</h2>
      </div>
      <Accordion type="single" collapsible className="space-y-3">
        {items.map(([q, a], i) => (
          <AccordionItem key={i} value={`q${i}`} className="card-pp rounded-xl px-5 border-pp">
            <AccordionTrigger className="text-left font-display text-lg hover:text-gold hover:no-underline">{q}</AccordionTrigger>
            <AccordionContent className="text-muted-pp">{a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}

// ============ CONTACT ============
function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [loading, setLoading] = useState(false)
  const submit = async (e) => {
    e.preventDefault(); setLoading(true)
    try { await api('contact', { method: 'POST', body: form }); toast.success('Message sent! We\'ll reach out shortly.'); setForm({ name: '', email: '', phone: '', message: '' }) }
    catch (err) { toast.error(err.message) } finally { setLoading(false) }
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="text-center mb-14">
        <p className="text-gold text-xs tracking-[0.3em] mb-3">CONTACT</p>
        <h1 className="font-display text-4xl md:text-6xl">Let's Make <span className="gold-gradient-text italic">Music Together</span></h1>
      </div>
      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-4">
          <a href={`tel:${PHONE}`} className="card-pp rounded-xl p-6 flex items-center gap-4 block">
            <div className="h-12 w-12 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center"><Phone className="h-5 w-5 text-gold" /></div>
            <div><div className="text-xs text-muted-pp">CALL TEACHER</div><div className="font-display text-lg">{PHONE}</div></div>
          </a>
          <a href={WA_URL} target="_blank" rel="noreferrer" className="card-pp rounded-xl p-6 flex items-center gap-4 block">
            <div className="h-12 w-12 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center"><MessageCircle className="h-5 w-5 text-gold" /></div>
            <div><div className="text-xs text-muted-pp">WHATSAPP</div><div className="font-display text-lg">Chat with us</div></div>
          </a>
          <a href={`mailto:${EMAIL}`} className="card-pp rounded-xl p-6 flex items-center gap-4 block">
            <div className="h-12 w-12 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center"><Mail className="h-5 w-5 text-gold" /></div>
            <div><div className="text-xs text-muted-pp">EMAIL</div><div className="font-display text-lg">{EMAIL}</div></div>
          </a>
          <div className="card-pp rounded-xl p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center"><MapPin className="h-5 w-5 text-gold" /></div>
            <div><div className="text-xs text-muted-pp">LOCATION</div><div className="font-display text-lg">Patna, Bihar, India</div></div>
          </div>
        </div>
        <form onSubmit={submit} className="card-pp rounded-xl p-8 space-y-4">
          <h3 className="font-display text-2xl mb-4">Send a Message</h3>
          <div><Label className="text-xs tracking-widest text-muted-pp">NAME</Label><Input value={form.name} onChange={e => setForm({...form,name:e.target.value})} required className="mt-1"/></div>
          <div><Label className="text-xs tracking-widest text-muted-pp">EMAIL</Label><Input type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} required className="mt-1"/></div>
          <div><Label className="text-xs tracking-widest text-muted-pp">PHONE</Label><Input value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} className="mt-1"/></div>
          <div><Label className="text-xs tracking-widest text-muted-pp">MESSAGE</Label><Textarea value={form.message} onChange={e => setForm({...form,message:e.target.value})} rows={5} required className="mt-1"/></div>
          <button disabled={loading} className="btn-gold w-full py-3 rounded-md">{loading ? 'Sending...' : 'Send Message'}</button>
        </form>
      </div>
    </div>
  )
}

// ============ AUTH ============
function Login({ setView, onAuth }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const submit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const res = await api('auth/login', { method: 'POST', body: form })
      onAuth(res.token, res.user)
      toast.success(`Welcome back, ${res.user.name}`)
      setView(res.user.role === 'ADMIN' ? 'adminDashboard' : 'dashboard')
    } catch (err) { toast.error(err.message) } finally { setLoading(false) }
  }
  return (
    <div className="min-h-[70vh] max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8"><h1 className="font-display text-4xl">Welcome Back</h1><p className="text-muted-pp mt-2">Login to book your next lesson.</p></div>
      <form onSubmit={submit} className="card-pp rounded-xl p-8 space-y-4">
        <div><Label className="text-xs tracking-widest text-muted-pp">EMAIL</Label><Input type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} required className="mt-1"/></div>
        <div><Label className="text-xs tracking-widest text-muted-pp">PASSWORD</Label><Input type="password" value={form.password} onChange={e => setForm({...form,password:e.target.value})} required className="mt-1"/></div>
        <button disabled={loading} className="btn-gold w-full py-3 rounded-md">{loading ? 'Signing in...' : 'Login'}</button>
        <p className="text-sm text-muted-pp text-center">Don't have an account? <button type="button" onClick={() => setView('signup')} className="text-gold">Sign up</button></p>
      </form>
      <p className="text-xs text-muted-pp text-center mt-4">Admin? Use <span className="text-gold">admin@patnapianoacademy.com</span> / <span className="text-gold">Admin@123</span></p>
    </div>
  )
}

function Signup({ setView, onAuth }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) return toast.error('Passwords do not match')
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      const res = await api('auth/signup', { method: 'POST', body: { name: form.name, email: form.email, phone: form.phone, password: form.password } })
      onAuth(res.token, res.user)
      toast.success(`Welcome, ${res.user.name}!`)
      setView('dashboard')
    } catch (err) { toast.error(err.message) } finally { setLoading(false) }
  }
  return (
    <div className="min-h-[70vh] max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8"><h1 className="font-display text-4xl">Create Account</h1><p className="text-muted-pp mt-2">Join Patna Piano Academy.</p></div>
      <form onSubmit={submit} className="card-pp rounded-xl p-8 space-y-4">
        <div><Label className="text-xs tracking-widest text-muted-pp">FULL NAME</Label><Input value={form.name} onChange={e => setForm({...form,name:e.target.value})} required className="mt-1"/></div>
        <div><Label className="text-xs tracking-widest text-muted-pp">EMAIL</Label><Input type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} required className="mt-1"/></div>
        <div><Label className="text-xs tracking-widest text-muted-pp">PHONE</Label><Input value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} required className="mt-1"/></div>
        <div><Label className="text-xs tracking-widest text-muted-pp">PASSWORD</Label><Input type="password" value={form.password} onChange={e => setForm({...form,password:e.target.value})} required className="mt-1"/></div>
        <div><Label className="text-xs tracking-widest text-muted-pp">CONFIRM PASSWORD</Label><Input type="password" value={form.confirm} onChange={e => setForm({...form,confirm:e.target.value})} required className="mt-1"/></div>
        <button disabled={loading} className="btn-gold w-full py-3 rounded-md">{loading ? 'Creating...' : 'Sign Up'}</button>
        <p className="text-sm text-muted-pp text-center">Already have an account? <button type="button" onClick={() => setView('login')} className="text-gold">Login</button></p>
      </form>
    </div>
  )
}

// ============ BOOKING FLOW ============
function BookingFlow({ classes, bookingClass, setBookingClass, user, token, setView, setLastBooking }) {
  const [step, setStep] = useState(bookingClass ? 2 : 1)
  const [mode, setMode] = useState(null)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [details, setDetails] = useState({ phone: user?.phone || '', age: '', message: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (bookingClass && step === 1) setStep(2) }, [bookingClass])

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="h-16 w-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-6"><Music className="h-7 w-7 text-gold" /></div>
        <h2 className="font-display text-3xl">Please login to continue</h2>
        <p className="text-muted-pp mt-3">You need an account to book a piano class.</p>
        <div className="flex gap-3 justify-center mt-8">
          <button onClick={() => setView('login')} className="btn-gold px-6 py-3 rounded-md">Login</button>
          <button onClick={() => setView('signup')} className="btn-gold-outline px-6 py-3 rounded-md">Create Account</button>
        </div>
      </div>
    )
  }

  const times = ['10:00 AM', '11:00 AM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM']
  const today = new Date().toISOString().slice(0, 10)
  const cls = bookingClass
  const availableModes = cls?.availableModes || ['ONLINE', 'OFFLINE']

  const startPayment = async () => {
    if (!cls || !mode || !date || !time) return toast.error('Please complete all steps')
    setLoading(true)
    try {
      const order = await api('bookings/create-order', {
        method: 'POST', token,
        body: { classId: cls.id, mode, date, time, ...details },
      })

      const proceedVerify = async (rzpResponse) => {
        try {
          const res = await api('bookings/verify', {
            method: 'POST', token,
            body: { bookingId: order.bookingId, ...rzpResponse },
          })
          setLastBooking(res.booking)
          setView('success')
        } catch (err) { toast.error(err.message) }
      }

      if (order.mock) {
        toast.info('MOCK payment mode active (no real charge). Confirming booking...')
        await proceedVerify({})
      } else {
        const loaded = await loadRazorpay()
        if (!loaded) throw new Error('Razorpay failed to load')
        const rz = new window.Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: 'Patna Piano Academy',
          description: `${order.className} · ${mode} · ${date} ${time}`,
          order_id: order.orderId,
          prefill: { name: user.name, email: user.email, contact: details.phone },
          theme: { color: '#D4AF37' },
          handler: proceedVerify,
        })
        rz.on('payment.failed', (e) => toast.error(e.error?.description || 'Payment failed'))
        rz.open()
      }
    } catch (err) { toast.error(err.message) } finally { setLoading(false) }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-10">
        <p className="text-gold text-xs tracking-[0.3em] mb-2">BOOKING</p>
        <h1 className="font-display text-4xl md:text-5xl">Reserve Your <span className="gold-gradient-text italic">Piano Lesson</span></h1>
      </div>

      {/* Progress */}
      <div className="flex justify-between mb-10 max-w-2xl mx-auto">
        {['Class', 'Mode', 'Date', 'Time', 'Details'].map((s, i) => {
          const n = i + 1
          const active = step >= n
          return (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center font-display border ${active ? 'bg-gold text-[#0B0B0D] border-gold' : 'border-pp text-muted-pp'}`}>{n}</div>
              <div className={`text-[10px] tracking-widest mt-2 ${active ? 'text-gold' : 'text-muted-pp'}`}>{s.toUpperCase()}</div>
            </div>
          )
        })}
      </div>

      <div className="card-pp rounded-xl p-6 md:p-10">
        {step === 1 && (
          <div>
            <h3 className="font-display text-2xl mb-6">Select a Class</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {classes.map(c => (
                <button key={c.id} onClick={() => { setBookingClass(c); setStep(2) }} className="text-left p-5 rounded-xl border border-pp hover:border-gold/60 transition-colors">
                  <div className="flex justify-between items-start mb-2"><div className="text-2xl">{c.emoji}</div><div className="text-gold font-display">₹{c.price}</div></div>
                  <div className="font-display text-lg">{c.name}</div>
                  <div className="text-xs text-muted-pp mt-1">{c.duration} min · {c.availableModes.join(' / ')}</div>
                </button>
              ))}
            </div>
          </div>
        )}
        {step === 2 && cls && (
          <div>
            <h3 className="font-display text-2xl mb-2">Choose Mode</h3>
            <p className="text-sm text-muted-pp mb-6">Selected: <span className="text-gold">{cls.name} · ₹{cls.price}</span></p>
            <div className="grid grid-cols-2 gap-4 max-w-lg">
              {['ONLINE', 'OFFLINE'].map(m => {
                const avail = availableModes.includes(m)
                const selected = mode === m
                return (
                  <button key={m} disabled={!avail} onClick={() => setMode(m)} className={`p-6 rounded-xl border-2 transition-all ${selected ? 'border-gold bg-gold/10' : 'border-pp'} ${!avail ? 'opacity-30 cursor-not-allowed' : 'hover:border-gold/60'}`}>
                    {m === 'ONLINE' ? <Monitor className="h-6 w-6 text-gold mx-auto mb-3" /> : <Building2 className="h-6 w-6 text-gold mx-auto mb-3" />}
                    <div className="font-display text-lg">{m === 'ONLINE' ? '🖥 ONLINE' : '📍 OFFLINE'}</div>
                    <div className="text-xs text-muted-pp mt-2">
                      {m === 'ONLINE' ? 'Live session · Learn from home' : 'Face-to-face · Patna Studio'}
                    </div>
                  </button>
                )
              })}
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(1)} className="btn-gold-outline px-6 py-2.5 rounded-md">Back</button>
              <button disabled={!mode} onClick={() => setStep(3)} className="btn-gold px-6 py-2.5 rounded-md disabled:opacity-40">Continue</button>
            </div>
          </div>
        )}
        {step === 3 && (
          <div>
            <h3 className="font-display text-2xl mb-6">Select Date</h3>
            <Input type="date" min={today} value={date} onChange={e => setDate(e.target.value)} className="max-w-xs"/>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(2)} className="btn-gold-outline px-6 py-2.5 rounded-md">Back</button>
              <button disabled={!date} onClick={() => setStep(4)} className="btn-gold px-6 py-2.5 rounded-md disabled:opacity-40">Continue</button>
            </div>
          </div>
        )}
        {step === 4 && (
          <div>
            <h3 className="font-display text-2xl mb-6">Select Time</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {times.map(t => (
                <button key={t} onClick={() => setTime(t)} className={`p-3 rounded-md border transition-colors ${time === t ? 'border-gold bg-gold/10 text-gold' : 'border-pp hover:border-gold/50'}`}>{t}</button>
              ))}
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(3)} className="btn-gold-outline px-6 py-2.5 rounded-md">Back</button>
              <button disabled={!time} onClick={() => setStep(5)} className="btn-gold px-6 py-2.5 rounded-md disabled:opacity-40">Continue</button>
            </div>
          </div>
        )}
        {step === 5 && cls && (
          <div>
            <h3 className="font-display text-2xl mb-6">Your Details & Summary</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div><Label className="text-xs tracking-widest text-muted-pp">FULL NAME</Label><Input value={user.name} disabled className="mt-1"/></div>
                <div><Label className="text-xs tracking-widest text-muted-pp">EMAIL</Label><Input value={user.email} disabled className="mt-1"/></div>
                <div><Label className="text-xs tracking-widest text-muted-pp">PHONE</Label><Input value={details.phone} onChange={e => setDetails({...details,phone:e.target.value})} required className="mt-1"/></div>
                <div><Label className="text-xs tracking-widest text-muted-pp">AGE</Label><Input value={details.age} onChange={e => setDetails({...details,age:e.target.value})} className="mt-1"/></div>
                <div><Label className="text-xs tracking-widest text-muted-pp">MESSAGE (optional)</Label><Textarea rows={3} value={details.message} onChange={e => setDetails({...details,message:e.target.value})} className="mt-1"/></div>
              </div>
              <div>
                <div className="rounded-xl border border-gold/30 bg-gold/5 p-6 sticky top-24">
                  <div className="text-gold text-xs tracking-[0.3em] mb-3">BOOKING SUMMARY</div>
                  <div className="space-y-3">
                    <SummaryRow label="Class" value={cls.name} />
                    <SummaryRow label="Mode" value={mode === 'ONLINE' ? '🖥 Online Lesson' : '📍 Offline Lesson'} />
                    <SummaryRow label="Date" value={new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })} />
                    <SummaryRow label="Time" value={time} />
                    <SummaryRow label="Duration" value={`${cls.duration} min`} />
                  </div>
                  <div className="border-t border-pp my-4"/>
                  <div className="flex justify-between text-sm"><span className="text-muted-pp">Class Fee</span><span>₹{cls.price}</span></div>
                  <div className="flex justify-between font-display text-2xl mt-2"><span>Total</span><span className="text-gold">₹{cls.price}</span></div>
                  <button disabled={loading} onClick={startPayment} className="btn-gold w-full py-3.5 rounded-md mt-6 flex items-center justify-center gap-2">
                    <CreditCard className="h-4 w-4" /> {loading ? 'Processing...' : 'Pay Securely with Razorpay'}
                  </button>
                  <p className="text-[10px] text-muted-pp text-center mt-3">🔒 Secured by Razorpay · SSL Encrypted</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(4)} className="btn-gold-outline px-6 py-2.5 rounded-md">Back</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SummaryRow({ label, value }) {
  return <div className="flex justify-between text-sm"><span className="text-muted-pp">{label}</span><span>{value}</span></div>
}

// ============ SUCCESS ============
function Success({ booking, setView }) {
  if (!booking) return null
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="h-24 w-24 rounded-full bg-gold/10 border-2 border-gold flex items-center justify-center mx-auto mb-8 slide-up">
        <CheckCircle2 className="h-12 w-12 text-gold" />
      </div>
      <h1 className="font-display text-4xl md:text-5xl">Booking <span className="gold-gradient-text italic">Confirmed</span></h1>
      <p className="text-muted-pp mt-3">Your piano lesson has been successfully booked.</p>
      <div className="card-pp rounded-xl p-6 mt-10 text-left">
        <div className="flex justify-between items-center mb-4"><span className="text-gold text-xs tracking-[0.3em]">BOOKING ID</span><span className="font-mono text-sm">{booking.id.slice(0, 8).toUpperCase()}</span></div>
        <div className="divider-gold mb-4"></div>
        <div className="space-y-3">
          <SummaryRow label="Class" value={booking.className} />
          <SummaryRow label="Mode" value={booking.mode} />
          <SummaryRow label="Date" value={new Date(booking.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })} />
          <SummaryRow label="Time" value={booking.time} />
          <SummaryRow label="Amount" value={`₹${booking.amount}`} />
          <div className="flex justify-between text-sm"><span className="text-muted-pp">Payment</span><span className="text-green-400">✓ {booking.paymentStatus}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-pp">Booking</span><span className="text-gold">{booking.bookingStatus}</span></div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-8">
        <button onClick={() => setView('myBookings')} className="btn-gold py-3 rounded-md text-sm">View My Booking</button>
        <a href={`tel:${PHONE}`} className="btn-gold-outline py-3 rounded-md text-sm flex items-center justify-center gap-2"><Phone className="h-4 w-4"/>Contact Teacher</a>
        <a href={WA_URL} target="_blank" rel="noreferrer" className="btn-gold-outline py-3 rounded-md text-sm flex items-center justify-center gap-2"><MessageCircle className="h-4 w-4"/>WhatsApp</a>
      </div>
    </div>
  )
}

// ============ STUDENT DASHBOARD ============
function StudentDashboard({ user, token, setView }) {
  const [bookings, setBookings] = useState([])
  useEffect(() => { api('bookings/mine', { token }).then(r => setBookings(r.bookings)).catch(() => {}) }, [token])
  const now = Date.now()
  const upcoming = bookings.filter(b => new Date(b.date).getTime() >= now - 86400000 && b.bookingStatus !== 'CANCELLED')
  const completed = bookings.filter(b => b.bookingStatus === 'COMPLETED')
  const spent = bookings.filter(b => b.paymentStatus === 'PAID').reduce((s, b) => s + b.amount, 0)
  const stats = [
    [Calendar, 'Upcoming Lessons', upcoming.length],
    [ListChecks, 'Total Bookings', bookings.length],
    [CheckCircle2, 'Completed Lessons', completed.length],
    [Wallet, 'Total Spent', `₹${spent}`],
  ]
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="flex justify-between items-end mb-10 flex-wrap gap-4">
        <div>
          <p className="text-gold text-xs tracking-[0.3em] mb-2">DASHBOARD</p>
          <h1 className="font-display text-4xl md:text-5xl">Welcome back, {user.name.split(' ')[0]} 👋</h1>
        </div>
        <button onClick={() => setView('book')} className="btn-gold px-6 py-3 rounded-md">+ Book a Class</button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(([Icon, label, val], i) => (
          <div key={i} className="card-pp rounded-xl p-5">
            <Icon className="h-5 w-5 text-gold mb-3" />
            <div className="font-display text-3xl">{val}</div>
            <div className="text-xs tracking-widest text-muted-pp mt-1">{label}</div>
          </div>
        ))}
      </div>
      <h2 className="font-display text-2xl mb-4">Upcoming Lessons</h2>
      {upcoming.length === 0 ? (
        <div className="card-pp rounded-xl p-10 text-center text-muted-pp">No upcoming lessons. <button onClick={() => setView('book')} className="text-gold ml-1">Book now →</button></div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {upcoming.map(b => <BookingCard key={b.id} b={b} />)}
        </div>
      )}
    </div>
  )
}

function BookingCard({ b, onCancel, showActions }) {
  return (
    <div className="card-pp rounded-xl p-6">
      <div className="flex justify-between items-start mb-3">
        <div className="text-3xl">{b.classEmoji || '🎹'}</div>
        <span className={`text-[10px] tracking-widest px-2 py-1 rounded-full border ${b.bookingStatus === 'CONFIRMED' ? 'border-gold text-gold' : b.bookingStatus === 'COMPLETED' ? 'border-green-500 text-green-400' : b.bookingStatus === 'CANCELLED' ? 'border-red-500 text-red-400' : 'border-pp text-muted-pp'}`}>{b.bookingStatus}</span>
      </div>
      <div className="font-display text-xl">{b.className}</div>
      <div className="text-xs text-muted-pp mt-1">{b.mode} · {b.time}</div>
      <div className="text-sm mt-3">{new Date(b.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-pp">
        <div><span className="text-xs text-muted-pp">Amount</span><div className="font-display text-lg text-gold">₹{b.amount}</div></div>
        <div><span className="text-xs text-muted-pp">Payment</span><div className={`text-sm ${b.paymentStatus === 'PAID' ? 'text-green-400' : 'text-muted-pp'}`}>✓ {b.paymentStatus}</div></div>
      </div>
      {showActions && b.bookingStatus === 'CONFIRMED' && (
        <button onClick={() => onCancel(b.id)} className="mt-4 w-full text-xs text-red-400 border border-red-500/40 rounded-md py-2 hover:bg-red-500/10">Cancel Booking</button>
      )}
    </div>
  )
}

function MyBookings({ token }) {
  const [bookings, setBookings] = useState([])
  const [tab, setTab] = useState('upcoming')
  const load = () => api('bookings/mine', { token }).then(r => setBookings(r.bookings))
  useEffect(() => { load().catch(() => {}) }, [token])
  const now = Date.now()
  const filtered = bookings.filter(b => {
    if (tab === 'upcoming') return new Date(b.date).getTime() >= now - 86400000 && !['CANCELLED', 'COMPLETED'].includes(b.bookingStatus)
    if (tab === 'completed') return b.bookingStatus === 'COMPLETED'
    if (tab === 'cancelled') return b.bookingStatus === 'CANCELLED'
    return true
  })
  const cancel = async (id) => { try { await api(`bookings/${id}/cancel`, { method: 'PUT', token }); toast.success('Booking cancelled'); load() } catch (e) { toast.error(e.message) } }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <h1 className="font-display text-4xl mb-8">My Bookings</h1>
      <div className="flex gap-2 mb-6 border-b border-pp">
        {['upcoming', 'completed', 'cancelled'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 py-3 text-sm capitalize transition-colors ${tab === t ? 'text-gold border-b-2 border-gold -mb-px' : 'text-muted-pp'}`}>{t}</button>
        ))}
      </div>
      {filtered.length === 0 ? <div className="card-pp rounded-xl p-10 text-center text-muted-pp">No bookings here yet.</div> : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(b => <BookingCard key={b.id} b={b} onCancel={cancel} showActions />)}
        </div>
      )}
    </div>
  )
}

function PaymentHistory({ token }) {
  const [bookings, setBookings] = useState([])
  useEffect(() => { api('bookings/mine', { token }).then(r => setBookings(r.bookings)).catch(() => {}) }, [token])
  const paid = bookings.filter(b => b.paymentStatus === 'PAID')
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <h1 className="font-display text-4xl mb-8">Payment History</h1>
      <div className="card-pp rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left border-b border-pp"><tr className="text-muted-pp text-xs tracking-widest"><th className="p-4">TRANSACTION</th><th>CLASS</th><th>AMOUNT</th><th>DATE</th><th>STATUS</th></tr></thead>
          <tbody>
            {paid.map(b => (
              <tr key={b.id} className="border-b border-pp last:border-0">
                <td className="p-4 font-mono text-xs">{(b.razorpayPaymentId || b.id).slice(0, 16)}...</td>
                <td>{b.className}</td>
                <td className="text-gold">₹{b.amount}</td>
                <td>{new Date(b.createdAt).toLocaleDateString('en-IN')}</td>
                <td><span className="text-green-400">✓ PAID</span></td>
              </tr>
            ))}
            {paid.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-muted-pp">No payments yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Profile({ user, token, refreshUser }) {
  const [form, setForm] = useState({ name: user.name, phone: user.phone })
  const [loading, setLoading] = useState(false)
  const save = async () => {
    setLoading(true)
    try { await api('auth/profile', { method: 'PUT', token, body: form }); toast.success('Profile updated'); refreshUser() }
    catch (e) { toast.error(e.message) } finally { setLoading(false) }
  }
  return (
    <div className="max-w-2xl mx-auto px-4 py-14">
      <h1 className="font-display text-4xl mb-8">Profile</h1>
      <div className="card-pp rounded-xl p-8 space-y-4">
        <div><Label className="text-xs tracking-widest text-muted-pp">NAME</Label><Input value={form.name} onChange={e => setForm({...form,name:e.target.value})} className="mt-1"/></div>
        <div><Label className="text-xs tracking-widest text-muted-pp">EMAIL</Label><Input value={user.email} disabled className="mt-1"/></div>
        <div><Label className="text-xs tracking-widest text-muted-pp">PHONE</Label><Input value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} className="mt-1"/></div>
        <button disabled={loading} onClick={save} className="btn-gold w-full py-3 rounded-md">{loading ? 'Saving...' : 'Save Changes'}</button>
      </div>
    </div>
  )
}

// ============ ADMIN ============
function AdminDashboard({ token }) {
  const [stats, setStats] = useState(null)
  const [bookings, setBookings] = useState([])
  useEffect(() => {
    api('admin/stats', { token }).then(setStats).catch(() => {})
    api('bookings/all', { token }).then(r => setBookings(r.bookings.slice(0, 8))).catch(() => {})
  }, [token])
  if (!stats) return <div className="p-10 text-center text-muted-pp">Loading...</div>
  const cards = [
    [UsersIcon, 'Total Students', stats.totalStudents],
    [ListChecks, 'Total Bookings', stats.totalBookings],
    [Clock, 'Pending', stats.pending],
    [CheckCircle2, 'Confirmed', stats.confirmed],
    [DollarSign, 'Revenue', `₹${stats.revenue}`],
  ]
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="mb-8"><p className="text-gold text-xs tracking-[0.3em] mb-2">ADMIN</p><h1 className="font-display text-4xl md:text-5xl">Dashboard</h1></div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        {cards.map(([Icon, label, val], i) => (
          <div key={i} className="card-pp rounded-xl p-5">
            <Icon className="h-5 w-5 text-gold mb-3" />
            <div className="font-display text-2xl">{val}</div>
            <div className="text-xs tracking-widest text-muted-pp mt-1">{label}</div>
          </div>
        ))}
      </div>
      <div className="card-pp rounded-xl p-6 mb-10">
        <h3 className="font-display text-xl mb-4">Revenue · Last 14 Days</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={stats.chart}>
            <CartesianGrid stroke="#302E2A" strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="#A9A5A0" tick={{ fontSize: 10 }} />
            <YAxis stroke="#A9A5A0" tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#18181B', border: '1px solid #302E2A', borderRadius: 8 }} />
            <Bar dataKey="amount" fill="#D4AF37" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <h3 className="font-display text-xl mb-4">Recent Bookings</h3>
      <BookingsTable bookings={bookings} token={token} onChange={() => api('bookings/all', { token }).then(r => setBookings(r.bookings.slice(0, 8)))} />
    </div>
  )
}

function BookingsTable({ bookings, token, onChange }) {
  const setStatus = async (id, status) => { try { await api(`bookings/${id}/status`, { method: 'PUT', token, body: { status } }); toast.success('Status updated'); onChange?.() } catch (e) { toast.error(e.message) } }
  return (
    <div className="card-pp rounded-xl overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left border-b border-pp"><tr className="text-muted-pp text-xs tracking-widest">
          <th className="p-4">STUDENT</th><th>CLASS</th><th>MODE</th><th>DATE</th><th>TIME</th><th>AMOUNT</th><th>PAYMENT</th><th>STATUS</th><th>ACTIONS</th>
        </tr></thead>
        <tbody>
          {bookings.map(b => (
            <tr key={b.id} className="border-b border-pp last:border-0">
              <td className="p-4">{b.userName}<div className="text-xs text-muted-pp">{b.userEmail}</div></td>
              <td>{b.className}</td>
              <td>{b.mode}</td>
              <td>{new Date(b.date).toLocaleDateString('en-IN')}</td>
              <td>{b.time}</td>
              <td className="text-gold">₹{b.amount}</td>
              <td>{b.paymentStatus === 'PAID' ? <span className="text-green-400">PAID</span> : <span className="text-muted-pp">{b.paymentStatus}</span>}</td>
              <td><span className={b.bookingStatus === 'CONFIRMED' ? 'text-gold' : b.bookingStatus === 'COMPLETED' ? 'text-green-400' : b.bookingStatus === 'CANCELLED' ? 'text-red-400' : 'text-muted-pp'}>{b.bookingStatus}</span></td>
              <td>
                <div className="flex gap-1">
                  <button onClick={() => setStatus(b.id, 'CONFIRMED')} className="text-[10px] px-2 py-1 rounded border border-pp hover:border-gold">Confirm</button>
                  <button onClick={() => setStatus(b.id, 'COMPLETED')} className="text-[10px] px-2 py-1 rounded border border-pp hover:border-gold">Complete</button>
                  <button onClick={() => setStatus(b.id, 'CANCELLED')} className="text-[10px] px-2 py-1 rounded border border-pp hover:border-red-500">Cancel</button>
                </div>
              </td>
            </tr>
          ))}
          {bookings.length === 0 && <tr><td colSpan={9} className="p-10 text-center text-muted-pp">No bookings yet.</td></tr>}
        </tbody>
      </table>
    </div>
  )
}

function AdminBookings({ token }) {
  const [bookings, setBookings] = useState([])
  const [filter, setFilter] = useState({ mode: '', status: '', q: '' })
  const load = () => api('bookings/all', { token }).then(r => setBookings(r.bookings))
  useEffect(() => { load().catch(() => {}) }, [token])
  const filtered = bookings.filter(b => {
    if (filter.mode && b.mode !== filter.mode) return false
    if (filter.status && b.bookingStatus !== filter.status) return false
    if (filter.q && !`${b.userName} ${b.userEmail} ${b.className}`.toLowerCase().includes(filter.q.toLowerCase())) return false
    return true
  })
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <h1 className="font-display text-4xl mb-6">Manage Bookings</h1>
      <div className="flex flex-wrap gap-3 mb-6">
        <Input placeholder="Search student or class..." value={filter.q} onChange={e => setFilter({...filter,q:e.target.value})} className="max-w-xs" />
        <select value={filter.mode} onChange={e => setFilter({...filter,mode:e.target.value})} className="px-3 py-2 rounded-md">
          <option value="">All Modes</option><option value="ONLINE">Online</option><option value="OFFLINE">Offline</option>
        </select>
        <select value={filter.status} onChange={e => setFilter({...filter,status:e.target.value})} className="px-3 py-2 rounded-md">
          <option value="">All Statuses</option><option>PENDING</option><option>CONFIRMED</option><option>COMPLETED</option><option>CANCELLED</option>
        </select>
      </div>
      <BookingsTable bookings={filtered} token={token} onChange={load} />
    </div>
  )
}

function AdminClasses({ token }) {
  const [classes, setClasses] = useState([])
  const [editing, setEditing] = useState(null)
  const load = () => api('classes').then(r => setClasses(r.classes))
  useEffect(() => { load() }, [])
  const save = async (c) => {
    try {
      if (c.id && classes.find(x => x.id === c.id)) {
        await api(`classes/${c.id}`, { method: 'PUT', token, body: c })
        toast.success('Class updated')
      } else {
        await api('classes', { method: 'POST', token, body: c })
        toast.success('Class created')
      }
      setEditing(null); load()
    } catch (e) { toast.error(e.message) }
  }
  const remove = async (id) => { if (!confirm('Delete class?')) return; try { await api(`classes/${id}`, { method: 'DELETE', token }); load() } catch (e) { toast.error(e.message) } }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="flex justify-between items-center mb-6"><h1 className="font-display text-4xl">Manage Classes</h1><button onClick={() => setEditing({ name:'', description:'', price:500, duration:45, availableModes:['ONLINE','OFFLINE'], isActive:true, emoji:'🎹' })} className="btn-gold px-4 py-2 rounded-md flex items-center gap-2"><Plus className="h-4 w-4"/>Add Class</button></div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map(c => (
          <div key={c.id} className="card-pp rounded-xl p-6">
            <div className="flex justify-between items-start mb-3"><div className="text-3xl">{c.emoji}</div><div className="text-gold font-display text-xl">₹{c.price}</div></div>
            <div className="font-display text-lg">{c.name}</div>
            <div className="text-xs text-muted-pp mt-1">{c.duration} min · {c.availableModes.join(' / ')}</div>
            <p className="text-sm text-muted-pp mt-3 line-clamp-2">{c.description}</p>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setEditing(c)} className="flex-1 text-xs border border-pp rounded-md py-2 hover:border-gold flex items-center justify-center gap-1"><Edit3 className="h-3 w-3"/>Edit</button>
              <button onClick={() => remove(c.id)} className="flex-1 text-xs border border-pp rounded-md py-2 hover:border-red-500 text-red-400 flex items-center justify-center gap-1"><Trash2 className="h-3 w-3"/>Delete</button>
            </div>
          </div>
        ))}
      </div>
      {editing && <ClassEditor c={editing} onSave={save} onClose={() => setEditing(null)} />}
    </div>
  )
}

function ClassEditor({ c, onSave, onClose }) {
  const [form, setForm] = useState(c)
  const toggleMode = (m) => setForm({ ...form, availableModes: form.availableModes.includes(m) ? form.availableModes.filter(x => x !== m) : [...form.availableModes, m] })
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-card-pp border border-pp rounded-xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4"><h2 className="font-display text-2xl">{c.id ? 'Edit' : 'Add'} Class</h2><button onClick={onClose}><X /></button></div>
        <div className="space-y-3">
          <div><Label className="text-xs tracking-widest text-muted-pp">EMOJI</Label><Input value={form.emoji} onChange={e => setForm({...form,emoji:e.target.value})} className="mt-1"/></div>
          <div><Label className="text-xs tracking-widest text-muted-pp">NAME</Label><Input value={form.name} onChange={e => setForm({...form,name:e.target.value})} className="mt-1"/></div>
          <div><Label className="text-xs tracking-widest text-muted-pp">DESCRIPTION</Label><Textarea value={form.description} onChange={e => setForm({...form,description:e.target.value})} className="mt-1"/></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs tracking-widest text-muted-pp">PRICE (₹)</Label><Input type="number" value={form.price} onChange={e => setForm({...form,price:Number(e.target.value)})} className="mt-1"/></div>
            <div><Label className="text-xs tracking-widest text-muted-pp">DURATION (min)</Label><Input type="number" value={form.duration} onChange={e => setForm({...form,duration:Number(e.target.value)})} className="mt-1"/></div>
          </div>
          <div><Label className="text-xs tracking-widest text-muted-pp">AVAILABLE MODES</Label>
            <div className="flex gap-3 mt-2">
              {['ONLINE','OFFLINE'].map(m => (
                <button key={m} onClick={() => toggleMode(m)} className={`px-4 py-2 rounded-md border text-sm ${form.availableModes.includes(m) ? 'border-gold text-gold' : 'border-pp text-muted-pp'}`}>{m}</button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm mt-3"><input type="checkbox" checked={form.isActive} onChange={e => setForm({...form,isActive:e.target.checked})} /> Active</label>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-gold-outline flex-1 py-3 rounded-md">Cancel</button>
          <button onClick={() => onSave(form)} className="btn-gold flex-1 py-3 rounded-md">Save</button>
        </div>
      </div>
    </div>
  )
}

function AdminStudents({ token }) {
  const [students, setStudents] = useState([])
  useEffect(() => { api('admin/students', { token }).then(r => setStudents(r.students)).catch(() => {}) }, [token])
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <h1 className="font-display text-4xl mb-6">Students</h1>
      <div className="card-pp rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left border-b border-pp"><tr className="text-muted-pp text-xs tracking-widest"><th className="p-4">NAME</th><th>EMAIL</th><th>PHONE</th><th>BOOKINGS</th><th>SPENT</th><th>JOINED</th></tr></thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id} className="border-b border-pp last:border-0">
                <td className="p-4">{s.name}</td>
                <td>{s.email}</td>
                <td>{s.phone}</td>
                <td>{s.totalBookings}</td>
                <td className="text-gold">₹{s.totalSpent}</td>
                <td>{new Date(s.createdAt).toLocaleDateString('en-IN')}</td>
              </tr>
            ))}
            {students.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-muted-pp">No students yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============ APP ROOT ============
function App() {
  const [view, setView] = useState('home')
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [classes, setClasses] = useState([])
  const [bookingClass, setBookingClass] = useState(null)
  const [lastBooking, setLastBooking] = useState(null)

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('ppa_token') : null
    const u = typeof window !== 'undefined' ? localStorage.getItem('ppa_user') : null
    if (t && u) { setToken(t); setUser(JSON.parse(u)) }
    api('classes').then(r => setClasses(r.classes)).catch(() => setClasses(DEFAULT_CLASSES))
  }, [])

  const onAuth = (t, u) => {
    setToken(t); setUser(u)
    localStorage.setItem('ppa_token', t); localStorage.setItem('ppa_user', JSON.stringify(u))
  }
  const logout = () => { setToken(null); setUser(null); localStorage.removeItem('ppa_token'); localStorage.removeItem('ppa_user') }
  const refreshUser = () => api('auth/me', { token }).then(r => { setUser(r.user); localStorage.setItem('ppa_user', JSON.stringify(r.user)) })

  const requireAuth = (v) => {
    if (!user && ['dashboard','myBookings','paymentHistory','profile','adminDashboard','adminBookings','adminClasses','adminStudents'].includes(v)) return 'login'
    return v
  }

  const currentView = requireAuth(view)

  return (
    <div className="min-h-screen">
      <Navbar view={currentView} setView={setView} user={user} logout={logout} />
      <main>
        {currentView === 'home' && <Home setView={setView} setBookingClass={setBookingClass} classes={classes} />}
        {currentView === 'about' && <About setView={setView} />}
        {currentView === 'classes' && <ClassesPage classes={classes} setView={setView} setBookingClass={setBookingClass} />}
        {currentView === 'how' && <HowItWorks />}
        {currentView === 'testimonials' && <Testimonials />}
        {currentView === 'contact' && <ContactPage />}
        {currentView === 'login' && <Login setView={setView} onAuth={onAuth} />}
        {currentView === 'signup' && <Signup setView={setView} onAuth={onAuth} />}
        {currentView === 'book' && <BookingFlow classes={classes} bookingClass={bookingClass} setBookingClass={setBookingClass} user={user} token={token} setView={setView} setLastBooking={setLastBooking} />}
        {currentView === 'success' && <Success booking={lastBooking} setView={setView} />}
        {currentView === 'dashboard' && user && <StudentDashboard user={user} token={token} setView={setView} />}
        {currentView === 'myBookings' && user && <MyBookings token={token} />}
        {currentView === 'paymentHistory' && user && <PaymentHistory token={token} />}
        {currentView === 'profile' && user && <Profile user={user} token={token} refreshUser={refreshUser} />}
        {currentView === 'adminDashboard' && user?.role === 'ADMIN' && <AdminDashboard token={token} />}
        {currentView === 'adminBookings' && user?.role === 'ADMIN' && <AdminBookings token={token} />}
        {currentView === 'adminClasses' && user?.role === 'ADMIN' && <AdminClasses token={token} />}
        {currentView === 'adminStudents' && user?.role === 'ADMIN' && <AdminStudents token={token} />}
      </main>
      <Footer setView={setView} />
      <FloatingButtons />
    </div>
  )
}

export default App