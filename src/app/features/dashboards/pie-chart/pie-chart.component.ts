import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { PatientService } from '../../../services/patient.service';

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [],
  template: `
    <div class="chart-container">
      <canvas id="departmentChart"></canvas>
    </div>
  `,
  styles: [`
    .chart-container {
      width: 100%;
      height: 400px;
      position: relative;
    }
  `],
})
export class PieChartComponent implements OnInit, OnDestroy {
  public chart: any;

  constructor(private patientService: PatientService) {}

  ngOnInit(): void {
    Chart.register(...registerables); // Register Chart.js components
    this.fetchDataAndCreateChart();
  }

  fetchDataAndCreateChart(): void {
    this.patientService.getPatientsByDepartment().subscribe({
      next: (departmentCounts) => {
        const labels = Object.keys(departmentCounts); // Department names
        const data = Object.values(departmentCounts); // Number of patients in each department

        this.createChart(labels, data);
      },
      error: (error) => {
        console.error('Error fetching department data:', error);
      },
    });
  }

  createChart(labels: string[], data: number[]): void {
    const ctx = document.getElementById('departmentChart') as HTMLCanvasElement;
    if (!ctx) {
      console.error('Canvas element not found!');
      return;
    }

    // Destroy existing chart if it exists
    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: 'pie', // Pie chart for better distribution visualization
      data: {
        labels: labels, // Dynamic department names
        datasets: [
          {
            label: 'Patients per Department',
            data: data, // Dynamic patient counts
            backgroundColor: [
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#4BC0C0',
              '#9966FF',
              '#FF9F40',
            ], // Colorful palette for pie slices
            borderColor: '#ffffff',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.raw as number;
                const total = context.dataset.data.reduce((sum: any, val: any) => sum + val, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} patients (${percentage}%)`;
              },
            },
          },
        },
      },
    });
  }

  ngOnDestroy(): void {
    // Clean up chart to prevent memory leaks
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
