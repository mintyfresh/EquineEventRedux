import { NextApiHandler } from 'next'
import httpProxyMiddleware from 'next-http-proxy-middleware'

const handler: NextApiHandler = (req, res) => {
  switch (req.method) {
    case 'POST':
      return httpProxyMiddleware(req, res, {
        target: process.env.API_URL,
        ignorePath: true
      })

    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end('Method Not Allowed')
  }
}

export default handler
