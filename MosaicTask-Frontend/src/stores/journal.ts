import { journalApi } from '@/services/journalApi';
import { JournalEntry, MoodStatistics, ProjectOverview, TaskMoodCorrelation, TaskMoodHistory } from '@/types';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useJournalStore = defineStore('journal', () => {
    const entries = ref<JournalEntry[]>([]);
    const moodStatistics = ref<MoodStatistics[]>([]);
    const heatmapData = ref<TaskMoodCorrelation[]>([]);
    const taskMoodHistory = ref<TaskMoodHistory[]>([]);
    const projectOverview = ref<ProjectOverview[]>([]);

    const getMoodStatistics = computed(() => moodStatistics.value);
    const getHeatMapData = computed(() => heatmapData.value);

    async function fetchJournalEntries() {
        try {
            entries.value = await journalApi.fetchJournalEntries();
            return entries.value;
        } catch (error) {
            console.error('Error fetching journal entries:', error);
            throw error;
        }
    }

    async function createJournalEntry(entryData: Omit<JournalEntry, 'id' | 'createdAt' | 'user' | 'moodIndex'>) {
        try {
            const newEntry = await journalApi.createJournalEntry(entryData);
            entries.value.unshift(newEntry);
            return newEntry;
        } catch (error) {
            console.error('Error creating journal entry:', error);
            throw error;
        }
    }

    async function updateJournalEntry(entryData: Partial<JournalEntry>) {
        try {
            const updatedEntry = await journalApi.updateJournalEntry(entryData);
            const index = entries.value.findIndex((entry) => entry.id === entryData.id);
            if (index !== -1) {
                entries.value[index] = { ...entries.value[index], ...updatedEntry };
            }
            return updatedEntry;
        } catch (error) {
            console.error('Error updating journal entry:', error);
            throw error;
        }
    }

    async function deleteJournalEntry(entryId: number) {
        try {
            await journalApi.deleteJournalEntry(entryId);
            entries.value = entries.value.filter((entry) => entry.id !== entryId);
        } catch (error) {
            console.error('Error deleting journal entry:', error);
            throw error;
        }
    }

    async function fetchMoodStatistics() {
        try {
            moodStatistics.value = await journalApi.fetchMoodStatistics();
            return moodStatistics.value;
        } catch (error) {
            console.error('Error fetching mood statistics:', error);
            throw error;
        }
    }

    async function fetchHeatMap() {
        try {
            heatmapData.value = await journalApi.fetchHeatMap();
            return heatmapData.value;
        } catch (error) {
            console.error('Error fetching heatmap data:', error);
            throw error;
        }
    }

    async function fetchTaskMoodStatistics(taskId: number, startDate?: string, endDate?: string) {
        try {
            return await journalApi.fetchTaskMoodStatistics(taskId, startDate, endDate);
        } catch (error) {
            console.error('Error fetching task mood statistics:', error);
            throw error;
        }
    }

    async function fetchTaskMoodHistory(taskId: number) {
        try {
            taskMoodHistory.value = await journalApi.fetchTaskMoodHistory(taskId);
            return taskMoodHistory.value;
        } catch (error) {
            console.error('Error fetching task mood history:', error);
            throw error;
        }
    }

    async function fetchProjectOverview(startDate?: string, endDate?: string) {
        try {
            projectOverview.value = await journalApi.fetchProjectOverview(startDate, endDate);
            return projectOverview.value;
        } catch (error) {
            console.error('Error fetching project overview:', error);
            throw error;
        }
    }

    async function shareJournalEntry(entryId: number, userIds: number[]) {
        try {
            const updatedEntry = await journalApi.shareJournalEntry(entryId, userIds);
            const index = entries.value.findIndex((entry) => entry.id === entryId);
            if (index !== -1) {
                entries.value[index] = updatedEntry;
            }
            return updatedEntry;
        } catch (error) {
            console.error('Error sharing journal entry:', error);
            throw error;
        }
    }

    async function fetchAvailableTasks() {
        try {
            return await journalApi.fetchAvailableTasks();
        } catch (error) {
            console.error('Error fetching available tasks:', error);
            throw error;
        }
    }

    async function fetchShareableUsers() {
        try {
            return await journalApi.fetchShareableUsers();
        } catch (error) {
            console.error('Error fetching shareable users:', error);
            throw error;
        }
    }

    return {
        entries,
        moodStatistics,
        heatmapData,
        taskMoodHistory,
        projectOverview,
        getMoodStatistics,
        getHeatMapData,
        fetchJournalEntries,
        createJournalEntry,
        updateJournalEntry,
        deleteJournalEntry,
        fetchMoodStatistics,
        fetchHeatMap,
        fetchTaskMoodStatistics,
        fetchTaskMoodHistory,
        fetchProjectOverview,
        shareJournalEntry,
        fetchAvailableTasks,
        fetchShareableUsers
    };
});
