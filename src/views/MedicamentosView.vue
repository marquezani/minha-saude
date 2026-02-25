<script>
import {
  salvarMedicamento,
  obterMedicamentos,
  deletarMedicamento,
} from "@/servers/medicamentosService"; // Importa o novo serviço
import { Modal } from "bootstrap";
import AppNavbar from "@/components/Navbar.vue";

export default {
  components: {
    AppNavbar,
  },
  data() {
    return {
      enviando: false,
      itensMedicamento: [], // Lista de medicamentos
      form: {
        nome: "",
        dosagem: "",
        frequencia_horas: null,
        horario_inicio: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        data_inicio: new Date().toISOString().substring(0, 10),
        data_fim: null, // Opcional
        estoque_atual: 0,
        alerta_estoque_baixo: 5,
        observacao: "",
      },
      notificacao: { visivel: false, mensagem: "", tipo: "success" },
      deleteModalInstance: null,
      itemParaDeletarId: null,
      currentPage: 1,
      itemsPerPage: 10,
    };
  },
  computed: {
    totalPages() {
      if (!this.itensMedicamento || this.itensMedicamento.length === 0) {
        return 1;
      }
      return Math.ceil(this.itensMedicamento.length / this.itemsPerPage);
    },
    paginatedItems() {
      if (!this.itensMedicamento || this.itensMedicamento.length === 0) {
        return [];
      }
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.itensMedicamento.slice(start, end);
    },
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
        this.itensMedicamento = (await obterMedicamentos()) || [];
      } catch (err) {
        console.error("Erro ao carregar medicamentos:", err);
        this.exibirMensagem("Erro ao carregar medicamentos", "error");
      }
    },
    async handleSalvar() {
      this.enviando = true;
      try {
        // Prepara os dados para salvar, garantindo que números sejam números e datas sejam strings
        const dadosParaSalvar = {
          ...this.form,
          frequencia_horas: this.form.frequencia_horas
            ? parseInt(this.form.frequencia_horas)
            : null,
          estoque_atual: this.form.estoque_atual
            ? parseInt(this.form.estoque_atual)
            : 0,
          alerta_estoque_baixo: this.form.alerta_estoque_baixo
            ? parseInt(this.form.alerta_estoque_baixo)
            : 5,
          // data_fim pode ser null, então não precisa de conversão se já for string ou null
        };

        await salvarMedicamento(dadosParaSalvar);

        this.exibirMensagem("Medicamento salvo com sucesso!");
        // Limpa o formulário ou redefine para valores iniciais
        this.form = {
          nome: "",
          dosagem: "",
          frequencia_horas: null,
          horario_inicio: new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          data_inicio: new Date().toISOString().substring(0, 10),
          data_fim: null,
          estoque_atual: 0,
          alerta_estoque_baixo: 5,
          observacao: "",
        };
        await this.carregarDados();
      } catch (err) {
        console.error("Erro detalhado ao salvar medicamento:", err);
        this.exibirMensagem("Erro ao salvar o medicamento.", "error");
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
        await deletarMedicamento(this.itemParaDeletarId);
        this.exibirMensagem("Medicamento excluído!");
        await this.carregarDados();
        if (this.currentPage > this.totalPages) {
          this.currentPage = this.totalPages;
        }
      } catch (err) {
        console.error("Erro ao excluir medicamento:", err);
        this.exibirMensagem("Erro ao excluir medicamento", "error");
      } finally {
        this.hideDeleteModal();
      }
    },
    formatarData(iso) {
      if (!iso) return "-";
      return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR"); // Adiciona T00:00:00 para evitar problemas de fuso horário
    },
    formatarHora(timeString) {
      if (!timeString) return "-";
      // Assumindo que timeString já está no formato HH:MM
      return timeString;
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    goToPage(page) {
      this.currentPage = page;
    },
  },
  mounted() {
    this.carregarDados();
    if (this.$refs.deleteModal)
      this.deleteModalInstance = new Modal(this.$refs.deleteModal);
  },
};
</script>

