<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { login } from "../servers/authService";

const router = useRouter();
const usuario = ref("");
const password = ref("");
const errorMessage = ref("");

const handleLogin = () => {
  errorMessage.value = "";
  const success = login(usuario.value, password.value);
  if (success) {
    router.push("/medicoes");
  } else {
    errorMessage.value = "Credenciais inválidas. Tente novamente.";
  }
};
</script>

<template>
  <div
    class="container vh-100 d-flex justify-content-center align-items-center"
  >
    <div class="card p-4 shadow-sm" style="width: 100%; max-width: 400px">
      <div class="card-body">
        <h1 class="card-title mb-4">Login</h1>
        <form @submit.prevent="handleLogin">
          <div class="mb-3">
            <label for="usuario" class="form-label">Usuário</label>
            <input
              type="text"
              class="form-control"
              id="usuario"
              v-model="usuario"
              required
            />
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">Senha</label>
            <input
              type="password"
              class="form-control"
              id="password"
              v-model="password"
              required
            />
          </div>
          <div v-if="errorMessage" class="alert alert-danger" role="alert">
            {{ errorMessage }}
          </div>
          <p class="text-muted small">
            Use <strong>admin</strong> e senha <strong>password</strong> para
            acessar.
          </p>
          <button type="submit" class="btn btn-primary btn-lg w-100 mt-3">
            Entrar
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
