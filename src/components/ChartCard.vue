<template>
  <div class="card shadow-sm border-0 rounded-4 h-100">
    <div class="card-body">
      <h5 class="card-title fw-bold mb-3">{{ title }}</h5>
      <div class="chart-container" style="position: relative; height: 300px">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ChartCard",
  props: {
    title: { type: String, required: true },
  },
};
</script>
