/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_TEACHER_WHATSAPP: process.env.NEXT_PUBLIC_TEACHER_WHATSAPP,
    NEXT_PUBLIC_TEACHER_PHONE: process.env.NEXT_PUBLIC_TEACHER_PHONE,
    NEXT_PUBLIC_TEACHER_EMAIL: process.env.NEXT_PUBLIC_TEACHER_EMAIL,
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  },
  allowedDevOrigins: ['127.0.0.1'],
}

module.exports = nextConfig