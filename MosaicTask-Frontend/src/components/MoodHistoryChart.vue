<script setup lang="ts">
import { useLayout } from '@/layout/composables/layout';
import { useJournalStore } from '@/stores/journal';
import { MoodStatistics } from '@/types';
import 'chartjs-adapter-date-fns';
import { onMounted, ref, watch } from 'vue';

const { getPrimary, getSurface, isDarkTheme } = useLayout();
const journalStore = useJournalStore();

const chartData = ref({});
const chartOptions = ref({});

onMounted(async () => {
    await journalStore.fetchMoodStatistics();
    updateChart();
});

function getCircumplexGradient(ctx, chartArea) {
    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    gradient.addColorStop(0, '#FF0000'); // Red (negative Stimmung)
    gradient.addColorStop(0.5, '#FFFF00'); // Yellow (neutrale Stimmung)
    gradient.addColorStop(1, '#00FF00'); // Green (positive Stimmung)

    return gradient;
}

const updateChart = () => {
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
};

const setChartData = () => {
    const statistics = journalStore.getMoodStatistics;
    const documentStyle = getComputedStyle(document.documentElement);

    const labels = statistics.map((entry: MoodStatistics) => new Date(entry.date));
    const data = statistics.map((entry: MoodStatistics) => entry.mood_index);

    return {
        labels: labels,
        datasets: [
            {
                label: 'Mood Index',
                data: data,
                borderColor: (context) => {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;
                    if (!chartArea) {
                        return;
                    }
                    return getCircumplexGradient(ctx, chartArea);
                },
                backgroundColor: documentStyle.getPropertyValue('--p-primary-200'),
                fill: false,
                tension: 0.4,
                borderWidth: 2
            }
        ]
    };
};

const setChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    return {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'day',
                    tooltipFormat: 'yyyy-MM-dd'
                },
                title: {
                    display: true,
                    text: 'Date'
                },
                ticks: {
                    color: textMutedColor
                },
                grid: {
                    color: surfaceBorder,
                    display: true,
                    drawBorder: false
                }
            },
            y: {
                beginAtZero: false,
                ticks: {
                    color: textMutedColor,
                    display: false
                },
                grid: {
                    color: surfaceBorder,
                    drawBorder: false,
                    display: true
                }
            }
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: (context) => `Mood Index: ${context.parsed.y.toFixed(2)}`
                }
            }
        }
    };
};

watch([getPrimary, getSurface, isDarkTheme], updateChart);
</script>
<template>
    <div class="card">
        <div class="mb-4 text-xl font-semibold">Mood History</div>
        <Chart type="line" :data="chartData" :options="chartOptions" class="h-80" />
    </div>
</template>
