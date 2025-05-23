// [WORKER_TOOL_NOTE] This is the ENTIRE desired content for dashboard-app/src/utils/helpers.js
import React from 'react';
import { notification } from 'antd';
import { WarningOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { dataSources, agriculturalAlertConditions } from './constants';

// ========== 数据生成相关函数 ==========

// 生成随机数
export const getRandomValue = (min, max, decimal = 0) => {
    const value = Math.random() * (max - min) + min;
    return decimal > 0 ? Number(value.toFixed(decimal)) : Math.floor(value);
};

// 生成随机波动值（基于前一个值）
export const getFluctuatedValue = (prevValue, maxFluctuation, min, max, decimal = 0) => {
    const fluctuation = (Math.random() * 2 - 1) * maxFluctuation;
    let newValue = prevValue + fluctuation;
    newValue = Math.max(min, Math.min(max, newValue));
    return decimal > 0 ? Number(newValue.toFixed(decimal)) : Math.floor(value);
};

// 生成时间标签
export const generateTimeLabels = (count = 12) => {
    const now = new Date();
    const labels = [];
    for (let i = count - 1; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 1000); // Simulate data for every minute
        labels.push(time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }));
    }
    return labels;
};


// Module-level static variables for generateMockData
let simHourGlobal = Math.floor(Math.random() * 24);
let simDayGlobal = 0;
let ndviStageGlobal = 0; // 0: initial, 1: rapid, 2: plateau, 3: decline
let currentNdviGlobal = 0.1;
let currentSoilTempGlobal = 18 + getRandomValue(-2, 2, 1);
let lastIrrigationHourGlobal = -72; // So it can water soon after start

