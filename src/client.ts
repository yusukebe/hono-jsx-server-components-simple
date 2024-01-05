import { jsx as jsxFn } from 'hono/jsx'

function renderServerComponentToJSX({ tag, props, children }) {
  const processedChildren = children.map((child) => {
    if (typeof child === 'object' && child !== null) {
      return renderServerComponentToJSX(child)
    }
    return child
  })
  return jsxFn(tag, props, ...processedChildren)
}

async function mountComponent(pathname: string) {
  const res = await fetch(`${pathname}?__sc`)
  const serverComponent = await res.json()
  const jsx = renderServerComponentToJSX(serverComponent)
  const root = document.querySelector<HTMLElement>(`#root`)
  root.innerHTML = await jsx.toString()

  // Force loading `htmx`
  // @ts-expect-error there is no types for `htmx`
  htmx.process(root)
}

document.addEventListener('DOMContentLoaded', async function () {
  await mountComponent(window.location.pathname)
})

window.addEventListener(
  'click',
  (e) => {
    if ((e.target as HTMLElement).tagName !== 'A') {
      return
    }
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return
    }
    const href = (e.target as HTMLElement).getAttribute('href')
    if (!href.startsWith('/')) {
      return
    }
    e.preventDefault()
    window.history.pushState(null, null, href)
    mountComponent(href)
  },
  true
)
