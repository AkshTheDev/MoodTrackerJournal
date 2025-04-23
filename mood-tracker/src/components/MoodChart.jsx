import React from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export function MoodLineChart({ data }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 1,
        max: 4,
        ticks: {
          callback: (value) => {
            return ['Angry', 'Sad', 'Neutral', 'Happy'][value - 1];
          }
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const dataPoint = data.datasets[0].data[context.dataIndex];
            const intensity = data.datasets[0].intensity[context.dataIndex];
            const mood = ['Angry', 'Sad', 'Neutral', 'Happy'][dataPoint - 1];
            return `Mood: ${mood}, Intensity: ${intensity}/10`;
          }
        }
      },
      legend: {
        display: false
      }
    }
  };

  return <Line data={data} options={options} />;
}

export function MoodDistributionChart({ data }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label;
            const value = context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  return <Doughnut data={data} options={options} />;
}

export function processMoodData(moodEntries) {
  const standardizeMood = (mood) => {
    const normalized = mood.toLowerCase();
    if (normalized.includes('happy')) return 'Happy';
    if (normalized.includes('neutral') || normalized.includes('calm')) return 'Neutral';
    if (normalized.includes('sad')) return 'Sad';
    if (normalized.includes('angry')) return 'Angry';
    return 'Neutral'; // Default case
  };

  const moodValues = {
    'Happy': 4,
    'Neutral': 3,
    'Sad': 2,
    'Angry': 1
  };

  // Sort entries by date and group them
  const sortedEntries = moodEntries
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  
  const dates = sortedEntries.map(entry => 
    new Date(entry.date).toLocaleDateString()
  );

  const moodCounts = {
    'Happy': 0,
    'Neutral': 0,
    'Sad': 0,
    'Angry': 0
  };

  // Process entries for both charts
  const processedEntries = sortedEntries.map(entry => {
    const standardizedMood = standardizeMood(entry.mood);
    moodCounts[standardizedMood]++;
    return {
      mood: standardizedMood,
      moodValue: moodValues[standardizedMood],
      intensity: entry.intensity || 5 // Default to 5 if not set
    };
  });

  const lineChartData = {
    labels: dates,
    datasets: [{
      label: 'Mood Level',
      data: processedEntries.map(entry => entry.moodValue),
      intensity: processedEntries.map(entry => entry.intensity), // Store intensity for tooltips
      borderColor: 'rgb(174, 213, 129)',
      backgroundColor: 'rgba(174, 213, 129, 0.2)',
      tension: 0.3
    }]
  };

  const doughnutChartData = {
    labels: Object.keys(moodCounts),
    datasets: [{
      data: Object.values(moodCounts),
      backgroundColor: [
        '#FFF9C4', // Happy
        '#C8E6C9', // Neutral
        '#B3E5FC', // Sad
        '#FFCDD2'  // Angry
      ]
    }]
  };

  return { lineChartData, doughnutChartData };
}