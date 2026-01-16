/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Correct way to handle cross-origin for Server Actions
  experimental: {
    serverActions: {
      allowedOrigins: [
        '192.168.29.174:3000', 
        'localhost:3000', 
        '127.0.0.1:3000'
      ],
    },
  },

  // 2. FIXED REWRITES (Critical Fix)
  async rewrites() {
    return [
      {
        source: '/api/upload/:path*',
        destination: 'http://localhost:5000/upload/:path*'
      },
      // You cannot have multiple rules with the SAME source ('/api/files/:path*').
      // Next.js will always pick the first one and ignore the rest.
      // You must give them unique paths on the frontend:
      
      {
        source: '/api/files/get/:path*', // Frontend path: /api/files/get/...
        destination: 'http://localhost:5000/getFiles/:path*', 
      },
      {
        source: '/api/files/delete/:path*', // Frontend path: /api/files/delete/...
        destination: 'http://localhost:5000/deleteSingleFile/:path*',
      },
      {
        source: '/api/files/download/:path*', 
        destination: 'http://localhost:5000/downloadSingleFile/:path*',
      },
      {
        source: '/api/files/trash/:path*', 
        destination: 'http://localhost:5000/trash/:path*',
      },
      {
        source: '/api/files/restore/:path*', 
        destination: 'http://localhost:5000/restore/:path*',
      },
      {
        source: '/api/files/permanent/:path*', 
        destination: 'http://localhost:5000/permanentlyDelete/:path*',
      },
    ]
  },
  
  // Optional: Enable CORS for development
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
}

module.exports = nextConfig