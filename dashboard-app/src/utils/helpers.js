import React from 'react';
import { notification } from 'antd';
import { WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { dataSources } from './constants';

// ========== 数据生成相关函数 ==========

// 生成随机数
export const getRandomValue = (min, max, decimal = 0) => {
    const value = Math.random() * (max - min) + min;
    return decimal > 0 ? Number(value.toFixed(decimal)) : Math.floor(value);
};

// 生成随机波动值（基于前一个值）
export const getFluctuatedValue = (prevValue, maxFluctuation, min, max, decimal = 0) => {
    // 生成波动幅度
    const fluctuation = (Math.random() * 2 - 1) * maxFluctuation;
    // 计算新值并确保在合理范围内
    let newValue = prevValue + fluctuation;
    newValue = Math.max(min, Math.min(max, newValue));
    // 格式化小数
    return decimal > 0 ? Number(newValue.toFixed(decimal)) : Math.floor(newValue);
};

// 生成时间标签
export const generateTimeLabels = (count = 12) => {
    const now = new Date();
    const labels = [];

    for (let i = count - 1; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 1000);
        labels.push(time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }));
    }

    return labels;
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
            case 'all':
                return {
                    data: timeSeriesData.flatMap(item => ([
                        { time: item.time, value: item.cpu, category: 'CPU' },
                        { time: item.time, value: item.memory, category: '内存' },
                        { time: item.time, value: item.network, category: '网络' }
                    ])),
                    xField: 'time',
                    yField: 'value',
                    seriesField: 'category',
                    yAxis: {
                        title: {
                            text: '使用率 (%)',
                        },
                    },
                    legend: {
                        position: 'top',
                    },
                    smooth: true,
                    animation: {
                        appear: {
                            animation: 'path-in',
                            duration: 1000,
                        },
                    },
                };
            case 'resource':
                return {
                    data: pieData,
                    angleField: 'value',
                    colorField: 'type',
                    radius: 0.8,
                    label: {
                        type: 'spider',
                        labelHeight: 28,
                        content: '{name}\n{percentage}',
                    },
                    interactions: [{ type: 'element-active' }],
                };
            default:
                // 检查是否是自定义数据源
                if (timeSeriesData.length > 0 && timeSeriesData[0][dataKey] !== undefined) {
                    return {
                        data: timeSeriesData.map(item => ({ time: item.time, value: item[dataKey] })),
                        xField: 'time',
                        yField: 'value',
                        meta: { value: { alias: `${dataKey} 值` } }
                    };
                }

                // 默认配置
                return chartType === 'pie' ? {
                    data: pieData,
                    angleField: 'value',
                    colorField: 'type',
                    radius: 0.8,
                    label: {
                        type: 'spider',
                        labelHeight: 28,
                        content: '{name}\n{percentage}',
                    },
                    interactions: [{ type: 'element-active' }],
                } : {
                    data: timeSeriesData.map(item => ({ time: item.time, value: item[dataKey] || 0 })),
                    xField: 'time',
                    yField: 'value'
                };
        }
    };

    // 各类型图表的基础配置
    const gaugeConfig = {
        percent: (currentData[dataKey] || 0) / 100,
        range: {
            color: 'l(0) 0:#6495ED 0.5:#87CEFA 1:#1890FF',
        },
        indicator: {
            pointer: {
                style: {
                    stroke: '#D0D0D0',
                },
            },
            pin: {
                style: {
                    stroke: '#D0D0D0',
                },
            },
        },
        statistic: {
            title: {
                formatter: () => dataKey.toUpperCase(),
                style: ({
                    fontSize: '16px',
                    lineHeight: 1,
                }),
            },
            content: {
                formatter: () => `${currentData[dataKey] || 0}%`,
                style: ({
                    fontSize: '24px',
                    lineHeight: 1,
                }),
            },
        },
    };

    const radarConfig = {
        data: [
            { name: 'CPU', value: currentData.cpu || 0 },
            { name: '内存', value: currentData.memory || 0 },
            { name: '磁盘', value: currentData.disk || 0 },
            { name: '网络', value: currentData.network || 0 },
            { name: '请求数', value: (currentData.requests || 0) / 5 },
            { name: '响应时间', value: (currentData.response_time || 0) / 10 },
        ],
        xField: 'name',
        yField: 'value',
        meta: {
            value: {
                min: 0,
                max: 100,
            },
        },
        area: {},
        point: {},
        legend: false,
    };

    const ringConfig = {
        percent: (currentData[dataKey] || 0) / 100,
        statistic: {
            title: {
                style: {
                    fontSize: '16px',
                    lineHeight: 1,
                },
                formatter: () => {
                    const dataSource = dataSources.find(ds => ds.key === dataKey);
                    return dataSource ? dataSource.name : dataKey;
                },
            },
            content: {
                style: {
                    fontSize: '24px',
                    lineHeight: 1,
                },
                formatter: ({ percent }) => `${(percent * 100).toFixed(1)}%`,
            },
        },
    };

    const funnelConfig = {
        data: [
            { stage: '总请求', value: currentData.requests || 0 },
            { stage: '处理中', value: (currentData.requests || 0) * 0.8 },
            { stage: '已完成', value: (currentData.requests || 0) * 0.6 },
            { stage: '成功', value: (currentData.requests || 0) * 0.5 },
        ],
        xField: 'stage',
        yField: 'value',
        legend: false,
    };

    // 热力图数据
    const heatmapData = [];
    for (let i = 0; i < 24; i++) {
        for (let j = 0; j < 7; j++) {
            heatmapData.push({
                hour: String(i).padStart(2, '0') + ':00',
                day: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][j],
                value: Math.floor(Math.random() * 90 + 10), // 随机值，范围10-100
            });
        }
    }

    const heatmapConfig = {
        data: heatmapData,
        xField: 'hour',
        yField: 'day',
        colorField: 'value',
        color: ['#174c83', '#7eb6d4', '#efefeb', '#efa759', '#9b4d16'],
        meta: {
            hour: {
                type: 'cat',
            },
            day: {
                type: 'cat',
            },
        },
    };

    const waterfallConfig = {
        data: [
            { type: '上月结余', value: 1000 },
            { type: '收入', value: 5000 },
            { type: '支出', value: -2000 },
            { type: '本月结余', value: 4000 },
        ],
        xField: 'type',
        yField: 'value',
        color: ({ type }) => {
            if (type === '总计' || type === '上月结余' || type === '本月结余') {
                return '#1890ff';
            }
            return type.includes('支出') ? '#ff4d4f' : '#73d13d';
        },
    };

    // 根据图表类型返回适当的配置
    switch (type) {
        case 'gauge':
            return gaugeConfig;
        case 'radar':
            return radarConfig;
        case 'ring':
            return ringConfig;
        case 'funnel':
            return funnelConfig;
        case 'heatmap':
            return heatmapConfig;
        case 'waterfall':
            return waterfallConfig;
        default:
            return getDataConfig(dataKey, type);
    }
};

