<template>
  <div>
    <app-navbar />
    <div class="container pt-4">
      <h2 class="mb-4 fw-bold">Dashboard de Evolução</h2>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Carregando...</span>
        </div>
      </div>

      <div v-else class="row g-4">
        <div class="col-lg-6">
          <chart-card title="Evolução da Glicose (mg/dL)">
            <line-chart
              v-if="glicoseChartData.labels.length"
              :chart-data="glicoseChartData"
            />
            <div
              v-else
              class="d-flex align-items-center justify-content-center h-100 text-muted"
            >
              Não há dados suficientes para exibir o gráfico.
            </div>
          </chart-card>
        </div>
        <div class="col-lg-6">
          <chart-card title="Evolução do Peso (kg)">
            <line-chart
              v-if="pesoChartData.labels.length"
              :chart-data="pesoChartData"
            />
            <div
              v-else
              class="d-flex align-items-center justify-content-center h-100 text-muted"
            >
              Não há dados suficientes para exibir o gráfico.
            </div>
          </chart-card>
        </div>
        <div class="col-lg-6">
          <chart-card title="Evolução da Cintura (cm)">
            <line-chart
              v-if="cinturaChartData.labels.length"
              :chart-data="cinturaChartData"
            />
            <div
              v-else
              class="d-flex align-items-center justify-content-center h-100 text-muted"
            >
              Não há dados suficientes para exibir o gráfico.
            </div>
          </chart-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AppNavbar from "@/components/Navbar.vue";
import ChartCard from "@/components/ChartCard.vue";
import LineChart from "@/components/LineChart.vue";
import { obterRegistros } from "@/servers/glicoseServe";
import { obterMedidas } from "@/servers/medidaCorporalService";

export default {
  components: { AppNavbar, ChartCard, LineChart },
  data() {
    return {
      loading: true,
      glicoseChartData: { labels: [], datasets: [] },
      pesoChartData: { labels: [], datasets: [] },
      cinturaChartData: { labels: [], datasets: [] },
    };
  },
  methods: {
    formatarData(data) {
      return new Date(data).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      });
    },
    async carregarDadosGraficos() {
      this.loading = true;
      try {
        const [glicoseData, medidasData] = await Promise.all([
          obterRegistros(),
          obterMedidas(),
        ]);

        if (glicoseData && glicoseData.length > 0) {
          const reversedGlicose = [...glicoseData].reverse();
          this.glicoseChartData = {
            labels: reversedGlicose.map((d) =>
              this.formatarData(d.data_horario),
            ),
            datasets: [
              {
                label: "Glicose (mg/dL)",
                backgroundColor: "#0d6efd",
                borderColor: "#0d6efd",
                data: reversedGlicose.map((d) => d.mg_dl),
                tension: 0.1,
              },
            ],
          };
        }

        if (medidasData && medidasData.length > 0) {
          const reversedMedidas = [...medidasData].reverse();
          this.pesoChartData = {
            labels: reversedMedidas.map((d) => this.formatarData(d.data)),
            datasets: [
              {
                label: "Peso (kg)",
                backgroundColor: "#198754",
                borderColor: "#198754",
                data: reversedMedidas.map((d) => d.peso),
                tension: 0.1,
              },
            ],
          };
          this.cinturaChartData = {
            labels: reversedMedidas.map((d) => this.formatarData(d.data)),
            datasets: [
              {
                label: "Cintura (cm)",
                backgroundColor: "#ffc107",
                borderColor: "#ffc107",
                data: reversedMedidas.map((d) => d.circunferencia_abdominal),
                tension: 0.1,
              },
            ],
          };
        }
      } catch (error) {
        console.error("Erro ao carregar dados para os gráficos:", error);
      } finally {
        this.loading = false;
      }
    },
  },
  mounted() {
    this.carregarDadosGraficos();
  },
};
</script>
