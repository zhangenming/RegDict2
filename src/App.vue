<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import { withTime } from './debug'
console.clear()
fetch('../WORDS2.json')
  .then(res => res.json())
  .then(res => {
    data.value = res.data.ll
  })

// import data from './WORDS.json' assert { type: 'json' }
// const { default: jsonObject } = await import('./WORDS.json', {
//   assert: {
//     type: 'json',
//   },
// })
const data = shallowRef<{ word: string; definition: string }[]>()
const userInput = ref('here')
const inputClean = computed(() =>
  userInput.value
    .replaceAll('*', '')
    .replaceAll('.', '')
    .replaceAll('!', '')
    .replaceAll('?', '')
    .replaceAll('+', '')
    .replaceAll('-', '')
    .replaceAll('=', '')
)
const results = computed(() => {
  const userInputV = userInput.value
  const inputCleanV = inputClean.value
  const dataV = data.value!.map(e => e.word)

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
  const 多 = Array(inputCleanV.length + 1)
    .fill(0)
    .flatMap((_, i) => {
      return alphabets.flatMap(alphabet => {
        const l = inputCleanV.slice(0, i)
        const r = inputCleanV.slice(i)
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

  const lens = dataV.filter(e => e.length === userInputV.length)

  return {
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

  function doColor(words: string[]) {
    return words.map(e =>
      e
        .replaceAll(inputClean.value, `-${inputClean.value}-`)
        .split('-')
        .filter(e => e !== '')
    )
  }
})

function getChinese(word: []) {
  const china = word.reduce((all, now: any) => {
    if (typeof now === 'string') {
      all += now
    } else {
      all += now.word
    }
    return all
  }, '')

  return data.value
    ?.find(e => e.word === china)
    ?.definition.replace(/\\u[\dA-Fa-f]{4}/g, function (match) {
      return String.fromCharCode(parseInt(match.replace(/\\u/, ''), 16))
    })
}
</script>

<template>
  <template v-if="data">
    <input v-model="userInput" />

    <template v-for="(group, type) in results">
      <group v-if="group.length">
        <span>{{ type }}</span>
        <word
          v-for="word in group
            .slice(0, 30)
            .map(e => (Array.isArray(e) ? e : [e])).ll"
        >
          <left v-for="part in word">
            <part
              v-if="typeof part === 'string'"
              :class="{ 'text-red-500': part === inputClean }"
            >
              {{ part }}
            </part>
            <part v-else :class="{ 'text-red-500': part.color }">
              {{ part.word }}
            </part>
          </left>
          <mid></mid>
          <right>{{ getChinese(word) }}</right>
        </word>
      </group>
    </template>
  </template>
</template>

<style>
body {
  margin: 0;
}
input {
  width: -webkit-fill-available;
  box-sizing: border-box;
  margin: 0.75rem;
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
  overflow: hidden;
  padding: 0 10px;
}
mid {
  flex: 1;
  min-width: 30px;
}
group word:nth-of-type(even) {
  background-color: #ddd;
}
group word:hover {
  background-color: #6ab7e7;
}
right {
  white-space: nowrap;
}
</style>
