<template>
  <div>
    <app-navbar />
    <div class="container pt-4">
      <div class="row justify-content-center mb-5">
        <div class="col-md-8 col-lg-6">
          <div class="card shadow-sm border-0 rounded-4">
            <div class="card-body p-4 p-md-5">
              <h3 class="card-title text-center mb-4 fw-bold">
                Registro Corporal
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
                      placeholder="00.0"
                      v-model.number="formMedida.peso"
                    />
                  </div>
                  <div class="col">
                    <label class="form-label">Cintura (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      class="form-control"
                      placeholder="00"
                      v-model.number="formMedida.circunferencia_abdominal"
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
            v-if="paginatedItems.length > 0"
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
                <tr v-for="item in paginatedItems" :key="item.id">
                  <td class="text-nowrap">{{ formatarData(item.data) }}</td>
                  <td class="fw-bold">
                    {{ item.peso ? item.peso + " kg" : "-" }}
                  </td>
                  <td class="fw-bold">
                    {{
                      item.circunferencia_abdominal
                        ? item.circunferencia_abdominal + " cm"
                        : "-"
                    }}
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
      currentPage: 1,
      itemsPerPage: 10,
    };
  },
  computed: {
    totalPages() {
      if (!this.itensCorporais || this.itensCorporais.length === 0) {
        return 1;
      }
      return Math.ceil(this.itensCorporais.length / this.itemsPerPage);
    },
    paginatedItems() {
      if (!this.itensCorporais || this.itensCorporais.length === 0) {
        return [];
      }
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.itensCorporais.slice(start, end);
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
    async carregarMedidas() {
      try {
        this.itensCorporais = (await obterMedidas()) || [];
      } catch (err) {
        this.exibirMensagem("Erro ao carregar as medidas.", "error");
      }
    },
    async handleSalvarMedida() {
      this.enviandoMedida = true;

      if (!this.formMedida.peso && !this.formMedida.circunferencia_abdominal) {
        this.exibirMensagem(
          "É obrigatório informar o Peso ou a Cintura.",
          "error",
        );
        this.enviandoMedida = false;
        return;
      }

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
        if (this.currentPage > this.totalPages) {
          this.currentPage = this.totalPages;
        }
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
    this.carregarMedidas();
    if (this.$refs.deleteModal) {
      this.deleteModalInstance = new Modal(this.$refs.deleteModal);
    }
  },
};
</script>
<style scoped></style>
