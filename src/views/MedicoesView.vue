<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-end mb-3">
      <button @click="handleLogout" class="btn btn-outline-danger shadow-sm">
        Sair
      </button>
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

              <div v-if="form.emJejum === 'sim'">
                <label class="form-label fw-semibold">Início do Jejum</label>
                <div class="row mb-3">
                  <div class="col">
                    <input
                      type="date"
                      class="form-control"
                      v-model="form.dataInicioJejum"
                      required
                    />
                  </div>
                  <div class="col">
                    <input
                      type="time"
                      class="form-control"
                      v-model="form.inicioJejum"
                      required
                    />
                  </div>
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
        <table class="grid-saude" v-if="itensGlicose.length > 0">
          <thead>
            <tr>
              <th>Data</th>
              <th>Horário</th>
              <th>Em Jejum?</th>
              <th>mg/dL</th>
              <th>Horas em Jejum</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in itensGlicose" :key="item.id">
              <td>{{ formatarData(item.data_horario) }}</td>
              <td>{{ formatarHora(item.data_horario) }}</td>
              <td>
                <span
                  :class="[
                    'status-badge',
                    item.em_jejum ? 'status-jejum' : 'status-normal',
                  ]"
                >
                  {{ item.em_jejum ? "Sim" : "Não" }}
                </span>
              </td>
              <td class="fw-bold">{{ item.mg_dl }}</td>
              <td>
                <span v-if="item.em_jejum && item.horas_jejum" class="fw-bold">
                  {{ item.horas_jejum }}
                </span>
                <span v-else>-</span>
              </td>
              <td>
                <button
                  @click="handleDeletar(item.id)"
                  class="btn btn-sm btn-outline-danger"
                >
                  Excluir
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="text-center p-4 bg-light rounded">
          Nenhum registro encontrado.
        </div>
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

    <div
      class="modal fade"
      id="deleteConfirmModal"
      tabindex="-1"
      ref="deleteModal"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmar Exclusão</h5>
            <button
              type="button"
              class="btn-close"
              @click="hideDeleteModal"
            ></button>
          </div>
          <div class="modal-body">
            <p>Tem certeza que deseja excluir este registro?</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="hideDeleteModal">
              Cancelar
            </button>
            <button class="btn btn-danger" @click="confirmarExclusao">
              Sim, Excluir
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  obterRegistros,
  salvarRegistro,
  deletarRegistro,
} from "@/servers/glicoseServe";
import { logout } from "../servers/authService";
import { Modal } from "bootstrap";

export default {
  data() {
    return {
      enviando: false,
      itensGlicose: [],
      form: {
        data: new Date().toISOString().substring(0, 10),
        horario: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        emJejum: "não",
        mdDl: null,
        dataInicioJejum: new Date(Date.now() - 86400000)
          .toISOString()
          .substring(0, 10),
        inicioJejum: "22:00",
      },
      notificacao: { visivel: false, mensagem: "", tipo: "success" },
      deleteModalInstance: null,
      itemParaDeletarId: null,
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
        this.itensGlicose = (await obterRegistros()) || [];
      } catch (err) {
        this.exibirMensagem("Erro ao carregar dados", "error");
      }
    },
    async handleSalvar() {
      this.enviando = true;
      try {
        // Cálculo das horas de jejum se aplicável
        let horasCalculadas = null;
        if (this.form.emJejum === "sim") {
          horasCalculadas = this.calcularHorasJejum(
            this.form.dataInicioJejum,
            this.form.inicioJejum,
            this.form.data,
            this.form.horario,
          );
        }

        const payload = {
          data_horario: `${this.form.data}T${this.form.horario}:00`,
          em_jejum: this.form.emJejum === "sim",
          mg_dl: parseInt(this.form.mdDl),
          horas_jejum: horasCalculadas !== "Erro" ? horasCalculadas : null,
        };

        await salvarRegistro(payload);
        this.exibirMensagem("Registro salvo com sucesso!");
        this.form.mdDl = null;
        await this.carregarDados();
      } catch (err) {
        this.exibirMensagem("Erro ao salvar o registro.", "error");
      } finally {
        this.enviando = false;
      }
    },
    handleDeletar(id) {
      this.itemParaDeletarId = id;
      this.deleteModalInstance.show();
    },
    hideDeleteModal() {
      this.deleteModalInstance.hide();
    },
    async confirmarExclusao() {
      try {
        await deletarRegistro(this.itemParaDeletarId);
        this.exibirMensagem("Registro excluído!");
        await this.carregarDados();
      } catch (err) {
        this.exibirMensagem("Erro ao excluir", "error");
      } finally {
        this.hideDeleteModal();
      }
    },
    formatarData(iso) {
      return new Date(iso).toLocaleDateString("pt-BR");
    },
    formatarHora(iso) {
      return new Date(iso).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    calcularHorasJejum(dataI, horaI, dataF, horaF) {
      const inicio = new Date(`${dataI}T${horaI}`);
      const fim = new Date(`${dataF}T${horaF}`);
      const diffMs = fim - inicio;
      if (diffMs < 0) return "Erro";
      const totalMin = Math.floor(diffMs / 60000);
      return `${Math.floor(totalMin / 60)
        .toString()
        .padStart(2, "0")}:${(totalMin % 60).toString().padStart(2, "0")}`;
    },
    handleLogout() {
      logout();
      this.$router.push("/");
    },
  },
  mounted() {
    this.carregarDados();
    if (this.$refs.deleteModal)
      this.deleteModalInstance = new Modal(this.$refs.deleteModal);
  },
};
</script>

<style scoped>
/* Estilos ajustados para legibilidade */
.grid-saude {
  width: 100%;
  border-collapse: separate;
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
  z-index: 9999;
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
