import api from '@/services/api';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useDashboardStore = defineStore('dashboard', () => {
    const tasks = ref([]);

    const fetchDashboardData = async () => {
        try {
            const response = await api.get('/dashboard/dashboard/');
            tasks.value = response.data.all_tasks;
        } catch (error) {
            console.error('Error in fetchDashboardData:', error);
            throw error;
        }
    };

    return {
        tasks,
        fetchDashboardData
    };
});
