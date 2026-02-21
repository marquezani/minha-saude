<template>
  <div>
    <app-navbar />
    <div class="container pt-4">
      <div class="row justify-content-center mb-5">
        <div class="col-md-8 col-lg-6">
          <div class="card shadow-sm border-0 rounded-4">
            <div class="card-body p-4 p-md-5">
              <h3 class="card-title text-center mb-4 fw-bold">
                Novo Registro Corporal
              </h3>
              <form @submit.prevent="handleSalvarMedida">
                <div class="mb-3">
                  <label class="form-label">Data da Medição</label>
                  <input
                    type="date"
                    class="form-control"
                    v-model="formMedida.data"
                    required
                  />
                </div>
                <div class="row mb-3">
                  <div class="col">
                    <label class="form-label">Peso (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      class="form-control"
                      v-model="formMedida.peso"
                      placeholder="00.0"
                      required
                    />
                  </div>
                  <div class="col">
                    <label class="form-label">Cintura (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      class="form-control"
                      v-model="formMedida.circunferencia_abdominal"
                      placeholder="00"
                      required
                    />
                  </div>
                </div>
                <div class="d-grid">
                  <button
                    type="submit"
                    class="btn btn-primary btn-lg fw-bold"
                    :disabled="enviandoMedida"
                  >
                    {{ enviandoMedida ? "Salvando..." : "Salvar Medidas" }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div class="row justify-content-center mt-5 mb-5">
        <div class="col-md-10">
          <h4 class="mb-3">Histórico Corporal</h4>

          <div
            v-if="itensCorporais.length > 0"
            class="table-responsive shadow-sm rounded-3"
          >
            <table class="grid-saude mb-0">
              <thead>
                <tr>
                  <th class="text-nowrap">Data</th>
                  <th class="text-nowrap">Peso (kg)</th>
                  <th class="text-nowrap">Circunferência (cm)</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in itensCorporais" :key="item.id">
                  <td class="text-nowrap">{{ formatarData(item.data) }}</td>
                  <td class="fw-bold">{{ item.peso }} kg</td>
                  <td class="fw-bold">
                    {{ item.circunferencia_abdominal }} cm
                  </td>
                  <td>
                    <button
                      @click="handleDeletarMedida(item.id)"
                      class="btn btn-sm btn-outline-danger"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="text-center p-4 bg-light rounded shadow-sm">
            Nenhum registro de medidas encontrado.
          </div>
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
      id="deleteMedidaModal"
      tabindex="-1"
      ref="deleteModal"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-light">
            <h5 class="modal-title fw-bold text-danger">Confirmar Exclusão</h5>
            <button
              type="button"
              class="btn-close"
              @click="hideDeleteModal"
            ></button>
          </div>
          <div class="modal-body py-4 text-center">
            <p class="mb-0">
              Tem certeza que deseja excluir esta medição corporal?
            </p>
          </div>
          <div class="modal-footer border-0">
            <button class="btn btn-light px-4" @click="hideDeleteModal">
              Cancelar
            </button>
            <button class="btn btn-danger px-4" @click="confirmarExclusao">
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  obterMedidas,
  salvarMedida,
  deletarMedida,
} from "@/servers/medidaCorporalService";
import { Modal } from "bootstrap";
import AppNavbar from "@/components/Navbar.vue";

export default {
  components: {
    AppNavbar,
  },
  data() {
    return {
      enviandoMedida: false,
      itensCorporais: [],
      formMedida: {
        data: new Date().toISOString().substring(0, 10),
        peso: null,
        circunferencia_abdominal: null,
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
    async carregarMedidas() {
      try {
        this.itensCorporais = (await obterMedidas()) || [];
      } catch (err) {
        this.exibirMensagem("Erro ao carregar as medidas.", "error");
      }
    },
    async handleSalvarMedida() {
      this.enviandoMedida = true;
      try {
        await salvarMedida(this.formMedida);

        this.exibirMensagem("Medidas salvas com sucesso!");
        this.formMedida.peso = null;
        this.formMedida.circunferencia_abdominal = null;
        await this.carregarMedidas();
      } catch (err) {
        this.exibirMensagem("Erro ao salvar medidas.", "error");
      } finally {
        this.enviandoMedida = false;
      }
    },
    handleDeletarMedida(id) {
      this.itemParaDeletarId = id;
      this.deleteModalInstance.show();
    },
    hideDeleteModal() {
      this.deleteModalInstance.hide();
    },
    async confirmarExclusao() {
      try {
        await deletarMedida(this.itemParaDeletarId);
        this.exibirMensagem("Registro excluído!");
        await this.carregarMedidas();
      } catch (err) {
        this.exibirMensagem("Erro ao excluir", "error");
      } finally {
        this.hideDeleteModal();
      }
    },
    formatarData(data) {
      if (!data) return "";
      return new Date(data + "T12:00:00").toLocaleDateString("pt-BR");
    },
  },
  mounted() {
    this.carregarMedidas();
    if (this.$refs.deleteModal) {
      this.deleteModalInstance = new Modal(this.$refs.deleteModal);
    }
  },
};
</script>

<style scoped>
.table-responsive {
  display: block;
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.grid-saude {
  width: 100%;
  border-collapse: separate;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  min-width: 600px;
}

.text-nowrap {
  white-space: nowrap;
}

.grid-saude th {
  background: #f8fafc;
  padding: 15px;
  color: #64748b;
  font-size: 0.8rem;
  text-transform: uppercase;
  border-bottom: 2px solid #f1f5f9;
}

.grid-saude td {
  padding: 12px 15px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
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
  background-color: #10b981;
}
.error {
  background-color: #ef4444;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
