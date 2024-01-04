import { jsx as jsxFn } from 'hono/jsx'

async function mountSC(pathname: string) {
  const res = await fetch(`${pathname}?sc`)
  const data = await res.json()
  const node = jsxFn(data.tag, data.props, ...data.children)
  const root = document.querySelector<HTMLElement>(`#root`)
  root.innerHTML = await node.toString()
}

document.addEventListener('DOMContentLoaded', async function () {
  mountSC(window.location.pathname)
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
    mountSC(href)
  },
  true
)
