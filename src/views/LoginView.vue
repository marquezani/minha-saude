<script setup>
import { RouterLink } from "vue-router";
</script>

<template>
  <div
    class="container vh-100 d-flex justify-content-center align-items-center"
  >
    <div class="card p-4 shadow-sm" style="width: 100%; max-width: 400px">
      <div class="card-body text-center">
        <h1 class="card-title mb-4">Login</h1>
        <p class="card-text text-muted mb-4">
          Acesse sua conta para continuar.
        </p>
        <RouterLink to="/medicoes" class="btn btn-primary btn-lg w-100">
          Acessar Medições (Demo)
        </RouterLink>
      </div>
    </div>
  </div>
</template>
