<script>
import {
  atualizarMedicamento,
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
        id: null,
        nome: "",
        dosagem: "",
        tipo: "", // Novo campo
        periodo: "", // Novo campo
        quantidade_uso_dose: 1,
        observacao: "",
      },
      notificacao: { visivel: false, mensagem: "", tipo: "success" },
      deleteModalInstance: null,
      itemParaDeletarId: null,
      currentPage: 1,
      itemsPerPage: 10,
      isEditing: false,
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
        const dadosParaSalvar = { ...this.form };
        // Garante que quantidade_uso_dose seja um número inteiro
        dadosParaSalvar.quantidade_uso_dose =
          parseInt(dadosParaSalvar.quantidade_uso_dose) || 1;

        if (this.isEditing) {
          await atualizarMedicamento(this.form.id, dadosParaSalvar);
        } else {
          await salvarMedicamento(dadosParaSalvar);
        }

        this.exibirMensagem(
          `Medicamento ${this.isEditing ? "atualizado" : "salvo"} com sucesso!`,
        );
        // Limpa o formulário ou redefine para valores iniciais
        this.resetForm();
        await this.carregarDados();
      } catch (err) {
        this.exibirMensagem("Erro ao salvar o medicamento.", "error");
      } finally {
        this.enviando = false;
      }
    },
    resetForm() {
      this.form = {
        id: null,
        nome: "",
        dosagem: "",
        tipo: "",
        periodo: "",
        quantidade_uso_dose: 1,
        observacao: "",
      };
      this.isEditing = false;
    },
    handleMedicamentoSelection(event) {
      const medicamentoId = event.target.value;
      const selectedMedicamento = this.itensMedicamento.find(
        (item) => item.id === medicamentoId,
      );
      if (selectedMedicamento) {
        this.form = { ...selectedMedicamento };
        this.isEditing = true;
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
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
                {{ isEditing ? "Editar Medicamento" : "Novo Medicamento" }}
              </h3>

              <form @submit.prevent="handleSalvar">
                <div class="mb-3">
                  <label class="form-label">Medicamento</label>
                  <select
                    class="form-select"
                    v-model="form.id"
                    @change="handleMedicamentoSelection($event)"
                  >
                    <option :value="null" disabled>
                      Selecione um Medicamento
                    </option>
                    <option
                      v-for="item in itensMedicamento"
                      :key="item.id"
                      :value="item.id"
                    >
                      {{ item.nome }}
                      {{ item.dosagem ? `(${item.dosagem})` : "" }}
                    </option>
                  </select>
                </div>

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

                <div class="mb-3">
                  <label class="form-label">Tipo</label>
                  <select class="form-select" v-model="form.tipo">
                    <option value="">Selecione o Tipo</option>
                    <option value="Comprimido">Comprimido</option>
                    <option value="Gotas">Gotas</option>
                    <option value="Pomada">Pomada</option>
                    <option value="Xarope">Xarope</option>
                    <option value="Injeção">Injeção</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label">Período de Uso</label>
                  <select class="form-select" v-model="form.periodo">
                    <option value="">Selecione o Período</option>
                    <option value="Manhã">Manhã</option>
                    <option value="Tarde">Tarde</option>
                    <option value="Noite">Noite</option>
                    <option value="Manhã/Noite">Manhã/Noite</option>
                    <option value="Personalizado">Personalizado</option>
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label">Quantidade por Dose</label>
                  <input
                    type="number"
                    class="form-control"
                    v-model="form.quantidade_uso_dose"
                    min="1"
                  />
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
                    {{
                      enviando
                        ? "Salvando..."
                        : isEditing
                        ? "Atualizar Medicamento"
                        : "Salvar Medicamento"
                    }}
                  </button>
                  <button
                    v-if="isEditing"
                    type="button"
                    class="btn btn-outline-secondary mt-2"
                    @click="resetForm"
                  >
                    Cancelar Edição
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div class="row justify-content-center mt-5 mb-5">
        <div class="col-md-10">
          <h4 class="mb-3">Lista de Medicamentos</h4>

          <div
            class="table-responsive shadow-sm rounded-3"
            v-if="paginatedItems.length > 0"
          >
            <table class="grid-saude mb-0">
              <thead>
                <tr>
                  <th class="text-nowrap">Nome</th>
                  <th class="text-nowrap">Dosagem</th>
                  <th class="text-nowrap">Tipo</th>
                  <th class="text-nowrap">Período</th>
                  <th class="text-nowrap">Qtd/Dose</th>
                  <th class="text-nowrap">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in paginatedItems" :key="item.id">
                  <td class="text-nowrap">{{ item.nome }}</td>
                  <td class="text-nowrap">{{ item.dosagem || "-" }}</td>
                  <td>{{ item.tipo || "-" }}</td>
                  <td>{{ item.periodo || "-" }}</td>
                  <td>{{ item.quantidade_uso_dose || 1 }}</td>
                  <td>
                    <button
                      @click="
                        handleMedicamentoSelection({
                          target: { value: item.id },
                        })
                      "
                      class="btn btn-sm btn-outline-primary me-2"
                    >
                      Editar
                    </button>
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
