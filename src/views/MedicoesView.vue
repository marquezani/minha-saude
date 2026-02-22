<script>
import {
  obterRegistros,
  salvarRegistro,
  deletarRegistro,
} from "@/servers/glicoseServe";
import { Modal } from "bootstrap";
import AppNavbar from "@/components/Navbar.vue";

export default {
  components: {
    AppNavbar,
  },
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
      currentPage: 1,
      itemsPerPage: 10,
    };
  },
  computed: {
    totalPages() {
      if (!this.itensGlicose || this.itensGlicose.length === 0) {
        return 1;
      }
      return Math.ceil(this.itensGlicose.length / this.itemsPerPage);
    },
    paginatedItems() {
      if (!this.itensGlicose || this.itensGlicose.length === 0) {
        return [];
      }
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.itensGlicose.slice(start, end);
    },
  },
  watch: {
    "form.data"(newVal) {
      if (newVal) {
        const selectedDate = new Date(newVal + "T00:00:00");
        selectedDate.setDate(selectedDate.getDate() - 1); // Subtrai um dia
        this.form.dataInicioJejum = selectedDate.toISOString().substring(0, 10);
      }
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
        this.itensGlicose = (await obterRegistros()) || [];
      } catch (err) {
        this.exibirMensagem("Erro ao carregar dados", "error");
      }
    },
    // MedicoesView.vue
    async handleSalvar() {
      this.enviando = true;
      try {
        let horasCalculadas = null;
        if (this.form.emJejum === "sim") {
          horasCalculadas = this.calcularHorasJejum(
            this.form.dataInicioJejum,
            this.form.inicioJejum,
            this.form.data,
            this.form.horario,
          );
        }

        // Envie o formulário completo + o cálculo
        const dadosParaSalvar = {
          ...this.form,
          horas_jejum: horasCalculadas, // Adicionamos o resultado do cálculo aqui
        };

        await salvarRegistro(dadosParaSalvar);

        this.exibirMensagem("Registro salvo com sucesso!");
        this.form.mdDl = null;
        await this.carregarDados();
      } catch (err) {
        console.error("Erro detalhado:", err);
        this.exibirMensagem("Erro ao salvar o registro.", "error");
      } finally {
        this.enviando = false;
      }
    },
    handleDeletar(id) {
      console.log("ID para deletar:", id); // Log para verificar o ID
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
        if (this.currentPage > this.totalPages) {
          this.currentPage = this.totalPages;
        }
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
    calcularHorasJejum(dataInicio, horaInicio, dataFim, horaFim) {
      const inicio = new Date(`${dataInicio}T${horaInicio}`);
      const fim = new Date(`${dataFim}T${horaFim}`);
      const diffMs = fim - inicio;

      if (isNaN(diffMs) || diffMs < 0) return 0;

      // Retorna apenas o total de horas como número inteiro
      return Math.floor(diffMs / (1000 * 60 * 60));
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
                Registro de Glicose
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

      <div class="row justify-content-center mt-5 mb-5">
        <div class="col-md-10">
          <h4 class="mb-3">Histórico de Medições</h4>

          <div
            class="table-responsive shadow-sm rounded-3"
            v-if="paginatedItems.length > 0"
          >
            <table class="grid-saude mb-0">
              <thead>
                <tr>
                  <th class="text-nowrap">Data</th>
                  <th class="text-nowrap">Horário</th>
                  <th class="text-nowrap">Em Jejum?</th>
                  <th class="text-nowrap">mg/dL</th>
                  <th class="text-nowrap">Horas Jejum</th>
                  <th class="text-nowrap">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in paginatedItems" :key="item.id">
                  <td class="text-nowrap">
                    {{ formatarData(item.data_horario) }}
                  </td>
                  <td class="text-nowrap">
                    {{ formatarHora(item.data_horario) }}
                  </td>
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
                    <span
                      v-if="item.em_jejum && item.horas_jejum"
                      class="fw-bold"
                    >
                      {{ item.horas_jejum }}h
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
          </div>
          <div v-else class="text-center p-4 bg-light rounded">
            Nenhum registro encontrado.
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
            <p class="mb-0">Tem certeza que deseja excluir este registro?</p>
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

.status-badge {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  display: inline-block;
}

.status-jejum {
  background: #dcfce7;
  color: #166534;
}

.status-normal {
  background: #f1f5f9;
  color: #475569;
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
