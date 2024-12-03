<template>
  <div class="chart-container">
    <Doughnut :data="chartData" :options="chartOptions" />
  </div>
</template>

<script>
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

export default {
  name: 'ProjectProgressChart',
  components: { Doughnut },
  props: {
    projectData: {
      type: Object,
      required: true
    }
  },
  computed: {
    chartData() {
      return {
        labels: ['規劃中', '進行中', '已完成'],
        datasets: [{
          data: [
            this.projectData.planning || 0,
            this.projectData.in_progress || 0,
            this.projectData.completed || 0
          ],
          backgroundColor: [
            '#ff9800',
            '#2196f3',
            '#4caf50'
          ],
          borderWidth: 0
        }]
      }
    },
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right'
          },
          title: {
            display: true,
            text: '專案進度分布'
          }
        }
      }
    }
  }
}
</script>

<style scoped>
.chart-container {
  height: 300px;
  margin: 1rem 0;
  padding: 1rem;
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 4px 12px var(--shadow-color);
}
</style> 