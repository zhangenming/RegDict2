const getT = () => performance.now()
const origins = getT()
let old = 0

// eslint-disable-next-line no-extend-native
Object.defineProperties(Object.prototype, {
  map: {
    value(cb: Function) {
      return Object.entries(this)
        .map(([k, v]) => [k, cb(v)])
        .reduce((all, [k, v]) => {
          all[k] = v
          return all
        }, {})
    },
    enumerable: false,
  },
  ll: {
    get() {
      console.log(this)
      return this
    },
  },
  lll: {
    get() {
      return (...args) => {
        console.log(...args, this)
        return this
      }
    },
  },
  llt: {
    get() {
      // Array(1e2)
      //   .fill()
      //   .map(() => window)
      const now = getT()
      console.log((now - origins).toFixed(1), (now - old).toFixed(1))
      old = now
      return this
    },
  },
  lls: {
    get() {
      console.time()
      return this
    },
  },
  lle: {
    get() {
      console.timeEnd()
      return this
    },
  },
})
;(window as any).withTime = withTime
export function withTime(...fns: Function[]) {
  if (!fns[0])
    return

  const idx = Number(location.hash.slice(1))
  if (idx) {
    setTimeout(() => {
      const d = Date.now()
      console.time()
      ;(fns[idx - 1] || fns[0])()

      console.timeEnd()
      document.title += `${Date.now() - d}-`
    }, 50)
  }
  else {
    fns.forEach((fn, i) => {
      console.time(`${i + 1}`)
      fn()
      console.timeEnd(`${i + 1}`)
    })
  }
}
(window as any).diff = (l, r) => {
  console.log(l.filter(e => !r.includes(e)))
  console.log(l.filter(e => r.includes(e)))
  console.log(r.filter(e => !l.includes(e)))
}
