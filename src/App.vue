<script setup lang="ts">
const userInput = ref('end') // with end
import { computed, ref, shallowRef, onMounted } from 'vue'
import { withTime } from './debug'
console.clear()

fetch('./WORDS.json')
  .then(res => res.json())
  .then(res => {
    res.ll
    res.__proto__ = Object.create(null) // avoid debuger .ll
    data.value = res
    // const str = JSON.stringify(res)
    // window.str = str
    // window.gets = gets

    // function get(str, n: number) {
    //   const R: any = {}
    //   for (var i = 0; i < str.length; i++) {
    //     const t = str.slice(i, i + n)
    //     if (!R[t]) R[t] = 1
    //     R[t]++
    //   }
    //   return Object.entries(R).sort((q, w) => w[1] - q[1])[0]
    // }

    // function gets(str) {
    //   return Array(6)
    //     .fill()
    //     .map((_, i) => {
    //       const x = get(str, i + 2)
    //       const [l, r] = x
    //       console.log([x, l, r, l.length * r])
    //     })
    // }
  })

const data = shallowRef<any>({})
const inputClean = computed(() =>
  userInput.value.replaceAll(/[*.!?+-/=']/g, '').toLowerCase()
)
const _dataV = computed(() => Object.keys(data.value!))
const results = computed(() => {
  const inputCleanV = inputClean.value
  if (!inputCleanV) return []
  console.time('computed')
  inputCleanV.ll
  const dataObj = data.value
  const dataV = _dataV.value
  const dataWithLen = dataV.filter(e => e.length === inputCleanV.length)
  const dataWithLen1 = dataV.filter(e => e.length === inputCleanV.length + 1)
  const dataWithLen_1 = dataV.filter(e => e.length === inputCleanV.length - 1)

  // stroke
  // stoker
  const 顺序 = dataWithLen
    .filter(e => [...e].sort().join() === [...inputCleanV].sort().join())
    .filter(e => e !== inputCleanV)

  const 替换 = dataWithLen.flatMap(word => {
    let n = 0
    let idx = 0
    for (let i = 0; i < inputCleanV.length; i++) {
      if (inputCleanV[i] !== word[i]) {
        n++
        idx = i
      }
    }
    return n === 1 && inputCleanV.length > 1
      ? [
          [
            {
              word: word.slice(0, idx),
            },
            {
              word: word.slice(idx, idx + 1),
              color: true,
            },
            {
              word: word.slice(idx + 1),
            },
          ].filter(e => e.word.length),
        ]
      : []
  })

  const alphabets = Array.from(Array(26), (_, i) => String.fromCharCode(97 + i))
  const 多 = Array(inputCleanV.length + 1)
    .fill(0)
    .flatMap((_, i) => {
      return alphabets.flatMap(alphabet => {
        const l = inputCleanV.slice(0, i)
        const r = inputCleanV.slice(i)
        return dataObj[l + alphabet + r]
          ? [
              [
                {
                  word: l,
                },
                {
                  word: alphabet,
                  color: true,
                },
                {
                  word: r,
                },
              ].filter(e => e.word.length),
            ]
          : []
      })
    })

  const 少 = [
    ...new Set(
      [...inputCleanV].flatMap((_, i) => {
        const target = inputCleanV.slice(0, i) + inputCleanV.slice(i + 1)
        return dataObj[target] ? [target] : []
      })
    ),
  ]

  // 拆分
  const cf = Array.from({ length: inputCleanV.length }, (_, i) => {
    const tmp = [...inputCleanV]
    tmp.splice(i, 1)
    return tmp.join('')
  }).filter(e => dataV.includes(e))

  // const lens = dataV.filter((e) => e.length === userInputV.length)

  const R = {
    best: doColor([
      ...dataWithLen.filter(e => e === inputCleanV),
      ...dataWithLen1.filter(e => e.startsWith(inputCleanV)),
      ...dataWithLen1.filter(e => e.endsWith(inputCleanV)),
    ]),
    start: doColor(
      dataV
        .filter(e => e !== inputCleanV)
        .filter(e => e.startsWith(inputCleanV))
        .filter(e => e.length === inputCleanV.length)
    ),
    end: doColor(
      dataV
        .filter(e => e !== inputCleanV)
        .filter(e => e.endsWith(inputCleanV))
        .filter(e => e.length === inputCleanV.length)
    ),
    mid: doColor(
      dataV.filter(
        e =>
          e.includes(inputCleanV) &&
          !e.endsWith(inputCleanV) &&
          !e.startsWith(inputCleanV)
      )
    ),
    顺序,
    替换,
    多,
    少,
  }
  console.timeEnd('computed')
  return R

  function doColor(words: string[]) {
    return words.map(e =>
      e
        .replaceAll(inputClean.value, `-${inputClean.value}-`)
        .split('-')
        .filter(e => e !== '')
    )
  }
})
const resultsLen = computed(() => {
  return Object.values(results.value).reduce((all, now) => all + now.length, 0)
})

function getChinese(word: any) {
  const china = word.reduce((all: string, now: any) => {
    if (typeof now === 'string') {
      all += now
    } else {
      all += now.word
    }
    return all
  }, '')

  return data.value[china].replace(/\\u[\dA-Fa-f]{4}/g, function (match: any) {
    return String.fromCharCode(parseInt(match.replace(/\\u/, ''), 16))
  })
}

onMounted(() => {
  const input = document.getElementById('inputDom')!
  input.focus()

  if (location.hostname !== '127.0.0.1') {
    let hadFullscreen = false
    input.onclick = () => {
      hadFullscreen || document.documentElement.requestFullscreen()
      hadFullscreen = true
    }
  }
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
    />
    <span>{{ resultsLen }}</span>
  </div>
  <div class="container">
    <div>
      <template v-for="(group, type) in results">
        <group v-if="group.length">
          <span>{{ type }}({{ group.length }})</span>
          <word
            v-for="word in group
          .slice(0, 20)
          .map((e:any) => (Array.isArray(e) ? e : [e]))"
            tabIndex="1"
          >
            <left>
              <template v-for="part in word">
                <part
                  v-if="typeof part === 'string'"
                  :class="{ 'text-red-500': part === inputClean }"
                >
                  {{ part }}
                </part>
                <part v-else :class="{ 'text-red-500': part.color }">
                  {{ part.word }}
                </part>
              </template>
            </left>
            <!-- <mid></mid> -->
            <right>{{ getChinese(word) }}</right>
          </word>
        </group>
      </template>
    </div>
  </div>
</template>

<style>
body {
  margin: 0;
  font-size: 20px;
  font-family: cursive, fangsong, serif, monospace;
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
  background: aquamarine;
  font-size: 35px;
  border-radius: 10px;
  padding-left: 10px;
  padding-bottom: 5px;
  border: 1px solid #aaa;
}
input:focus {
  color: yellow;
  background: #6ab7e7;
  caret-color: yellow;
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
}
.container > div {
  width: fit-content;
}
group:not(:nth-last-of-type(1)) {
  display: block;
  margin-bottom: 3rem;
}
word {
  display: flex;
  align-items: center;
  padding: 2px 0;
  height: 27px;
}
word:active {
  color: red;
}
word:focus left,
word:focus left part {
  width: auto;
}
word:focus {
  width: 100vw;
  height: 27px;
  color: darkcyan;
}
word:focus left {
  color: slateblue;
  background: aquamarine;
  border: 1px solid;
  border-left: none;
  border-right: none;
  z-index: 3;
}
word:focus left part {
  color: slateblue;
  font-weight: 900;
}
word:focus right {
  font-weight: 900;
  color: slateblue;
  background: aquamarine;
  z-index: 2;
  position: relative;
  left: -1px;
  border: 1px solid;
  border-radius: 0 10px 10px 0;
  white-space: inherit;
  width: min-content;
  white-space: pre;
  text-indent: -0.6em;
  /* text-overflow: ellipsis; */
  /* width: 290px; */
  /* word-wrap: break-word; */
  /* word-break: break-word; */
  /* display: flex; */
  /* flex-wrap: wrap; */
  /* flex-direction: row; */
  /* height: 110px; */
  /* overflow: hidden; */
}
word:nth-of-type(odd) part {
  background-color: white#ddd;
}
word:nth-of-type(even) {
  background-color: #ddd;
}
/* div word:hover * {
  background-color: #6ab7e7;
}
word:hover right {
  z-index: 3;
} */
left {
  width: 200px;
  flex-shrink: 0;
  padding: 0 10px;
  height: 27px;
}

right {
  white-space: nowrap;
  padding: 10px;
}

* {
  box-sizing: border-box;
  /* transition: all 1.5s; */
}
*:focus {
  outline: none;
}
/* 设置滚动条的样式 */
::-webkit-scrollbar {
  /* display: none; */
  width: 0.4rem;
  height: 0.2rem;
}
/* 滚动槽 */
::-webkit-scrollbar-track {
  background: red;
}
/* 滚动条滑块 */
::-webkit-scrollbar-thumb {
  background: aquamarine;
}
/* ::-webkit-scrollbar-thumb:window-inactive {
  background: #000;
} */
</style>
