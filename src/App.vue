<script setup lang="ts">
import { computed, nextTick, onMounted, ref, shallowRef } from 'vue'
import { withTime } from './debug'
console.clear()

const userInput = ref('with') // with end ate iferous layout//ntrin
const loading = ref(false)
const fetchData: { obj: any; arr: string[] } = {
  obj: {},
  arr: [],
}
let helper

fetch(location.host === 'zem-word.netlify.app' ? 'WORDS.json' : './max2.json')
  // Object.entries(obj).filter(e=>!e[1].includes('地名')).reduce((all,[k,v])=>{
  //     all[k]=v
  //     return all
  // },{})
  .then(res => res.json())
  .then((res) => {
    Object.setPrototypeOf(res, null) // avoid debuger
    fetchData.obj = (window as any).obj = res
    fetchData.arr = (window as any).arr = Object.keys(res) // 100+ms 考虑通过网络?
    loading.value = true

    // setInterval(() => {
    //   withTime(() => Object.keys(res))
    // }, 1000)
    // helper = fetchData.arr.reduce((all, word) => {
    //   ;[...new Set(word)].forEach(e => {
    //     e = e.toLowerCase()
    //     if (!all[e]) all[e] = []
    //     all[e].push(word)
    //   })
    //   return all
    // }, {}).ll

    withTime(
      0,
      () => {
        fetchData.arr.reduce((all, word) => {
          for (let w of word) {
            // az->w
            w = w.toLowerCase()
            if (!all[w])
              all[w] = []
            all[w].push(word)
          }
          return all
        }, {}).ll
      },
      () => {
        const all = {}
        for (const az of 'abcdefghijklmnopqrstuvwxyz')
          all[az] = fetchData.arr.filter(word => word.includes(az))

        all.ll
      },
    )
  })

const rightPos = ref('1000px')
const cache: any = {}

function withCache<T>(fn: any, flag: any): T {
  if (!(withCache as any)[`${fn}`])
    (withCache as any)[`${fn}`] = {}

  const cache = (withCache as any)[`${fn}`]

  if (!cache[flag])
    cache[flag] = fn()

  return cache[flag]
}

