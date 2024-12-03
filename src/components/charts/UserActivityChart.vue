<template>
  <div class="chart-container">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<script>
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default {
  name: 'UserActivityChart',
  components: { Line },
  props: {
    activityData: {
      type: Object,
      required: true
    }
  },
  computed: {
    chartData() {
      return {
        labels: this.activityData.dates,
        datasets: [
          {
            label: '任務活動',
            data: this.activityData.taskActivities,
            borderColor: '#2196f3',
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            tension: 0.4
          },
          {
            label: '專案活動',
            data: this.activityData.projectActivities,
            borderColor: '#4caf50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            tension: 0.4
          }
        ]
      }
    },
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          },
          title: {
            display: true,
            text: '用戶活動趨勢'
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