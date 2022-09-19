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
  userInput.value
    .replaceAll('*', '')
    .replaceAll('.', '')
    .replaceAll('!', '')
    .replaceAll('?', '')
    .replaceAll('+', '')
    .replaceAll('-', '')
    .replaceAll('=', '')
    .replaceAll("'", '')
    .toLowerCase()
)
const _dataV = computed(() => Object.keys(data.value!))
const results = computed(() => {
  const inputCleanV = inputClean.value
  if (!inputCleanV) return []
  console.time('computed')

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
      ...dataWithLen1.filter(e => e.startsWith(inputCleanV)),
      ...dataWithLen1.filter(e => e.endsWith(inputCleanV)),
    ]),
    start: doColor(
      dataV
        .filter(e => e.startsWith(inputCleanV))
        .filter(e => e !== inputCleanV)
    ),
    end: doColor(
      dataV.filter(e => e.endsWith(inputCleanV)).filter(e => e !== inputCleanV)
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
  inputDom.focus()
})
</script>

<template>
  <div class="control">
    <input
      id="inputDom"
      :value="userInput"
      @input="userInput = ($event as any).target.value"
    />
    <span>{{ resultsLen }}</span>
  </div>
  <div class="word">
    <div>
      <template v-for="(group, type) in results">
        <group v-if="group.length">
          <span>{{ type }} ({{ group.length }})</span>
          <word
            v-for="word in group
          .slice(0, 20)
          .map((e:any) => (Array.isArray(e) ? e : [e]))"
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
::-webkit-scrollbar {
  /* display: none; */
}
body {
  margin: 0;
  font-size: 20px;
  font-family: cursive, fangsong, serif, monospace;
}
#app {
  height: 100vh;
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.control {
  display: flex;
  align-items: baseline;
  align-content: center;
}
.word {
  width: 100%;
  overflow-x: scroll;
  flex-grow: 1;
  border-top: 0.5px solid #aaa;
}
.word > div {
  width: fit-content;
}
input {
  width: -webkit-fill-available;
  box-sizing: border-box;
  margin: 0.75rem;
  background: aquamarine;
  padding: 10px;
  font-size: 35px;
  border-radius: 10px;
}
input:focus {
  color: yellow;
  background: #6ab7e7;
  caret-color: #0519ed;
}
span {
  font-size: 25px;
  font-weight: 900;
}
div > span {
  padding-bottom: 10px;
  display: block;
}
group {
  display: block;
  margin-bottom: 3rem;
}
word {
  display: flex;
  align-items: center;
  padding: 5px 0;
}
group word:nth-of-type(odd) part {
  background-color: white#ddd;
}
group word:nth-of-type(even) part {
  background-color: #ddd;
}
group word:nth-of-type(even) {
  background-color: #ddd;
}
div group word:hover * {
  background-color: #6ab7e7;
}
group word left {
  z-index: 2;
}
group word:hover right {
  z-index: 3;
}
left {
  width: 200px;
  flex-shrink: 0;
  padding-left: 20px;
}
mid {
  flex: 1;
  min-width: 30px;
}
right {
  white-space: nowrap;
}
</style>
