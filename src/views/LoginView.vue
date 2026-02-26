<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import AppLogo from "@/components/AppLogo.vue";
import { handler } from "../servers/authService";

const router = useRouter();
const usuario = ref("");
const password = ref("");
const showPassword = ref(false);
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
    class="main-wrapper bg-light min-vh-100 d-flex flex-column justify-content-center align-items-center p-3"
  >
    <div
      class="card-login border-0 overflow-hidden position-relative"
      style="max-width: 400px; width: 100%"
    >
      <div class="position-absolute top-0 end-0 p-3 mt-1 me-2">
        <span
          class="version-text text-uppercase fw-bold"
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
          <h1 class="h4 fw-bold title-text mb-1">Minha Saúde</h1>
          <p class="subtitle-text small">
            Bem-vindo à sua jornada de bem-estar
          </p>
        </div>

        <form @submit.prevent="handleLogin">
          <div class="mb-3">
            <label
              for="usuario"
              class="form-label small fw-bold text-uppercase label-text ms-1"
              >USUÁRIO</label
            >
            <input
              type="text"
              id="usuario"
              v-model="usuario"
              class="form-control form-control-lg bg-light border-0 rounded-3 shadow-none custom-input"
              :disabled="loading"
              required
            />
          </div>

          <div class="mb-4">
            <label
              for="password"
              class="form-label small fw-bold text-uppercase label-text ms-1"
              >SENHA</label
            >
            <div class="position-relative">
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="password"
                class="form-control form-control-lg bg-light border-0 rounded-3 shadow-none custom-input"
                :disabled="loading"
                required
              />
              <span
                @click="showPassword = !showPassword"
                class="password-toggle-icon"
              >
                <svg
                  v-if="!showPassword"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" />
                  <path
                    d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"
                  />
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588M5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z"
                  />
                  <path
                    d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z"
                  />
                </svg>
              </span>
            </div>
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
            class="btn btn-action btn-lg w-100 fw-bold py-3 mt-2"
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
      <p class="text-muted small opacity-50">
        &copy; {{ new Date().getFullYear() }} Minha Saúde
      </p>
    </footer>
  </div>
</template>

<style scoped>
.card-login {
  background-color: #ffffff;
  border-radius: 24px;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.05);
}

.version-text {
  color: #8898aa;
}

.logo-container {
  width: 64px;
  height: 64px;
  background-color: rgba(240, 98, 114, 0.1); /* Cor do ícone com opacidade */
  border-radius: 50%;
}

.title-text {
  color: #34475e;
}

.subtitle-text {
  color: #8898aa;
}

.label-text {
  color: #34475e;
}

.main-wrapper {
  background-color: #f4f7f9 !important;
}

.custom-input {
  background-color: #f8f9fa;
  border: none;
  border-radius: 10px;
  height: 50px;
  padding: 15px;
  padding-right: 2.5rem; /* Espaço para o ícone */
  color: #34475e;
  box-shadow: none !important;
}

.custom-input:focus {
  background-color: #ffffff !important;
  border: 1px solid #19bd82 !important;
}

.btn-action {
  background-color: #19bd82;
  color: white;
  border: none;
  border-radius: 10px;
  transition: filter 0.2s;
}

.btn-action:hover {
  filter: brightness(0.9);
}

.password-toggle-icon {
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  cursor: pointer;
  color: #8898aa;
  z-index: 5;
}
</style>
