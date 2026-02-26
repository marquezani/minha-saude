<template>
  <nav
    class="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top"
  >
    <div class="container">
      <router-link
        class="navbar-brand fw-bold d-flex align-items-center"
        to="/dashboard"
      >
        <app-logo :size="42" class="me-2" />
        <span class="navbar-title">Minha Saúde</span>
      </router-link>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link
              class="nav-link"
              active-class="active fw-bold"
              to="/dashboard"
              >Dashboard</router-link
            >
          </li>
          <li class="nav-item">
            <router-link
              class="nav-link"
              active-class="active fw-bold"
              to="/medicoes"
              >Glicose</router-link
            >
          </li>
          <li class="nav-item">
            <router-link
              class="nav-link"
              active-class="active fw-bold"
              to="/medicao-corporal"
              >Medidas Corporais</router-link
            >
          </li>
          <li class="nav-item">
            <router-link
              class="nav-link"
              active-class="active fw-bold"
              to="/medicamentos"
              >Medicamentos</router-link
            >
          </li>
          <li class="nav-item">
            <router-link
              class="nav-link"
              active-class="active fw-bold"
              to="/estoque-medicamentos"
              >Estoque</router-link
            >
          </li>
        </ul>
        <button @click="handleLogout" class="btn btn-outline-danger">
          Sair
        </button>
      </div>
    </div>
  </nav>
</template>

<script>
import { logout } from "@/servers/authService";
import AppLogo from "@/components/AppLogo.vue";

export default {
  name: "AppNavbar",
  methods: {
    handleLogout() {
      logout();
      this.$router.push("/");
    },
  },
  components: {
    AppLogo,
  },
};
</script>
<style scoped>
.navbar-title {
  color: #34475e; /* Tipografia Principal */
  font-weight: bold;
}

.nav-link.active {
  color: #19bd82 !important;
}
</style>
