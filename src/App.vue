<script setup lang="ts">
import { computed, ref, shallowRef, onMounted, nextTick } from 'vue'
import { withTime } from './debug'
const userInput = ref('miss') // with end
console.clear()

let wordsArr: string[] = []
fetch('./WORDS.json')
  .then(res => res.json())
  .then(res => {
    res.__proto__ = Object.create(null) // avoid debuger
    wordsObj.value = res
    wordsArr = Object.keys(res)
  })

const wordsObj = shallowRef<any>({})
const inputClean = computed(() =>
  userInput.value.replaceAll(/[*.!?+-/=']/g, '').toLowerCase()
)

const rightPos = ref('1000px')
const results = computed(() => {
  nextTick(() => {
    const dom = document.querySelector('word')
    if (!dom) return
    rightPos.value = getComputedStyle(dom).width
  })

  const inputCleanV = inputClean.value
  if (!inputCleanV) return []

  console.time('computed')
  const wordsObjV = wordsObj.value

  const mid = wordsArr.filter(e => e.includes(inputCleanV))
  const start = mid.filter(e => e.startsWith(inputCleanV))
  const end = mid.filter(e => e.endsWith(inputCleanV))
  const dataWithLen = mid.filter(e => e.length === inputCleanV.length)

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
        return wordsObjV[l + alphabet + r]
          ? [
              [
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
            ]
          : []
      })
    }).ll

  const 少 = [
    ...new Set(
      [...inputCleanV].flatMap((_, i) => {
        const target = inputCleanV.slice(0, i) + inputCleanV.slice(i + 1)
        return wordsObjV[target] ? [target] : []
      })
    ),
  ]

  // 拆分
  // const cf = Array.from({ length: inputCleanV.length }, (_, i) => {
  //   const tmp = [...inputCleanV]
  //   tmp.splice(i, 1)
  //   return tmp.join('')
  // }).filter(e => dataV.includes(e))

  // const lens = dataV.filter((e) => e.length === userInputV.length)

  const R: any = {
    base: [
      ...mid.filter(e => e === inputCleanV),
      ...start.filter(e => e.length === inputCleanV.length + 1),
      ...end.filter(e => e.length === inputCleanV.length + 1),
    ],
    start,
    end,
    mid,
    多,
    少,
    顺序,
    替换,
  }

  const repeat: any = {}
  for (const key in R) {
    const group = R[key]
    R[key] = group.flatMap((word: any) => {
      const isO = typeof word === 'object'
      // 重复
      const key = isO ? word.map((e: any) => e.part).join('') : word
      if (repeat[key]) {
        return []
      }

      repeat[key] = true
      return isO ? [word] : [doColor(word)]
    })

    if (!R[key].length) delete R[key]
  }
  console.timeEnd('computed')
  return R

  function doColor(word: string) {
    return word
      .replaceAll(inputClean.value, `-${inputClean.value}-`)
      .split('-')
      .filter(e => e !== '')
      .map(part => ({ part, color: part === inputCleanV }))
  }
})
const resultsLen = computed(() => {
  return Object.values(results.value).reduce(
    (all, now: any) => all + now.length,
    0
  )
})

function getChinese(word: any) {
  const china = word.reduce((all: string, now: any) => {
    if (typeof now === 'string') {
      all += now
    } else {
      all += now.part
    }
    return all
  }, '')

  return wordsObj.value[china].replace(
    /\\u[\dA-Fa-f]{4}/g,
    function (match: any) {
      return String.fromCharCode(parseInt(match.replace(/\\u/, ''), 16))
    }
  )
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
      <group v-for="(group, type) in results.ll">
        <span>{{ type }}({{ group.length }})</span>
        <word v-for="word in group.slice(0, 10)" tabIndex="1">
          <part v-for="part in word" :class="{ 'text-red-500': part.color }">
            {{ part.part }}
          </part>
          <right>{{ getChinese(word) }}</right>
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
  background: blanchedalmond;
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
  height: 27px;
  display: flex;
  align-items: center;
  align-content: center;
  position: relative;
  padding-right: 500px;
  display: flex;
  align-items: center;
  align-content: center;
}

part {
  height: 100%;
  display: flex;
  align-items: center;
  display: flex;
  align-items: center;
  align-content: center;
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
  display: flex;
  align-items: center;
  align-content: center;
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
  left: -0.7px;
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
