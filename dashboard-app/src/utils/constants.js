import React from 'react';
import {
  LineChartOutlined, AreaChartOutlined, BarChartOutlined, PieChartOutlined,
  DashboardOutlined, RadarChartOutlined, HeatMapOutlined, FunnelPlotOutlined,
  DotChartOutlined
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
];

// 刷新频率选项
export const refreshOptions = [
  { value: 'off', label: '关闭自动刷新' },
  { value: '3s', label: '3秒' },
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
    id: 'cpu-panel', 
    title: 'CPU使用率', 
    type: 'line', 
    dataKey: 'cpu', 
    span: 8, 
    refreshRate: null,
    alerts: [
      { id: 'cpu-warning', type: 'warning', threshold: 80, enabled: true },
      { id: 'cpu-critical', type: 'critical', threshold: 90, enabled: true }
    ]
  },
  { 
    id: 'memory-panel', 
    title: '内存使用率', 
    type: 'area', 
    dataKey: 'memory', 
    span: 8, 
    refreshRate: null,
    alerts: [
      { id: 'memory-warning', type: 'warning', threshold: 75, enabled: true },
      { id: 'memory-critical', type: 'critical', threshold: 90, enabled: true }
    ]
  },
  { 
    id: 'network-panel', 
    title: '网络流量', 
    type: 'column', 
    dataKey: 'network', 
    span: 8, 
    refreshRate: null,
    alerts: [
      { id: 'network-warning', type: 'warning', threshold: 70, enabled: true }
    ]
  },
  { 
    id: 'resource-panel', 
    title: '资源分配', 
    type: 'pie', 
    dataKey: 'resource', 
    span: 8, 
    refreshRate: null,
    alerts: []
  },
  { 
    id: 'overview-panel', 
    title: '系统指标概览', 
    type: 'multi-line', 
    dataKey: 'all', 
    span: 16, 
    refreshRate: null,
    alerts: []
  },
];

// 初始布局
export const initialLayout = {
  lg: [
    { i: 'cpu-panel', x: 0, y: 0, w: 4, h: 3 },
    { i: 'memory-panel', x: 4, y: 0, w: 4, h: 3 },
    { i: 'network-panel', x: 8, y: 0, w: 4, h: 3 },
    { i: 'resource-panel', x: 0, y: 3, w: 4, h: 3 },
    { i: 'overview-panel', x: 4, y: 3, w: 8, h: 3 },
  ]
};