// 获取基于时间的负载因子
// 模拟工作时间负载较高，夜间负载较低的常见模式
export const getTimeBasedLoadFactor = () => {
    const now = new Date();
    const hour = now.getHours();

    // 工作时间 (9:00 - 18:00) 负载较高
    if (hour >= 9 && hour < 18) {
        return 0.7 + (Math.random() * 0.3); // 70%-100% 基础负载
    }
    // 晚间活跃时间 (18:00 - 22:00) 中等负载
    else if (hour >= 18 && hour < 22) {
        return 0.4 + (Math.random() * 0.3); // 40%-70% 基础负载
    }
    // 深夜/凌晨 (22:00 - 6:00) 低负载
    else if (hour >= 22 || hour < 6) {
        return 0.1 + (Math.random() * 0.2); // 10%-30% 基础负载
    }
    // 早晨 (6:00 - 9:00) 逐渐增加的负载
    else {
        // 计算从6点到9点负载的线性增长
        const minutesSince6am = (hour - 6) * 60 + now.getMinutes();
        const loadFactor = 0.2 + (minutesSince6am / 180) * 0.5; // 20% 到 70% 逐渐增加
        return loadFactor + (Math.random() * 0.1); // 添加一些随机波动
    }
};

// 添加突发事件（偶尔会有的流量/负载突增）
export const addSpikeEvent = (baseValue, maxMultiplier = 3, probability = 0.05) => {
    // 有一定概率出现突发事件
    if (Math.random() < probability) {
        // 突发倍数，比如CPU突然飙升至2-3倍
        const spikeMultiplier = 1 + Math.random() * (maxMultiplier - 1);
        return Math.min(baseValue * spikeMultiplier, 100); // 确保不超过100%
    }
    return baseValue;
};

