<script setup lang="ts">
import { ref } from 'vue';

interface Mood {
    valence: number;
    arousal: number;
}

const props = defineProps<{ initialValence: number; initialArousal: number }>();

const currentMood = ref<Mood>({ valence: props.initialValence || 0, arousal: props.initialArousal || 0 });

const updateMood = (x: number, y: number) => {
    currentMood.value = {
        valence: Math.max(-1, Math.min(1, x)),
        arousal: Math.max(-1, Math.min(1, y))
    };
};

const emit = defineEmits(['save-mood']);

const saveMood = () => {
    emit('save-mood', currentMood.value);
};
</script>

<template>
    <div class="flex items-center justify-center">
        <div class="relative w-full max-w-sm aspect-square" style="border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3)">
            <!-- Circumplex Mood Model with Radial and Conic Gradient -->
            <div
                class="absolute inset-0 overflow-hidden rounded-lg cursor-pointer bg-gradient-to-br from-red-500 via-yellow-500 to-green-500"
                @click="(e) => updateMood(((e.clientX - e.target.getBoundingClientRect().left) / e.target.offsetWidth) * 2 - 1, 1 - ((e.clientY - e.target.getBoundingClientRect().top) / e.target.offsetHeight) * 2)"
                tabindex="0"
                role="slider"
                aria-label="Mood selector"
                :aria-valuetext="`Valence: ${currentMood.valence.toFixed(2)}, Arousal: ${currentMood.arousal.toFixed(2)}`"
            >
                <!-- Indicator that moves based on mood -->
                <div
                    class="absolute w-6 h-6 transform -translate-x-1/2 -translate-y-1/2 bg-white border rounded-full shadow-md border-zinc-400"
                    :style="{
                        left: `${((currentMood.valence + 1) / 2) * 100}%`,
                        top: `${((1 - currentMood.arousal) / 2) * 100}%`,
                        boxShadow: '0 0 12px rgba(255, 255, 255, 1)',
                        transition: 'left 0.2s ease, top 0.2s ease'
                    }"
                ></div>
            </div>
            <div class="pointer-events-none">
                <div class="absolute text-xl font-semibold text-white transform -translate-y-1/2 text-md left-2 top-1/2" style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5)">Unpleasant</div>
                <div class="absolute text-xl font-semibold text-white transform -translate-y-1/2 text-md right-2 top-1/2" style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5)">Pleasant</div>
                <div class="absolute text-xl font-semibold text-white transform -translate-x-1/2 text-md top-2 left-1/2" style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5)">High Energy</div>
                <div class="absolute text-xl font-semibold text-white transform -translate-x-1/2 text-md bottom-2 left-1/2" style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5)">Low Energy</div>
            </div>
        </div>
    </div>
    <div class="p-3 mt-4 text-center">
        <Button label="Save mood" @click="saveMood" />
    </div>
</template>
