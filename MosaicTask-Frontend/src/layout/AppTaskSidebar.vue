<script setup lang="ts">
import { useLayout } from '@/layout/composables/layout';
import { useBoardStore } from '@/stores/board';
import { User } from '@/types';
import 'chartjs-adapter-date-fns';
import { format } from 'date-fns';
import { computed, onMounted, ref, watch } from 'vue';

const boardStore = useBoardStore();
const { toggleTaskSidebar, isDarkTheme, getPrimary, getSurface } = useLayout();
const textFocus = (el: any) => {
    el.el?.focus();
};

const chartData = ref({});
const chartOptions = ref({});
const startDate = ref(null);
const endDate = ref(null);
const showEntries = ref(false);

const isEditingTitle = ref(false);
const isEditingDescription = ref(false);
const editedTitle = ref('');
const editedDescription = ref('');
const localDueDate = ref<Date | null>(null);
const taskMoodHistory = ref('');

function formatDate(date: string) {
    return format(new Date(date), 'PPP');
}
const availableUsers = computed(() => boardStore.currentBoard?.members || []);

const selectedUsers = computed({
    get: () => boardStore.selectedTask?.assigned_to || [],
    set: (value: User[]) => {
        if (boardStore.selectedTask) {
            boardStore.selectedTask.assigned_to = value;
        }
    }
});

function getCircumplexGradient(ctx, chartArea) {
    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    // Farbübergänge richtig definieren (Werte müssen zwischen 0 und 1 liegen)
    gradient.addColorStop(0, '#FF0000'); // Red (negative Stimmung)
    gradient.addColorStop(0.5, '#FFFF00'); // Yellow (neutrale Stimmung)
    gradient.addColorStop(1, '#00FF00'); // Green (positive Stimmung)

    return gradient;
}

function getCircumplexGradientForMinMax(ctx, chartArea) {
    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);

    // Verwendung von halbtransparenten Farben
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
                    fontColor: textSurface, // Verwende die CSS-Variable oder eine Standardfarbe
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

async function updateAssignedUsers() {
    if (!boardStore.selectedTask) return;

    const userIds = selectedUsers.value.length > 0 ? selectedUsers.value.map((user: User) => user.id) : [];

    try {
        const updatedTask = await boardStore.updateTask(boardStore.selectedTask.id, { assigned_to_ids: userIds });

        selectedUsers.value = updatedTask.assigned_to;
    } catch (error) {
        selectedUsers.value = boardStore.selectedTask.assigned_to;
    }
}

const isCompleted = computed(() => !!boardStore.selectedTask?.completed);
function toggleCompleted() {
    if (!boardStore.selectedTask) return;

    const newValue = !isCompleted.value;
    try {
        boardStore.updateTask(boardStore.selectedTask.id, { completed: newValue });
    } catch (error) {
        console.error('Error updating task completion status:', error);
    }
}

const assignedUsers = computed(() => {
    return boardStore.selectedTask.assigned_to.map((user: User) => ({
        label: user.username.charAt(0).toUpperCase(),
        username: user.username
    }));
});

watch(
    () => boardStore.selectedTask,
    (newTask) => {
        localDueDate.value = newTask?.due_date ? new Date(newTask.due_date) : null;
    },
    { immediate: true }
);

onMounted(() => {
    setChartOptions();
    fetchMoodStatistics();
});

watch(
    () => boardStore.selectedTask,
    (newTask, oldTask) => {
        if (newTask?.id !== oldTask?.id) {
            taskMoodHistory.value = '';
            showEntries.value = false;
            fetchMoodStatistics();
        }
    },
    { immediate: true }
);

async function fetchMoodStatistics() {
    if (!boardStore.selectedTask) return;

    const params = new URLSearchParams();
    if (startDate.value) params.append('start_date', startDate.value.toISOString().split('T')[0]);
    if (endDate.value) params.append('end_date', endDate.value.toISOString().split('T')[0]);

    try {
        const response = await boardStore.fetchTaskMoodStatistics(boardStore.selectedTask.id, params);
        setChartData(response);
    } catch (error) {
        console.error('Error fetching mood statistics:', error);
    }
}

async function fetchTaskMoodEntries() {
    if (!boardStore.selectedTask || taskMoodHistory.value.length > 0) return;

    try {
        const response = await boardStore.fetchTaskMoodHistory(boardStore.selectedTask.id);
        taskMoodHistory.value = response || [];
    } catch (error) {
        console.error('Error fetching mood statistics:', error);
    }
}

function toggleEntries() {
    if (!showEntries.value && taskMoodHistory.value.length === 0) {
        fetchTaskMoodEntries();
    }
    showEntries.value = !showEntries.value;
}

const priorityOptions = [
    { name: 'Low', value: 1 },
    { name: 'Medium', value: 2 },
    { name: 'High', value: 3 }
];

const complexityOptions = [
    { name: 'Easy', value: 1 },
    { name: 'Medium', value: 2 },
    { name: 'Hard', value: 3 }
];

function closeSidebar() {
    boardStore.clearSelectedTask();
    toggleTaskSidebar();
}

function startEditingTitle() {
    editedTitle.value = boardStore.selectedTask?.title || '';
    isEditingTitle.value = true;
}

function startEditingDescription() {
    editedDescription.value = boardStore.selectedTask?.description || '';
    isEditingDescription.value = true;
}

async function saveTitle() {
    if (boardStore.selectedTask) {
        await boardStore.updateTask(boardStore.selectedTask.id, { title: editedTitle.value });
        isEditingTitle.value = false;
    }
}

async function saveDescription() {
    if (boardStore.selectedTask) {
        await boardStore.updateTask(boardStore.selectedTask.id, { description: editedDescription.value });
        isEditingDescription.value = false;
    }
}