export const generateMockData = (timeSeriesData, customDataSources = null) => {
    const timeLabels = generateTimeLabels(12);
    const baseLoadFactor = getTimeBasedLoadFactor(); // For system data

    const isInitialGeneration = timeSeriesData.length === 0;
    const pointsToGenerate = isInitialGeneration ? 12 : 1; // Generate 12 points initially, then 1 per update
    
    let newTimeSeriesData = isInitialGeneration ? [] : [...timeSeriesData];
    
    let prevData = newTimeSeriesData.length > 0 ? newTimeSeriesData[newTimeSeriesData.length - 1] : {
        // System data defaults
        cpu: 50, memory: 50, network: 50, disk: 50, user: 50, load: 5, requests: 150, response_time: 250, errors: 1, queue: 5,
        // Agri data defaults, using global static vars for continuity
        soil_moisture: 60, 
        ndvi_index: currentNdviGlobal,
        air_temp: 18 + getRandomValue(-2, 2, 1), 
        air_humidity: 65, 
        light_intensity: (simHourGlobal >= 6 && simHourGlobal <= 18) ? getRandomValue(10000, 50000) : getRandomValue(0,200),
        crop_health_map: 0,
        soil_temp: currentSoilTempGlobal,
    };

    for (let i = 0; i < pointsToGenerate; i++) {
        simHourGlobal++; // Increment global simulation hour
        if (simHourGlobal > 0 && simHourGlobal % 24 === 0) { // Ensure simHourGlobal has incremented before checking modulo
            simDayGlobal++; // Increment global simulation day every 24 simulation hours
        }
        const currentHourOfDay = simHourGlobal % 24;

        // 1. Air Temperature (Diurnal Cycle)
        const baseAirT = 18; 
        const amplitudeAirT = 8; 
        let newAirTemp = baseAirT + amplitudeAirT * Math.sin((currentHourOfDay - 8) * (Math.PI / 12)); // Peak at 2 PM (14:00)
        newAirTemp += getRandomValue(-1, 1, 1); 
        newAirTemp = parseFloat(newAirTemp.toFixed(1));
        newAirTemp = Math.max(5, Math.min(40, newAirTemp));

        // 2. Light Intensity (Diurnal Cycle)
        const maxLux = 70000;
        let newLightIntensity = 0;
        if (currentHourOfDay >= 6 && currentHourOfDay <= 18) { 
            newLightIntensity = maxLux * Math.sin((currentHourOfDay - 6) * (Math.PI / 12)); 
            newLightIntensity += getRandomValue(-5000, 5000);
            newLightIntensity = Math.max(0, Math.round(newLightIntensity));
        } else {
            newLightIntensity = getRandomValue(0, 200); 
        }
        
        currentSoilTempGlobal = parseFloat((newAirTemp * 0.2 + currentSoilTempGlobal * 0.8 + getRandomValue(-0.3, 0.3, 1)).toFixed(1));
        currentSoilTempGlobal = Math.max(5, Math.min(35, currentSoilTempGlobal));

        // 3. Soil Moisture (Evaporation & Irrigation)
        let newSoilMoisture = prevData.soil_moisture;
        if (simHourGlobal - lastIrrigationHourGlobal >= 72 && currentHourOfDay === 5) { 
            newSoilMoisture = getRandomValue(80, 90, 1);
            lastIrrigationHourGlobal = simHourGlobal;
        } else {
            const evaporationRate = (newLightIntensity / maxLux) * 0.4 + (Math.max(0, newAirTemp - 15) / 25) * 0.3;
            newSoilMoisture -= (getRandomValue(0.2, 0.4, 1) + evaporationRate);
        }
        newSoilMoisture = parseFloat(Math.max(15, Math.min(95, newSoilMoisture)).toFixed(1));
        
        // 4. NDVI (Growth Curve)
        if (simDayGlobal < 30) { 
            if(ndviStageGlobal !== 0) currentNdviGlobal = 0.1;
            ndviStageGlobal = 0; // Initial
            currentNdviGlobal += getRandomValue(0.002, 0.004, 3);
        } else if (simDayGlobal < 90) { 
            if(ndviStageGlobal === 0) currentNdviGlobal = Math.max(currentNdviGlobal, 0.2);
            ndviStageGlobal = 1; // Rapid growth
            currentNdviGlobal += getRandomValue(0.007, 0.012, 3);
        } else if (simDayGlobal < 150) { 
             if(ndviStageGlobal === 1) currentNdviGlobal = Math.max(currentNdviGlobal, 0.75);
            ndviStageGlobal = 2; // Plateau
            currentNdviGlobal += getRandomValue(-0.002, 0.002, 3);
        } else { 
            if(ndviStageGlobal === 2) currentNdviGlobal = Math.max(currentNdviGlobal, 0.5);
            ndviStageGlobal = 3; // Decline
            currentNdviGlobal -= getRandomValue(0.003, 0.007, 3);
            if (simDayGlobal >= 200) { 
                 simDayGlobal = 0; currentNdviGlobal = 0.1; ndviStageGlobal = 0; // Reset cycle
            }
        }
        currentNdviGlobal = parseFloat(Math.max(0.05, Math.min(0.92, currentNdviGlobal)).toFixed(2));

        // 5. Crop Health Map
        let newCropHealth = prevData.crop_health_map; 
        const randFactor = Math.random();
        if (currentNdviGlobal < 0.25 || newSoilMoisture < 20) { 
            newCropHealth = (randFactor < 0.5) ? 2 : 1; 
        } else if (currentNdviGlobal < 0.4 || newSoilMoisture < 35) { 
            newCropHealth = (randFactor < 0.2) ? 2 : (randFactor < 0.6) ? 1 : 0;
        } else { 
            newCropHealth = (randFactor < 0.1) ? 1 : 0; 
        }

        // 6. Air Humidity
        const baseAirHumidity = 60;
        const humidityTempInfluence = (baseAirT - newAirTemp) * 1.5; 
        let newAirHumidity = baseAirHumidity + humidityTempInfluence + getRandomValue(-5, 5, 1);
        newAirHumidity = parseFloat(Math.max(30, Math.min(98, newAirHumidity)).toFixed(1));

        const cpu = getFluctuatedValue(prevData.cpu, 5, 10, 90, 1);
        const memory = getFluctuatedValue(prevData.memory, 5, 20, 80, 1);
        const network = getFluctuatedValue(prevData.network, 10, 5, 100, 1);
        const disk = getFluctuatedValue(prevData.disk, 2, 30, 90, 1);
        const user = Math.round(getFluctuatedValue(prevData.user, 10, 20, 150));
        const load = parseFloat(getFluctuatedValue(prevData.load, 0.5, 0.1, 10, 2).toFixed(2));
        const requests = Math.round(getFluctuatedValue(prevData.requests, 20, 50, 300));
        const response_time = Math.round(getFluctuatedValue(prevData.response_time, 30, 50, 500));
        const errors = parseFloat(Math.max(0, getFluctuatedValue(prevData.errors, 0.5, 0, 5, 1)).toFixed(1));
        const queue = Math.round(Math.max(0, getFluctuatedValue(prevData.queue, 3, 0, 20)));

        const dataPoint = {
            time: isInitialGeneration ? timeLabels[i] : timeLabels[timeLabels.length -1],
            cpu, memory, network, disk, user, load, requests, response_time, errors, queue,
            air_temp: newAirTemp,
            light_intensity: newLightIntensity,
            soil_moisture: newSoilMoisture,
            ndvi_index: currentNdviGlobal,
            crop_health_map: newCropHealth,
            air_humidity: newAirHumidity,
            soil_temp: currentSoilTempGlobal,
        };

        if (isInitialGeneration) {
            newTimeSeriesData.push(dataPoint);
        } else {
            newTimeSeriesData = [...newTimeSeriesData.slice(1), dataPoint];
        }
        prevData = dataPoint; 
    }
    
    if (customDataSources && customDataSources.length > 0) {
        const lastGeneratedPoint = newTimeSeriesData[newTimeSeriesData.length -1];
        // For correlation, use values from the last generated point
        const {cpu: cpuValue, memory: memoryValue, requests: requestsValue, response_time: responseTimeValue} = lastGeneratedPoint; 

        customDataSources.forEach(source => {
            if (!lastGeneratedPoint[source.key]) { 
                if (source.category === '系统') {
                    if (source.unit === '%') {
                        const baseValue = getCorrelatedValue((cpuValue + memoryValue) / 2, 0.5, baseLoadFactor * 50, 20 );
                        lastGeneratedPoint[source.key] = parseFloat(baseValue.toFixed(1));
                    } else if (source.unit === 'MB' || source.unit === 'GB') {
                        const baseValue = getCorrelatedValue(memoryValue, 0.6, 1000, 200);
                        lastGeneratedPoint[source.key] = Math.round(baseValue);
                    } else {
                        lastGeneratedPoint[source.key] = getRandomValue(10, 90, 1);
                    }
                } else if (source.category === '应用') {
                    if (source.key.includes('count') || source.key.includes('total')) {
                        const baseValue = getCorrelatedValue(requestsValue,0.7,baseLoadFactor * 5000,1000);
                        lastGeneratedPoint[source.key] = Math.round(baseValue);
                    } else if (source.unit === 'ms') {
                        const baseValue = getCorrelatedValue(responseTimeValue, 0.6, responseTimeValue * 0.8, 50);
                        lastGeneratedPoint[source.key] = Math.round(baseValue);
                    } else if (source.unit === '%') {
                        lastGeneratedPoint[source.key] = getRandomValue(5, 95, 1);
                    } else {
                        lastGeneratedPoint[source.key] = getRandomValue(1, 100, 0);
                    }
                } else if (source.category === '业务') {
                    if (source.key.includes('revenue') || source.key.includes('sales')) {
                        const dailyFactor = baseLoadFactor * 0.5 + 0.5; 
                        lastGeneratedPoint[source.key] = Math.round(10000 * dailyFactor + getRandomValue(-2000, 2000, 0));
                    } else if (source.unit === '%') {
                        lastGeneratedPoint[source.key] = getRandomValue(1, 30, 1);
                    } else {
                        lastGeneratedPoint[source.key] = getRandomValue(100, 10000, 0);
                    }
                } else { // Default for other categories or if no specific logic
                    lastGeneratedPoint[source.key] = getRandomValue(1, 100, (source.unit === '%' || source.unit === '°C') ? 1 : 0);
                }
            }
        });
    }

    const newPieData = [
        { type: '数据库', value: getRandomValue(20, 40) },
        { type: '应用服务', value: getRandomValue(20, 35) },
        { type: '缓存', value: getRandomValue(10, 25) },
        { type: '前端', value: getRandomValue(5, 15) },
        { type: '其他', value: getRandomValue(1, 10) },
    ];

    return { newTimeSeriesData, newPieData };
};


