<script setup lang="ts">
import Toast from "primevue/toast";
import { TransitionFade } from "@morev/vue-transitions"
</script>

<template>
  <RouterView v-slot="{Component}">
    <TransitionFade>
      <KeepAlive>
        <Component :is="Component" class="h-full"/>
      </KeepAlive>
    </TransitionFade>
  </RouterView>
  <Toast position="bottom-center" class="max-w-[80vw]"/>
</template>
