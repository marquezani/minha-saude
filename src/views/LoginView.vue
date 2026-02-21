<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { handler } from "../servers/authService";

const router = useRouter();
const usuario = ref("");
const password = ref("");
const errorMessage = ref("");
const loading = ref(false); // Feedback visual

const handleLogin = async () => {
  if (loading.value) return;

  loading.value = true;
  errorMessage.value = "";

  try {
    // Chama o serviço esperando a resposta do banco
    const success = await handler(usuario.value, password.value);

    if (success) {
      router.push("/medicoes");
    } else {
      errorMessage.value = "Usuário ou senha inválidos.";
    }
  } catch (err) {
    errorMessage.value = "Erro ao conectar com o banco de dados.";
  } finally {
    loading.value = false;
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
              :disabled="loading"
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
              :disabled="loading"
              required
            />
          </div>

          <div v-if="errorMessage" class="alert alert-danger p-2" role="alert">
            <small>{{ errorMessage }}</small>
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-lg w-100 mt-3"
            :disabled="loading"
          >
            {{ loading ? "Carregando..." : "Entrar" }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
