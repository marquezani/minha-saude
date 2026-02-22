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
    const encodedPassword = btoa(password.value); // Codifica a senha para Base64
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
    class="container vh-100 d-flex justify-content-center align-items-center"
  >
    <div class="card p-4 shadow-sm" style="width: 100%; max-width: 400px">
      <span class="versao">V 1.7</span>
      <div class="card-body">
        <div class="text-center mb-4">
          <svg
            version="1.0"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 5120 5120"
            class="me-2 text-danger"
            style="height: 52px"
            fill="currentColor"
            stroke="none"
          >
            <g transform="translate(0,5120) scale(1,-1)">
              <path
                d="M1645 3985 c-180 -33 -322 -111 -451 -248 -88 -92 -143 -183 -186 -307 -31 -91 -32 -101 -33 -250 0 -120 4 -168 18 -215 14 -49 44 -129 53 -143 1 -2 36 14 78 35 58 28 75 41 70 53 -52 118 -67 272 -40 400 53 251 257 453 510 504 125 25 228 18 346 -25 127 -47 170 -79 363 -268 l187 -184 188 184 c192 189 235 221 362 268 118 43 221 50 346 25 253 -51 457 -253 510 -504 27 -128 12 -282 -40 -400 -5 -12 12 -25 70 -53 42 -21 77 -37 78 -35 9 14 39 94 53 143 14 47 18 95 18 215 -1 149 -2 159 -33 250 -43 124 -98 215 -186 307 -230 243 -557 323 -873 214 -124 -43 -221 -109 -365 -250 l-128 -124 -133 129 c-92 89 -158 144 -213 176 -175 103 -375 139 -569 103z"
              />
              <path
                d="M1625 3186 c-28 -13 -63 -38 -79 -57 -15 -18 -74 -124 -129 -236 l-102 -203 -485 -2 -485 -3 0 -85 0 -85 535 0 535 0 126 249 c69 137 134 255 144 262 20 15 62 18 90 8 9 -4 70 -77 135 -163 64 -86 130 -168 146 -183 44 -41 101 -61 171 -61 83 1 141 30 201 101 85 102 98 112 135 112 44 0 53 -8 181 -158 148 -174 204 -210 311 -199 111 11 172 66 254 227 30 58 60 113 68 122 23 26 70 32 99 14 13 -9 72 -89 131 -176 l106 -160 531 2 531 3 0 85 0 85 -490 3 -490 3 -79 120 c-116 175 -166 212 -286 212 -120 1 -185 -54 -275 -232 -67 -135 -96 -159 -157 -130 -13 6 -79 76 -147 156 -142 167 -181 193 -286 193 -93 0 -150 -32 -226 -124 -61 -75 -90 -94 -134 -87 -30 4 -40 15 -153 166 -58 77 -117 153 -131 169 -67 74 -199 98 -296 52z"
              />
              <path d="M0 2600 l0 -90 85 0 85 0 0 90 0 90 -85 0 -85 0 0 -90z" />
              <path
                d="M4950 2600 l0 -90 85 0 85 0 0 90 0 90 -85 0 -85 0 0 -90z"
              />
              <path
                d="M1536 2357 c-43 -39 -57 -57 -51 -67 14 -22 1069 -1175 1075 -1175 9 0 1080 1175 1080 1184 0 5 -28 33 -61 62 -60 52 -62 53 -78 33 -50 -61 -934 -1024 -941 -1024 -4 0 -221 233 -480 518 -260 284 -475 518 -479 519 -3 1 -33 -21 -65 -50z"
              />
            </g>
          </svg>
          <h1 class="h3 fw-bold mt-2 mb-4">Minha Saúde</h1>
        </div>
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

<style scoped>
.versao {
  display: block;
  text-align: right;
  margin-top: 10px;
  color: #888;
  font-size: 8px;
}
</style>
