<script setup>
import { ref, computed, onMounted } from "vue";
import { obterMedicamentos } from "@/servers/medicamentosService";
import {
  salvarUsoMedicamento,
  obterHistoricoUso,
  deletarHistoricoUso,
} from "@/servers/historicoUsoService";
import { darBaixaEstoque, obterEstoque } from "@/servers/estoqueService";
import { Modal } from "bootstrap";
import AppNavbar from "@/components/Navbar.vue";
import { useNotification } from "@/components/useNotification.js";

// State
const enviando = ref(false);
const historicoUso = ref([]);
const medicamentosDisponiveis = ref([]);
const estoqueItens = ref([]);
const form = ref({
  medicamento_id: null,
  quantidade_usada: 1,
  data_hora_uso: new Date().toISOString().slice(0, 16),
  observacao: "",
});
const deleteModalInstance = ref(null);
const itemParaDeletarId = ref(null);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const deleteModal = ref(null); // Template ref for the modal element

// Composables
const { exibirMensagem } = useNotification();

// Computed
const totalPages = computed(() => {
  if (!historicoUso.value || historicoUso.value.length === 0) {
    return 1;
  }
  return Math.ceil(historicoUso.value.length / itemsPerPage.value);
});

const paginatedItems = computed(() => {
  if (!historicoUso.value || historicoUso.value.length === 0) {
    return [];
  }
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return historicoUso.value.slice(start, end);
});

const medicamentosEmEstoque = computed(() => {
  if (!medicamentosDisponiveis.value.length || !estoqueItens.value.length) {
    return [];
  }
  const emEstoqueIds = new Set(
    estoqueItens.value
      .filter((item) => item.quantidade_estoque > 0)
      .map((item) => item.medicamento_id),
  );
  return medicamentosDisponiveis.value.filter((med) =>
    emEstoqueIds.has(med.id),
  );
});

// Methods
const carregarHistorico = async () => {
  try {
    historicoUso.value = (await obterHistoricoUso()) || [];
  } catch (err) {
    console.error("Erro ao carregar histórico:", err);
    exibirMensagem("Erro ao carregar histórico de uso", "error");
  }
};

const carregarMedicamentos = async () => {
  try {
    medicamentosDisponiveis.value = (await obterMedicamentos()) || [];
  } catch (err) {
    console.error("Erro ao carregar medicamentos para o formulário:", err);
    exibirMensagem("Erro ao carregar lista de medicamentos", "error");
  }
};

const carregarEstoque = async () => {
  try {
    estoqueItens.value = (await obterEstoque()) || [];
  } catch (err) {
    console.error("Erro ao carregar estoque:", err);
    exibirMensagem("Erro ao carregar dados do estoque", "error");
  }
};

const handleSalvarUso = async () => {
  enviando.value = true;
  try {
    if (!form.value.medicamento_id) {
      exibirMensagem("Por favor, selecione um medicamento.", "error");
      return;
    }
    const dadosParaSalvar = {
      ...form.value,
      quantidade_usada: parseInt(form.value.quantidade_usada) || 1,
    };
    await Promise.all([
      salvarUsoMedicamento(dadosParaSalvar),
      darBaixaEstoque(
        dadosParaSalvar.medicamento_id,
        dadosParaSalvar.quantidade_usada,
      ),
    ]);
    exibirMensagem("Uso de medicamento registrado com sucesso!");
    resetForm();
    await carregarHistorico();
  } catch (err) {
    exibirMensagem(err.message || "Erro ao registrar o uso.", "error");
  } finally {
    enviando.value = false;
  }
};

const resetForm = () => {
  form.value = {
    medicamento_id: null,
    quantidade_usada: 1,
    data_hora_uso: new Date().toISOString().slice(0, 16),
    observacao: "",
  };
};

const handleDeletar = (id) => {
  itemParaDeletarId.value = id;
  deleteModalInstance.value.show();
};

const hideDeleteModal = () => {
  deleteModalInstance.value.hide();
};

const confirmarExclusao = async () => {
  try {
    await deletarHistoricoUso(itemParaDeletarId.value);
    exibirMensagem("Registro de uso excluído!");
    await carregarHistorico();
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value;
    }
  } catch (err) {
    console.error("Erro ao excluir registro de uso:", err);
    exibirMensagem("Erro ao excluir registro", "error");
  } finally {
    hideDeleteModal();
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

const goToPage = (page) => {
  currentPage.value = page;
};

// Lifecycle
onMounted(async () => {
  await Promise.all([
    carregarHistorico(),
    carregarMedicamentos(),
    carregarEstoque(),
  ]);
  if (deleteModal.value) {
    deleteModalInstance.value = new Modal(deleteModal.value);
  }
});
</script>

<template>
  <div>
    <app-navbar />
    <div class="container pt-4">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          <div class="card card-form">
            <div class="card-body p-4 p-md-5">
              <h3 class="card-title text-center mb-4 fw-bold">
                Registrar Uso de Medicamento
              </h3>

              <form @submit.prevent="handleSalvarUso">
                <div class="mb-3">
                  <label class="form-label">MEDICAMENTO</label>
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
                    <label class="form-label">DATA E HORA DO USO</label>
                    <input
                      type="datetime-local"
                      class="form-control"
                      v-model="form.data_hora_uso"
                      required
                    />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">QUANTIDADE</label>
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
                  <label class="form-label">OBSERVAÇÃO (OPCIONAL)</label>
                  <textarea
                    class="form-control"
                    v-model="form.observacao"
                    rows="2"
                  ></textarea>
                </div>

                <div class="d-grid">
                  <button
                    type="submit"
                    class="btn btn-action btn-lg"
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
            class="shadow-sm rounded-3 overflow-hidden"
            v-if="paginatedItems.length > 0"
          >
            <div class="table-responsive">
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
/* Estilos específicos do componente podem ser adicionados aqui. Os estilos globais estão em main.css */
/* A transição do toast foi mantida pois é específica do componente */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px) translateX(10px);
}
</style>
