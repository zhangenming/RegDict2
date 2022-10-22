<script setup lang="ts">
import { ref } from 'vue'

const value_input = ref('')
const value_change = ref('')
</script>

<template>
  <div>
    <!-- input -->
    value_input: {{ value_input }}
    <input
      :value="value_input"
      @input="
        (e) => {
          value_input = e.target.value
        }
      "
    >
    <input v-model="value_input">

    <!-- change -->
    value_change: {{ value_change }}
    <input
      :value="value_change"
      @change="
        (e) => {
          value_change = e.target.value
        }
      "
    >
    <input v-model="value_change">
  </div>
</template>
