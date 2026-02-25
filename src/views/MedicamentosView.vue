<script>
import { obterMedicamentos } from "@/servers/medicamentosService";
import {
  salvarUsoMedicamento,
  obterHistoricoUso,
  deletarHistoricoUso,
} from "@/servers/historicoUsoService";
import { darBaixaEstoque, obterEstoque } from "@/servers/estoqueService";
import { Modal } from "bootstrap";
import AppNavbar from "@/components/Navbar.vue";

export default {
  components: {
    AppNavbar,
  },
  data() {
    return {
      enviando: false,
      historicoUso: [], // Lista do histórico de uso
      medicamentosDisponiveis: [], // Lista de medicamentos para o formulário
      estoqueItens: [],
      form: {
        medicamento_id: null,
        quantidade_usada: 1,
        data_hora_uso: new Date().toISOString().slice(0, 16), // Formato 'YYYY-MM-DDTHH:mm'
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
      if (!this.historicoUso || this.historicoUso.length === 0) {
        return 1;
      }
      return Math.ceil(this.historicoUso.length / this.itemsPerPage);
    },
    paginatedItems() {
      if (!this.historicoUso || this.historicoUso.length === 0) {
        return [];
      }
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.historicoUso.slice(start, end);
    },
    medicamentosEmEstoque() {
      if (!this.medicamentosDisponiveis.length || !this.estoqueItens.length) {
        return [];
      }

      // Cria um conjunto de IDs de medicamentos que estão em estoque com quantidade > 0
      const emEstoqueIds = new Set(
        this.estoqueItens
          .filter((item) => item.quantidade_estoque > 0)
          .map((item) => item.medicamento_id),
      );

      // Filtra a lista de medicamentos para mostrar apenas os que estão em estoque
      return this.medicamentosDisponiveis.filter((med) =>
        emEstoqueIds.has(med.id),
      );
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
    async carregarHistorico() {
      try {
        this.historicoUso = (await obterHistoricoUso()) || [];
      } catch (err) {
        console.error("Erro ao carregar histórico:", err);
        this.exibirMensagem("Erro ao carregar histórico de uso", "error");
      }
    },
    async carregarMedicamentos() {
      try {
        this.medicamentosDisponiveis = (await obterMedicamentos()) || [];
      } catch (err) {
        console.error("Erro ao carregar medicamentos para o formulário:", err);
        this.exibirMensagem("Erro ao carregar lista de medicamentos", "error");
      }
    },
    async carregarEstoque() {
      try {
        this.estoqueItens = (await obterEstoque()) || [];
      } catch (err) {
        console.error("Erro ao carregar estoque:", err);
        this.exibirMensagem("Erro ao carregar dados do estoque", "error");
      }
    },
    async handleSalvarUso() {
      this.enviando = true;
      try {
        if (!this.form.medicamento_id) {
          this.exibirMensagem("Por favor, selecione um medicamento.", "error");
          return;
        }

        const dadosParaSalvar = {
          ...this.form,
          quantidade_usada: parseInt(this.form.quantidade_usada) || 1,
        };

        // Inicia as duas operações em paralelo
        await Promise.all([
          salvarUsoMedicamento(dadosParaSalvar),
          darBaixaEstoque(
            dadosParaSalvar.medicamento_id,
            dadosParaSalvar.quantidade_usada,
          ),
        ]);

        this.exibirMensagem("Uso de medicamento registrado com sucesso!");
        this.resetForm();
        await this.carregarHistorico();
      } catch (err) {
        this.exibirMensagem(err.message || "Erro ao registrar o uso.", "error");
      } finally {
        this.enviando = false;
      }
    },
    resetForm() {
      this.form = {
        medicamento_id: null,
        quantidade_usada: 1,
        data_hora_uso: new Date().toISOString().slice(0, 16),
        observacao: "",
      };
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
        // ATENÇÃO: Ao excluir um registro de uso, o estoque NÃO é devolvido automaticamente.
        // Isso precisaria de uma lógica mais complexa se desejado.
        await deletarHistoricoUso(this.itemParaDeletarId);
        this.exibirMensagem("Registro de uso excluído!");
        await this.carregarHistorico();
        if (this.currentPage > this.totalPages) {
          this.currentPage = this.totalPages;
        }
      } catch (err) {
        console.error("Erro ao excluir registro de uso:", err);
        this.exibirMensagem("Erro ao excluir registro", "error");
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
  async mounted() {
    await Promise.all([
      this.carregarHistorico(),
      this.carregarMedicamentos(),
      this.carregarEstoque(),
    ]);
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
                Registrar Uso de Medicamento
              </h3>

              <form @submit.prevent="handleSalvarUso">
                <div class="mb-3">
                  <label class="form-label">Medicamento</label>
                  <select
                    class="form-select"
                    v-model="form.medicamento_id"
                    required
                  >
                    <option :value="null" disabled>
                      Selecione um medicamento
                    </option>
                    <option
                      v-for="med in medicamentosEmEstoque"
                      :key="med.id"
                      :value="med.id"
                    >
                      {{ med.nome }} {{ med.dosagem ? `(${med.dosagem})` : "" }}
                    </option>
                  </select>
                </div>

                <div class="row mb-3">
                  <div class="col-md-8">
                    <label class="form-label">Data e Hora do Uso</label>
                    <input
                      type="datetime-local"
                      class="form-control"
                      v-model="form.data_hora_uso"
                      required
                    />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Quantidade</label>
                    <input
                      type="number"
                      class="form-control"
                      v-model="form.quantidade_usada"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div class="mb-4">
                  <label class="form-label">Observação (Opcional)</label>
                  <textarea
                    class="form-control"
                    v-model="form.observacao"
                    rows="2"
                  ></textarea>
                </div>

                <div class="d-grid">
                  <button
                    type="submit"
                    class="btn btn-primary btn-lg fw-bold"
                    :disabled="enviando"
                  >
                    {{ enviando ? "Salvando..." : "Registrar Uso" }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div class="row justify-content-center mt-5 mb-5">
        <div class="col-md-10">
          <h4 class="mb-3">Histórico de Uso</h4>

          <div
            class="table-responsive shadow-sm rounded-3"
            v-if="paginatedItems.length > 0"
          >
            <table class="grid-saude mb-0">
              <thead>
                <tr>
                  <th class="text-nowrap">Medicamento</th>
                  <th class="text-nowrap">Data e Hora</th>
                  <th class="text-nowrap">Qtd. Usada</th>
                  <th class="text-nowrap">Observação</th>
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
                  <td class="text-nowrap">
                    {{ new Date(item.data_hora_uso).toLocaleString("pt-BR") }}
                  </td>
                  <td>{{ item.quantidade_usada }}</td>
                  <td>{{ item.observacao || "-" }}</td>
                  <td>
                    <button
                      @click="handleDeletar(item.id)"
                      class="btn btn-sm btn-outline-danger"
                      :disabled="enviando"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="text-center p-4 bg-light rounded">
            Nenhum uso de medicamento registrado.
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
              Tem certeza que deseja excluir este registro de uso?
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
