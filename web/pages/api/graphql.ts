import { NextApiHandler } from 'next'
import httpProxyMiddleware from 'next-http-proxy-middleware'

export const config = {
  api: {
    bodyParser: false
  }
}

const handler: NextApiHandler = (req, res) => {
  switch (req.method) {
    case 'POST':
      return httpProxyMiddleware(req, res, {
        target: process.env.GRAPHQL_API_URL,
        ignorePath: true,
        onProxyInit: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            let responseBody  = null
            const requestBody = (req as any).body
            const contentType = req.headers['content-type'] ?? ''

            if (contentType.startsWith('application/json')) {
              responseBody = JSON.stringify(requestBody)
            } else if (contentType.startsWith('application/x-www-form-urlencoded')) {
              responseBody = new URLSearchParams(requestBody).toString()
            } else if (contentType.startsWith('multipart/form-data')) {
              responseBody = requestBody
            }

            if (responseBody) {
              proxyReq.setHeader('Content-Length', Buffer.byteLength(responseBody))
              proxyReq.write(responseBody)
            }
          })
        }
      })

    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end('Method Not Allowed')
  }
}

export default handler
