/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix the cross-origin warning
  experimental: {
    allowedDevOrigins: [
      '192.168.29.174',
      'localhost',
      '127.0.0.1',
      '0.0.0.0'
    ],
  },

  
  
  // Optional: Configure API routes if you have any
  async rewrites() {
    return [
      {
        source: '/api/upload/:path*',
        destination: 'http://localhost:5000/upload/:path*'
      },
      {
        source: '/api/files/:path*',
        destination: 'http://localhost:5000/getFiles/:path*', 
      },
      {
        source: '/api/files/:path*', 
        destination: 'http://localhost:5000/deleteSingleFile/:path*',
      },
      {
        source: '/api/files/:path*', 
        destination: 'http://localhost:5000/downloadSingleFile/:path*',
      },
      {
        source: '/api/files/:path*', 
        destination: 'http://localhost:5000/trash/:path*',
      },
      {
        source: '/api/files/:path*', 
        destination: 'http://localhost:5000/restore/:path*',
      },
      {
        source: '/api/files/:path*', 
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
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig