<script setup>
import { ref, computed, onMounted } from "vue";
import {
  obterMedidas,
  salvarMedida,
  deletarMedida,
} from "@/servers/medidaCorporalService";
import { Modal } from "bootstrap";
import AppNavbar from "@/components/Navbar.vue";
import { useNotification } from "@/components/useNotification.js";

// State
const enviandoMedida = ref(false);
const itensCorporais = ref([]);
const formMedida = ref({
  data: new Date().toISOString().substring(0, 10),
  peso: null,
  circunferencia_abdominal: null,
});
const deleteModalInstance = ref(null);
const itemParaDeletarId = ref(null);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const deleteModal = ref(null);

// Composables
const { exibirMensagem } = useNotification();

// Computed
const totalPages = computed(() => {
  if (!itensCorporais.value || itensCorporais.value.length === 0) {
    return 1;
  }
  return Math.ceil(itensCorporais.value.length / itemsPerPage.value);
});

const paginatedItems = computed(() => {
  if (!itensCorporais.value || itensCorporais.value.length === 0) {
    return [];
  }
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return itensCorporais.value.slice(start, end);
});

// Methods
const carregarMedidas = async () => {
  try {
    itensCorporais.value = (await obterMedidas()) || [];
  } catch (err) {
    exibirMensagem("Erro ao carregar as medidas.", "error");
  }
};

const handleSalvarMedida = async () => {
  enviandoMedida.value = true;

  if (!formMedida.value.peso && !formMedida.value.circunferencia_abdominal) {
    exibirMensagem("É obrigatório informar o Peso ou a Cintura.", "error");
    enviandoMedida.value = false;
    return;
  }

  try {
    await salvarMedida(formMedida.value);

    exibirMensagem("Medidas salvas com sucesso!");
    formMedida.value.peso = null;
    formMedida.value.circunferencia_abdominal = null;
    await carregarMedidas();
  } catch (err) {
    exibirMensagem("Erro ao salvar medidas.", "error");
  } finally {
    enviandoMedida.value = false;
  }
};

const handleDeletarMedida = (id) => {
  itemParaDeletarId.value = id;
  deleteModalInstance.value.show();
};

const hideDeleteModal = () => {
  deleteModalInstance.value.hide();
};

const confirmarExclusao = async () => {
  try {
    await deletarMedida(itemParaDeletarId.value);
    exibirMensagem("Registro excluído!");
    await carregarMedidas();
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value;
    }
  } catch (err) {
    exibirMensagem("Erro ao excluir", "error");
  } finally {
    hideDeleteModal();
  }
};

const formatarData = (data) => {
  if (!data) return "";
  return new Date(data + "T12:00:00").toLocaleDateString("pt-BR");
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const goToPage = (page) => {
  currentPage.value = page;
};

// Lifecycle
onMounted(() => {
  carregarMedidas();
  if (deleteModal.value) {
    deleteModalInstance.value = new Modal(deleteModal.value);
  }
});
</script>

<template>
  <div>
    <app-navbar />
    <div class="container pt-4">
      <div class="row justify-content-center mb-5">
        <div class="col-md-8 col-lg-6">
          <div class="card card-form">
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
                    class="btn btn-action btn-lg"
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
            class="shadow-sm rounded-3 overflow-hidden"
            v-if="paginatedItems.length > 0"
          >
            <div class="table-responsive">
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

<style scoped></style>
