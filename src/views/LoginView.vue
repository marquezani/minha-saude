<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import AppLogo from "./AppLogo.vue";
import { handler } from "../servers/authService";

const router = useRouter();
const usuario = ref("");
const password = ref("");
const errorMessage = ref("");
const loading = ref(false);

const handleLogin = async () => {
  if (loading.value) return;

  loading.value = true;
  errorMessage.value = "";

  try {
    const encodedPassword = btoa(password.value);
    const success = await handler(usuario.value, encodedPassword);

    if (success) {
      router.push("/dashboard");
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
    class="main-wrapper bg-light min-vh-100 d-flex flex-column justify-center align-items-center p-3"
  >
    <div
      class="card border-0 shadow-sm rounded-4 overflow-hidden position-relative"
      style="max-width: 400px; width: 100%"
    >
      <div class="position-absolute top-0 end-0 p-3 mt-1 me-2">
        <span
          class="text-uppercase fw-bold text-secondary opacity-25"
          style="font-size: 10px; letter-spacing: 1px"
        >
          V 1.10
        </span>
      </div>

      <div class="card-body p-4 p-sm-5">
        <div class="text-center mb-4">
          <div
            class="logo-container d-inline-flex align-items-center justify-content-center rounded-4 mb-3"
          >
            <app-logo />
          </div>
          <h1 class="h4 fw-bold text-dark mb-1">Minha Saúde</h1>
          <p class="text-muted small">Bem-vindo à sua jornada de bem-estar</p>
        </div>

        <form @submit.prevent="handleLogin">
          <div class="mb-3">
            <label
              for="usuario"
              class="form-label small fw-bold text-secondary ms-1"
              >USUÁRIO</label
            >
            <input
              type="text"
              id="usuario"
              v-model="usuario"
              class="form-control form-control-lg bg-light border-0 rounded-3 shadow-none custom-input"
              placeholder="CPF"
              :disabled="loading"
              required
            />
          </div>

          <div class="mb-4">
            <label
              for="password"
              class="form-label small fw-bold text-secondary ms-1"
              >SENHA</label
            >
            <input
              type="password"
              id="password"
              v-model="password"
              class="form-control form-control-lg bg-light border-0 rounded-3 shadow-none custom-input"
              placeholder="••••••••"
              :disabled="loading"
              required
            />
          </div>

          <div
            v-if="errorMessage"
            class="alert alert-danger border-0 rounded-3 small py-2 text-center"
            role="alert"
          >
            {{ errorMessage }}
          </div>

          <button
            type="submit"
            class="btn btn-success btn-lg w-100 fw-bold py-3 shadow-sm rounded-3 mt-2 transition-all"
            :disabled="loading"
          >
            <template v-if="loading">
              <span
                class="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              Aguarde...
            </template>
            <template v-else> Acessar </template>
          </button>
        </form>
      </div>
    </div>

    <footer class="mt-4 text-center">
      <p class="text-muted small opacity-50">&copy; 2024 Minha Saúde</p>
    </footer>
  </div>
</template>

<style scoped>
.logo-container {
  width: 64px;
  height: 64px;
  background-color: rgba(244, 63, 94, 0.06);
  color: #f43f5e;
}

/* Estilos para garantir que o Bootstrap fique com cara de App moderno */
.main-wrapper {
  background-color: #f8fafc !important; /* Slate 50 do Tailwind */
}

.custom-input {
  font-size: 0.95rem;
  padding: 0.8rem 1.2rem;
  transition: all 0.2s ease-in-out;
}

.custom-input:focus {
  background-color: #ffffff !important;
  box-shadow: 0 0 0 3px rgba(25, 135, 84, 0.1) !important;
  border: 1px solid #198754 !important;
}

.btn-success {
  background-color: #10b981; /* Verde esmeralda */
  border: none;
}

.btn-success:hover {
  background-color: #059669;
}

.transition-all {
  transition: all 0.3s ease;
}

/* Arredondamentos Extras (Bootstrap 5 tem rounded-4, mas aqui garantimos) */
.rounded-4 {
  border-radius: 1.5rem !important;
}
</style>
