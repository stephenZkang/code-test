// Mock data generation
const provinces = [
    { name: '北京', value: 100 }, { name: '天津', value: 50 }, { name: '河北', value: 150 },
    { name: '山西', value: 80 }, { name: '内蒙古', value: 60 }, { name: '辽宁', value: 110 },
    { name: '吉林', value: 70 }, { name: '黑龙江', value: 90 }, { name: '上海', value: 200 },
    { name: '江苏', value: 300 }, { name: '浙江', value: 250 }, { name: '安徽', value: 180 },
    { name: '福建', value: 160 }, { name: '江西', value: 140 }, { name: '山东', value: 280 },
    { name: '河南', value: 260 }, { name: '湖北', value: 240 }, { name: '湖南', value: 230 },
    { name: '广东', value: 400 }, { name: '广西', value: 130 }, { name: '海南', value: 40 },
    { name: '重庆', value: 190 }, { name: '四川', value: 270 }, { name: '贵州', value: 120 },
    { name: '云南', value: 150 }, { name: '西藏', value: 20 }, { name: '陕西', value: 170 },
    { name: '甘肃', value: 100 }, { name: '青海', value: 30 }, { name: '宁夏', value: 40 },
    { name: '新疆', value: 80 }, { name: '香港', value: 50 }, { name: '澳门', value: 20 },
    { name: '台湾', value: 90 }
];

// Global chart instances
let mapChart, barChart, lineChart, pieChart, radarChart;

// Initialize all charts
async function initDashboard() {
    updateTime();
    setInterval(updateTime, 1000);

    // Load Map
    const response = await fetch('./data/china.json');
    const chinaGeoJSON = await response.json();
    echarts.registerMap('china', chinaGeoJSON);

    initMapChart();
    initBarChart();
    initLineChart();
    initPieChart();
    initRadarChart();

    window.addEventListener('resize', () => {
        [mapChart, barChart, lineChart, pieChart, radarChart].forEach(c => c.resize());
    });
}

function updateTime() {
    const now = new Date();
    document.getElementById('current-time').innerText = now.toLocaleString('zh-CN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
}

function initMapChart() {
    mapChart = echarts.init(document.getElementById('chart-map'), 'dark');
    const option = {
        backgroundColor: 'transparent',
        title: {
            text: '全国业务分布',
            left: 'center',
            top: 20,
            textStyle: { color: '#00d2ff', fontSize: 20 }
        },
        tooltip: { trigger: 'item', formatter: '{b}<br/>业务量: {c}' },
        visualMap: {
            min: 0,
            max: 500,
            left: 'left',
            top: 'bottom',
            text: ['高', '低'],
            calculable: true,
            inRange: { color: ['#1a233a', '#00d2ff'] }
        },
        series: [{
            name: '业务分布',
            type: 'map',
            map: 'china',
            roam: true,
            emphasis: {
                label: { show: true, color: '#fff' },
                itemStyle: { areaColor: '#f2d643' }
            },
            data: provinces
        }]
    };
    mapChart.setOption(option);

    // Linkage Event
    mapChart.on('click', function (params) {
        updateSurroundingCharts(params.name);
    });
}

function initBarChart() {
    barChart = echarts.init(document.getElementById('chart-bar'), 'dark');
    const option = {
        backgroundColor: 'transparent',
        title: { text: '重点区域统计', left: 'center', textStyle: { fontSize: 16 } },
        xAxis: { type: 'category', data: ['广东', '江苏', '山东', '浙江', '河南'] },
        yAxis: { type: 'value' },
        series: [{
            data: [400, 300, 280, 250, 260],
            type: 'bar',
            itemStyle: { color: '#00d2ff' }
        }]
    };
    barChart.setOption(option);
}

function initLineChart() {
    lineChart = echarts.init(document.getElementById('chart-line'), 'dark');
    const option = {
        backgroundColor: 'transparent',
        title: { text: '业务趋势分析', left: 'center', textStyle: { fontSize: 16 } },
        xAxis: { type: 'category', data: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'] },
        yAxis: { type: 'value' },
        series: [{
            data: [120, 200, 150, 80, 70, 110],
            type: 'line',
            smooth: true,
            areaStyle: { opacity: 0.3 },
            lineStyle: { color: '#f2d643' }
        }]
    };
    lineChart.setOption(option);
}

function initPieChart() {
    pieChart = echarts.init(document.getElementById('chart-pie'), 'dark');
    const option = {
        backgroundColor: 'transparent',
        title: { text: '渠道占比', left: 'center', textStyle: { fontSize: 16 } },
        tooltip: { trigger: 'item' },
        series: [{
            type: 'pie',
            radius: ['40%', '70%'],
            data: [
                { value: 1048, name: '移动端' },
                { value: 735, name: '网页端' },
                { value: 580, name: '桌面端' }
            ]
        }]
    };
    pieChart.setOption(option);
}

function initRadarChart() {
    radarChart = echarts.init(document.getElementById('chart-radar'), 'dark');
    const option = {
        backgroundColor: 'transparent',
        title: { text: '业务维度评估', left: 'center', textStyle: { fontSize: 16 } },
        radar: {
            indicator: [
                { name: '安全性', max: 100 },
                { name: '稳定性', max: 100 },
                { name: '响应速度', max: 100 },
                { name: '吞吐量', max: 100 },
                { name: '合规性', max: 100 }
            ]
        },
        series: [{
            type: 'radar',
            data: [{ value: [80, 90, 70, 85, 95], name: '当前状态' }]
        }]
    };
    radarChart.setOption(option);
}

// Update logic for linkage
function updateSurroundingCharts(regionName) {
    // Generate random mock data based on region
    const seed = regionName.length;
    
    // Update Bar
    barChart.setOption({
        title: { text: regionName + ' - 关键指标' },
        series: [{ data: provinces.slice(0, 5).map(p => Math.floor(Math.random() * 500)) }]
    });

    // Update Line
    lineChart.setOption({
        series: [{ data: Array.from({length: 6}, () => Math.floor(Math.random() * 300)) }]
    });

    // Update Radar
    radarChart.setOption({
        series: [{ data: [{ value: Array.from({length: 5}, () => 60 + Math.random() * 40), name: regionName }] }]
    });

    // Update Stats
    document.getElementById('stat-total').innerText = (50000 + Math.floor(Math.random() * 50000)).toLocaleString();
    document.getElementById('stat-users').innerText = (1000 + Math.floor(Math.random() * 2000)).toLocaleString();
}

initDashboard();
