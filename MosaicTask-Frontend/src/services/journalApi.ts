import api from '@/services/api';
import { JournalEntry, MoodStatistics, ProjectOverview, TaskMoodCorrelation, TaskMoodHistory } from '@/types';

export const journalApi = {
    async fetchJournalEntries(): Promise<JournalEntry[]> {
        const response = await api.get('/journal-entries/');
        return response.data;
    },

    async createJournalEntry(entryData: Omit<JournalEntry, 'id' | 'createdAt' | 'user' | 'moodIndex'>): Promise<JournalEntry> {
        const response = await api.post('/journal-entries/', entryData);
        return response.data;
    },

    async updateJournalEntry(entryData: Partial<JournalEntry>): Promise<JournalEntry> {
        const response = await api.put(`/journal-entries/${entryData.id}/`, entryData);
        return response.data;
    },

    async deleteJournalEntry(entryId: number): Promise<void> {
        await api.delete(`/journal-entries/${entryId}/`);
    },

    async fetchMoodStatistics(): Promise<MoodStatistics[]> {
        const response = await api.get('/journal-entries/mood-statistics/');
        return response.data;
    },

    async fetchHeatMap(): Promise<TaskMoodCorrelation[]> {
        const response = await api.get('/journal-entries/heatmap-data/');
        return response.data;
    },

    async fetchTaskMoodStatistics(taskId: number, startDate?: string, endDate?: string): Promise<any> {
        let url = `/tasks/${taskId}/mood-statistics/`;
        if (startDate && endDate) {
            url += `?start_date=${startDate}&end_date=${endDate}`;
        }
        const response = await api.get(url);
        return response.data;
    },

    async fetchTaskMoodHistory(taskId: number): Promise<TaskMoodHistory[]> {
        const response = await api.get(`/journal-entries/${taskId}/task-mood-history/`);
        return response.data;
    },

    async fetchProjectOverview(startDate?: string, endDate?: string): Promise<ProjectOverview[]> {
        let url = '/journal-entries/project-overview/';
        if (startDate && endDate) {
            url += `?start_date=${startDate}&end_date=${endDate}`;
        }
        const response = await api.get(url);
        return response.data;
    },

    async shareJournalEntry(entryId: number, userIds: number[]): Promise<JournalEntry> {
        const response = await api.post(`/journal-entries/${entryId}/share/`, { user_ids: userIds });
        return response.data;
    },

    async fetchAvailableTasks(): Promise<any[]> {
        const response = await api.get('/journal-entries/available-tasks/');
        return response.data;
    },

    async fetchShareableUsers(): Promise<any[]> {
        const response = await api.get('/journal-entries/shareable-users/');
        return response.data;
    }
};
