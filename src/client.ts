import { jsx as jsxFn } from 'hono/jsx'

function scToCC({ tag, props, children }) {
  return jsxFn(
    tag,
    props,
    ...children.map((child) => {
      if (Array.isArray(child)) {
        return child.map((c) => scToCC(c))
      } else {
        return child.children ?? child
      }
    })
  )
}

async function mountSC(pathname: string) {
  const res = await fetch(`${pathname}?__sc`)
  const sc = await res.json()
  const cc = scToCC(sc)
  const root = document.querySelector<HTMLElement>(`#root`)
  root.innerHTML = await cc.toString()
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