async function savePriority() {
    if (boardStore.selectedTask) {
        await boardStore.updateTask(boardStore.selectedTask.id, { priority: boardStore.selectedTask.priority });
    }
}

async function saveComplexity() {
    if (boardStore.selectedTask) {
        await boardStore.updateTask(boardStore.selectedTask.id, { complexity: boardStore.selectedTask.complexity });
    }
}

async function handleDatePickerHide() {
    if (boardStore.selectedTask) {
        const newDueDate = localDueDate.value ? localDueDate.value.toISOString() : null;
        if (newDueDate !== boardStore.selectedTask.due_date) {
            try {
                await boardStore.updateTask(boardStore.selectedTask.id, { due_date: newDueDate });
            } catch (error) {
                console.error('Error updating task:', error);
            }
        }
    }
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
    <div class="overflow-y-auto layout-task-sidebar">
        <!-- Close Button -->
        <Button icon="pi pi-angle-double-right" @click="closeSidebar" class="absolute -top-1 -left-5" rounded text severity="secondary" />
        <div v-if="boardStore.selectedTask" class="flex flex-col gap-6 pt-6">
            <!-- Title -->
            <div class="flex flex-col">
                <span v-if="!isEditingTitle" @click="startEditingTitle" class="text-2xl font-bold cursor-pointer md:pl-6">
                    {{ boardStore.selectedTask.title }}
                </span>
                <InputText v-else v-model="editedTitle" @keyup.enter="saveTitle" @blur="saveTitle" class="text-2xl" @vue:mounted="textFocus" />
            </div>

            <!-- Description -->
            <div class="flex flex-col md:flex-row">
                <label class="w-full mb-2 font-bold md:w-1/3 md:mb-0 md:pl-6">Description</label>
                <div class="w-full md:w-2/3 md:pl-4">
                    <span v-if="!isEditingDescription" @click="startEditingDescription" class="cursor-pointer description-text">
                        {{ boardStore.selectedTask.description || 'No description' }}
                    </span>
                    <Textarea v-else v-model="editedDescription" @blur="saveDescription" class="" rows="5" cols="30" autoResize @vue:mounted="textFocus" />
                </div>
            </div>

            <!-- Priority -->
            <div class="flex flex-col md:flex-row md:items-center">
                <label class="w-full mb-2 font-bold md:w-1/3 md:mb-0 md:pl-6">Priority</label>
                <div class="w-full md:w-2/3 md:pl-4">
                    <Select v-model="boardStore.selectedTask.priority" :options="priorityOptions" optionLabel="name" optionValue="value" @change="savePriority" class="" />
                </div>
            </div>

            <!-- Complexity -->
            <div class="flex flex-col md:flex-row md:items-center">
                <label class="w-full mb-2 font-bold md:w-1/3 md:mb-0 md:pl-6">Complexity</label>
                <div class="w-full md:w-2/3 md:pl-4">
                    <Select v-model="boardStore.selectedTask.complexity" :options="complexityOptions" optionLabel="name" optionValue="value" @change="saveComplexity" class="" />
                </div>
            </div>

            <!-- Due Date -->
            <div class="flex flex-col md:flex-row md:items-start">
                <label class="w-full mb-2 font-bold md:w-1/3 md:mb-0 md:pt-2 md:pl-6">Due Date</label>
                <div class="flex items-center md:w-2/3 md:pl-4">
                    <Checkbox v-model="boardStore.selectedTask.completed" @click="toggleCompleted" :binary="true" v-tooltip.bottom="'Mark as completed'" class="mr-2" />
                    <DatePicker v-model="localDueDate" showTime hourFormat="24" dateFormat="dd. M. y" showIcon showButtonBar :manualInput="false" @hide="handleDatePickerHide" class="" />
                </div>
            </div>

            <!-- Assigned To -->
            <div class="flex flex-col md:flex-row">
                <label class="w-full mb-2 font-bold md:w-1/3 md:mb-0 md:pl-6">Assigned To</label>
                <div class="w-full md:w-2/3 md:pl-4">
                    <MultiSelect :options="availableUsers" v-model="selectedUsers" optionLabel="username" filter placeholder="Select asignees" :maxSelectedLabels="6" @change="updateAssignedUsers" class="w-full md:w-80" />
                </div>
            </div>

            <Chart type="line" :data="chartData" :options="chartOptions" class="h-80" />

            <Button :label="showEntries ? 'Hide Journal Entries' : 'Show Journal Entries'" @click="toggleEntries" />
            <div v-if="showEntries" class="entries-container">
                <Card v-for="entry in taskMoodHistory" :key="entry.date" class="entry-card">
                    <template #header>
                        <div class="entry-header">
                            <strong>{{ entry.title }}</strong>
                            <span class="entry-date">{{ formatDate(entry.date) }}</span>
                        </div>
                    </template>
                    <template #content>
                        <div class="entry-content">
                            <p>{{ entry.content }}</p>
                        </div>
                    </template>
                    <template #footer>
                        <p class="entry-user">{{ entry.user }}</p>
                    </template>
                </Card>
            </div>
        </div>
        <div v-else>No task selected</div>
    </div>
</template>

<style scoped>
.description-text {
    word-wrap: break-word;
    word-break: break-word;
    white-space: pre-wrap;
    max-width: 100%;
}

.entries-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
    padding: 1rem;
}

.entry-card {
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.entry-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bold;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e0e0e0;
}

.entry-date {
    font-size: 0.875rem;
}

.entry-content {
    padding: 1rem 0;
}

.entry-user {
    font-size: 0.875rem;
    text-align: right;
}
</style>