export const getChartConfigByType = (type, dataKey, timeSeriesData, currentData, pieData) => {
    // 创建数据源特定的配置
    const getDataConfig = (dataKey, chartType) => {
        switch (dataKey) {
            case 'cpu':
                return {
                    data: timeSeriesData.map(item => ({ time: item.time, value: item.cpu })),
                    xField: 'time',
                    yField: 'value',
                    meta: { value: { alias: 'CPU使用率 (%)' } }
                };
            case 'memory':
                return {
                    data: timeSeriesData.map(item => ({ time: item.time, value: item.memory })),
                    xField: 'time',
                    yField: 'value',
                    meta: { value: { alias: '内存使用率 (%)' } }
                };
            case 'network':
                return {
                    data: timeSeriesData.map(item => ({ time: item.time, value: item.network })),
                    xField: 'time',
                    yField: 'value',
                    meta: { value: { alias: '网络使用率 (%)' } }
                };
            case 'disk':
                return {
                    data: timeSeriesData.map(item => ({ time: item.time, value: item.disk })),
                    xField: 'time',
                    yField: 'value',
                    meta: { value: { alias: '磁盘使用率 (%)' } }
                };
            case 'user':
                return {
                    data: timeSeriesData.map(item => ({ time: item.time, value: item.user })),
                    xField: 'time',
                    yField: 'value',
                    meta: { value: { alias: '用户会话数' } }
                };
            case 'load':
                return {
                    data: timeSeriesData.map(item => ({ time: item.time, value: item.load })),
                    xField: 'time',
                    yField: 'value',
                    meta: { value: { alias: '系统负载' } }
                };
            case 'requests':
                return {
                    data: timeSeriesData.map(item => ({ time: item.time, value: item.requests })),
                    xField: 'time',
                    yField: 'value',
                    meta: { value: { alias: '请求数' } }
                };
            case 'response_time':
                return {
                    data: timeSeriesData.map(item => ({ time: item.time, value: item.response_time })),
                    xField: 'time',
                    yField: 'value',
                    meta: { value: { alias: '响应时间 (ms)' } }
                };
            case 'errors':
                return {
                    data: timeSeriesData.map(item => ({ time: item.time, value: item.errors })),
                    xField: 'time',
                    yField: 'value',
                    meta: { value: { alias: '错误率 (%)' } }
                };
            case 'queue':
                return {
                    data: timeSeriesData.map(item => ({ time: item.time, value: item.queue })),
                    xField: 'time',
                    yField: 'value',
                    meta: { value: { alias: '队列长度' } }
                };
            case 'all': // Example for multi-line chart showing system overview
                 return {
                    data: timeSeriesData.flatMap(item => ([
                        { time: item.time, value: item.cpu, category: 'CPU' },
                        { time: item.time, value: item.memory, category: '内存' },
                        // Add other relevant system metrics if desired
                    ])),
                    xField: 'time',
                    yField: 'value',
                    seriesField: 'category', // Key for differentiating lines
                    // ... other multi-line chart configs
                 };
            case 'resource': // Example for pie chart
                return {
                    data: pieData, // pieData should be structured as [{type: 'db', value: 20}, ...]
                    angleField: 'value',
                    colorField: 'type',
                    // ... other pie chart configs
                };
            // Add cases for new agricultural data keys if they need specific configurations
            case 'soil_moisture':
                return {
                    data: timeSeriesData.map(item => ({ time: item.time, value: item.soil_moisture })),
                    xField: 'time',
                    yField: 'value',
                    meta: { value: { alias: '土壤湿度 (%)' } }
                };
            case 'ndvi_index':
                return {
                    data: timeSeriesData.map(item => ({ time: item.time, value: item.ndvi_index })),
                    xField: 'time',
                    yField: 'value',
                    meta: { value: { alias: 'NDVI植被指数' } }
                };
            case 'air_temp':
                return {
                    data: timeSeriesData.map(item => ({ time: item.time, value: item.air_temp })),
                    xField: 'time',
                    yField: 'value',
                    meta: { value: { alias: '空气温度 (°C)' } }
                };
             case 'air_humidity':
                return {
                    data: timeSeriesData.map(item => ({ time: item.time, value: item.air_humidity})),
                    xField: 'time',
                    yField: 'value',
                    meta: { value: { alias: '空气湿度 (%)' } }
                };
            case 'light_intensity':
                return {
                    data: timeSeriesData.map(item => ({ time: item.time, value: item.light_intensity})),
                    xField: 'time',
                    yField: 'value',
                    meta: { value: { alias: '光照强度 (lux)' } }
                };
            case 'soil_temp':
                return {
                    data: timeSeriesData.map(item => ({ time: item.time, value: item.soil_temp})),
                    xField: 'time',
                    yField: 'value',
                    meta: { value: { alias: '土壤温度 (°C)' } }
                };
            // crop_health_map might not be directly plottable as a simple series
            // It might be used to color-code map markers or display status text,
            // so it might not need a config here, or a very different one.
            default:
                // Fallback for any other dataKey, including custom ones
                if (timeSeriesData.length > 0 && timeSeriesData[0][dataKey] !== undefined) {
                    const dataSourceInfo = dataSources.find(ds => ds.key === dataKey);
                    const alias = dataSourceInfo ? `${dataSourceInfo.name} ${dataSourceInfo.unit ? `(${dataSourceInfo.unit})` : ''}` : `${dataKey} 值`;
                    return {
                        data: timeSeriesData.map(item => ({ time: item.time, value: item[dataKey] })),
                        xField: 'time',
                        yField: 'value',
                        meta: { value: { alias } }
                    };
                }
                return { // Default empty config if dataKey not found
                    data: [],
                    xField: 'time',
                    yField: 'value'
                };
        }
    };

    // Base configurations for chart types, can be extended or customized
    const commonLineAreaConfig = {
        smooth: true,
        animation: { appear: { animation: 'path-in', duration: 1000 } },
        interactions: [{ type: 'tooltip' }, { type: 'legend-filter' }],
        xAxis: { title: { text: '时间' }},
    };
    
    const commonGaugeConfig = (dataKey, currentData) => {
        const ds = dataSources.find(d => d.key === dataKey) || {};
        const unit = ds.unit || '';
        const name = ds.name || dataKey;
        let percentValue = currentData[dataKey];
        // If unit is '%', divide by 100 for gauge's 0-1 scale. Otherwise, determine scale.
        // This needs careful handling based on expected data ranges for non-% gauges.
        // For simplicity, if not %, assume it's on a scale where max is e.g. 50 for temp, 100 for humidity if not already %.
        if (unit === '%') {
            percentValue = (currentData[dataKey] || 0) / 100;
        } else if (dataKey === 'air_temp' || dataKey === 'soil_temp') { // Example: temp scale 0-50
            percentValue = (currentData[dataKey] || 0) / 50;
        } else { // Default to 0-100 scale if not % and no specific handling
             percentValue = (currentData[dataKey] || 0) / 100;
        }
        percentValue = Math.max(0, Math.min(1, percentValue)); // Clamp to 0-1

        return {
            percent: percentValue,
            range: { color: 'l(0) 0:#6495ED 0.5:#87CEFA 1:#1890FF' },
            indicator: { pointer: { style: { stroke: '#D0D0D0' } }, pin: { style: { stroke: '#D0D0D0' } } },
            statistic: {
                title: { 
                    formatter: () => name, 
                    style: { fontSize: '16px', lineHeight: 1 } 
                },
                content: { 
                    formatter: () => `${currentData[dataKey] || 0}${unit}`, 
                    style: { fontSize: '24px', lineHeight: 1 } 
                },
            },
        };
    };


    switch (type) {
        case 'line':
        case 'area':
        case 'column': // Column can share some configs with line/area
            return { ...commonLineAreaConfig, ...getDataConfig(dataKey, type) };
        case 'pie':
             return { ...getDataConfig(dataKey, type), interactions: [{ type: 'element-active' }] }; // dataKey often 'resource' for pie
        case 'gauge':
            return commonGaugeConfig(dataKey, currentData);
        // Add other chart types if needed
        default:
            return getDataConfig(dataKey, type); // Fallback to basic data config
    }
};


