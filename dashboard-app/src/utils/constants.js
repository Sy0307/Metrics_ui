import React from 'react';
import {
  LineChartOutlined, AreaChartOutlined, BarChartOutlined, PieChartOutlined,
  DashboardOutlined, RadarChartOutlined, HeatMapOutlined, FunnelPlotOutlined,
  DotChartOutlined, PushpinOutlined, FileImageOutlined
} from '@ant-design/icons';

// 数据源选项
export const dataSources = [
  { key: 'cpu', name: 'CPU使用率', unit: '%', category: '系统' },
  { key: 'memory', name: '内存使用率', unit: '%', category: '系统' },
  { key: 'network', name: '网络流量', unit: 'Mbps', category: '系统' },
  { key: 'disk', name: '磁盘使用率', unit: '%', category: '系统' },
  { key: 'user', name: '用户会话数', unit: '', category: '应用' },
  { key: 'load', name: '系统负载', unit: '', category: '系统' },
  { key: 'requests', name: '请求数', unit: 'req/s', category: '应用' },
  { key: 'response_time', name: '响应时间', unit: 'ms', category: '应用' },
  { key: 'errors', name: '错误率', unit: '%', category: '应用' },
  { key: 'queue', name: '队列长度', unit: '', category: '应用' },
  // Agricultural Data Sources
  // Farmland Sensor Data
  { key: 'soil_temp', name: '土壤温度', unit: '°C', category: '农田传感数据' },
  { key: 'soil_moisture', name: '土壤湿度', unit: '%', category: '农田传感数据' },
  { key: 'air_temp', name: '空气温度', unit: '°C', category: '农田传感数据' },
  { key: 'air_humidity', name: '空气湿度', unit: '%', category: '农田传感数据' },
  { key: 'light_intensity', name: '光照强度', unit: 'lux', category: '农田传感数据' },
  // Remote Sensing Imagery Data
  { key: 'ndvi_index', name: 'NDVI植被指数', unit: '', category: '遥感影像数据' },
  { key: 'crop_health_map', name: '作物健康图', unit: '', category: '遥感影像数据' },
  // Weather Data
  { key: 'weather_forecast', name: '天气预报', unit: '', category: '气象数据' },
  { key: 'historical_weather', name: '历史气象记录', unit: '', category: '气象数据' },
];

// 图表类型选项
export const chartTypes = [
  { value: 'line', label: '折线图', icon: <LineChartOutlined /> },
  { value: 'area', label: '面积图', icon: <AreaChartOutlined /> },
  { value: 'column', label: '柱状图', icon: <BarChartOutlined /> },
  { value: 'pie', label: '饼图', icon: <PieChartOutlined /> },
  { value: 'gauge', label: '仪表盘', icon: <DashboardOutlined /> },
  { value: 'radar', label: '雷达图', icon: <RadarChartOutlined /> },
  { value: 'heatmap', label: '热力图', icon: <HeatMapOutlined /> },
  { value: 'waterfall', label: '瀑布图', icon: <FunnelPlotOutlined /> },
  { value: 'ring', label: '环形进度', icon: <DotChartOutlined /> },
  { value: 'funnel', label: '漏斗图', icon: <FunnelPlotOutlined /> },
  { value: 'map_marker', label: '地图标记点', icon: <PushpinOutlined /> },
  { value: 'image_overlay', label: '影像叠加层', icon: <FileImageOutlined /> },
];

// 刷新频率选项
export const refreshOptions = [
  { value: 'off', label: '关闭自动刷新' },
  { value: '5s', label: '5秒' },
  { value: '10s', label: '10秒' },
  { value: '30s', label: '30秒' },
  { value: '1m', label: '1分钟' },
  { value: '5m', label: '5分钟' },
  { value: '15m', label: '15分钟' },
];

// 数据源配置
export const dataConnections = [
  { id: 'api1', name: 'Prometheus API', type: 'prometheus', url: 'http://prometheus.example.com/api/v1', status: 'active' },
  { id: 'api2', name: 'REST Metrics API', type: 'rest', url: 'https://api.example.com/metrics', status: 'inactive' },
  { id: 'api3', name: '模拟数据', type: 'mock', url: 'local', status: 'active' },
];

