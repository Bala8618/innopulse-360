import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const data = {
  labels: ['Mentor', 'Jury', 'Prototype', 'Participation'],
  datasets: [
    {
      label: 'Performance Index Contributors',
      data: [82, 78, 74, 88],
      backgroundColor: ['#1d4ed8', '#0ea5e9', '#22c55e', '#f59e0b']
    }
  ]
};

const options = {
  responsive: true,
  plugins: {
    legend: { position: 'top' },
    title: { display: true, text: 'IPI Snapshot' }
  }
};

export default function PerformanceChart() {
  return <Bar options={options} data={data} />;
}
