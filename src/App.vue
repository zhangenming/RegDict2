<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import { withTime } from './debug'
console.clear()

fetch('./WORDS1.json')
  .then(res => res.text())
  .then(res => {
    res = JSON.parse(res.replaceAll('%', '","').replaceAll('$', '":" '))
    console.log(11, res)

    window.res = res
    data.value = res

    // const str = JSON.stringify(res)
    // window.str = str
    // window.gets = gets

    function get(str, n: number) {
      const R: any = {}
      for (var i = 0; i < str.length; i++) {
        const t = str.slice(i, i + n)
        if (!R[t]) R[t] = 1
        R[t]++
      }
      return Object.entries(R).sort((q, w) => w[1] - q[1])[0]
    }

    function gets(str) {
      return Array(6)
        .fill()
        .map((_, i) => {
          const x = get(str, i + 2)
          const [l, r] = x
          console.log([x, l, r, l.length * r])
        })
    }
  })

const data = shallowRef<any>({})
const userInput = ref('will') // with
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
  const dataV = _dataV.value

  if (!inputCleanV) return []
  console.time('computed')

  const dataWithLen = dataV.filter(e => e.length === inputCleanV.length)
  const dataWithLen1 = dataV.filter(e => e.length === inputCleanV.length + 1)

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
  const 多 = Array(inputCleanV.length - 1)
    .fill(0)
    .flatMap((_, i) => {
      return alphabets.flatMap(alphabet => {
        const l = inputCleanV.slice(0, i + 1)
        const r = inputCleanV.slice(i + 1)
        return dataWithLen1.includes(l + alphabet + r)
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

  const 少 = Array.from({ length: inputCleanV.length }, (_, i) => {
    const tmp = [...inputCleanV]
    tmp.splice(i, 1)
    return tmp.join('')
  }).filter(e => dataV.includes(e))

  // 拆分
  const cf = Array.from({ length: inputCleanV.length }, (_, i) => {
    const tmp = [...inputCleanV]
    tmp.splice(i, 1)
    return tmp.join('')
  }).filter(e => dataV.includes(e))

  // const lens = dataV.filter((e) => e.length === userInputV.length)

  const R = {
    start: doColor(
      dataV
        .filter(e => e.startsWith(inputCleanV))
        .filter(e => e !== inputCleanV)
    ),
    mid: doColor(
      dataV.filter(
        e =>
          e.includes(inputCleanV) &&
          !e.endsWith(inputCleanV) &&
          !e.startsWith(inputCleanV)
      )
    ),
    end: doColor(
      dataV.filter(e => e.endsWith(inputCleanV)).filter(e => e !== inputCleanV)
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
</script>

<template>
  <input :value="userInput" @input="userInput = ($event as any).target.value" />

  <span>总共: {{ resultsLen }}</span>

  <template v-for="(group, type) in results">
    <group v-if="group.length">
      <span>{{ type }} -- {{ group.length }}</span>
      <word
        v-for="word in group
          .slice(0, 100)
          .map(e => (Array.isArray(e) ? e : [e]))"
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
</template>

<style>
body {
  margin: 0;
}
#app {
  width: fit-content;
}
input {
  width: -webkit-fill-available;
  box-sizing: border-box;
  margin: 0.75rem;
  background: aquamarine;
  padding: 10px;
  font-size: 50px;
}
div > span {
  margin-left: 0.75rem;
}
group {
  display: block;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 0.75rem 1.75rem;
}
group span {
  margin-left: -1rem;
  font-weight: 900;
  font-size: 20px;
}
word {
  display: flex;
  align-items: center;
  height: 2em;
  padding: 0 10px;
}
group word:nth-of-type(even) {
  background-color: #ddd;
}
group word:hover {
  background-color: #6ab7e7;
}
left {
  width: 200px;
  flex-shrink: 0;
}
mid {
  flex: 1;
  min-width: 30px;
}
right {
  white-space: nowrap;
}
</style>
