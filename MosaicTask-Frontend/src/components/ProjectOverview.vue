<script setup lang="ts">
import { useLayout } from '@/layout/composables/layout';
import { useBoardStore } from '@/stores/board';
import { Board } from '@/types';
import 'chartjs-adapter-date-fns';
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const props = defineProps<{
    board: Board;
}>();
const route = useRoute();
const boardStore = useBoardStore();
const chartData = ref({});
const chartOptions = ref({});
const dates = ref();
const { isDarkTheme, getPrimary, getSurface } = useLayout();

onMounted(() => {
    setChartOptions();
    fetchProjectMoodStatistics(route.params.boardId);
});

watch(
    () => route.params.boardId,
    (newBoardId) => {
        fetchProjectMoodStatistics(newBoardId);
    }
);
watch(dates, () => {
    fetchProjectMoodStatistics(route.params.boardId);
});

function getCircumplexGradient(ctx, chartArea) {
    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);

    gradient.addColorStop(0, '#FF0000'); // Red (negative Stimmung)
    gradient.addColorStop(0.5, '#FFFF00'); // Yellow (neutrale Stimmung)
    gradient.addColorStop(1, '#00FF00'); // Green (positive Stimmung)

    return gradient;
}

function getCircumplexGradientForMinMax(ctx, chartArea) {
    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);

    gradient.addColorStop(0, 'rgba(255, 0, 0, 0.3)'); // Semi-transparent Red
    gradient.addColorStop(0.5, 'rgba(255, 255, 0, 0.3)'); // Semi-transparent Yellow
    gradient.addColorStop(1, 'rgba(0, 255, 0, 0.3)'); // Semi-transparent Green

    return gradient;
}

function setChartData(statistics) {
    const documentStyle = getComputedStyle(document.documentElement);
    const labels = statistics.map((entry) => new Date(entry.created_at__date));
    const avgData = statistics.map((entry) => entry.avg_mood_index);
    const minData = statistics.map((entry) => entry.min_mood_index);
    const maxData = statistics.map((entry) => entry.max_mood_index);

    chartData.value = {
        labels: labels,
        datasets: [
            {
                label: 'Positive Mood',
                data: maxData,
                borderColor: (context) => {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;
                    if (!chartArea) {
                        return;
                    }
                    return getCircumplexGradientForMinMax(ctx, chartArea);
                },
                backgroundColor: 'rgba(129, 199, 132, 0.1)',
                fill: '+1',
                tension: 0.4,
                borderWidth: 2,

                pointBackgroundColor: '#00FF00'
            },

            {
                label: 'Average Mood',
                data: avgData,
                borderColor: (context) => {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;
                    if (!chartArea) {
                        return;
                    }
                    return getCircumplexGradient(ctx, chartArea);
                },
                backgroundColor: documentStyle.getPropertyValue('--p-surface-400'),
                fill: false,
                tension: 0.4,
                borderWidth: 2,
                pointBackgroundColor: '#FFFF00'
            },

            {
                label: 'Negative Mood',
                data: minData,
                borderColor: (context) => {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;
                    if (!chartArea) {
                        return;
                    }
                    return getCircumplexGradientForMinMax(ctx, chartArea);
                },
                backgroundColor: 'rgba(229, 115, 115, 0.1)',
                fill: '-1',
                tension: 0.4,
                borderWidth: 2,
                pointBackgroundColor: '#FF0000'
            }
        ]
    };
}

function setChartOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
    const textSurface = documentStyle.getPropertyValue('--p-text-color');

    chartOptions.value = {
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
                    drawBorder: false
                }
            }
        },
        plugins: {
            legend: {
                display: true,
                labels: {
                    fontColor: textSurface,
                    color: textSurface,
                    generateLabels: function (chart) {
                        const labels = chart.data.datasets.map((dataset, i) => {
                            return {
                                text: dataset.label,
                                fillStyle: dataset.label === 'Average Mood' ? '#FFA500' : dataset.label === 'Positive Mood' ? '#00FF00' : '#FF0000',
                                hidden: !chart.isDatasetVisible(i),
                                lineCap: dataset.borderCapStyle,
                                lineDash: dataset.borderDash,
                                lineDashOffset: dataset.borderDashOffset,
                                lineJoin: dataset.borderJoinStyle,
                                borderWidth: 2,
                                strokeStyle: dataset.borderColor,
                                pointStyle: dataset.pointStyle,
                                rotation: dataset.rotation,
                                datasetIndex: i
                            };
                        });
                        return labels;
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.dataset.label}: ${context.parsed.y.toFixed(2)}`
                }
            }
        }
    };
}

async function fetchProjectMoodStatistics(boardId) {
    if (!boardStore.currentBoard) return;

    const params = new URLSearchParams();
    if (dates.value && dates.value[0]) {
        params.append('start_date', formatDate(dates.value[0]));
    }
    if (dates.value && dates.value[1]) {
        params.append('end_date', formatDate(dates.value[1]));
    }

    try {
        const response = await boardStore.fetchProjectMoodStatistics(boardId, params);
        setChartData(response);
    } catch (error) {
        console.error('Error fetching mood statistics:', error);
    }
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}
watch(
    [getPrimary, getSurface, isDarkTheme],
    () => {
        setChartOptions();
    },
    { immediate: true }
);
</script>

<template>
    <div class="project-overview card">
        <div class="flex justify-end mb-4">
            <DatePicker v-model="dates" selectionMode="range" :manualInput="false" showButtonBar showIcon fluid iconDisplay="input" />
        </div>
        <Chart type="line" :data="chartData" :options="chartOptions" class="h-80" />
    </div>
</template>
