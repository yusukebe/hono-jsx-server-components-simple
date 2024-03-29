import { Context, Hono } from 'hono'
import { FC, JSXNode } from 'hono/jsx'
import { jsxRenderer } from 'hono/jsx-renderer'
import { logger } from 'hono/logger'

const app = new Hono()

app.use('*', logger())
app.get(
  '*',
  jsxRenderer(({ children }) => {
    return (
      <html>
        <head>
          <meta name="viewport" content="width=device-width" />
          {import.meta.env.PROD ? (
            <script type="module" src="/static/client.js"></script>
          ) : (
            <script type="module" src="/src/client.ts"></script>
          )}
          <script src="https://unpkg.com/htmx.org@1.9.10"></script>
        </head>
        <body>
          <nav>
            <a href="/">top</a>&nbsp;
            <a href="/posts/good-morning">good-morning</a>&nbsp;
            <a href="/posts/good-night">good-night</a>&nbsp;
            <a href="/about">about</a>&nbsp;
            <a href="/htmx">htmx</a>
          </nav>
          <div id="root">{children}</div>
          <footer>
            <p>
              <a href="https://github.com/yusukebe/hono-jsx-server-components-simple">Code</a>
            </p>
          </footer>
        </body>
      </html>
    )
  })
)

const renderJSXToClientJSX = async (jsxElement: JSX.Element) => {
  const jsx = jsxElement as unknown as JSXNode
  if (typeof jsx === 'string' || typeof jsx === 'number' || typeof jsx === 'boolean' || jsx == null) {
    return jsx
  }

  const { children, tag, props } = jsx

  if (typeof tag === 'function') {
    const returnedJSX = await tag(props)
    if (returnedJSX['tag'] !== '') {
      return renderJSXToClientJSX(returnedJSX)
    }
  }

  let resolvedChildren = []

  if (children && children.length > 0) {
    resolvedChildren = await Promise.all(children.map((child) => renderJSXToClientJSX(child as JSX.Element)))
  }

  return { tag, props, children: resolvedChildren }
}

const renderServerComponent = async (c: Context, element: JSX.Element) => {
  if (c.req.query('__sc') != undefined) {
    const clientJSX = await renderJSXToClientJSX(element)
    return c.json(clientJSX)
  }
  return c.render(element)
}

app.get('/', (c) => {
  return renderServerComponent(
    c,
    <h1>
      <b>Hello!</b>
    </h1>
  )
})

app.get('/posts/:id', (c) => {
  return renderServerComponent(c, <h1>{c.req.param('id')}!</h1>)
})

app.get('/about', (c) => {
  const Title: FC<{ name: string }> = ({ name }) => {
    return <h1>Hey {name}!</h1>
  }
  return renderServerComponent(
    c,
    <div>
      <Title name="JSX" />
    </div>
  )
})

app.get('/htmx', (c) => {
  return renderServerComponent(
    c,
    <>
      <h1>with htmx</h1>
      <button hx-post="/clicked" hx-swap="outerHTML">
        Click Me
      </button>
    </>
  )
})

app.post('/clicked', (c) => {
  return c.text('Clicked')
})

export default app