// ========== 警报相关函数 ==========

// 获取数据单位
export const getUnitForDataKey = (dataKey) => {
    const dataSource = dataSources.find(ds => ds.key === dataKey);
    return dataSource ? dataSource.unit : '';
};

// 播放告警声音
export const playAlertSound = (severity) => {
    const audio = new Audio();

    switch (severity) {
        case 'critical':
            audio.src = 'data:audio/wav;base64,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';
            break;
        case 'warning':
            audio.src = 'data:audio/wav;base64,UklGRigBAABXQVZFZm10IBAAAAABAAEAESsAACJWAAABAAgAZGF0YQQBAAB5eHh4eXh2eXh4eHd3d3h5eHh3T3h5eXl5eHh4eHh5eXl4eHl5enh5eXl5nIuVjYp5eHh4eHh4TXl5eHl5eXl5eHh4eXl5eHg5eXh4eXl4eVY4eHl5eXl5eHh4eXl4eHh3eHh5eXl5eXl4eXl5eXh5eHl4eHl4eHl5eXl5eHd5eHh4d3Z5eHh5eHhmZlh5eHh4eXl5eHl5eXh3eHd4eHl5eXl5eXl5eXl4eHh3eHh5eHl5eXl5eXl4SHh5eHh4V3h5eXl4eHh3eXl5eHh4d3d5eXl5eXl5eXl5eXl5eXl5eHh4eHh5eXl4eHl5eXl5eXl4eHh5eXl5';
            break;
        case 'info':
            audio.src = 'data:audio/wav;base64,UklGRigBAABXQVZFZm10IBAAAAABAAEARKwAACJWAAABAAgAZGF0YQQBAACBhYqFbF1fdH2Sop+Yj4FpVExFS1Vih5uuvaujlnhcQ0M3JRUM/vXo3ubTeWJXVVBRWmpvdGRXKi1qrDJ6CK3d1PX7u157R/+icluUc5RplGaEV4pJdkVvzb3CqNDa4cvZx6yyrcDQwrC+pdHdcbdRrz6RMnU8e0ZEPdpQgTbMLV3sZ2un9rP0M/T/8/7W63TvuOS02J/HtA==';
            break;
        default:
            return; // 不播放声音
    }

    audio.play().catch(e => {
        console.log('播放声音失败:', e);
    });
};