const results = computed(() => {
  nextTick(() => {
    const dom = document.querySelector('word')
    if (dom)
      rightPos.value = getComputedStyle(dom).width
  })

  const input = userInput.value.toLocaleLowerCase().trim()
  if (!loading.value || !input)
    return {}
  // if (cache[input]) return cache[input]

  console.time(`search ${input}`)
  const { arr, obj } = fetchData
  // const include2 = helper[input[0]].filter(e => e.includes(input))
  const include = arr.filter(e => e.includes(input))
  // withTime(
  //   () => {
  //     const include2 = helper[input[0]].filter(e => e.includes(input))
  //   },
  //   () => {
  //     const include = arr.filter(e => e.includes(input))
  //   }
  // )
  const start = include.filter(e => e.startsWith(input))
  const end = include.filter(e => e.endsWith(input))
  const dataWithLen = withCache<string[]>(
    () => arr.filter(e => e.length === input.length),
    input.length,
  )

  // stroke
  // stoker
  const inputSpread = [...input]
  const 顺序 = dataWithLen
    .filter(word => inputSpread.every(w => word.includes(w)))
    .filter(word => `${[...word].sort()}` === `${inputSpread.sort()}`)

  // const newA = dataWithLen.map(e => ({ e, s: [...e].sort() + '' }))

  // withTime(
  //   () => {
  //     console.log(111)

  //     dataWithLen
  //       // .filter(word => inputSpread.every(w => word.includes(w)))
  //       .filter(word => [...word].sort() + '' === inputSpread.sort() + '')
  //   },
  //   () => {
  //     console.log(222)

  //     newA
  //       // .filter(word => inputSpread.every(w => word.e.includes(w)))
  //       .filter(word => word.s === sort)
  //   }
  // )

  // const __顺序2 = Array.from(
  //   Array(input.length - 1),
  //   (_, i) => input.slice(i + 1) + input.slice(0, i + 1)
  // ).ll
  // const 顺序2 = dataWithLen.filter(word => __顺序2.includes(word)).ll

  // withTime(() => {
  //   const sortMap2: any = {}
  //   dataWithLen
  //     .flatMap(input_ => {
  //       const inputSpread = [...input_]
  //       const inputSpreadSort = [...inputSpread].sort() + ''

  //       const 顺序SuperArr = Array.from(
  //         Array(input_.length - 3),
  //         (_, i) => input_.slice(i + 2) + input_.slice(0, i + 2)
  //       )
  //       const 顺序 = dataWithLen
  //         // .filter(word => inputSpread.every(w => word.includes(w)))
  //         .filter(word => {
  //           if (!sortMap2[word]) sortMap2[word] = [...word].sort() + ''
  //           return sortMap2[word] === inputSpreadSort
  //         })
  //         .filter(word => word != input_)
  //         .filter(word => 顺序SuperArr.includes(word))

  //       return 顺序.length ? [{ [input_]: 顺序 }] : []
  //     })
  //     .reduce((all, now) => {
  //       all[Object.keys(now)] = Object.values(now)[0]
  //       return all
  //     }, {}).ll
  // })
  const 替换 = dataWithLen.flatMap((word) => {
    let n = 0
    let idx = 0
    for (let i = 0; i < input.length; i++) {
      if (input[i] !== word[i]) {
        n++
        idx = i
      }
    }
    return n === 1 && input.length > 1
      ? [
          {
            china: fetchData.obj[word],
            parts: [
              {
                part: word.slice(0, idx),
              },
              {
                part: word.slice(idx, idx + 1),
                color: true,
              },
              {
                part: word.slice(idx + 1),
              },
            ].filter(e => e.part.length),
          },
        ]
      : []
  })

  const alphabets = Array.from(Array(26), (_, i) => String.fromCharCode(97 + i))
  const 多 = Array(input.length + 1)
    .fill(0)
    .flatMap((_, i) => {
      return alphabets.flatMap((alphabet) => {
        const l = input.slice(0, i)
        const r = input.slice(i)
        const targetWord = l + alphabet + r
        return obj[targetWord]
          ? [
              {
                china: fetchData.obj[targetWord],
                parts: [
                  {
                    part: l,
                  },
                  {
                    part: alphabet,
                    color: true,
                  },
                  {
                    part: r,
                  },
                ].filter(e => e.part.length),
              },
            ]
          : []
      })
    })

  const 少 = [
    ...new Set(
      inputSpread.flatMap((_, i) => {
        const target = input.slice(0, i) + input.slice(i + 1)
        return obj[target] ? [target] : []
      }),
    ),
  ]

  // const 拆分 = Array.from({ length: inputCleanV.length }, (_, i) => {
  //   const tmp = [...inputCleanV]
  //   tmp.splice(i, 1)
  //   return tmp.join('')
  // }).filter(e => dataV.includes(e))

  const datas: any = (() => {
    const base = [
      ...include.filter(e => e === input),
      ...start.filter(e => e.length === input.length + 1),
      ...end.filter(e => e.length === input.length + 1),
    ]

    if (input.length === 1)
      return { base }

    return {
      base,
      start,
      end,
      mid: include,
      顺序,
      替换,
      多,
      少,
    }
    // 能不能分步返回 谁先完成就render谁
  })()

  const repeat: any = {}
  for (const key in datas) {
    const group = datas[key]
    datas[key] = group.flatMap((word: any) => {
      const isStr = typeof word === 'string'
      const english = isStr ? word : word.china
      if (repeat[english])
        return []

      repeat[english] = true
      return isStr
        ? [
            {
              china: fetchData.obj[english],
              parts: doColor(word),
            },
          ]
        : [word]
    })

    if (!datas[key].length)
      delete datas[key]
  }
  console.timeEnd(`search ${input}`)

  return (cache[input] = {
    data: datas,
    len: include.length,
    // len: Object.values(results.value).reduce(
    //   (all, now: any) => all + now.length,
    //   0
    // ),
  })

  function doColor(word: string) {
    return word
      .replaceAll(input, `@${input}@`)
      .split('@')
      .filter(e => e !== '')
      .map(part => ({ part, color: part === input }))
  }
})

