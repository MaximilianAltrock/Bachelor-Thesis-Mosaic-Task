import api from '@/services/api';
import { Board, List, Task, User } from '@/types';

export const boardApi = {
    async fetchBoards() {
        return api.get<Board[]>('/boards/');
    },

    async fetchBoardById(boardId: number) {
        return api.get<Board>(`/boards/${boardId}/`);
    },

    async createBoard(boardData: Omit<Board, 'id' | 'members'>) {
        return api.post<Board>('/boards/', boardData);
    },

    async updateBoard(id: number, boardData: Partial<Board>) {
        return api.put<Board>(`/boards/${id}/`, boardData);
    },

    async deleteBoard(id: number) {
        return api.delete(`/boards/${id}/`);
    },

    async fetchBoardUsers(boardId: number) {
        return api.get<User[]>(`/boards/${boardId}/users/`);
    },

    async addMemberToBoard(boardId: number, username: string) {
        return api.post(`/boards/${boardId}/add_member/`, { username });
    },

    async fetchLists(boardId: number) {
        return api.get<List[]>(`/lists/?board=${boardId}`);
    },

    async createList(name: string, boardId: number) {
        return api.post<List>('/lists/', { name, board: boardId });
    },

    async updateList(listId: number, updatedFields: Partial<List>) {
        return api.patch<List>(`/lists/${listId}/`, updatedFields);
    },

    async deleteList(listId: number) {
        return api.delete(`/lists/${listId}/`);
    },

    async moveList(listId: number, newPosition: number) {
        return api.post(`/lists/${listId}/move/`, { position: newPosition });
    },

    async fetchTasks(boardId: number) {
        return api.get<Task[]>(`/tasks/?list__board=${boardId}`);
    },

    async fetchTaskById(taskId: number) {
        return api.get<Task>(`/tasks/${taskId}/`);
    },

    async createTask(task: Omit<Task, 'id'>) {
        return api.post<Task>('/tasks/', task);
    },

    async updateTask(taskId: number, updates: Partial<Task>) {
        return api.patch<Task>(`/tasks/${taskId}/`, updates);
    },

    async deleteTask(taskId: number) {
        return api.delete(`/tasks/${taskId}/`);
    },

    async moveTask(taskId: number, newListId: number, newPosition: number) {
        return api.post(`/tasks/${taskId}/move/`, {
            list_id: newListId,
            position: newPosition
        });
    },

    async fetchTaskMoodStatistics(taskId: number, params: URLSearchParams) {
        return api.get(`/journal-entries/${taskId}/task-mood-statistics/`, { params });
    },

    async fetchProjectMoodStatistics(boardId: number, params: URLSearchParams) {
        return api.get(`/journal-entries/${boardId}/project-overview/`, { params });
    },

    async fetchTaskMoodHistory(taskId: number) {
        return api.get(`/journal-entries/${taskId}/task-mood-history/`);
    }
};
