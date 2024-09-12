import { computed, reactive, readonly } from 'vue';

const layoutConfig = reactive({
    preset: 'Aura',
    primary: 'cyan',
    surface: null,
    darkTheme: false, // Initial false, kann später überschrieben werden
    menuMode: 'static'
});

const layoutState = reactive({
    staticMenuDesktopInactive: false,
    overlayMenuActive: false,
    profileSidebarVisible: false,
    configSidebarVisible: false,
    staticMenuMobileActive: false,
    menuHoverActive: false,
    activeMenuItem: null,
    taskSidebarVisible: false
});

function initializeTheme() {
    // Check if the user has a saved preference
    const savedTheme = localStorage.getItem('darkTheme');
    if (savedTheme !== null) {
        layoutConfig.darkTheme = JSON.parse(savedTheme);
    } else {
        // Fallback to system preference if no saved preference
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
        layoutConfig.darkTheme = prefersDarkScheme;
    }
    updateDocumentClass();
}

function updateDocumentClass() {
    if (layoutConfig.darkTheme) {
        document.documentElement.classList.add('app-dark');
    } else {
        document.documentElement.classList.remove('app-dark');
    }
}

const toggleDarkMode = () => {
    if (!document.startViewTransition) {
        executeDarkModeToggle();
        return;
    }

    document.startViewTransition(() => executeDarkModeToggle());
};

const toggleTaskSidebar = () => {
    layoutState.taskSidebarVisible = !layoutState.taskSidebarVisible;
};
const isTaskSidebarVisible = computed(() => layoutState.taskSidebarVisible);
const executeDarkModeToggle = () => {
    layoutConfig.darkTheme = !layoutConfig.darkTheme;
    localStorage.setItem('darkTheme', layoutConfig.darkTheme); // Save the preference
    updateDocumentClass();
};

export function useLayout() {
    initializeTheme(); // Initialize theme on layout use

    const setPrimary = (value) => {
        layoutConfig.primary = value;
    };

    const setSurface = (value) => {
        layoutConfig.surface = value;
    };

    const setPreset = (value) => {
        layoutConfig.preset = value;
    };

    const setActiveMenuItem = (item) => {
        layoutState.activeMenuItem = item.value || item;
    };

    const setMenuMode = (mode) => {
        layoutConfig.menuMode = mode;
    };

    const onMenuToggle = () => {
        if (layoutConfig.menuMode === 'overlay') {
            layoutState.overlayMenuActive = !layoutState.overlayMenuActive;
        }

        if (window.innerWidth > 991) {
            layoutState.staticMenuDesktopInactive = !layoutState.staticMenuDesktopInactive;
        } else {
            layoutState.staticMenuMobileActive = !layoutState.staticMenuMobileActive;
        }
    };

    const resetMenu = () => {
        layoutState.overlayMenuActive = false;
        layoutState.staticMenuMobileActive = false;
        layoutState.menuHoverActive = false;
    };

    const isSidebarActive = computed(() => layoutState.overlayMenuActive || layoutState.staticMenuMobileActive);

    const isDarkTheme = computed(() => layoutConfig.darkTheme);

    const getPrimary = computed(() => layoutConfig.primary);

    const getSurface = computed(() => layoutConfig.surface);

    return {
        layoutConfig: readonly(layoutConfig),
        layoutState: readonly(layoutState),
        onMenuToggle,
        isSidebarActive,
        isDarkTheme,
        getPrimary,
        getSurface,
        isTaskSidebarVisible,
        setActiveMenuItem,
        toggleDarkMode,
        setPrimary,
        setSurface,
        setPreset,
        resetMenu,
        setMenuMode,
        toggleTaskSidebar
    };
}
