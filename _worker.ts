import app from './src/server'
import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-pages'

const base = new Hono()
base.get('/static/*', serveStatic())
base.route('/', app)

export default base