// 指标相关性
// 例如当CPU上升时，Memory和Load通常也会上升
export const getCorrelatedValue = (sourceValue, correlation = 0.7, baseValue = 50, maxDeviation = 20) => {
    // sourceValue 是源指标的值，correlation是相关度(0-1)
    // baseValue是基础值，maxDeviation是最大偏差

    // 计算相关部分（与源指标相关）
    const correlatedPart = (sourceValue - 50) * correlation;

    // 计算随机部分（引入一些独立的随机性）
    const randomPart = (Math.random() * 2 - 1) * maxDeviation * (1 - correlation);

    // 合并得到最终值
    let finalValue = baseValue + correlatedPart + randomPart;

    // 确保在有效范围内(0-100)
    finalValue = Math.max(0, Math.min(100, finalValue));

    return finalValue;
};

// 添加小的趋势变化
// 模拟系统随时间变化的趋势，如内存缓慢增长直到重启
export const addTrend = (value, trendFactor, min, max) => {
    // trendFactor为正表示上升趋势，为负表示下降趋势
    let newValue = value + trendFactor;

    // 确保在有效范围内
    newValue = Math.max(min, Math.min(max, newValue));

    return newValue;
};

// 生成更真实的模拟数据
export const generateMockData = (timeSeriesData, customDataSources = null) => {
    // 生成时间标签
    const timeLabels = generateTimeLabels(12);

    // 系统负载基准因子 (基于时间)
    const baseLoadFactor = getTimeBasedLoadFactor();

    // 各指标的趋势因子 (模拟长期趋势)
    const trends = {
        cpu: 0, // CPU无明显长期趋势
        memory: 0.2, // 内存有轻微上升趋势(内存泄漏)
        disk: 0.1, // 磁盘使用率缓慢增长
        network: 0, // 网络无明显趋势
        load: 0 // 系统负载无明显趋势
    };

    // 生成新的时间序列数据或更新现有数据
    let newTimeSeriesData;

    if (timeSeriesData.length === 0) {
        // 第一次初始化：生成所有数据点
        // 首先为核心指标生成基准值
        const baseCpu = 20 + baseLoadFactor * 30; // 基准CPU使用率
        const baseMemory = 30 + baseLoadFactor * 20; // 基准内存使用率
        const baseNetwork = 15 + baseLoadFactor * 40; // 基准网络使用率

        newTimeSeriesData = timeLabels.map((time, index) => {
            // 为每个时间点添加趋势因子，但使第一个点不受影响
            const trendMultiplier = index / 10; // 趋势随时间逐渐增强

            // 创建核心指标，使用时间和前面指标的相关性
            const cpuValue = addSpikeEvent(
                baseCpu + getRandomValue(-10, 10, 1) + (trends.cpu * trendMultiplier),
                2.5, 0.03
            );

            const memoryValue = getCorrelatedValue(
                cpuValue, 0.3, // 与CPU有30%相关性
                baseMemory + (trends.memory * trendMultiplier),
                10
            );

            const diskValue = 40 + getRandomValue(-3, 3, 1) + (trends.disk * trendMultiplier);

            const networkValue = addSpikeEvent(
                baseNetwork + getRandomValue(-15, 15, 1) + (trends.network * trendMultiplier),
                3, 0.05
            );

            const loadValue = getCorrelatedValue(
                cpuValue, 0.7, // 与CPU有70%相关性
                (baseLoadFactor * 5) + (trends.load * trendMultiplier),
                1
            ) / 10; // 负载通常在0-10范围内

            // 创建其他指标，部分基于核心指标
            const userValue = getCorrelatedValue(networkValue, 0.5, baseLoadFactor * 80, 20);

            const requestsValue = getCorrelatedValue(
                networkValue, 0.8, // 与网络流量高度相关
                baseLoadFactor * 200,
                50
            );

            // 响应时间与CPU和负载相关
            const cpuLoadFactor = (cpuValue / 100 + loadValue / 5) / 2; // 基于CPU和负载的混合因子
            const responseTimeValue = 100 + cpuLoadFactor * 400 + getRandomValue(-40, 40, 0);

            // 错误率与CPU和内存有一定相关性
            const errorBaseFactor = Math.max(0, (cpuValue - 70) / 30 * 3 + (memoryValue - 80) / 20 * 2);
            const errorsValue = Math.max(0, errorBaseFactor + getRandomValue(-0.5, 0.5, 1));

            // 队列长度与负载和请求数相关
            const queueValue = Math.max(0,
                (loadValue - 3) * 5 +
                (requestsValue - 150) / 30 +
                getRandomValue(-2, 5, 0)
            );

            // 创建基础数据点
            const dataPoint = {
                time,
                cpu: parseFloat(cpuValue.toFixed(1)),
                memory: parseFloat(memoryValue.toFixed(1)),
                network: parseFloat(networkValue.toFixed(1)),
                disk: parseFloat(diskValue.toFixed(1)),
                user: Math.round(userValue),
                load: parseFloat(loadValue.toFixed(2)),
                requests: Math.round(requestsValue),
                response_time: Math.round(responseTimeValue),
                errors: parseFloat(errorsValue.toFixed(1)),
                queue: Math.round(queueValue)
            };

            // 添加自定义数据源的数据
            if (customDataSources && customDataSources.length > 0) {
                customDataSources.forEach(source => {
                    // 确保自定义数据源不会覆盖已有的标准数据
                    if (!dataPoint[source.key]) {
                        // 根据数据源的类别为其生成合适的随机值
                        if (source.category === '系统') {
                            // 系统指标通常与CPU、内存等相关
                            if (source.unit === '%') {
                                // 百分比类指标
                                const baseValue = getCorrelatedValue(
                                    (cpuValue + memoryValue) / 2,
                                    0.5,
                                    baseLoadFactor * 50,
                                    20
                                );
                                dataPoint[source.key] = parseFloat(baseValue.toFixed(1));
                            } else if (source.unit === 'MB' || source.unit === 'GB') {
                                // 容量类指标，与内存使用相关
                                const baseValue = getCorrelatedValue(
                                    memoryValue,
                                    0.6,
                                    1000, // 基准值1000MB或1GB
                                    200
                                );
                                dataPoint[source.key] = Math.round(baseValue);
                            } else {
                                // 其他系统指标
                                dataPoint[source.key] = getRandomValue(10, 90, 1);
                            }
                        } else if (source.category === '应用') {
                            // 应用指标通常与请求数、响应时间相关
                            if (source.key.includes('count') || source.key.includes('total')) {
                                // 计数类指标，与请求数相关
                                const baseValue = getCorrelatedValue(
                                    requestsValue,
                                    0.7,
                                    baseLoadFactor * 5000,
                                    1000
                                );
                                dataPoint[source.key] = Math.round(baseValue);
                            } else if (source.unit === 'ms') {
                                // 时间类指标，与响应时间相关
                                const baseValue = getCorrelatedValue(
                                    responseTimeValue,
                                    0.6,
                                    responseTimeValue * 0.8,
                                    50
                                );
                                dataPoint[source.key] = Math.round(baseValue);
                            } else if (source.unit === '%') {
                                // 百分比类指标
                                dataPoint[source.key] = getRandomValue(5, 95, 1);
                            } else {
                                // 其他应用指标
                                dataPoint[source.key] = getRandomValue(1, 100, 0);
                            }
                        } else if (source.category === '业务') {
                            // 业务指标通常更加独立，但可能与整体负载有一定关联
                            if (source.key.includes('revenue') || source.key.includes('sales')) {
                                // 收入/销售类指标
                                const dailyFactor = baseLoadFactor * 0.5 + 0.5; // 业务指标受负载影响较小
                                dataPoint[source.key] = Math.round(10000 * dailyFactor + getRandomValue(-2000, 2000, 0));
                            } else if (source.unit === '%') {
                                // 百分比类指标，如转化率
                                dataPoint[source.key] = getRandomValue(1, 30, 1); // 业务转化率通常较低
                            } else {
                                // 其他业务指标
                                dataPoint[source.key] = getRandomValue(100, 10000, 0);
                            }
                        } else {
                            // 其他类别的默认随机范围
                            dataPoint[source.key] = getRandomValue(1, 100, 0);
                        }
                    }
                });
            }

            return dataPoint;
        });
    } else {
        // 更新：移除最旧的数据点，添加新的数据点
        const latestTime = timeLabels[timeLabels.length - 1];

        // 安全地获取前一个数据点
        const prevData = timeSeriesData.length > 0
            ? timeSeriesData[timeSeriesData.length - 1]
            : {
                cpu: 50,
                memory: 50,
                network: 50,
                disk: 50,
                user: 50,
                load: 5,
                requests: 150,
                response_time: 250,
                errors: 1,
                queue: 5
            };

        // 基于前一个值和环境因素生成新的值
        // CPU波动较大，负载受时间影响明显
        const newCpuBase = prevData.cpu + trends.cpu + (baseLoadFactor * 5 - 2.5);
        const newCpuValue = addSpikeEvent(
            getFluctuatedValue(newCpuBase, 8, 5, 98, 1),
            2.5, 0.03
        );

        // 内存增长更稳定，有小趋势变化
        const newMemoryBase = prevData.memory + trends.memory;
        const newMemoryValue = getFluctuatedValue(
            newMemoryBase,
            2 + (baseLoadFactor * 3), // 高负载时波动略大
            10, 95, 1
        );

        // 网络流量波动很大，与时间相关性高
        const newNetworkBase = prevData.network + (baseLoadFactor * 8 - 4);
        const newNetworkValue = addSpikeEvent(
            getFluctuatedValue(newNetworkBase, 15, 5, 100, 1),
            3, 0.05
        );

        // 磁盘使用率缓慢增长
        const newDiskValue = getFluctuatedValue(
            prevData.disk + trends.disk,
            1, // 磁盘使用波动很小
            30, 99, 1
        );

        // 用户会话数与网络流量和时间相关
        const newUserValue = getCorrelatedValue(
            newNetworkValue,
            0.5,
            prevData.user,
            10 + (baseLoadFactor * 10)
        );

        // 系统负载与CPU高度相关
        const newLoadValue = getCorrelatedValue(
            newCpuValue,
            0.7,
            prevData.load,
            0.5 + (baseLoadFactor * 0.5)
        );

        // 请求数与网络流量和时间高度相关
        const newRequestsValue = getCorrelatedValue(
            newNetworkValue,
            0.8,
            prevData.requests,
            30 + (baseLoadFactor * 20)
        );

        // 响应时间与CPU和负载相关
        const cpuLoadFactor = (newCpuValue / 100 + newLoadValue / 5) / 2;
        const newResponseTimeValue = getCorrelatedValue(
            cpuLoadFactor * 100,
            0.7,
            prevData.response_time,
            20 + (baseLoadFactor * 30)
        );

        // 错误率与CPU和内存负载有关联，尤其是在高负载时
        const errorBaseFactor = Math.max(0, (newCpuValue - 70) / 30 * 3 + (newMemoryValue - 80) / 20 * 2);
        const newErrorsValue = Math.max(0, errorBaseFactor + getRandomValue(-0.5, 0.5, 1));

        // 队列长度与系统负载和请求数相关
        const newQueueValue = Math.max(
            0,
            (newLoadValue - 3) * 5 + (newRequestsValue - prevData.requests) / 30 + getRandomValue(-2, 5, 0)
        );

        // 基于前一个值添加合理的波动
        const newDataPoint = {
            time: latestTime,
            cpu: parseFloat(newCpuValue.toFixed(1)),
            memory: parseFloat(newMemoryValue.toFixed(1)),
            network: parseFloat(newNetworkValue.toFixed(1)),
            disk: parseFloat(newDiskValue.toFixed(1)),
            user: Math.round(newUserValue),
            load: parseFloat(newLoadValue.toFixed(2)),
            requests: Math.round(newRequestsValue),
            response_time: Math.round(newResponseTimeValue),
            errors: parseFloat(newErrorsValue.toFixed(1)),
            queue: Math.round(newQueueValue)
        };

        // 添加自定义数据源的数据，并基于前一个值添加合理波动
        if (customDataSources && customDataSources.length > 0) {
            customDataSources.forEach(source => {
                if (prevData[source.key] !== undefined) {
                    // 如果有前一个值，基于它生成波动
                    if (source.category === '系统') {
                        if (source.unit === '%') {
                            // 系统百分比类指标，与CPU/内存相关
                            const baseValue = getCorrelatedValue(
                                (newCpuValue + newMemoryValue) / 2,
                                0.4,
                                prevData[source.key],
                                5
                            );
                            newDataPoint[source.key] = parseFloat(baseValue.toFixed(1));
                        } else if (source.unit === 'MB' || source.unit === 'GB') {
                            // 容量类指标
                            const baseValue = getCorrelatedValue(
                                newMemoryValue,
                                0.5,
                                prevData[source.key],
                                50
                            );
                            newDataPoint[source.key] = Math.round(baseValue);
                        } else {
                            // 其他系统指标
                            newDataPoint[source.key] = getFluctuatedValue(
                                prevData[source.key],
                                5 + (baseLoadFactor * 5),
                                0, 100, 1
                            );
                        }
                    } else if (source.category === '应用') {
                        if (source.key.includes('count') || source.key.includes('total')) {
                            // 计数类指标，与请求数相关
                            const baseValue = getCorrelatedValue(
                                newRequestsValue,
                                0.6,
                                prevData[source.key],
                                prevData[source.key] * 0.1
                            );
                            newDataPoint[source.key] = Math.round(baseValue);
                        } else if (source.unit === 'ms') {
                            // 响应时间类指标
                            const baseValue = getCorrelatedValue(
                                newResponseTimeValue,
                                0.7,
                                prevData[source.key],
                                prevData[source.key] * 0.05
                            );
                            newDataPoint[source.key] = Math.round(baseValue);
                        } else if (source.unit === '%') {
                            // 百分比类指标
                            newDataPoint[source.key] = getFluctuatedValue(
                                prevData[source.key],
                                3, 0, 100, 1
                            );
                        } else {
                            // 其他应用指标
                            newDataPoint[source.key] = getFluctuatedValue(
                                prevData[source.key],
                                prevData[source.key] * 0.1,
                                0,
                                prevData[source.key] * 2,
                                0
                            );
                        }
                    } else if (source.category === '业务') {
                        // 业务指标波动更独立，但有时间相关性
                        if (source.key.includes('revenue') || source.key.includes('sales')) {
                            // 收入/销售类指标
                            const dailyFactor = baseLoadFactor * 0.3 + 0.7; // 业务指标受负载影响较小
                            const variation = prevData[source.key] * 0.05; // 5%的波动
                            newDataPoint[source.key] = Math.round(
                                prevData[source.key] * dailyFactor + getRandomValue(-variation, variation, 0)
                            );
                        } else if (source.unit === '%') {
                            // 百分比类业务指标变化较小
                            newDataPoint[source.key] = getFluctuatedValue(
                                prevData[source.key],
                                1, 0, 100, 1
                            );
                        } else {
                            // 其他业务指标
                            newDataPoint[source.key] = getFluctuatedValue(
                                prevData[source.key],
                                prevData[source.key] * 0.03,
                                prevData[source.key] * 0.8,
                                prevData[source.key] * 1.2,
                                0
                            );
                        }
                    } else {
                        // 其他类别指标
                        newDataPoint[source.key] = getFluctuatedValue(
                            prevData[source.key],
                            prevData[source.key] * 0.1,
                            0,
                            prevData[source.key] * 1.5,
                            0
                        );
                    }
                } else {
                    // 如果没有前一个值，生成一个新的随机值
                    // 使用与第一次初始化时相同的逻辑
                    if (source.category === '系统') {
                        if (source.unit === '%') {
                            const baseValue = getCorrelatedValue(
                                (newCpuValue + newMemoryValue) / 2,
                                0.5,
                                baseLoadFactor * 50,
                                20
                            );
                            newDataPoint[source.key] = parseFloat(baseValue.toFixed(1));
                        } else if (source.unit === 'MB' || source.unit === 'GB') {
                            const baseValue = getCorrelatedValue(
                                newMemoryValue,
                                0.6,
                                1000,
                                200
                            );
                            newDataPoint[source.key] = Math.round(baseValue);
                        } else {
                            newDataPoint[source.key] = getRandomValue(10, 90, 1);
                        }
                    } else if (source.category === '应用') {
                        if (source.key.includes('count') || source.key.includes('total')) {
                            const baseValue = getCorrelatedValue(
                                newRequestsValue,
                                0.7,
                                baseLoadFactor * 5000,
                                1000
                            );
                            newDataPoint[source.key] = Math.round(baseValue);
                        } else if (source.unit === 'ms') {
                            const baseValue = getCorrelatedValue(
                                newResponseTimeValue,
                                0.6,
                                newResponseTimeValue * 0.8,
                                50
                            );
                            newDataPoint[source.key] = Math.round(baseValue);
                        } else if (source.unit === '%') {
                            newDataPoint[source.key] = getRandomValue(5, 95, 1);
                        } else {
                            newDataPoint[source.key] = getRandomValue(1, 100, 0);
                        }
                    } else if (source.category === '业务') {
                        if (source.key.includes('revenue') || source.key.includes('sales')) {
                            const dailyFactor = baseLoadFactor * 0.5 + 0.5;
                            newDataPoint[source.key] = Math.round(10000 * dailyFactor + getRandomValue(-2000, 2000, 0));
                        } else if (source.unit === '%') {
                            newDataPoint[source.key] = getRandomValue(1, 30, 1);
                        } else {
                            newDataPoint[source.key] = getRandomValue(100, 10000, 0);
                        }
                    } else {
                        newDataPoint[source.key] = getRandomValue(1, 100, 0);
                    }
                }
            });
        }

        // 移除最旧的数据，添加新数据
        newTimeSeriesData = [...timeSeriesData.slice(1), newDataPoint];
    }

    // 更新饼图数据 - 资源分配
    // 使资源分配也随系统负载变化
    const baseLoadFraction = baseLoadFactor * 0.3 + 0.7; // 降低负载因子影响
    const newPieData = [
        { type: '数据库', value: getRandomValue(20, 40) * baseLoadFraction },
        { type: '应用服务', value: getRandomValue(20, 35) * baseLoadFraction },
        { type: '缓存', value: getRandomValue(10, 25) * baseLoadFraction },
        { type: '前端', value: getRandomValue(5, 15) * baseLoadFraction },
        { type: '其他', value: getRandomValue(1, 10) * baseLoadFraction },
    ];

    return { newTimeSeriesData, newPieData };
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

            const alertId = `${panel.id}-${alert.id}`;
            const isActive = currentValue >= alert.threshold;
            const existingAlertIndex = newActiveAlerts.findIndex(a => a.id === alertId);

            if (isActive && existingAlertIndex === -1) {
                // 新告警触发
                const newAlert = {
                    id: alertId,
                    panelId: panel.id,
                    panelTitle: panel.title,
                    dataKey: panel.dataKey,
                    value: currentValue,
                    threshold: alert.threshold,
                    type: alert.type,
                    time: new Date()
                };

                newActiveAlerts.push(newAlert);

                // 显示通知
                notification.open({
                    message: `${alert.type === 'critical' ? '严重警报' : '警告'}：${panel.title}`,
                    description: `当前值 ${currentValue} ${getUnitForDataKey(panel.dataKey)} 超过了阈值 ${alert.threshold} ${getUnitForDataKey(panel.dataKey)}`,
                    icon: alert.type === 'critical' ?
                        <WarningOutlined style={{ color: '#f5222d' }} /> :
                        <WarningOutlined style={{ color: '#faad14' }} />,
                    duration: 4.5,
                });

                // 播放警报声音
                playAlertSound(alert.type);

            } else if (!isActive && existingAlertIndex !== -1) {
                // 告警已恢复
                newActiveAlerts.splice(existingAlertIndex, 1);

                notification.open({
                    message: `告警已恢复：${panel.title}`,
                    description: `当前值 ${currentValue} ${getUnitForDataKey(panel.dataKey)} 已低于阈值 ${alert.threshold} ${getUnitForDataKey(panel.dataKey)}`,
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
        if (value > 90) return '#cf1322'; // 危险
        if (value > 70) return '#faad14'; // 警告
        return '#3f8600'; // 正常
    }
    if (dataKey === 'errors') {
        if (value > 10) return '#cf1322'; // 危险
        if (value > 5) return '#faad14'; // 警告
        return '#3f8600'; // 正常
    }
    return undefined;
};

// 获取当前面板数据值
export const getPanelCurrentValue = (dataKey, currentData) => {
    if (!currentData || !Object.keys(currentData).length) return '-';

    switch (dataKey) {
        case 'cpu': return currentData.cpu;
        case 'memory': return currentData.memory;
        case 'network': return currentData.network;
        case 'disk': return currentData.disk;
        case 'user': return currentData.user;
        case 'load': return currentData.load;
        case 'requests': return currentData.requests;
        case 'response_time': return currentData.response_time;
        case 'errors': return currentData.errors;
        case 'queue': return currentData.queue;
        default: return currentData[dataKey] !== undefined ? currentData[dataKey] : '-';
    }
};

// 从API获取数据 (模拟)
export const fetchDataFromAPI = async (sourceId, dataConnections) => {
    // 这里是模拟的API调用
    // 在实际应用中，这应该是真实的API请求
    if (sourceId === 'api3') {
        // 使用模拟数据
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    data: {
                        // 一些随机生成的数据
                    }
                });
            }, 500);
        });
    } else {
        // 这里应该是真实的API请求
        try {
            const connection = dataConnections.find(conn => conn.id === sourceId);
            if (!connection) {
                throw new Error('数据源不存在');
            }

            // 模拟请求结果
            return {
                success: true,
                data: {}
            };
        } catch (error) {
            console.error('Failed to fetch data:', error);
            return {
                success: false,
                error: error.message
            };
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
    return 60000; // 默认1分钟
};

// 格式化毫秒为人类可读形式
export const formatTimeRemaining = (milliseconds) => {
    if (milliseconds < 1000) return '< 1秒';
    if (milliseconds < 60000) return `${Math.round(milliseconds / 1000)}秒`;
    return `${Math.round(milliseconds / 60000)}分钟`;
};