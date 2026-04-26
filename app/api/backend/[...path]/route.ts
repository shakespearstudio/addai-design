import { NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.BACKEND_URL || 'http://localhost:8000'

async function proxy(request: NextRequest, path: string[]) {
  const url = `${BACKEND}/api/${path.join('/')}`
  const contentType = request.headers.get('content-type') || ''

  const headers: Record<string, string> = {}
  if (contentType) headers['content-type'] = contentType

  const body = request.method !== 'GET' ? await request.arrayBuffer() : undefined

  const res = await fetch(url, {
    method: request.method,
    headers,
    body: body ?? undefined,
  })

  const resContentType = res.headers.get('content-type') || ''
  if (resContentType.includes('application/json')) {
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  }

  const buffer = await res.arrayBuffer()
  return new Response(buffer, {
    status: res.status,
    headers: { 'content-type': resContentType },
  })
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  return proxy(req, path)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  return proxy(req, path)
}