// 检查警报
export const checkAlerts = (panels, newData, activeAlerts) => {
    // 新的活跃警报列表
    let newActiveAlerts = [...activeAlerts];

    // 检查每个面板的告警设置
    panels.forEach(panel => {
        if (!panel.alerts || panel.alerts.length === 0) return;

        const currentValue = newData[panel.dataKey];
        if (currentValue === undefined) return;

        panel.alerts.forEach(alert => {
            if (!alert.enabled) return;

            const alertId = `${panel.id}-${alert.id}`; // alert.id is the one generated in AlertSettingsModal
            let isActive = false;
            // let comparisonText = `阈值 ${alert.threshold}`; // Not directly used in notifications anymore

            const condition = agriculturalAlertConditions.find(c => c.key === alert.conditionKey);

            if (condition) {
                // comparisonText = `${condition.name} ${alert.threshold} ${condition.unit || getUnitForDataKey(panel.dataKey) || ''}`;
                switch (condition.comparison) {
                    case 'above':
                        isActive = currentValue > alert.threshold;
                        break;
                    case 'below':
                        isActive = currentValue < alert.threshold;
                        break;
                    case 'equal':
                        // eslint-disable-next-line
                        isActive = currentValue == alert.threshold; 
                        break;
                    default:
                        isActive = currentValue > alert.threshold; // Default for unknown conditions
                }
            } else if (alert.conditionKey === 'above_threshold') { 
                isActive = currentValue > alert.threshold;
            } else if (alert.conditionKey === 'below_threshold') { 
                isActive = currentValue < alert.threshold;
            } else {
                 isActive = currentValue >= alert.threshold; 
            }

            const existingAlertIndex = newActiveAlerts.findIndex(a => a.id === alertId);

            if (isActive && existingAlertIndex === -1) {
                const newAlert = {
                    id: alertId,
                    panelId: panel.id,
                    panelTitle: panel.title,
                    dataKey: panel.dataKey,
                    value: currentValue,
                    threshold: alert.threshold,
                    type: alert.type, 
                    conditionKey: alert.conditionKey, 
                    conditionName: condition ? condition.name : (alert.conditionKey === 'above_threshold' ? '高于阈值' : alert.conditionKey === 'below_threshold' ? '低于阈值' : '超过阈值'),
                    time: new Date()
                };
                newActiveAlerts.push(newAlert);

                notification.open({
                    message: `${alert.type === 'critical' ? '严重警报' : alert.type === 'warning' ? '警告' : '信息'}：${panel.title}`,
                    description: `当前值 ${currentValue} ${getUnitForDataKey(panel.dataKey) || ''}. 条件: ${newAlert.conditionName} (${alert.threshold} ${condition ? condition.unit || getUnitForDataKey(panel.dataKey) || '' : getUnitForDataKey(panel.dataKey) || ''}).`,
                    icon: alert.type === 'critical' ? <WarningOutlined style={{ color: '#f5222d' }} /> : 
                          alert.type === 'warning' ? <WarningOutlined style={{ color: '#faad14' }} /> :
                          <InfoCircleOutlined style={{ color: '#1890ff' }} />, 
                    duration: 4.5,
                });
                playAlertSound(alert.type);

            } else if (!isActive && existingAlertIndex !== -1) {
                const recoveredAlert = newActiveAlerts[existingAlertIndex];
                newActiveAlerts.splice(existingAlertIndex, 1);

                notification.open({
                    message: `警报已恢复：${panel.title}`,
                    description: `当前值 ${currentValue} ${getUnitForDataKey(panel.dataKey) || ''}. 条件: ${recoveredAlert.conditionName} (${recoveredAlert.threshold} ${condition ? condition.unit || getUnitForDataKey(panel.dataKey) || '' : getUnitForDataKey(panel.dataKey) || ''}) 已恢复正常.`,
                    icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                    duration: 3,
                });
            }
        });
    });

    return newActiveAlerts;
};

