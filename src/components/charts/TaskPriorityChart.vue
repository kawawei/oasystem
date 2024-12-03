<template>
  <div class="chart-container">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script>
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

export default {
  name: 'TaskPriorityChart',
  components: { Bar },
  props: {
    taskData: {
      type: Object,
      required: true
    }
  },
  computed: {
    chartData() {
      return {
        labels: ['低', '中', '高'],
        datasets: [{
          label: '任務數量',
          data: [
            this.taskData.low || 0,
            this.taskData.medium || 0,
            this.taskData.high || 0
          ],
          backgroundColor: [
            'rgba(76, 175, 80, 0.6)',
            'rgba(255, 152, 0, 0.6)',
            'rgba(244, 67, 54, 0.6)'
          ],
          borderColor: [
            '#4caf50',
            '#ff9800',
            '#f44336'
          ],
          borderWidth: 1
        }]
      }
    },
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: '任務優先級分布'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
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