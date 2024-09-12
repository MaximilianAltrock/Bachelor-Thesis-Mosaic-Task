<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const navigateToRegister = () => {
    router.push('/auth/register');
};
</script>

<template>
    <div class="max-w-4xl p-6 mx-auto landing-page">
        <header class="mb-12 text-center">
            <h1 class="mb-4 text-4xl font-bold md:text-5xl text-primary">Welcome to My Task Management Thesis Project</h1>
            <p class="text-xl text-surface-600 dark:text-surface-300">Exploring how integrating mood tracking with task management can enhance productivity and well-being for individuals and teams</p>
        </header>

        <section class="mb-12">
            <h2 class="mb-4 text-3xl font-semibold text-surface-900 dark:text-surface-0">About My Project</h2>
            <p class="mb-4 text-lg">
                Hello! I'm excited to share with you my bachelor thesis project. As a student passionate about productivity and mental health, I've developed this prototype application that combines task management with mood tracking.
            </p>
            <p class="mb-4 text-lg">
                The core idea behind this project is to explore whether being more aware of our emotional states while managing tasks can lead to better productivity and improved well-being. I believe that by understanding the relationship between
                our tasks and our moods, we can make more informed decisions about how we work and take care of ourselves and our team members.
            </p>
            <p class="text-lg italic text-surface-600 dark:text-surface-300">
                Please note: As this is a prototype developed for my thesis, it's not a fully polished product. You might encounter some bugs or unfinished features. Your understanding is greatly appreciated!
            </p>
        </section>

        <section class="mb-12">
            <h2 class="mb-4 text-3xl font-semibold text-surface-900 dark:text-surface-0">Key Aspects of the Project</h2>
            <p class="mb-4 text-lg">Here are some of the core features and ideas that make this project unique:</p>
            <ul class="mb-4 text-lg list-disc list-inside">
                <li class="mb-3">
                    <strong>Integrated Mood Tracking via Journal:</strong> The Journal feature is the central hub for mood tracking in this application. Unlike traditional task management system, it allows you to log your emotional state alongside
                    your tasks. You can create daily entries to reflect on your mood, associate these entries with specific tasks, and track how different types of work affect your emotional state over time.
                </li>
                <li class="mb-3">
                    <strong>Task-Emotion Correlation:</strong> The app provides visualizations that show how your mood correlates with task complexity and priority. This can help identify which types of tasks might be causing stress or bringing
                    satisfaction.
                </li>
                <li class="mb-3"><strong>Task Management:</strong> Create boards for your projects, add lists to structure your workflow, and create tasks with details like priority, due dates, and assignees.</li>
                <li class="mb-3">
                    <strong>Team Mood Awareness:</strong> For collaborative projects, the app offers insights into team mood trends, promoting empathy and better team dynamics. This feature helps in understanding not just individual, but also
                    collective emotional patterns. These statistics work for individuals working on projects and tasks as well.
                </li>
                <li class="mb-3"><strong>Customizable Workflows:</strong> The task management system is flexible, allowing for different organizational styles like Kanban boards or traditional to-do lists.</li>
                <li><strong>Data-Driven Insights:</strong> The dashboard provides analytics on your productivity patterns and emotional trends, helping you and your team make informed decisions about work habits and task allocation.</li>
            </ul>
        </section>

        <section class="mb-12">
            <h2 class="mb-4 text-3xl font-semibold text-surface-900 dark:text-surface-0">How to Use the Application</h2>
            <p class="mb-4 text-lg">Here’s a brief guide to help you get started with the main features:</p>
            <p class="mb-4 text-lg">To facilitate a quick start and ensure meaningful statistics right from the beginning, your account will be pre-filled with synthetic data upon registration. This serves two main purposes:</p>
            <ul class="mb-4 text-lg list-disc list-inside">
                <li>It allows you to explore all features immediately, including analytics and visualization tools.</li>
                <li>It provides sufficient data points to make the statistics and correlations in the app meaningful and insightful.</li>
            </ul>
            <ul class="mb-4 text-lg list-disc list-inside">
                <li class="mb-2"><strong>Task Management:</strong> Start by exploring the pre-populated boards and tasks to familiarize yourself with the system. Then, create your own boards, lists, and tasks to organize your workflow.</li>
                <li class="mb-2">
                    <strong>Mood Tracking with the Journal:</strong> Use the Journal feature to log your moods and emotions. Try associating these entries with specific tasks to understand how your work impacts your emotional state. This is crucial
                    for gaining insights into the relationship between your productivity and emotions.
                </li>
                <li class="mb-2"><strong>Analytics:</strong> Visit the dashboard to view visualizations of your mood trends and analyze the correlations between different task types and your emotional well-being.</li>
                <li><strong>Collaboration:</strong> If you’re working with a team or friends, share boards to collaborate and gain insights into team dynamics and collective emotional patterns.</li>
            </ul>
        </section>

        <section class="mb-12">
            <h2 class="mb-4 text-3xl font-semibold text-surface-900 dark:text-surface-0">Your Feedback is Valuable</h2>
            <p class="mb-4 text-lg">As a student working on this thesis project, your experience and feedback are incredibly valuable to me. While using the application, I'd be grateful if you could take note of:</p>
            <ul class="mb-4 text-lg list-disc list-inside">
                <li>Any bugs or unexpected behaviors you encounter</li>
                <li>Features you find particularly useful or interesting</li>
                <li>Aspects of the user interface that could be improved</li>
                <li>Any insights you gain about your own task management and emotional patterns</li>
            </ul>
            <p class="mb-4 text-lg">
                To capture your thoughts and experiences comprehensively, I've prepared a survey that I'd like you to complete after you've had a chance to use the application. Your input will not only help me improve this prototype but will also
                contribute significantly to my thesis.
            </p>
            <p class="mb-6 text-lg font-semibold">Please save the survey link below. After you've explored the application, I'd greatly appreciate if you could take a few minutes to fill out the survey with your valuable feedback.</p>
            <div class="flex flex-col items-center justify-center mb-6">
                <a href="https://forms.office.com/r/Eq8pU9pbAz" target="_blank" rel="noopener noreferrer" class="text-primary"> Save Survey Link </a>
                <p class="text-sm text-muted">Click to open and bookmark, or copy the link for later</p>
            </div>
        </section>

        <section>
            <h2 class="mb-4 text-3xl font-semibold text-surface-900 dark:text-surface-0">Getting Started</h2>
            <p class="mb-4 text-lg">Ready to dive in and help with my research? Here's how you can get started:</p>
            <ol class="mb-4 text-lg list-decimal list-inside">
                <li class="mb-2"><strong>Register an account:</strong> Create an account with just a username and password. No email required!</li>
                <li>
                    <strong>Use a desktop or laptop:</strong> Due to the complexity of the task management interface, this application is not optimized for smartphones. For the best experience and to access all features, please use a desktop computer
                    or laptop.
                </li>
            </ol>
            <p class="text-lg">
                Thank you for your interest in my thesis project! Your participation will help me explore this exciting intersection of task management and emotional well-being, both for individuals and teams. I'm looking forward to your insights!
            </p>
            <div class="text-center">
                <Button label="Register Now" @click="navigateToRegister" class="ml-2" />
            </div>
        </section>
    </div>
</template>

<style scoped>
.landing-page {
    @apply bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-surface-50;
}

h2 {
    @apply text-primary;
}

section {
    @apply bg-surface-0 dark:bg-surface-800 p-6 rounded-lg shadow-md;
}
</style>
