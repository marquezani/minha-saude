<script setup>
import { ref, computed, onMounted } from "vue";
import {
  salvarEstoque,
  obterEstoque,
  deletarEstoque,
} from "@/servers/estoqueService";
import {
  obterMedicamentos,
  salvarMedicamento,
} from "@/servers/medicamentosService";
import { Modal } from "bootstrap";
import AppNavbar from "@/components/Navbar.vue";
import { useNotification } from "@/components/useNotification.js";

// State
const enviando = ref(false);
const form = ref({
  id: null,
  medicamento_id: null,
  quantidade_estoque: 0,
  quantidade_minima: 5,
  ativo: true,
});
const estoqueItens = ref([]);
const medicamentosDisponiveis = ref([]);
const deleteModalInstance = ref(null);
const itemParaDeletarId = ref(null);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const isEditing = ref(false);
const searchTerm = ref("");
const deleteModal = ref(null);

// Composables
const { exibirMensagem } = useNotification();

// Computed
const totalPages = computed(() => {
  if (!estoqueItens.value || estoqueItens.value.length === 0) return 1;
  return Math.ceil(estoqueItens.value.length / itemsPerPage.value);
});

const paginatedItems = computed(() => {
  if (!estoqueItens.value || estoqueItens.value.length === 0) return [];
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return estoqueItens.value.slice(start, end);
});

const filteredMedicamentosParaSelecao = computed(() => {
  const searchTermLower = searchTerm.value
    ? searchTerm.value.toLowerCase()
    : "";
  return medicamentosDisponiveis.value
    .filter((med) => {
      const hasEstoque = estoqueItens.value.some(
        (estoque) =>
          estoque.medicamento_id === med.id && estoque.id !== form.value.id,
      );
      return !hasEstoque;
    })
    .filter(
      (med) =>
        med.nome.toLowerCase().includes(searchTermLower) ||
        (med.dosagem && med.dosagem.toLowerCase().includes(searchTermLower)),
    );
});

const displayMedicamentoName = computed({
  get() {
    if (form.value.medicamento_id) {
      const selected = medicamentosDisponiveis.value.find(
        (med) => med.id === form.value.medicamento_id,
      );
      return selected
        ? `${selected.nome}${
            selected.dosagem ? " (" + selected.dosagem + ")" : ""
          }`
        : searchTerm.value;
    }
    return searchTerm.value;
  },
  set(value) {
    searchTerm.value = value;
    updateMedicamentoIdFromSearch(value);
  },
});

// Methods
const carregarMedicamentos = async () => {
  try {
    medicamentosDisponiveis.value = (await obterMedicamentos()) || [];
  } catch (err) {
    console.error("Erro ao carregar medicamentos:", err);
    exibirMensagem("Erro ao carregar medicamentos para seleção", "error");
  }
};

const carregarEstoqueDados = async () => {
  try {
    estoqueItens.value = (await obterEstoque()) || [];
  } catch (err) {
    console.error("Erro ao carregar estoque:", err);
    exibirMensagem("Erro ao carregar dados do estoque", "error");
  }
};

const updateMedicamentoIdFromSearch = (inputString) => {
  const found = medicamentosDisponiveis.value.find((med) => {
    const displayValue = `${med.nome}${
      med.dosagem ? " (" + med.dosagem + ")" : ""
    }`;
    return displayValue.toLowerCase() === inputString.toLowerCase();
  });
  form.value.medicamento_id = found ? found.id : null;
};

const handleSalvar = async () => {
  enviando.value = true;
  try {
    let medId = form.value.medicamento_id;
    if (!medId && searchTerm.value) {
      const novoMedicamento = await salvarMedicamento({
        nome: searchTerm.value,
      });
      if (novoMedicamento && novoMedicamento.id) {
        medId = novoMedicamento.id;
      } else {
        throw new Error("Falha ao criar o novo medicamento.");
      }
    }
    if (!medId) {
      exibirMensagem(
        "Forneça ou selecione um nome de medicamento válido.",
        "error",
      );
      enviando.value = false;
      return;
    }
    const dadosParaSalvar = {
      medicamento_id: medId,
      quantidade_estoque: parseInt(form.value.quantidade_estoque) || 0,
      quantidade_minima: parseInt(form.value.quantidade_minima) || 5,
      ativo: form.value.ativo,
    };
    await salvarEstoque(dadosParaSalvar);
    exibirMensagem("Estoque salvo com sucesso!");
    resetForm();
    await carregarEstoqueDados();
    await carregarMedicamentos();
  } catch (err) {
    console.error("Erro detalhado ao salvar estoque:", err.message);
    exibirMensagem(err.message || "Erro ao salvar o estoque.", "error");
  } finally {
    enviando.value = false;
  }
};

const resetForm = () => {
  form.value = {
    id: null,
    medicamento_id: null,
    quantidade_estoque: 0,
    quantidade_minima: 5,
    ativo: true,
  };
  searchTerm.value = "";
  isEditing.value = false;
};

const handleEditar = (item) => {
  form.value = { ...item };
  form.value.quantidade_estoque = parseInt(item.quantidade_estoque);
  form.value.quantidade_minima = parseInt(item.quantidade_minima);
  form.value.medicamento_id = item.medicamento_id;
  searchTerm.value = item.medicamentos.nome;
  isEditing.value = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
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
    await deletarEstoque(itemParaDeletarId.value);
    exibirMensagem("Item de estoque excluído!");
    resetForm();
    await carregarEstoqueDados();
    await carregarMedicamentos();
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value;
    }
  } catch (err) {
    console.error("Erro ao excluir item de estoque:", err);
    exibirMensagem("Erro ao excluir item de estoque", "error");
  } finally {
    hideDeleteModal();
  }
};

const formatarData = (iso) => {
  if (!iso) return "-";
  return (
    new Date(iso).toLocaleDateString("pt-BR") +
    " " +
    new Date(iso).toLocaleTimeString("pt-BR")
  );
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
  await carregarMedicamentos();
  await carregarEstoqueDados();
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
                {{
                  isEditing
                    ? "Editar Estoque de Medicamento"
                    : "Registro de Estoque de Medicamento"
                }}
              </h3>

              <form @submit.prevent="handleSalvar">
                <div class="mb-3">
                  <label class="form-label">Medicamento</label>
                  <input
                    type="text"
                    class="form-control"
                    list="medicamentos-datalist"
                    v-model="displayMedicamentoName"
                    placeholder="Digite o nome do medicamento..."
                    :disabled="isEditing"
                    required
                  />
                  <datalist id="medicamentos-datalist">
                    <option
                      v-for="med in filteredMedicamentosParaSelecao"
                      :key="med.id"
                      :value="`${med.nome}${
                        med.dosagem ? ' (' + med.dosagem + ')' : ''
                      }`"
                    ></option>
                  </datalist>

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
                    class="btn btn-action btn-lg"
                    :disabled="enviando"
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
                    class="btn btn-light btn-lg"
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
            class="table-responsive shadow-sm rounded-3 overflow-hidden"
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
                      class="btn btn-sm btn-outline-action me-2"
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
