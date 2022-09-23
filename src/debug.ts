const getT = () => performance.now()
const origins = getT()
let old = 0

Object.defineProperties(Object.prototype, {
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

export function withTime(fn) {
  console.time()
  const r = fn()
  console.timeEnd()
  return r
}


window.diff = (l, r) => {
  console.log(l.filter(e => !r.includes(e)))
  console.log(l.filter(e => r.includes(e)))
  console.log(r.filter(e => !l.includes(e)))
}