// ========== 图表相关函数 ==========

// 获取面板统计颜色
export const getPanelColor = (dataKey, value) => {
    if (dataKey === 'cpu' || dataKey === 'memory' || dataKey === 'disk') {
        if (value > 90) return '#cf1322'; 
        if (value > 70) return '#faad14'; 
        return '#3f8600'; 
    }
    if (dataKey === 'errors') {
        if (value > 10) return '#cf1322'; 
        if (value > 5) return '#faad14'; 
        return '#3f8600'; 
    }
    // Add color logic for agricultural data if needed
    if (dataKey === 'soil_moisture') {
        if (value < 20 || value > 85) return '#faad14'; // Warning for too dry or too wet
    }
    if (dataKey === 'air_temp' || dataKey === 'soil_temp') {
        if (value < 10 || value > 35) return '#faad14'; // Warning for extreme temps
    }
    if (dataKey === 'ndvi_index' && value < 0.3) return '#faad14';

    return undefined; 
};

// 获取当前面板数据值
export const getPanelCurrentValue = (dataKey, currentData) => {
    if (!currentData || !Object.keys(currentData).length) return '-';
    // This function should now correctly return values for new agricultural keys as well
    // as they are part of the currentData object structure.
    return currentData[dataKey] !== undefined ? currentData[dataKey] : '-';
};

// 从API获取数据 (模拟)
export const fetchDataFromAPI = async (sourceId, dataConnections) => {
    if (sourceId === 'api3') {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    data: { /* Mock data if needed, but generateMockData is primary */ }
                });
            }, 500);
        });
    } else {
        try {
            const connection = dataConnections.find(conn => conn.id === sourceId);
            if (!connection) throw new Error('数据源不存在');
            // Actual API fetch logic would go here
            return { success: true, data: {} };
        } catch (error) {
            console.error('Failed to fetch data:', error);
            return { success: false, error: error.message };
        }
    }
};

// ========== 时间相关函数 ==========

// 解析刷新率字符串为毫秒数
export const parseRefreshRate = (refreshRate) => {
    if (refreshRate === 'off') return null;
    const value = parseInt(refreshRate);
    if (refreshRate.includes('s')) return value * 1000;
    if (refreshRate.includes('m')) return value * 60 * 1000;
    return 60000; 
};

// 格式化毫秒为人类可读形式
export const formatTimeRemaining = (milliseconds) => {
    if (milliseconds < 1000) return '< 1秒';
    if (milliseconds < 60000) return `${Math.round(milliseconds / 1000)}秒`;
    return `${Math.round(milliseconds / 60000)}分钟`;
};