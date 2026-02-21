<template>
  <nav
    class="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top"
  >
    <div class="container">
      <router-link class="navbar-brand fw-bold" to="/dashboard"
        >Minha Saúde</router-link
      >
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

export default {
  name: "AppNavbar",
  methods: {
    handleLogout() {
      logout();
      this.$router.push("/");
    },
  },
};
</script>

<style scoped>
.nav-link.active {
  color: #0d6efd !important;
}
</style>