<template>
  <div>
    <app-navbar />
    <div class="container pt-4">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          <div class="card shadow-sm border-0 rounded-4">
            <div class="card-body p-4 p-md-5">
              <h3 class="card-title text-center mb-4 fw-bold">
                Registro de Medicamentos
              </h3>

              <form @submit.prevent="handleSalvar">
                <div class="mb-3">
                  <label class="form-label">Nome do Medicamento</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="form.nome"
                    required
                  />
                </div>

                <div class="mb-3">
                  <label class="form-label">Dosagem</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="form.dosagem"
                  />
                </div>

                <div class="row mb-3">
                  <div class="col-md-6">
                    <label class="form-label">Frequência (horas)</label>
                    <input
                      type="number"
                      class="form-control"
                      v-model="form.frequencia_horas"
                      min="1"
                    />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Horário de Início</label>
                    <input
                      type="time"
                      class="form-control"
                      v-model="form.horario_inicio"
                    />
                  </div>
                </div>

                <div class="row mb-3">
                  <div class="col-md-6">
                    <label class="form-label">Data de Início</label>
                    <input
                      type="date"
                      class="form-control"
                      v-model="form.data_inicio"
                      required
                    />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Data de Fim (Opcional)</label>
                    <input
                      type="date"
                      class="form-control"
                      v-model="form.data_fim"
                    />
                  </div>
                </div>

                <div class="row mb-3">
                  <div class="col-md-6">
                    <label class="form-label">Estoque Atual</label>
                    <input
                      type="number"
                      class="form-control"
                      v-model="form.estoque_atual"
                      min="0"
                    />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Alerta Estoque Baixo</label>
                    <input
                      type="number"
                      class="form-control"
                      v-model="form.alerta_estoque_baixo"
                      min="0"
                    />
                  </div>
                </div>

                <div class="mb-4">
                  <label class="form-label">Observação</label>
                  <textarea
                    class="form-control"
                    v-model="form.observacao"
                    rows="3"
                  ></textarea>
                </div>

                <div class="d-grid">
                  <button
                    type="submit"
                    class="btn btn-primary btn-lg fw-bold"
                    :disabled="enviando"
                  >
                    {{ enviando ? "Salvando..." : "Salvar Medicamento" }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div class="row justify-content-center mt-5 mb-5">
        <div class="col-md-10">
          <h4 class="mb-3">Meus Medicamentos</h4>

          <div
            class="table-responsive shadow-sm rounded-3"
            v-if="paginatedItems.length > 0"
          >
            <table class="grid-saude mb-0">
              <thead>
                <tr>
                  <th class="text-nowrap">Nome</th>
                  <th class="text-nowrap">Dosagem</th>
                  <th class="text-nowrap">Freq.</th>
                  <th class="text-nowrap">Início</th>
                  <th class="text-nowrap">Fim</th>
                  <th class="text-nowrap">Estoque</th>
                  <th class="text-nowrap">Alerta</th>
                  <th class="text-nowrap">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in paginatedItems" :key="item.id">
                  <td class="text-nowrap">{{ item.nome }}</td>
                  <td class="text-nowrap">{{ item.dosagem || "-" }}</td>
                  <td>
                    <span v-if="item.frequencia_horas" class="fw-bold">
                      {{ item.frequencia_horas }}h
                    </span>
                    <span v-else>-</span>
                  </td>
                  <td class="text-nowrap">
                    {{ formatarData(item.data_inicio) }} às
                    {{ formatarHora(item.horario_inicio) }}
                  </td>
                  <td class="text-nowrap">
                    {{ formatarData(item.data_fim) }}
                  </td>
                  <td>{{ item.estoque_atual }}</td>
                  <td>{{ item.alerta_estoque_baixo }}</td>
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
          </div>
          <div v-else class="text-center p-4 bg-light rounded">
            Nenhum medicamento registrado.
          </div>

          <div v-if="totalPages > 1" class="d-flex justify-content-center mt-4">
            <nav aria-label="Page navigation">
              <ul class="pagination">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a class="page-link" href="#" @click.prevent="prevPage"
                    >Anterior</a
                  >
                </li>
                <li
                  v-for="page in totalPages"
                  :key="page"
                  class="page-item"
                  :class="{ active: currentPage === page }"
                >
                  <a
                    class="page-link"
                    href="#"
                    @click.prevent="goToPage(page)"
                    >{{ page }}</a
                  >
                </li>
                <li
                  class="page-item"
                  :class="{ disabled: currentPage === totalPages }"
                >
                  <a class="page-link" href="#" @click.prevent="nextPage"
                    >Próximo</a
                  >
                </li>
              </ul>
            </nav>
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
      id="deleteConfirmModal"
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
            <p class="mb-0">Tem certeza que deseja excluir este medicamento?</p>
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

<style scoped>
/* Estilos ajustados para Responsividade */
.table-responsive {
  border: 1px solid #f1f5f9;
}

.grid-saude {
  width: 100%;
  border-collapse: separate;
  background: #fff;
  min-width: 600px; /* Garante que a tabela não esmague os dados */
}

.grid-saude th {
  background: #f8fafc;
  padding: 12px 15px;
  color: #64748b;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  border-bottom: 2px solid #f1f5f9;
}

.grid-saude td {
  padding: 12px 15px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  font-size: 0.9rem;
}

.text-nowrap {
  white-space: nowrap;
  color: #475569;
  font-weight: bold;
}

/* Toast Customizado */
.toast-custom {
  position: fixed;
  top: 25px;
  right: 25px;
  padding: 16px 24px;
  border-radius: 12px;
  color: white;
  z-index: 10000;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  font-weight: 600;
}

.success {
  background-color: #10b981;
}
.error {
  background-color: #ef4444;
}

/* Transições */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px) translateX(10px);
}

@media (max-width: 576px) {
  .card-body {
    padding: 1.5rem !important;
  }
  .h3 {
    font-size: 1.25rem;
  }
}
</style>