// 初始面板配置
export const initialPanels = [
  {
    id: 'soil-moisture-panel',
    title: '地块A - 土壤湿度',
    type: 'line', // 保持折线图，因为湿度变化适合用线性展示
    dataKey: 'soil_moisture',
    span: 12,
    refreshRate: null,
    alerts: [
      { id: 'soil-moisture-low-warn', conditionKey: 'low_soil_moisture', threshold: 30, enabled: true, type: 'warning' }
    ]
  },
  {
    id: 'ndvi-panel',
    title: '区域1 - NDVI植被指数',
    type: 'area', // 改为面积图，更好地展示植被覆盖度
    dataKey: 'ndvi_index',
    span: 12,
    refreshRate: null,
    alerts: [
      { id: 'ndvi-low-warn', conditionKey: 'low_ndvi_index', threshold: 0.4, enabled: true, type: 'warning' }
    ]
  },
  {
    id: 'air-temp-panel',
    title: '大棚1 - 空气温度',
    type: 'column', // 改为柱状图，更直观地显示温度变化
    dataKey: 'air_temp',
    span: 12,
    refreshRate: null,
    alerts: [
      { id: 'air-temp-high-crit', conditionKey: 'high_air_temp', threshold: 35, enabled: true, type: 'critical' },
      { id: 'air-temp-low-warn', conditionKey: 'low_air_temp', threshold: 10, enabled: true, type: 'warning' }
    ]
  },
  {
    id: 'air-humidity-panel',
    title: '大棚1 - 空气湿度',
    type: 'gauge', // 保持仪表盘，湿度百分比适合用仪表显示
    dataKey: 'air_humidity',
    span: 12,
    refreshRate: null,
    alerts: [
      { id: 'air-humidity-high', conditionKey: 'high_air_humidity', threshold: 85, enabled: true, type: 'warning' },
      { id: 'air-humidity-low', conditionKey: 'low_air_humidity', threshold: 40, enabled: true, type: 'warning' }
    ]
  },
  {
    id: 'light-intensity-panel',
    title: '光照监测 - 光照强度',
    type: 'area', // 面积图展示光照强度变化
    dataKey: 'light_intensity',
    span: 12,
    refreshRate: null,
    alerts: [
      { id: 'light-low-warn', conditionKey: 'low_light_intensity', threshold: 10000, enabled: true, type: 'warning' }
    ]
  },
  {
    id: 'soil-temp-panel',
    title: '地块A - 土壤温度',
    type: 'line', // 线性图展示土壤温度的平缓变化
    dataKey: 'soil_temp',
    span: 12,
    refreshRate: null,
    alerts: [
      { id: 'soil-temp-high', conditionKey: 'high_soil_temp', threshold: 28, enabled: true, type: 'warning' },
      { id: 'soil-temp-low', conditionKey: 'low_soil_temp', threshold: 12, enabled: true, type: 'warning' }
    ]
  },
  {
    id: 'crop-health-overview-panel',
    title: '作物健康状况图 (地块总览)',
    type: 'map_marker', // Placeholder, will show '地图标记点图表占位符'
    dataKey: 'crop_health_map', // This dataKey will need specific handling in data generation and chart rendering
    span: 24, // Full width
    refreshRate: '5m',
    alerts: [
      { id: 'crop-health-issue', conditionKey: 'crop_health_issue_detected', threshold: 1, enabled: true, type: 'critical' } // Assuming 1 means issue detected
    ]
  }
];

// 初始布局
// react-grid-layout w is typically based on 12 columns.
// antd span 12 -> w=6 (half width if gridCols=12 in PanelGrid)
// antd span 24 -> w=12 (full width if gridCols=12 in PanelGrid)
// Assuming PanelGrid's `cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}` or similar, let's use w based on 12 columns.
// For simplicity, let's make the first four panels take half width (w=6) and the last one full width (w=12).
// The default PanelGrid `cols` prop in `react-grid-layout` is `cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}`.
// So antd `span=12` would map to `w=6` on `lg` breakpoint.
// antd `span=24` would map to `w=12` on `lg` breakpoint.
export const initialLayout = {
  lg: [
    { i: 'soil-moisture-panel', x: 0, y: 0, w: 6, h: 3 },
    { i: 'ndvi-panel', x: 6, y: 0, w: 6, h: 3 },
    { i: 'air-temp-panel', x: 0, y: 3, w: 6, h: 3 }, // Air Temp
    { i: 'air-humidity-panel', x: 6, y: 3, w: 6, h: 3 }, // Air Humidity
    { i: 'light-intensity-panel', x: 0, y: 6, w: 6, h: 3 }, // 光照强度
    { i: 'soil-temp-panel', x: 6, y: 6, w: 6, h: 3 }, // 土壤温度
    { i: 'crop-health-overview-panel', x: 0, y: 9, w: 12, h: 4 } // Crop Health Map
  ]
};

// 农业相关警报条件类型
export const agriculturalAlertConditions = [
  // 土壤传感器数据相关
  { key: 'low_soil_moisture', name: '土壤湿度过低', dataKey: 'soil_moisture', comparison: 'below', unit: '%' },
  { key: 'high_soil_temp', name: '土壤温度过高', dataKey: 'soil_temp', comparison: 'above', unit: '°C' },
  { key: 'low_soil_temp', name: '土壤温度过低', dataKey: 'soil_temp', comparison: 'below', unit: '°C' },
  // 空气传感器数据相关
  { key: 'high_air_temp', name: '空气温度过高', dataKey: 'air_temp', comparison: 'above', unit: '°C' },
  { key: 'low_air_temp', name: '空气温度过低', dataKey: 'air_temp', comparison: 'below', unit: '°C' },
  { key: 'high_air_humidity', name: '空气湿度过高', dataKey: 'air_humidity', comparison: 'above', unit: '%' },
  { key: 'low_air_humidity', name: '空气湿度过低', dataKey: 'air_humidity', comparison: 'below', unit: '%' },
  // 光照强度数据相关
  { key: 'low_light_intensity', name: '光照强度不足', dataKey: 'light_intensity', comparison: 'below', unit: 'lux' },
  // NDVI 植被指数相关
  { key: 'low_ndvi_index', name: 'NDVI植被指数偏低', dataKey: 'ndvi_index', comparison: 'below', unit: '' },
  { key: 'high_ndvi_index', name: 'NDVI植被指数偏高', dataKey: 'ndvi_index', comparison: 'above', unit: '' },
  // 作物健康图 - 假设我们有一个特定的值或状态来表示异常
  // For crop_health_map, we might need a more complex logic or specific values that indicate alerts.
  // This is a placeholder, actual implementation might differ based on how crop_health_map data is structured.
  { key: 'crop_health_issue_detected', name: '作物健康问题预警', dataKey: 'crop_health_map', comparison: 'equal', unit: '' }, // Example: 'equal' to a specific status code like ' unhealthy'
];