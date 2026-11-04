<script setup lang="ts">
import { withBase } from "vitepress"

const props = defineProps<{
  href: string
  no?: string
  title: string
}>()

const to = withBase(props.href)
</script>

<template>
  <a class="oc-card" :href="to">
    <span v-if="no" class="oc-card-no">{{ no }}</span>
    <strong>{{ title }}</strong>
    <p><slot /></p>
  </a>
</template>
