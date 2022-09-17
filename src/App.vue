<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'

fetch('../WORDS2.json')
  .then((res) => res.json())
  .then((res) => {
    data.value = res.data.map((e: any) => e.word)
  })

// import data from './WORDS.json' assert { type: 'json' }
// const { default: jsonObject } = await import('./WORDS.json', {
//   assert: {
//     type: 'json',
//   },
// })

const data = shallowRef<string[]>()
const userInput = ref('data')
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
  const dataV = data.value!

  const result: any = {}

  // 顺序
  // stroke
  // stoker
  const sx = dataV
    .filter((e) => e.length === inputCleanV.length)
    .filter((e) => [...e].sort().join() === [...inputCleanV].sort().join())

  // 不同一个
  const bt = dataV.filter((word) => {
    let n = 0
    for (let i = 0; i < inputCleanV.length; i++) {
      if (inputCleanV[i] !== word[i]) n++
    }
    return n === 1 && word.length === inputCleanV.length
  })

  const alphabets = Array.from(Array(26), (_, i) => String.fromCharCode(97 + i))

  // 多一个
  const dy = Array(inputCleanV.length + 1)
    .fill(0)
    .flatMap((_, i) => {
      return alphabets.map((alphabet) => {
        const res = [...inputCleanV]
        res.splice(i, 0, alphabet)
        return res.join('')
      })
    })
    .filter((e) => dataV.includes(e))

  // 少一个
  const sy = Array.from({ length: inputCleanV.length }, (_, i) => {
    const tmp = [...inputCleanV]
    tmp.splice(i, 1)
    return tmp.join('')
  }).filter((e) => dataV.includes(e))

  // 拆分
  const cf = Array.from({ length: inputCleanV.length }, (_, i) => {
    const tmp = [...inputCleanV]
    tmp.splice(i, 1)
    return tmp.join('')
  }).filter((e) => dataV.includes(e))

  const lens = dataV.filter((e) => e.length === userInputV.length)

  return Object.entries({
    self: [[inputCleanV]],
    dy,
    sy,
    start: doColor(
      dataV
        .filter((e) => e.startsWith(inputCleanV))
        .filter((e) => e !== inputCleanV)
    ),
    end: doColor(
      dataV
        .filter((e) => e.endsWith(inputCleanV))
        .filter((e) => e !== inputCleanV)
    ),
    mid: doColor(
      dataV.filter(
        (e) =>
          e.includes(inputCleanV) &&
          !e.endsWith(inputCleanV) &&
          !e.startsWith(inputCleanV)
      )
    ),
  }).reduce((all: any, [k, v]) => {
    if (v.length) {
      all[k] = v
    }
    return all
  }, {}).ll

  function doColor(words: string[]) {
    return words.map((e) =>
      e
        .replaceAll(inputClean.value, `-${inputClean.value}-`)
        .split('-')
        .filter((e) => e !== '')
    )
  }
})
</script>

<template>
  <template v-if="data">
    <input v-model="userInput" class="box-border m3" />

    <group v-for="group in results">
      <word v-for="word in group.slice(0, 30)">
        <template v-if="Array.isArray(word)">
          <part
            v-for="part in word"
            :class="{ 'text-red-300': part === inputClean }"
          >
            {{ part }}
          </part>
        </template>

        <template v-else> {{ word }}</template>
      </word>
    </group>
  </template>
</template>

<style>
body {
  margin: 0;
}
input {
  width: -webkit-fill-available;
}
group {
  display: block;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 0.75rem;
}
group:nth-of-type(2),
group:nth-of-type(3) {
  background-color: rgb(203, 213, 225);
}
word {
  display: block;
}
</style>
