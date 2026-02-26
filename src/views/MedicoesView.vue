<script setup>
import { ref, computed, watch, onMounted } from "vue";
import {
  obterRegistros,
  salvarRegistro,
  deletarRegistro,
} from "@/servers/glicoseServe";
import { Modal } from "bootstrap";
import AppNavbar from "@/components/Navbar.vue";
import { useNotification } from "@/components/useNotification.js";

// State
const enviando = ref(false);
const itensGlicose = ref([]);
const form = ref({
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
  if (!itensGlicose.value || itensGlicose.value.length === 0) {
    return 1;
  }
  return Math.ceil(itensGlicose.value.length / itemsPerPage.value);
});

const paginatedItems = computed(() => {
  if (!itensGlicose.value || itensGlicose.value.length === 0) {
    return [];
  }
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return itensGlicose.value.slice(start, end);
});

// Watcher
watch(
  () => form.value.data,
  (newVal) => {
    if (newVal) {
      const selectedDate = new Date(newVal + "T00:00:00");
      selectedDate.setDate(selectedDate.getDate() - 1);
      form.value.dataInicioJejum = selectedDate.toISOString().substring(0, 10);
    }
  },
);

// Methods
const carregarDados = async () => {
  try {
    itensGlicose.value = (await obterRegistros()) || [];
  } catch (err) {
    exibirMensagem("Erro ao carregar dados", "error");
  }
};

const calcularHorasJejum = (dataInicio, horaInicio, dataFim, horaFim) => {
  const inicio = new Date(`${dataInicio}T${horaInicio}`);
  const fim = new Date(`${dataFim}T${horaFim}`);
  const diffMs = fim - inicio;
  if (isNaN(diffMs) || diffMs < 0) return 0;
  return Math.floor(diffMs / (1000 * 60 * 60));
};

const handleSalvar = async () => {
  enviando.value = true;
  try {
    let horasCalculadas = null;
    if (form.value.emJejum === "sim") {
      horasCalculadas = calcularHorasJejum(
        form.value.dataInicioJejum,
        form.value.inicioJejum,
        form.value.data,
        form.value.horario,
      );
    }
    const dadosParaSalvar = {
      ...form.value,
      horas_jejum: horasCalculadas,
    };
    await salvarRegistro(dadosParaSalvar);
    exibirMensagem("Registro salvo com sucesso!");
    form.value.mdDl = null;
    await carregarDados();
  } catch (err) {
    console.error("Erro detalhado:", err);
    exibirMensagem("Erro ao salvar o registro.", "error");
  } finally {
    enviando.value = false;
  }
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
    await deletarRegistro(itemParaDeletarId.value);
    exibirMensagem("Registro excluído!");
    await carregarDados();
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value;
    }
  } catch (err) {
    exibirMensagem("Erro ao excluir", "error");
  } finally {
    hideDeleteModal();
  }
};

const formatarData = (iso) => new Date(iso).toLocaleDateString("pt-BR");
const formatarHora = (iso) =>
  new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

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
onMounted(() => {
  carregarDados();
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
                    <label class="btn btn-outline-action" for="jejumSim"
                      >Sim</label
                    >

                    <input
                      type="radio"
                      class="btn-check"
                      id="jejumNao"
                      value="não"
                      v-model="form.emJejum"
                    />
                    <label class="btn btn-outline-action" for="jejumNao"
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
                    class="btn btn-action btn-lg"
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
            class="table-responsive shadow-sm rounded-3 overflow-hidden"
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
/* Estilos específicos do componente podem ser adicionados aqui. Os estilos globais estão em main.css */
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
