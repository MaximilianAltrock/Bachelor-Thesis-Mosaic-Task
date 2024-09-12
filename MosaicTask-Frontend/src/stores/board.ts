import api from '@/services/api';
import { boardApi } from '@/services/boardApi';
import { Board, List, Task } from '@/types';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useBoardStore = defineStore('board', () => {
    const boards = ref<Board[]>([]);
    const currentBoard = ref<Board | null>(null);
    const lists = ref<List[]>([]);
    const tasks = ref<Task[]>([]);
    const isCreatingBoard = ref(false);
    const error = ref<string | null>(null);
    const selectedTask = ref<Task | null>(null);

    const sortedLists = computed(() => [...lists.value].sort((a, b) => a.position - b.position));

    const getTasksByList = computed(() => (listId: number) => tasks.value.filter((task) => task.list === listId).sort((a, b) => a.position - b.position));

    const getBoardById = computed(() => (id: number) => boards.value.find((board) => board.id === id));

    async function fetchBoards() {
        try {
            const response = await boardApi.fetchBoards();
            boards.value = response.data;
        } catch (error) {
            console.error('Error fetching boards:', error);
            throw error;
        }
    }

    async function fetchBoardById(boardId: number) {
        try {
            error.value = null;
            const response = await boardApi.fetchBoardById(boardId);
            currentBoard.value = response.data;
            lists.value = response.data.lists;
            tasks.value = response.data.lists.flatMap((list) => list.tasks);
        } catch (err) {
            console.error(`Error fetching board with id ${boardId}:`, err);
            if (err.response && err.response.status === 403) {
                error.value = "You don't have permission to access this board.";
            } else {
                error.value = 'An error occurred while fetching the board.';
            }
            throw err;
        }
    }

    async function createBoard(boardData: Omit<Board, 'id' | 'members'>) {
        isCreatingBoard.value = true;
        const tempId = Date.now();
        const tempBoard: Board = {
            id: tempId,
            ...boardData,
            members: []
        };
        boards.value.push(tempBoard);
        try {
            const response = await boardApi.createBoard(boardData);
            const newBoard = response.data;
            const index = boards.value.findIndex((board) => board.id === tempId);
            if (index !== -1) {
                boards.value[index] = newBoard;
            }
            return newBoard;
        } catch (error) {
            console.error('Error creating board:', error);
            boards.value = boards.value.filter((board) => board.id !== tempId);
            throw error;
        } finally {
            isCreatingBoard.value = false;
        }
    }

    async function updateBoard(id: number, boardData: Partial<Board>) {
        try {
            const response = await boardApi.updateBoard(id, boardData);
            const index = boards.value.findIndex((board) => board.id === id);
            if (index !== -1) {
                boards.value[index] = response.data;
            }
            if (currentBoard.value && currentBoard.value.id === id) {
                currentBoard.value = response.data;
            }
            return response.data;
        } catch (error) {
            console.error(`Error updating board with id ${id}:`, error);
            throw error;
        }
    }

    async function deleteBoard(id: number) {
        try {
            await boardApi.deleteBoard(id);
            boards.value = boards.value.filter((board) => board.id !== id);
            if (currentBoard.value && currentBoard.value.id === id) {
                currentBoard.value = null;
            }
        } catch (error) {
            console.error(`Error deleting board with id ${id}:`, error);
            throw error;
        }
    }

    async function addMemberToBoard(boardId: number, username: string) {
        try {
            const response = await boardApi.addMemberToBoard(boardId, username);
            if (response.data.status === 'user added to board' && response.data.user) {
                if (currentBoard.value && currentBoard.value.id === boardId) {
                    currentBoard.value.members.push(response.data.user);
                }
                const boardIndex = boards.value.findIndex((board) => board.id === boardId);
                if (boardIndex !== -1) {
                    boards.value[boardIndex].members.push(response.data.user);
                }
            }
            return response.data;
        } catch (error) {
            console.error(`Error adding member to board with id ${boardId}:`, error);
            throw error;
        }
    }

    async function fetchLists(boardId: number) {
        try {
            const response = await boardApi.fetchLists(boardId);
            lists.value = response.data;
        } catch (error) {
            console.error('Error fetching lists:', error);
            throw error;
        }
    }

    async function fetchTasks(boardId: number) {
        try {
            const response = await boardApi.fetchTasks(boardId);
            tasks.value = response.data;
        } catch (error) {
            console.error('Error fetching tasks:', error);
            throw error;
        }
    }

    async function fetchTaskById(taskId: number): Promise<Task> {
        try {
            const response = await boardApi.fetchTaskById(taskId);
            const fetchedTask = response.data;

            // Update the task in the local state if it exists
            const taskIndex = tasks.value.findIndex((t) => t.id === taskId);
            if (taskIndex !== -1) {
                tasks.value[taskIndex] = fetchedTask;
            } else {
                // If the task doesn't exist in the local state, add it
                tasks.value.push(fetchedTask);
            }

            // Set the selected task
            selectedTask.value = fetchedTask;

            return fetchedTask;
        } catch (err) {
            console.error(`Error fetching task with id ${taskId}:`, err);
            error.value = 'Error fetching task';
            throw err;
        }
    }

    async function fetchTaskMoodStatistics(taskId: number, params: URLSearchParams) {
        try {
            const response = await boardApi.fetchTaskMoodStatistics(taskId, params);
            return response.data;
        } catch (error) {
            console.error('Error fetching task mood statistics:', error);
            throw error;
        }
    }

    async function fetchProjectMoodStatistics(boardId: number, params: URLSearchParams) {
        try {
            const response = await boardApi.fetchProjectMoodStatistics(boardId, params);
            return response.data;
        } catch (error) {
            console.error('Error fetching project mood statistics:', error);
            throw error;
        }
    }

    async function fetchTaskMoodHistory(taskId: number) {
        try {
            const response = await boardApi.fetchTaskMoodHistory(taskId);
            return response.data;
        } catch (error) {
            console.error('Error fetching task mood statistics:', error);
            throw error;
        }
    }

    function clearSelectedTask() {
        selectedTask.value = null;
    }

    async function createList(name: string, boardId: number) {
        try {
            const response = await api.post<List>('/lists/', { name, board: boardId });
            lists.value.push(response.data);
        } catch (error) {
            console.error('Error creating list:', error);
            throw error;
        }
    }

    function addTaskOptimistically(task: Task) {
        tasks.value.push(task);
    }

    async function createTask(task: Omit<Task, 'id'>) {
        try {
            const response = await boardApi.createTask(task);
            const newTask = response.data;
            const index = tasks.value.findIndex((t) => t.id === task.id);
            if (index !== -1) {
                tasks.value[index] = newTask;
            } else {
                tasks.value.push(newTask);
            }
            return newTask;
        } catch (error) {
            console.error('Error creating task:', error);
            removeTask(task.id);
            throw error;
        }
    }

    async function deleteTask(taskId: number) {
        try {
            await boardApi.deleteTask(taskId);
            tasks.value = tasks.value.filter((task) => task.id !== taskId);
        } catch (error) {
            console.error('Error deleting task:', error);
            throw error;
        }
    }

    function removeTask(taskId: number) {
        const index = tasks.value.findIndex((t) => t.id === taskId);
        if (index !== -1) {
            tasks.value.splice(index, 1);
        }
    }

    async function updateTask(taskId: number, updates: Partial<Task>): Promise<Task> {
        try {
            const response = await boardApi.updateTask(taskId, updates);
            const updatedTask = response.data;

            // Update the task in the local state
            const taskIndex = tasks.value.findIndex((t) => t.id === taskId);
            if (taskIndex !== -1) {
                tasks.value[taskIndex] = { ...tasks.value[taskIndex], ...updatedTask };
            }

            // Update the selected task if it's the one being edited
            if (selectedTask.value && selectedTask.value.id === taskId) {
                selectedTask.value = { ...selectedTask.value, ...updatedTask };
            }

            return updatedTask;
        } catch (err) {
            console.error(`Error updating task with id ${taskId}:`, err);
            throw err;
        }
    }

    async function moveTask(taskId: number, newListId: number, newPosition: number) {
        const task = tasks.value.find((t) => t.id === taskId);
        if (!task) {
            console.error(`Task with ID ${taskId} not found.`);
            return;
        }
        const oldListId = task.list;
        const oldPosition = task.position;

        task.list = newListId;
        task.position = newPosition;

        updateTaskPositions(oldListId, newListId, taskId, oldPosition, newPosition);

        tasks.value = [...tasks.value];

        try {
            const response = await boardApi.moveTask(taskId, newListId, newPosition);

            if (response.data.status !== 'task moved') {
                throw new Error('Task move not confirmed by server');
            }
        } catch (error) {
            console.error('Error moving task:', error);
            task.list = oldListId;
            task.position = oldPosition;
            updateTaskPositions(newListId, oldListId, taskId, newPosition, oldPosition);
            tasks.value = [...tasks.value];
        }
    }

    function updateTaskPositions(oldListId: number, newListId: number, movedTaskId: number, oldPosition: number, newPosition: number) {
        if (oldListId === newListId) {
            // Moving within the same list
            tasks.value.forEach((task) => {
                if (task.list === newListId && task.id !== movedTaskId) {
                    if (oldPosition < newPosition && task.position > oldPosition && task.position <= newPosition) {
                        task.position -= 1;
                    } else if (oldPosition > newPosition && task.position >= newPosition && task.position < oldPosition) {
                        task.position += 1;
                    }
                }
            });
        } else {
            // Moving to a different list
            tasks.value.forEach((task) => {
                if (task.list === oldListId && task.position > oldPosition) {
                    task.position -= 1;
                }
                if (task.list === newListId && task.position >= newPosition) {
                    task.position += 1;
                }
            });
        }

        // Finally, set the position of the moved task to the desired position
        const movedTask = tasks.value.find((t) => t.id === movedTaskId);
        if (movedTask) {
            movedTask.position = newPosition;
        }
    }
    async function updateList(listId: number, updatedFields: Partial<List>) {
        try {
            const response = await boardApi.updateList(listId, updatedFields);
            const updatedList = response.data;
            const listIndex = lists.value.findIndex((list) => list.id === listId);
            if (listIndex !== -1) {
                lists.value[listIndex] = { ...lists.value[listIndex], ...updatedList };
            }
        } catch (error) {
            console.error('Error updating list:', error);
            throw error;
        }
    }

    async function deleteList(listId: number) {
        try {
            await boardApi.deleteList(listId);
            lists.value = lists.value.filter((list) => list.id !== listId);
        } catch (error) {
            console.error('Error deleting list:', error);
            throw error;
        }
    }

    async function moveList(listId: number, newPosition: number) {
        const listIndex = lists.value.findIndex((list) => list.id === listId);
        if (listIndex === -1) return;

        const updatedLists = [...lists.value];
        const [movedList] = updatedLists.splice(listIndex, 1);
        updatedLists.splice(newPosition, 0, movedList);
        updatedLists.forEach((list, index) => {
            list.position = index;
        });

        try {
            // array index starts at 0 but backend sorting starts at 1 so temp fix is just to add + 1
            const response = await boardApi.moveList(listId, newPosition);
            if (response.data.status === 'list moved') {
                // Force reactivity by assigning a new array
                lists.value = updatedLists;
            } else {
                throw new Error('List move not confirmed by server');
            }
        } catch (error) {
            console.error('Error moving list:', error);
            lists.value = [...lists.value].sort((a, b) => a.position - b.position);
        }
    }

    return {
        boards,
        currentBoard,
        lists,
        tasks,
        isCreatingBoard,
        sortedLists,
        getTasksByList,
        getBoardById,
        selectedTask,
        fetchBoards,
        fetchBoardById,
        createBoard,
        updateBoard,
        deleteBoard,
        addMemberToBoard,
        fetchProjectMoodStatistics,
        fetchLists,
        fetchTasks,
        fetchTaskById,
        clearSelectedTask,
        createList,
        addTaskOptimistically,
        createTask,
        deleteTask,
        removeTask,
        updateTask,
        fetchTaskMoodStatistics,
        fetchTaskMoodHistory,
        moveTask,
        updateList,
        deleteList,
        moveList
    };
});
