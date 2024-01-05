import { Context, Hono } from 'hono'
import { jsxRenderer } from 'hono/jsx-renderer'

const app = new Hono()

app.get(
  '*',
  jsxRenderer(({ children }) => {
    return (
      <html>
        <body>
          <script type="module" src="/src/client.ts"></script>
        </body>
        <body>
          <nav>
            <a href="/">top</a>&nbsp;
            <a href="/posts/good-morning">good-morning</a>&nbsp;
            <a href="/posts/good-night">good-night</a>&nbsp;
          </nav>
          <div id="root">{children}</div>
        </body>
      </html>
    )
  })
)

const renderSC = (c: Context, element: JSX.Element) => {
  if (c.req.query('__sc') != undefined) {
    return c.json(element)
  }
  return c.render(element)
}

app.get('/', (c) => {
  return renderSC(
    c,
    <h1>
      <b>Hello!</b>
    </h1>
  )
})

app.get('/posts/:id', (c) => {
  return renderSC(c, <h1>{c.req.param('id')}!</h1>)
})

export default app
