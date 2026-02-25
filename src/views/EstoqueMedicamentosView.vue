<script>
import {
  salvarEstoque,
  obterEstoque,
  deletarEstoque,
} from "@/servers/estoqueService";
import { obterMedicamentos } from "@/servers/medicamentosService"; // Para obter a lista de medicamentos
import { Modal } from "bootstrap";
import AppNavbar from "@/components/Navbar.vue";

export default {
  components: {
    AppNavbar,
  },
  data() {
    return {
      enviando: false,
      form: {
        id: null, // Usado para edição de um item de estoque existente
        medicamento_id: null,
        quantidade_estoque: 0,
        quantidade_minima: 5,
        ativo: true,
      },
      estoqueItens: [], // Lista de itens de estoque
      medicamentosDisponiveis: [], // Lista de medicamentos para seleção no formulário
      notificacao: { visivel: false, mensagem: "", tipo: "success" },
      deleteModalInstance: null,
      itemParaDeletarId: null,
      currentPage: 1,
      itemsPerPage: 10,
      isEditing: false, // Indica se o formulário está em modo de edição
    };
  },
  computed: {
    totalPages() {
      if (!this.estoqueItens || this.estoqueItens.length === 0) {
        return 1;
      }
      return Math.ceil(this.estoqueItens.length / this.itemsPerPage);
    },
    paginatedItems() {
      if (!this.estoqueItens || this.estoqueItens.length === 0) {
        return [];
      }
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.estoqueItens.slice(start, end);
    },
    // Filtra os medicamentos disponíveis para seleção, removendo aqueles que já possuem um registro de estoque,
    // a menos que estejamos editando o próprio registro de estoque desse medicamento.
    medicamentosParaSelecao() {
      return this.medicamentosDisponiveis.filter((med) => {
        return !this.estoqueItens.some(
          (estoque) =>
            estoque.medicamento_id === med.id && estoque.id !== this.form.id,
        );
      });
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
    async carregarMedicamentos() {
      try {
        this.medicamentosDisponiveis = (await obterMedicamentos()) || [];
      } catch (err) {
        console.error("Erro ao carregar medicamentos:", err);
        this.exibirMensagem(
          "Erro ao carregar medicamentos para seleção",
          "error",
        );
      }
    },
    async carregarEstoqueDados() {
      try {
        this.estoqueItens = (await obterEstoque()) || [];
      } catch (err) {
        console.error("Erro ao carregar estoque:", err);
        this.exibirMensagem("Erro ao carregar dados do estoque", "error");
      }
    },
    async handleSalvar() {
      this.enviando = true;
      try {
        // Prepara os dados para salvar
        const dadosParaSalvar = {
          medicamento_id: this.form.medicamento_id,
          quantidade_estoque: parseInt(this.form.quantidade_estoque) || 0,
          quantidade_minima: parseInt(this.form.quantidade_minima) || 5,
          ativo: this.form.ativo,
        };

        // Se estiver editando, o ID do estoque já estará no form.id e será usado pelo serviço
        // para identificar o registro a ser atualizado.

        await salvarEstoque(dadosParaSalvar);

        this.exibirMensagem("Estoque salvo com sucesso!");
        this.resetForm(); // Limpa o formulário
        await this.carregarEstoqueDados(); // Recarrega a lista de estoque
        await this.carregarMedicamentos(); // Recarrega medicamentos para atualizar opções de seleção
      } catch (err) {
        console.error("Erro detalhado ao salvar estoque:", err);
        this.exibirMensagem("Erro ao salvar o estoque.", "error");
      } finally {
        this.enviando = false;
      }
    },
    resetForm() {
      this.form = {
        id: null,
        medicamento_id: null,
        quantidade_estoque: 0,
        quantidade_minima: 5,
        ativo: true,
      };
      this.isEditing = false;
    },
    handleEditar(item) {
      // Copia os dados do item para o formulário para edição
      this.form = { ...item };
      // Garante que os campos numéricos sejam tratados como números
      this.form.quantidade_estoque = parseInt(item.quantidade_estoque);
      this.form.quantidade_minima = parseInt(item.quantidade_minima);
      this.isEditing = true;
      // Rola para o topo da página para exibir o formulário de edição
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
        await deletarEstoque(this.itemParaDeletarId);
        this.exibirMensagem("Item de estoque excluído!");
        await this.carregarEstoqueDados(); // Recarrega a lista de estoque
        await this.carregarMedicamentos(); // Recarrega medicamentos para atualizar opções de seleção
        if (this.currentPage > this.totalPages) {
          this.currentPage = this.totalPages;
        }
      } catch (err) {
        console.error("Erro ao excluir item de estoque:", err);
        this.exibirMensagem("Erro ao excluir item de estoque", "error");
      } finally {
        this.hideDeleteModal();
      }
    },
    formatarData(iso) {
      if (!iso) return "-";
      // Formata a data e hora para o padrão brasileiro
      return (
        new Date(iso).toLocaleDateString("pt-BR") +
        " " +
        new Date(iso).toLocaleTimeString("pt-BR")
      );
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
  async mounted() {
    // Carrega os medicamentos e os dados do estoque ao montar o componente
    await this.carregarMedicamentos();
    await this.carregarEstoqueDados();
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
                {{
                  isEditing
                    ? "Editar Estoque de Medicamento"
                    : "Registro de Estoque de Medicamento"
                }}
              </h3>

              <form @submit.prevent="handleSalvar">
                <div class="mb-3">
                  <label class="form-label">Medicamento</label>
                  <select
                    class="form-select"
                    v-model="form.medicamento_id"
                    required
                    :disabled="isEditing"
                  >
                    <option :value="null" disabled>
                      Selecione um Medicamento
                    </option>
                    <option
                      v-for="med in medicamentosParaSelecao"
                      :key="med.id"
                      :value="med.id"
                    >
                      {{ med.nome }} {{ med.dosagem ? `(${med.dosagem})` : "" }}
                    </option>
                    <!-- Se estiver editando e o medicamento atual não estiver na lista filtrada, exibe-o -->
                    <option
                      v-if="
                        isEditing &&
                        form.medicamento_id &&
                        !medicamentosParaSelecao.some(
                          (m) => m.id === form.medicamento_id,
                        )
                      "
                      :value="form.medicamento_id"
                      selected
                    >
                      {{ form.medicamentos.nome }}
                      {{
                        form.medicamentos.dosagem
                          ? `(${form.medicamentos.dosagem})`
                          : ""
                      }}
                      (Atual)
                    </option>
                  </select>
                  <div v-if="isEditing" class="form-text text-muted">
                    O medicamento não pode ser alterado durante a edição de um
                    item de estoque existente.
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Quantidade em Estoque</label>
                  <input
                    type="number"
                    class="form-control"
                    v-model="form.quantidade_estoque"
                    min="0"
                    required
                  />
                </div>

                <div class="mb-3">
                  <label class="form-label"
                    >Quantidade Mínima para Alerta</label
                  >
                  <input
                    type="number"
                    class="form-control"
                    v-model="form.quantidade_minima"
                    min="0"
                    required
                  />
                </div>

                <div class="mb-4 form-check form-switch">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="ativoSwitch"
                    v-model="form.ativo"
                  />
                  <label class="form-check-label" for="ativoSwitch"
                    >Ativo</label
                  >
                </div>

                <div class="d-grid gap-2">
                  <button
                    type="submit"
                    class="btn btn-primary btn-lg fw-bold"
                    :disabled="enviando || !form.medicamento_id"
                  >
                    {{
                      enviando
                        ? "Salvando..."
                        : isEditing
                        ? "Atualizar Estoque"
                        : "Salvar Estoque"
                    }}
                  </button>
                  <button
                    v-if="isEditing"
                    type="button"
                    class="btn btn-outline-secondary btn-lg"
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
          <h4 class="mb-3">Estoque de Medicamentos</h4>

          <div
            class="table-responsive shadow-sm rounded-3"
            v-if="paginatedItems.length > 0"
          >
            <table class="grid-saude mb-0">
              <thead>
                <tr>
                  <th class="text-nowrap">Medicamento</th>
                  <th class="text-nowrap">Estoque Atual</th>
                  <th class="text-nowrap">Estoque Mínimo</th>
                  <th class="text-nowrap">Ativo</th>
                  <th class="text-nowrap">Última Atualização</th>
                  <th class="text-nowrap">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in paginatedItems" :key="item.id">
                  <td class="text-nowrap">
                    {{ item.medicamentos.nome }}
                    {{
                      item.medicamentos.dosagem
                        ? `(${item.medicamentos.dosagem})`
                        : ""
                    }}
                  </td>
                  <td>{{ item.quantidade_estoque }}</td>
                  <td>{{ item.quantidade_minima }}</td>
                  <td>
                    <span
                      :class="[
                        'badge',
                        item.ativo ? 'bg-success' : 'bg-danger',
                      ]"
                    >
                      {{ item.ativo ? "Sim" : "Não" }}
                    </span>
                  </td>
                  <td>{{ formatarData(item.ultima_atualizacao) }}</td>
                  <td>
                    <button
                      @click="handleEditar(item)"
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
            Nenhum item de estoque registrado.
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
            <p class="mb-0">
              Tem certeza que deseja excluir este item de estoque?
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
