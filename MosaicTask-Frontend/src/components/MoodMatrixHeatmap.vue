<template>
    <div class="card">
        <div class="mb-4 text-xl font-semibold">Mood Matrix: Complexity vs. Priority</div>
        <div class="heatmap-wrapper">
            <div ref="heatmapContainer" class="w-full h-80"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useLayout } from '@/layout/composables/layout';
import { useJournalStore } from '@/stores/journal';
import * as d3 from 'd3';
import { onMounted, ref, watch } from 'vue';

const { isDarkTheme } = useLayout();
const journalStore = useJournalStore();
const heatmapContainer = ref(null);

onMounted(async () => {
    await journalStore.fetchHeatMap();
    createHeatmap();
});

function createHeatmap() {
    const data = journalStore.getHeatMapData;

    if (!heatmapContainer.value) {
        // console.error('Heatmap container is not available');
        return;
    }

    heatmapContainer.value.offsetHeight;

    const containerWidth = heatmapContainer.value.clientWidth || 300;
    const containerHeight = heatmapContainer.value.clientHeight || 300;

    d3.select(heatmapContainer.value).selectAll('*').remove();

    const margin = { top: 15, right: 160, bottom: 50, left: 80 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    //console.log('Calculated dimensions:', width, height);

    const svg = d3.select(heatmapContainer.value).append('svg').attr('width', containerWidth).attr('height', containerHeight).append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand().range([0, width]).domain(['Low', 'Medium', 'High']).padding(0.05);
    const y = d3.scaleBand().range([height, 0]).domain(['Easy', 'Medium', 'Hard']).padding(0.05);

    // X-axis
    svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x)).selectAll('text').style('font-size', '12px');

    // X-axis label
    svg.append('text')
        .attr('transform', `translate(${width / 2},${height + 40})`)
        .style('text-anchor', 'middle')
        .style('font-size', '14px')
        .text('Priority');

    // Y-axis
    svg.append('g').call(d3.axisLeft(y)).selectAll('text').style('font-size', '12px');

    // Y-axis label
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - height / 2)
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .style('font-size', '14px')
        .text('Complexity');

    svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x)).selectAll('text').style('font-size', '12px');

    svg.append('g').call(d3.axisLeft(y)).selectAll('text').style('font-size', '12px');

    const colorScale = d3.scaleLinear<number, string>().domain([-1, 0, 1]).range(['red', 'yellow', 'green']);
    const tooltip = d3
        .select(heatmapContainer.value)
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('background-color', 'white')
        .style('border', 'solid')
        .style('border-width', '1px')
        .style('border-radius', '5px')
        .style('padding', '10px');

    const mouseover = function (event, d) {
        tooltip.style('opacity', 1);
        d3.select(this).style('stroke', 'black').style('stroke-width', 2);
    };

    const mousemove = function (event, d) {
        tooltip
            .html(`Mood Index: ${d.mood_index.toFixed(2)}<br>Complexity: ${complexityLabel(d.complexity)}<br>Priority: ${priorityLabel(d.priority)}`)
            .style('left', event.pageX + 10 + 'px')
            .style('top', event.pageY - 10 + 'px');
    };

    const mouseleave = function (event, d) {
        tooltip.style('opacity', 0);
        d3.select(this).style('stroke', 'black').style('stroke-width', 1);
    };

    svg.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', (d) => x(priorityLabel(d.priority)))
        .attr('y', (d) => y(complexityLabel(d.complexity)))
        .attr('width', x.bandwidth())
        .attr('height', y.bandwidth())
        .style('fill', (d) => colorScale(d.mood_index))
        .style('stroke', 'black')
        .style('stroke-width', 1)
        .on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseleave', mouseleave);

    svg.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', (d) => x(priorityLabel(d.priority)))
        .attr('y', (d) => y(complexityLabel(d.complexity)))
        .attr('width', x.bandwidth())
        .attr('height', y.bandwidth())
        .style('fill', (d) => colorScale(d.mood_index))
        .style('stroke', 'black')
        .style('stroke-width', 1)
        .on('mouseover', function (event, d) {
            d3.select(this).style('stroke-width', 2);
            tooltip.transition().duration(200).style('opacity', 1);
            tooltip
                .html(`Mood Index: ${d.mood_index.toFixed(2)}<br>Complexity: ${complexityLabel(d.complexity)}<br>Priority: ${priorityLabel(d.priority)}`)
                .style('left', `${event.pageX + 10}px`)
                .style('top', `${event.pageY - 30}px`);
        })
        .on('mouseout', function () {
            d3.select(this).style('stroke-width', 1);
            tooltip.transition().duration(200).style('opacity', 0);
        });

    const legendData = [
        { color: 'red', text: 'Negative' },
        { color: 'yellow', text: 'Neutral' },
        { color: 'green', text: 'Positive' }
    ];

    const legend = svg
        .append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${width + 20}, 0)`);

    legend
        .selectAll('rect')
        .data(legendData)
        .enter()
        .append('rect')
        .attr('x', 0)
        .attr('y', (d, i) => i * 35)
        .attr('width', 24)
        .attr('height', 24)
        .style('fill', (d) => d.color);

    legend
        .selectAll('text')
        .data(legendData)
        .enter()
        .append('text')
        .attr('x', 30)
        .attr('y', (d, i) => i * 35 + 18)
        .style('font-size', '10px')
        .text((d) => d.text);

    function updateTextColor() {
        const textColor = isDarkTheme.value ? '#fff' : '#09090b';
        const backgroundColor = isDarkTheme.value ? '#333' : '#f4f4f4';

        svg.selectAll('text').style('fill', textColor);

        tooltip.style('color', textColor).style('background', backgroundColor);
    }

    updateTextColor();

    watch(isDarkTheme, () => {
        updateTextColor();
    });
}

watch(isDarkTheme, createHeatmap);

const priorityLabel = (priority) => {
    const labels = { 1: 'Low', 2: 'Medium', 3: 'High' };
    return labels[priority] || '';
};

const complexityLabel = (complexity) => {
    const labels = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };
    return labels[complexity] || '';
};
</script>

<style scoped>
.heatmap-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
}
</style>
