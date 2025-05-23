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
    return decimal > 0 ? Number(newValue.toFixed(decimal)) : Math.floor(newValue);
};

// 生成时间标签
export const generateTimeLabels = (count = 12) => {
    const now = new Date();
    const labels = [];
    for (let i = count - 1; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 1000); // Simulate data for every minute
        labels.push(time.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }));
    }
    return labels;
};


// Module-level static variables for generateMockData
let simHourGlobal = Math.floor(Math.random() * 24);
let simDayGlobal = 0;
let currentNdviGlobal = 0.1;
let currentSoilTempGlobal = 18 + getRandomValue(-2, 2, 1);
let lastIrrigationHourGlobal = -72; // So it can water soon after start
let dataPointTimeCounter = 0; // 新增：用于生成连续时间戳的计数器

export const generateMockData = (timeSeriesData, customDataSources = null) => {
    const now = new Date();
    const baseLoadFactor = getTimeBasedLoadFactor();

    const isInitialGeneration = timeSeriesData.length === 0;
    const pointsToGenerate = isInitialGeneration ? 12 : 1;

    let newTimeSeriesData = isInitialGeneration ? [] : [...timeSeriesData];

    // 初始化时间计数器
    if (isInitialGeneration) {
        dataPointTimeCounter = 0;
    }

    let prevData = newTimeSeriesData.length > 0 ? newTimeSeriesData[newTimeSeriesData.length - 1] : {
        // 系统数据默认值优化
        cpu: 35,           // 更合理的CPU使用率起始值
        memory: 45,        // 更合理的内存使用率起始值
        network: 30,       // 更合理的网络使用率起始值
        disk: 65,          // 更真实的磁盘使用率起始值
        user: 25,          // 更合理的用户数起始值
        load: 2.5,         // 更合理的系统负载起始值
        requests: 80,      // 更合理的请求数起始值
        response_time: 150, // 更好的响应时间起始值
        errors: 0.5,       // 更合理的错误率起始值
        queue: 3,          // 更合理的队列长度起始值

        // 农业数据默认值优化
        soil_moisture: 65,  // 更适合的土壤湿度起始值
        ndvi_index: currentNdviGlobal,
        air_temp: 22 + getRandomValue(-1, 1, 1), // 更合理的气温起始值
        air_humidity: 60,   // 更合理的空气湿度起始值
        light_intensity: (simHourGlobal >= 6 && simHourGlobal <= 18) ?
            getRandomValue(15000, 65000) : getRandomValue(0, 100), // 更真实的光照强度范围
        crop_health_map: 0,
        soil_temp: currentSoilTempGlobal,
    };

    for (let i = 0; i < pointsToGenerate; i++) {
        simHourGlobal++;
        if (simHourGlobal > 0 && simHourGlobal % 24 === 0) {
            simDayGlobal++;
        }
        const currentHourOfDay = simHourGlobal % 24;

        // 生成连续的时间戳
        let timeStamp;
        if (isInitialGeneration) {
            // 初始生成时，创建过去12分钟的数据点
            const timeOffset = (11 - i) * 60 * 1000; // 从12分钟前开始
            timeStamp = new Date(now.getTime() - timeOffset);
        } else {
            // 新数据点使用当前时间，每次递增较短时间间隔
            dataPointTimeCounter++;
            timeStamp = new Date(now.getTime() + dataPointTimeCounter * 10 * 1000); // 每10秒一个数据点，更平滑
        }

        // 1. 气温生成逻辑优化 - 使用平滑变化
        let newAirTemp;
        if (isInitialGeneration && i === 0) {
            // 初始生成时使用基准温度
            const baseAirT = 22;
            const amplitudeAirT = 6;
            newAirTemp = baseAirT + amplitudeAirT * Math.sin((currentHourOfDay - 8) * (Math.PI / 12));
            newAirTemp += getRandomValue(-1, 1, 1); // 增加初始随机波动
        } else {
            // 后续数据点使用平滑变化 - 增加波动幅度
            newAirTemp = getFluctuatedValue(prevData.air_temp, 0.8, 15, 32, 1); // 增加波动从0.3到0.8
        }
        newAirTemp = parseFloat(newAirTemp.toFixed(1));

        // 2. 光照强度生成逻辑优化 - 使用更明显的变化
        let newLightIntensity;
        if (currentHourOfDay >= 6 && currentHourOfDay <= 18) {
            if (isInitialGeneration && i === 0) {
                // 初始值基于时间计算
                const hoursSinceDawn = currentHourOfDay - 6;
                const dayLength = 12;
                const normalizedTime = hoursSinceDawn / dayLength;
                const lightCurve = Math.sin(Math.PI * normalizedTime);
                newLightIntensity = 60000 * lightCurve;
            } else {
                // 平滑变化，白天时逐渐变化 - 增加波动幅度
                const targetLux = 60000 * Math.sin(((currentHourOfDay - 6) / 12) * Math.PI);
                newLightIntensity = getFluctuatedValue(prevData.light_intensity, 5000, Math.max(0, targetLux - 8000), targetLux + 8000, 0); // 增加波动从2000到5000
            }
            newLightIntensity = Math.max(0, Math.round(newLightIntensity));
        } else {
            // 夜间逐渐降低到接近0 - 增加波动
            newLightIntensity = getFluctuatedValue(prevData.light_intensity || 50, 50, 0, 200, 0); // 增加夜间波动
        }

        // 3. 土壤温度生成逻辑优化 - 增加变化幅度
        const soilTempLag = 0.08; // 增加变化幅度，更明显
        currentSoilTempGlobal = parseFloat((newAirTemp * soilTempLag + currentSoilTempGlobal * (1 - soilTempLag) +
            getRandomValue(-0.3, 0.3, 1)).toFixed(1)); // 增加随机波动从0.1到0.3
        currentSoilTempGlobal = Math.max(8, Math.min(35, currentSoilTempGlobal)); // 扩大范围

        // 4. 土壤湿度生成逻辑优化 - 增加变化幅度
        let newSoilMoisture = prevData.soil_moisture;
        const hoursSinceLastIrrigation = simHourGlobal - lastIrrigationHourGlobal;

        // 改进的灌溉逻辑
        if ((hoursSinceLastIrrigation >= 72 && currentHourOfDay === 5) ||
            (newSoilMoisture < 30 && currentHourOfDay === 16)) {
            newSoilMoisture = getRandomValue(75, 90, 1); // 增加灌溉后的范围
            lastIrrigationHourGlobal = simHourGlobal;
        } else {
            // 更明显的蒸发模型 - 增加变化幅度
            const evaporationRate = (
                (newLightIntensity / 60000) * 0.15 + // 增加光照影响从0.1到0.15
                (Math.max(0, newAirTemp - 20) / 15) * 0.08 + // 增加温度影响从0.05到0.08
                (1 - (prevData.air_humidity || 60) / 100) * 0.08 + // 增加湿度影响从0.05到0.08
                getRandomValue(-0.02, 0.02, 2) // 添加随机因素
            );
            newSoilMoisture -= (getRandomValue(0.05, 0.15, 2) + evaporationRate); // 增加变化幅度从0.02-0.08到0.05-0.15
        }
        newSoilMoisture = parseFloat(Math.max(15, Math.min(95, newSoilMoisture)).toFixed(1)); // 扩大范围

        // 5. NDVI指数生成逻辑优化 - 增加变化幅度
        const ndviFactors = {
            moisture: Math.min(1, newSoilMoisture / 60),
            temperature: 1 - Math.abs(newAirTemp - 23) / 20,
            light: Math.min(1, newLightIntensity / 40000)
        };

        let ndviGrowthRate = 0;
        if (simDayGlobal < 30) {
            ndviGrowthRate = 0.003 * Math.min(ndviFactors.moisture, ndviFactors.temperature, ndviFactors.light); // 增加变化从0.001到0.003
        } else if (simDayGlobal < 90) {
            ndviGrowthRate = 0.006 * Math.min(ndviFactors.moisture, ndviFactors.temperature, ndviFactors.light); // 增加变化从0.003到0.006
        } else if (simDayGlobal < 150) {
            ndviGrowthRate = getRandomValue(-0.002, 0.002, 4) *
                Math.min(ndviFactors.moisture, ndviFactors.temperature, ndviFactors.light); // 增加变化从0.0005到0.002
        } else {
            ndviGrowthRate = -0.004 * (1 - Math.min(ndviFactors.moisture, ndviFactors.temperature, ndviFactors.light)); // 增加变化从0.002到0.004
        }

        currentNdviGlobal += ndviGrowthRate + getRandomValue(-0.001, 0.001, 4); // 添加随机因素
        currentNdviGlobal = parseFloat(Math.max(0.05, Math.min(0.98, currentNdviGlobal)).toFixed(3)); // 扩大范围并增加精度

        if (simDayGlobal >= 200) {
            simDayGlobal = 0;
            currentNdviGlobal = 0.1;
        }

        // 6. 作物健康图生成逻辑优化 - 更稳定
        let newCropHealth = prevData.crop_health_map || 0; // 使用前一个值作为基础
        const healthFactors = {
            ndvi: currentNdviGlobal < 0.3 ? 2 : currentNdviGlobal < 0.5 ? 1 : 0,
            moisture: newSoilMoisture < 30 ? 2 : newSoilMoisture < 45 ? 1 : 0,
            temp: (newAirTemp > 32 || newAirTemp < 15) ? 2 :
                (newAirTemp > 30 || newAirTemp < 18) ? 1 : 0
        };

        const maxHealthIssue = Math.max(healthFactors.ndvi, healthFactors.moisture, healthFactors.temp);
        const randomFactor = Math.random();

        // 只在有显著变化时才改变健康状态
        if (maxHealthIssue === 2 && randomFactor < 0.3) {
            newCropHealth = 2;
        } else if (maxHealthIssue === 1 && randomFactor < 0.2) {
            newCropHealth = 1;
        } else if (maxHealthIssue === 0 && randomFactor < 0.1) {
            newCropHealth = 0;
        }
        // 否则保持前一个状态

        // 7. 空气湿度生成逻辑优化 - 增加变化幅度
        let newAirHumidity;
        if (isInitialGeneration && i === 0) {
            // 初始值计算
            const baseAirHumidity = 65;
            const humidityFactors = {
                temp: (22 - newAirTemp) * 1.5, // 增加温度影响从1.2到1.5
                soilMoisture: (newSoilMoisture - 60) * 0.3, // 增加土壤湿度影响从0.2到0.3
                timeOfDay: Math.sin((currentHourOfDay - 4) * (Math.PI / 12)) * 12, // 增加时间影响从10到12
                season: Math.sin((simDayGlobal / 365) * 2 * Math.PI) * 8 // 增加季节影响从5到8
            };
            newAirHumidity = baseAirHumidity + humidityFactors.temp + humidityFactors.soilMoisture +
                humidityFactors.timeOfDay + humidityFactors.season + getRandomValue(-3, 3, 1); // 增加随机变化从-2,2到-3,3
        } else {
            // 使用平滑变化 - 增加波动幅度
            newAirHumidity = getFluctuatedValue(prevData.air_humidity, 2.5, 25, 95, 1); // 增加波动幅度从1.5到2.5，扩大范围
        }

        // 确保湿度在合理范围内 - 扩大范围
        const minHumidity = Math.max(25, 100 - newAirTemp * 2.2); // 降低最小值
        const maxHumidity = Math.min(95, 100 - newAirTemp * 0.3); // 提高最大值
        newAirHumidity = parseFloat(Math.max(minHumidity, Math.min(maxHumidity, newAirHumidity)).toFixed(1));

        // 8. 系统指标生成逻辑优化 - 增加变化幅度
        const systemLoad = baseLoadFactor * (1 + getRandomValue(-0.2, 0.2, 2)); // 增加波动从0.1到0.2
        const cpu = Math.max(15, Math.min(85, getFluctuatedValue(prevData.cpu, 4, 15, 85, 1) * systemLoad)); // 增加波动从2到4
        const memory = Math.max(25, Math.min(85, getFluctuatedValue(prevData.memory, 3, 25, 85, 1) * systemLoad)); // 增加波动从1.5到3
        const network = Math.max(10, Math.min(95, getFluctuatedValue(prevData.network, 6, 10, 95, 1) * systemLoad)); // 增加波动从3到6
        const disk = Math.max(40, Math.min(95, getFluctuatedValue(prevData.disk, 1.2, 40, 95, 1))); // 增加波动从0.5到1.2
        const user = Math.round(Math.max(15, getFluctuatedValue(prevData.user, 6, 15, 200) * systemLoad)); // 增加波动从3到6
        const load = parseFloat(Math.max(0.5, (getFluctuatedValue(prevData.load, 0.4, 0.5, 8, 2) * systemLoad)).toFixed(2)); // 增加波动从0.2到0.4
        const requests = Math.round(Math.max(40, getFluctuatedValue(prevData.requests, 20, 40, 400) * systemLoad)); // 增加波动从10到20
        const response_time = Math.round(Math.max(80, getFluctuatedValue(prevData.response_time, 30, 80, 600) * systemLoad)); // 增加波动从15到30
        const errors = parseFloat(Math.max(0, getFluctuatedValue(prevData.errors, 0.4, 0, 3, 1)).toFixed(1)); // 增加波动从0.2到0.4
        const queue = Math.round(Math.max(0, getFluctuatedValue(prevData.queue, 2, 0, 15) * systemLoad)); // 增加波动从1到2

        const dataPoint = {
            time: timeStamp,
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
            newTimeSeriesData.push(dataPoint);
            if (newTimeSeriesData.length > 60) {
                newTimeSeriesData = newTimeSeriesData.slice(-60);
            }
        }
        prevData = dataPoint;
    }

    if (customDataSources && customDataSources.length > 0) {
        const lastGeneratedPoint = newTimeSeriesData[newTimeSeriesData.length - 1];
        // For correlation, use values from the last generated point
        const { cpu: cpuValue, memory: memoryValue, requests: requestsValue, response_time: responseTimeValue } = lastGeneratedPoint;

        customDataSources.forEach(source => {
            if (!lastGeneratedPoint[source.key]) {
                if (source.category === '系统') {
                    if (source.unit === '%') {
                        const baseValue = getCorrelatedValue((cpuValue + memoryValue) / 2, 0.5, baseLoadFactor * 50, 20);
                        lastGeneratedPoint[source.key] = parseFloat(baseValue.toFixed(1));
                    } else if (source.unit === 'MB' || source.unit === 'GB') {
                        const baseValue = getCorrelatedValue(memoryValue, 0.6, 1000, 200);
                        lastGeneratedPoint[source.key] = Math.round(baseValue);
                    } else {
                        lastGeneratedPoint[source.key] = getRandomValue(10, 90, 1);
                    }
                } else if (source.category === '应用') {
                    if (source.key.includes('count') || source.key.includes('total')) {
                        const baseValue = getCorrelatedValue(requestsValue, 0.7, baseLoadFactor * 5000, 1000);
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
                    meta: {
                        value: { alias: 'CPU使用率 (%)' },
                        time: {
                            type: 'time',
                            mask: 'HH:mm:ss' // 时间格式化
                        }
                    }
                };
            case 'memory':
                return {
                    data: timeSeriesData.map(item => ({ time: item.time, value: item.memory })),
                    xField: 'time',
                    yField: 'value',
                    meta: {
                        value: { alias: '内存使用率 (%)' },
                        time: {
                            type: 'time',
                            mask: 'HH:mm:ss'
                        }
                    }
                };
            case 'network':
                return {
                    data: timeSeriesData.map(item => ({ time: item.time, value: item.network })),
                    xField: 'time',
                    yField: 'value',
                    meta: {
                        value: { alias: '网络使用率 (%)' },
                        time: {
                            type: 'time',
                            mask: 'HH:mm:ss'
                        }
                    }
                };
            case 'disk':
                return {
                    data: timeSeriesData.map(item => ({ time: item.time, value: item.disk })),
                    xField: 'time',
                    yField: 'value',
                    meta: {
                        value: { alias: '磁盘使用率 (%)' },
                        time: {
                            type: 'time',
                            mask: 'HH:mm:ss'
                        }
                    }
                };
            case 'user':
                return {
                    data: timeSeriesData.map(item => ({ time: item.time, value: item.user })),
                    xField: 'time',
                    yField: 'value',
                    meta: {
                        value: { alias: '用户会话数' },
                        time: {
                            type: 'time',
                            mask: 'HH:mm:ss'
                        }
                    }
                };
            case 'load':
                return {
                    data: timeSeriesData.map(item => ({ time: item.time, value: item.load })),
                    xField: 'time',
                    yField: 'value',
                    meta: {
                        value: { alias: '系统负载' },
                        time: {
                            type: 'time',
                            mask: 'HH:mm:ss'
                        }
                    }
                };
            case 'requests':
                return {
                    data: timeSeriesData.map(item => ({ time: item.time, value: item.requests })),
                    xField: 'time',
                    yField: 'value',
                    meta: {
                        value: { alias: '请求数' },
                        time: {
                            type: 'time',
                            mask: 'HH:mm:ss'
                        }
                    }
                };
            case 'response_time':
                return {
                    data: timeSeriesData.map(item => ({ time: item.time, value: item.response_time })),
                    xField: 'time',
                    yField: 'value',
                    meta: {
                        value: { alias: '响应时间 (ms)' },
                        time: {
                            type: 'time',
                            mask: 'HH:mm:ss'
                        }
                    }
                };
            case 'errors':
                return {
                    data: timeSeriesData.map(item => ({ time: item.time, value: item.errors })),
                    xField: 'time',
                    yField: 'value',
                    meta: {
                        value: { alias: '错误率 (%)' },
                        time: {
                            type: 'time',
                            mask: 'HH:mm:ss'
                        }
                    }
                };
            case 'queue':
                return {
                    data: timeSeriesData.map(item => ({ time: item.time, value: item.queue })),
                    xField: 'time',
                    yField: 'value',
                    meta: {
                        value: { alias: '队列长度' },
                        time: {
                            type: 'time',
                            mask: 'HH:mm:ss'
                        }
                    }
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
                    meta: {
                        time: {
                            type: 'time',
                            mask: 'HH:mm:ss'
                        }
                    }
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
                    meta: {
                        value: { alias: '土壤湿度 (%)' },
                        time: {
                            type: 'time',
                            mask: 'HH:mm:ss'
                        }
                    }
                };
            case 'ndvi_index':
                return {
                    data: timeSeriesData.map(item => ({ time: item.time, value: item.ndvi_index })),
                    xField: 'time',
                    yField: 'value',
                    meta: {
                        value: { alias: 'NDVI植被指数' },
                        time: {
                            type: 'time',
                            mask: 'HH:mm:ss'
                        }
                    }
                };
            case 'air_temp':
                return {
                    data: timeSeriesData.map(item => ({ time: item.time, value: item.air_temp })),
                    xField: 'time',
                    yField: 'value',
                    meta: {
                        value: { alias: '空气温度 (°C)' },
                        time: {
                            type: 'time',
                            mask: 'HH:mm:ss'
                        }
                    }
                };
            case 'air_humidity':
                return {
                    data: timeSeriesData.map(item => ({ time: item.time, value: item.air_humidity })),
                    xField: 'time',
                    yField: 'value',
                    meta: {
                        value: { alias: '空气湿度 (%)' },
                        time: {
                            type: 'time',
                            mask: 'HH:mm:ss'
                        }
                    }
                };
            case 'light_intensity':
                return {
                    data: timeSeriesData.map(item => ({ time: item.time, value: item.light_intensity })),
                    xField: 'time',
                    yField: 'value',
                    meta: {
                        value: { alias: '光照强度 (lux)' },
                        time: {
                            type: 'time',
                            mask: 'HH:mm:ss'
                        }
                    }
                };
            case 'soil_temp':
                return {
                    data: timeSeriesData.map(item => ({ time: item.time, value: item.soil_temp })),
                    xField: 'time',
                    yField: 'value',
                    meta: {
                        value: { alias: '土壤温度 (°C)' },
                        time: {
                            type: 'time',
                            mask: 'HH:mm:ss'
                        }
                    }
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
                        meta: {
                            value: { alias },
                            time: {
                                type: 'time',
                                mask: 'HH:mm:ss'
                            }
                        }
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
        animation: false, // 彻底禁用动画，避免闪烁
        interactions: [{ type: 'tooltip' }, { type: 'legend-filter' }],
        xAxis: {
            title: { text: '时间' },
            type: 'time',
            tickCount: 6,
            nice: false, // 关键：禁用坐标轴美化，保持原始时间流
            label: {
                autoRotate: true,
                formatter: (text) => {
                    if (text instanceof Date) {
                        return text.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
                    }
                    return text.toString().split(':').slice(0, 2).join(':');
                }
            }
        },
        yAxis: {
            grid: true,
            nice: true
        },
        slider: false,
        appendPadding: [10, 10, 10, 10],
        autoFit: true,
        // 关键配置：让图表支持实时数据流
        limitInPlot: true,  // 限制图表内容在绘图区域内
        connectNulls: true, // 连接空值点，保证线条连续
        // 添加实时滚动配置
        forceFit: true,     // 强制适应容器
        padding: 'auto',    // 自动内边距
        renderer: 'canvas', // 使用canvas渲染，性能更好
        // 添加性能优化配置
        pixelRatio: 1,      // 固定像素比，避免重绘
        supportCSSTransform: false, // 禁用CSS变换，减少重绘
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
            audio.src = 'data:audio/wav;base64,UklGRigBAABXQVZFZm10IBAAAAABAAEARKwAACJWAAABAAgAZGF0YQQBAAB5eHh4eXh2eXh4eHd3d3h5eHh3T3h5eXl5eHh4eHh5eXl4eHl5enh5eXl5nIuVjYp5eHh4eHh4TXl5eHl5eXl5eHh4eXl5eHg5eXh4eXl4eVY4eHl5eXl5eHh4eXl4eHh3eHh5eXl5eXl4eXl5eXh5eHl4eHl4eHl5eXl5eHd5eHh4d3Z5eHh5eHhmZlh5eHh4eXl5eHl5eXh3eHd4eHl5eXl5eXl5eXl4eHh3eHh5eHl5eXl5eXl4SHh5eHh4V3h5eXl4eHh3eXl5eHh4d3d5eXl5eXl5eXl5eXl5eXl5eHh4eHh5eXl4eHl5eXl5eXl4eHh5eXl5';
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

// 添加缺失的函数定义
const getTimeBasedLoadFactor = () => {
    const hour = new Date().getHours();
    // 根据时间返回负载因子，工作时间负载较高
    if (hour >= 9 && hour <= 18) {
        return 0.8 + Math.random() * 0.2; // 工作时间 0.8-1.0
    } else if ((hour >= 7 && hour < 9) || (hour > 18 && hour <= 22)) {
        return 0.4 + Math.random() * 0.4; // 过渡时间 0.4-0.8
    } else {
        return 0.1 + Math.random() * 0.3; // 夜间时间 0.1-0.4
    }
};

// 添加相关性数据生成函数
const getCorrelatedValue = (baseValue, correlation, scale = 100, offset = 0) => {
    const randomComponent = (1 - correlation) * (Math.random() * 2 - 1);
    const correlatedComponent = correlation * (baseValue / 100);
    return Math.max(0, (correlatedComponent + randomComponent) * scale + offset);
};