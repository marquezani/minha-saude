<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-end mb-3">
      <button @click="handleLogout" class="btn btn-outline-danger">Sair</button>
    </div>
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6">
        <div class="card shadow-sm border-0 rounded-4">
          <div class="card-body p-4 p-md-5">
            <h3 class="card-title text-center mb-4 fw-bold">
              Novo Registro de Glicose
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
                      id="inicioJejum"
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

    <div class="row justify-content-center mt-5">
      <div class="col-md-10">
        <h4 class="mb-3">Histórico de Medições</h4>
        <table class="grid-saude" v-if="itensGlicose.length != 0">
          <thead>
            <tr>
              <th>Data</th>
              <th>Horário</th>
              <th>Em Jejum?</th>
              <th>mg/dL</th>
              <th>Horas em Jejum</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in itensGlicose" :key="item.id">
              <td>
                <span class="font-bold">{{ formatarData(item.data) }}</span>
              </td>
              <td>
                <span class="font-bold">{{ item.horario }}</span>
              </td>
              <td>
                <span
                  :class="[
                    'status-badge',
                    item.emJejum === 'sim' ? 'status-jejum' : 'status-normal',
                  ]"
                >
                  {{ item.emJejum }}
                </span>
              </td>
              <td>
                <span class="font-bold">{{ item.mdDl }}</span>
              </td>
              <td>
                <span
                  class="font-bold"
                  v-if="item.emJejum === 'sim' && item.inicioJejum"
                >
                  {{
                    calcularHorasJejum(
                      item.dataInicioJejum,
                      item.inicioJejum,
                      item.data,
                      item.horario,
                    )
                  }}
                </span>
                <span v-else>-</span>
              </td>
              <td>
                <button
                  @click="handleDeletar(item.id)"
                  class="btn btn-sm btn-outline-danger"
                  title="Excluir registro"
                >
                  Excluir
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <span v-if="itensGlicose.length === 0" class="mensagem-sem-registro"
          >Nenhum registro encontrado.</span
        >
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

    <!-- Modal de Confirmação de Exclusão -->
    <div
      class="modal fade"
      id="deleteConfirmModal"
      tabindex="-1"
      ref="deleteModal"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmar Exclusão</h5>
            <button
              type="button"
              class="btn-close"
              @click="hideDeleteModal"
            ></button>
          </div>
          <div class="modal-body">
            <p>
              Tem certeza que deseja excluir este registro? Esta ação não pode
              ser desfeita.
            </p>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="hideDeleteModal"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="btn btn-danger"
              @click="confirmarExclusao"
            >
              Sim, Excluir
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  obterRegistros,
  salvarRegistro,
  deletarRegistro,
} from "@/servers/glicoseServe";
import { logout } from "../servers/authService";
import { Modal } from "bootstrap";

export default {
  data() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    return {
      enviando: false,
      itensGlicose: [],
      form: {
        data: new Date().toISOString().substring(0, 10),
        horario: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        emJejum: "sim",
        mdDl: null,
        dataInicioJejum: yesterday.toISOString().substring(0, 10),
        inicioJejum: "",
      },
      notificacao: {
        visivel: false,
        mensagem: "",
        tipo: "success",
      },
      deleteModalInstance: null,
      itemParaDeletarId: null,
    };
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
        const res = await obterRegistros();
        this.itensGlicose = res.data;
      } catch (err) {
        console.error("Erro na API:", err);
      }
    },
    async handleSalvar() {
      this.enviando = true;
      try {
        const response = await salvarRegistro(this.form);
        // O json-server retorna 201 Created para POST com sucesso
        if (response.status === 201 || response.status === 200) {
          this.exibirMensagem("Registro salvo com sucesso!");
          this.form.mdDl = null;
          this.form.inicioJejum = "20:00";
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          this.form.dataInicioJejum = yesterday.toISOString().substring(0, 10);
          await this.carregarDados(); // Recarrega a grid
        }
      } catch (err) {
        this.exibirMensagem("Erro ao salvar o registro.", "error");
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
      if (!this.itemParaDeletarId) return;
      try {
        await deletarRegistro(this.itemParaDeletarId);
        this.exibirMensagem("Registro excluído com sucesso!");
        await this.carregarDados();
      } catch (err) {
        this.exibirMensagem("Erro ao excluir o registro.", "error");
      } finally {
        this.hideDeleteModal();
        this.itemParaDeletarId = null;
      }
    },
    formatarData(data) {
      if (!data) return "";
      return data.split("-").reverse().join("/");
    },
    calcularHorasJejum(dataInicio, horaInicio, dataFim, horaFim) {
      if (!dataInicio || !horaInicio || !dataFim || !horaFim) {
        return "N/A";
      }

      // Cria objetos Date a partir das strings de data e hora combinadas
      const startDateTime = new Date(`${dataInicio}T${horaInicio}`);
      const endDateTime = new Date(`${dataFim}T${horaFim}`);

      // Verifica se as datas são válidas
      if (isNaN(startDateTime) || isNaN(endDateTime)) {
        return "Inválido";
      }

      const diffMs = endDateTime - startDateTime;

      // Se a diferença for negativa, os dados de entrada estão incorretos
      if (diffMs < 0) return "Erro";

      // Calcula o total de horas e minutos da diferença
      const totalMinutes = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      // Formata para HH:mm, adicionando um zero à esquerda se necessário
      const paddedHours = String(hours).padStart(2, "0");
      const paddedMinutes = String(minutes).padStart(2, "0");

      return `${paddedHours}:${paddedMinutes}`;
    },
    handleLogout() {
      logout();
      this.$router.push("/");
    },
  },
  mounted() {
    this.carregarDados();
    if (this.$refs.deleteModal) {
      this.deleteModalInstance = new Modal(this.$refs.deleteModal);
    }
  },
};
</script>

<style scoped>
.font-bold {
  color: red;
  font-weight: bold;
}
.mensagem-sem-registro {
  margin-top: 20px;
  font-size: 18px;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}

/* Estilos mantidos conforme sua solicitação */
.grid-saude {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}
.grid-saude th {
  background: #f8fafc;
  padding: 15px;
  color: #64748b;
  font-size: 0.8rem;
  text-transform: uppercase;
  text-align: left;
}
.grid-saude td {
  padding: 12px 15px;
  border-bottom: 1px solid #f1f5f9;
}
.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
}
.status-jejum {
  background: #dcfce7;
  color: #166534;
}
.status-normal {
  background: #f1f5f9;
  color: #475569;
}
.toast-custom {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 25px;
  border-radius: 8px;
  color: white;
  font-weight: bold;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.success {
  background-color: #2ecc71;
}
.error {
  background-color: #e74c3c;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s, transform 0.5s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
