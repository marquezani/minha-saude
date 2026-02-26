<script setup>
import { notificationStore } from "@/assets/notificationStore.js";
</script>

<template>
  <transition name="fade">
    <div
      v-if="notificationStore.visivel"
      :class="['toast-custom', notificationStore.tipo]"
    >
      {{ notificationStore.mensagem }}
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px) translateX(10px);
}
</style>
