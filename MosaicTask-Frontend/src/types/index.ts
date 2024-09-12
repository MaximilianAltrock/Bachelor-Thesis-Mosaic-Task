export interface User {
    id: number;
    username: string;
}

export interface Board {
    id: number;
    name: string;
    members: User[];
}

export interface List {
    id: number;
    name: string;
    board: number; // Board ID
    position: number;
}

export interface Task {
    id: number;
    title: string;
    description: string;
    due_date: string | null;
    priority: 1 | 2 | 3; // 1: Low, 2: Medium, 3: High
    complexity: 1 | 2 | 3; // 1: Easy, 2: Medium, 3: Hard
    list: number; // List ID
    assigned_to: User[];
    position: number;
    completed: boolean;
    completed_at: string | null;
}

export interface JournalEntry {
    id: number;
    user: number; // User ID
    title: string;
    content: string;
    createdAt: string;
    task: Task | null;
    valence: number | null;
    arousal: number | null;
    visibility: 'private' | 'shared' | 'public';
    shared_with: User[];
    moodIndex: number | null;
}

export interface MoodStatistics {
    date: string;
    mood_index: number;
}

export interface TaskMoodHistory {
    date: string;
    moodIndex: number;
    title: string;
    content: string;
    visibility: 'private' | 'shared' | 'public';
    user: string;
}

export interface ProjectOverview {
    createdAt: string;
    avgMoodIndex: number;
    minMoodIndex: number;
    maxMoodIndex: number;
    entryCount: number;
}

export interface DashboardStatistics {
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    avgValence: number;
    avgArousal: number;
    tasksCompletedThisWeek: number;
}

export interface TaskMoodCorrelation {
    complexity: 1 | 2 | 3;
    priority: 1 | 2 | 3;
    mood_index: number;
}
