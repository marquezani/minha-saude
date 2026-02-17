<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-end mb-3">
      <button @click="handleLogout" class="btn btn-outline-danger">Sair</button>
    </div>
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6">
        <div class="card shadow-sm border-0 rounded-4">
          <div class="card-body p-4 p-md-5">
            <h3 class="card-title text-center mb-4 fw-bold">
              Novo Registro de Glicose
            </h3>

            <form @submit.prevent="handleSalvar">
              <div class="row mb-3">
                <div class="col">
                  <label class="form-label">Data</label>
                  <input
                    type="date"
                    class="form-control"
                    v-model="form.data"
                    required
                  />
                </div>
                <div class="col">
                  <label class="form-label">Horário</label>
                  <input
                    type="time"
                    class="form-control"
                    v-model="form.horario"
                    required
                  />
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label d-block fw-semibold"
                  >Estado de Jejum</label
                >
                <div class="btn-group w-100" role="group">
                  <input
                    type="radio"
                    class="btn-check"
                    id="jejumSim"
                    value="sim"
                    v-model="form.emJejum"
                  />
                  <label class="btn btn-outline-primary" for="jejumSim"
                    >Sim</label
                  >

                  <input
                    type="radio"
                    class="btn-check"
                    id="jejumNao"
                    value="não"
                    v-model="form.emJejum"
                  />
                  <label class="btn btn-outline-primary" for="jejumNao"
                    >Não</label
                  >
                </div>
              </div>

              <div class="mb-4">
                <label class="form-label">Medição (mg/dL)</label>
                <div class="input-group">
                  <input
                    type="number"
                    class="form-control form-control-lg"
                    v-model="form.mdDl"
                    required
                  />
                  <span class="input-group-text">mg/dL</span>
                </div>
              </div>

              <div class="d-grid">
                <button
                  type="submit"
                  class="btn btn-primary btn-lg fw-bold"
                  :disabled="enviando"
                >
                  {{ enviando ? "Salvando..." : "Salvar Registro" }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <div class="row justify-content-center mt-5">
      <div class="col-md-10">
        <h4 class="mb-3">Histórico de Medições</h4>
        <table class="grid-saude" v-if="itensGlicose.length != 0">
          <thead>
            <tr>
              <th>Data</th>
              <th>Horário</th>
              <th>Em Jejum?</th>
              <th>mg/dL</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in itensGlicose" :key="item.id">
              <td>{{ formatarData(item.data) }}</td>
              <td>{{ item.horario }}</td>
              <td>
                <span
                  :class="[
                    'status-badge',
                    item.emJejum === 'sim' ? 'status-jejum' : 'status-normal',
                  ]"
                >
                  {{ item.emJejum }}
                </span>
              </td>
              <td>
                <strong>{{ item.mdDl }}</strong>
              </td>
            </tr>
          </tbody>
        </table>
        <span v-if="itensGlicose.length === 0" class="mensagem-sem-registro"
          >Nenhum registro encontrado.</span
        >
      </div>
    </div>

    <transition name="fade">
      <div
        v-if="notificacao.visivel"
        :class="['toast-custom', notificacao.tipo]"
      >
        {{ notificacao.mensagem }}
      </div>
    </transition>
  </div>
</template>

<script>
import { obterRegistros, salvarRegistro } from "@/servers/glicoseServe";
import { logout } from "../servers/authService";

export default {
  data() {
    return {
      enviando: false,
      itensGlicose: [],
      form: {
        data: new Date().toISOString().substr(0, 10),
        horario: "",
        emJejum: "sim",
        mdDl: null,
      },
      notificacao: {
        visivel: false,
        mensagem: "",
        tipo: "success",
      },
    };
  },
  methods: {
    exibirMensagem(texto, tipo = "success") {
      this.notificacao.mensagem = texto;
      this.notificacao.tipo = tipo;
      this.notificacao.visivel = true;
      setTimeout(() => {
        this.notificacao.visivel = false;
      }, 3000);
    },
    async carregarDados() {
      try {
        const res = await obterRegistros();
        this.itensGlicose = res.data;
      } catch (err) {
        console.error("Erro na API:", err);
      }
    },
    async handleSalvar() {
      this.enviando = true;
      try {
        const response = await salvarRegistro(this.form);
        // O json-server retorna 201 Created para POST com sucesso
        if (response.status === 201 || response.status === 200) {
          this.exibirMensagem("Registro salvo com sucesso!");
          this.form.mdDl = null; // Limpa apenas o valor da glicose
          await this.carregarDados(); // Recarrega a grid
        }
      } catch (err) {
        this.exibirMensagem("Erro ao salvar o registro.", "error");
      } finally {
        this.enviando = false;
      }
    },
    formatarData(data) {
      if (!data) return "";
      return data.split("-").reverse().join("/");
    },
    handleLogout() {
      logout();
      this.$router.push("/");
    },
  },
  mounted() {
    this.carregarDados();
  },
};
</script>

<style scoped>
.mensagem-sem-registro {
  margin-top: 20px;
  font-size: 18px;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}

/* Estilos mantidos conforme sua solicitação */
.grid-saude {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}
.grid-saude th {
  background: #f8fafc;
  padding: 15px;
  color: #64748b;
  font-size: 0.8rem;
  text-transform: uppercase;
  text-align: left;
}
.grid-saude td {
  padding: 12px 15px;
  border-bottom: 1px solid #f1f5f9;
}
.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
}
.status-jejum {
  background: #dcfce7;
  color: #166534;
}
.status-normal {
  background: #f1f5f9;
  color: #475569;
}
.toast-custom {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 25px;
  border-radius: 8px;
  color: white;
  font-weight: bold;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.success {
  background-color: #2ecc71;
}
.error {
  background-color: #e74c3c;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s, transform 0.5s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