onMounted(() => {
  document.getElementById('inputDom')!.focus()
})
</script>

<template>
  <div class="control">
    <input
      id="inputDom"
      autocomplete="off"
      :value="userInput"
      type="url"
      autocapitalize="off"
      @input="userInput = ($event as any).target.value"
    >
    <span>{{ results.len }}</span>
  </div>
  <div class="container">
    <div>
      <group v-for="(group, type) in results.data?.ll">
        <span>{{ type }}({{ group.length }})</span>
        <word v-for="word in group.slice(0, 20)" tab-index="1">
          <part
            v-for="part in word.parts"
            :class="{ 'text-red-500': part.color }"
          >
            {{ part.part }}
          </part>
          <right>{{ word.china }}</right>
        </word>
      </group>
    </div>
  </div>
</template>

<style>
body {
  margin: 0;
  font-size: 20px;
  font-family: fangsong, serif, monospace;
  background: #eee;
}
#app {
  height: 100vh;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.control {
  display: flex;
  align-items: center;
  align-content: center;
  padding: 10px;
  gap: 10px;
  background: #eee;
}

input {
  width: 100%;
  box-sizing: border-box;
  background: #6ab7e7;
  font-size: 35px;
  border-radius: 10px;
  padding-left: 10px;
  padding-bottom: 5px;
  border: 1px solid #aaa;
}
input:focus {
  background: aquamarine;
  color: red;
  caret-color: red;
}
input:focus-visible {
  outline-offset: 0px;
  outline: none;
}
.container {
  width: 100%;
  overflow-x: auto;
  flex-grow: 1;
  border-top: 0.5px solid #aaa;
  padding: 10px;
  box-sizing: border-box;
  border-radius: 25px 25px 0 0;
  background: blanchedalmond;
}
.container > div {
  width: fit-content;
}
group:not(:nth-last-of-type(1)) {
  display: block;
  margin-bottom: 3rem;
}

word {
  height: 27px;
  display: flex;
  align-items: center;
  align-content: center;
  position: relative;
  padding-right: 500px;
}

part {
  height: 100%;
  display: flex;
  align-items: center;
  white-space: nowrap;
}
right {
  display: flex;
  align-items: center;
  white-space: nowrap;
  position: absolute;
  left: calc(v-bind(rightPos) - 500px);
  transition: left 0.3s;
  padding-left: 20px;
  height: inherit;
}

word:active {
  color: red;
}
word:focus {
  height: 27px;
  color: darkcyan;
}
word:focus part {
  width: auto;
  color: slateblue;
}
word:focus part {
  color: slateblue;
  background: aquamarine;
  border: 1px solid;
  border-left: none;
  border-right: none;
  z-index: 3;
}
word:focus right {
  height: unset;
  color: slateblue;
  background: aquamarine !important;
  z-index: 2;
  position: relative;
  left: -0.8px;
  border: 1px solid;
  border-radius: 0 10px 10px 0;
  white-space: inherit;
  width: min-content;
  white-space: pre;
  text-indent: -0.6em;
  padding: 3px 10px;
}
word:nth-of-type(odd) {
  background-color: white;
}
word:nth-of-type(even) {
  background-color: #ddd;
}
word:nth-of-type(odd) right {
  background-color: white;
}
word:nth-of-type(even) right {
  background-color: #ddd;
}

* {
  box-sizing: border-box;
}
*:focus {
  outline: none;
}
/* 设置滚动条的样式 */
::-webkit-scrollbar {
  width: 0.4rem;
  height: 0.2rem;
}
/* ::-webkit-scrollbar:window-inactive {
  display: none;
} */
/* 滚动槽 */
::-webkit-scrollbar-track {
  background: #eee;
}
/* 滚动条滑块 */
::-webkit-scrollbar-thumb {
  background: #6ab7e7;
}
/* 使用:has退回一级 才可匹配到 */
:has(input:focus) ::-webkit-scrollbar-thumb {
  background: aquamarine;
}
</style>
