"use strict";

const nonPartitonedEChartsOptions = {
    grid: {
        left: '3%',
        right: '7%',
        bottom: '7%',
        containLabel: true
    },
    toolbox: {
        feature: {
            dataZoom: {},
            brush: {
                type: ['rect', 'polygon', 'clear']
            }
        }
    },
    brush: {},
    xAxis: [
        {
            type: 'value',
            scale: true,
            splitLine: {
                show: false
            }
        }
    ],
    yAxis: [
        {
            type: 'value',
            scale: true,
            splitLine: {
                show: false
            }
        }
    ],
    series: [
        {
            type: 'scatter',
            data: null

        }
    ]
};

function getNonPartitonedEChartsOptions(global, dataX, dataY) {
    let data = dataX.map((e, i) => [e, dataY[i]]);
    let options = global.structuredClone(nonPartitonedEChartsOptions);
    options.series[0].data = data;
    let symbolSize = 2 + (1000 - Math.min(dataX.length, 1000)) * 0.008;
    options.series[0].symbolSize = symbolSize;
    return options;
}

const partitonedEChartsOptions = {
    grid: {
        left: '3%',
        right: '7%',
        bottom: '7%',
        containLabel: true
    },
    toolbox: {
        feature: {
            dataZoom: {},
            brush: {
                type: ['rect', 'polygon', 'clear']
            }
        }
    },
    brush: {},
    legend: {
        data: null,
        left: 'center',
        bottom: 0
    },
    xAxis: [
        {
            type: 'value',
            scale: true,
            splitLine: {
                show: false
            }
        }
    ],
    yAxis: [
        {
            type: 'value',
            scale: true,
            splitLine: {
                show: false
            }
        }
    ],
    series: [
    ]
};

const partitonedEChartsSerie = {
    name: null,
    type: 'scatter',
    emphasis: {
        focus: 'series'
    },
    data: null,
    markArea: {
        silent: true,
        itemStyle: {
            color: 'transparent',
            borderWidth: 1,
            borderType: 'dashed'
        },
        data: [
            [
                {
                    name: null,
                    xAxis: 'min',
                    yAxis: 'min'
                },
                {
                    xAxis: 'max',
                    yAxis: 'max'
                }
            ]
        ]
    }
};

function getPartitonedEChartsOptions(global, series) {
    let options = global.structuredClone(partitonedEChartsOptions);
    let maxLengthSeries = Math.max(...series.map(s => s.dataX.length));
    let symbolSize = 2 + (1000 - Math.min(maxLengthSeries, 1000)) * 0.008;
    options.series = series.map(s => {
        let serie = global.structuredClone(partitonedEChartsSerie);
        serie.name = s.name
        serie.data = s.dataX.map((e, i) => [e, s.dataY[i]]);
        serie.markArea.data[0][0].name = null, //`${s.name} Data Range`;
        serie.symbolSize = symbolSize;
        return serie;
    });
    options.legend.data = series.map(s => s.name);    
    return options;
}

export { getNonPartitonedEChartsOptions, getPartitonedEChartsOptions };
