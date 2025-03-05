// 修复的导入语句
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Layout, Menu, Card, Row, Col, Typography, Dropdown, Button, 
  Space, DatePicker, Select, Switch, Statistic, Divider, Modal,
  Form, Input, Radio, InputNumber, message, Badge, Progress, Alert,
  notification, Tabs, Drawer, Spin, Tag, Tooltip, List, Slider, Empty
} from 'antd';
import {
  DashboardOutlined, SettingOutlined, MoreOutlined,
  ReloadOutlined, PlusOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
  LineChartOutlined, AreaChartOutlined, BarChartOutlined, PieChartOutlined,
  ClockCircleOutlined, BellOutlined, ApiOutlined, DatabaseOutlined,
  WarningOutlined, CheckCircleOutlined, CopyOutlined, DeleteOutlined,
  FullscreenOutlined, DragOutlined, LinkOutlined, DownloadOutlined,
  SaveOutlined, HeatMapOutlined, RadarChartOutlined, FunnelPlotOutlined,
  DotChartOutlined, CloudOutlined, SoundOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import { 
  Line, Area, Column, Pie, Gauge, Radar, 
  Heatmap, Waterfall, RingProgress, Funnel 
} from '@ant-design/plots';
import { 
  LineChart, Line as RechartsLine, BarChart, Bar, AreaChart, Area as RechartsArea,
  PieChart, Pie as RechartsPie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import axios from 'axios';

const { Header, Sider, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;
const { Search } = Input;

// 创建响应式Grid布局
const ResponsiveGridLayout = WidthProvider(Responsive);

// 数据源选项
const dataSources = [
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
const chartTypes = [
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
const refreshOptions = [
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
const dataConnections = [
  { id: 'api1', name: 'Prometheus API', type: 'prometheus', url: 'http://prometheus.example.com/api/v1', status: 'active' },
  { id: 'api2', name: 'REST Metrics API', type: 'rest', url: 'https://api.example.com/metrics', status: 'inactive' },
  { id: 'api3', name: '模拟数据', type: 'mock', url: 'local', status: 'active' },
];

// 辅助函数：生成随机数
const getRandomValue = (min, max, decimal = 0) => {
  const value = Math.random() * (max - min) + min;
  return decimal > 0 ? Number(value.toFixed(decimal)) : Math.floor(value);
};

// 辅助函数：生成随机波动值（基于前一个值）
const getFluctuatedValue = (prevValue, maxFluctuation, min, max, decimal = 0) => {
  // 生成波动幅度
  const fluctuation = (Math.random() * 2 - 1) * maxFluctuation;
  // 计算新值并确保在合理范围内
  let newValue = prevValue + fluctuation;
  newValue = Math.max(min, Math.min(max, newValue));
  // 格式化小数
  return decimal > 0 ? Number(newValue.toFixed(decimal)) : Math.floor(newValue);
};

// 辅助函数：生成时间标签
const generateTimeLabels = (count = 12) => {
  const now = new Date();
  const labels = [];
  
  for (let i = count - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 1000);
    labels.push(time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }));
  }
  
  return labels;
};

// 辅助函数：解析刷新率字符串为毫秒数
const parseRefreshRate = (refreshRate) => {
  if (refreshRate === 'off') return null;
  
  const value = parseInt(refreshRate);
  if (refreshRate.includes('s')) return value * 1000;
  if (refreshRate.includes('m')) return value * 60 * 1000;
  return 60000; // 默认1分钟
};

// 辅助函数：格式化毫秒为人类可读形式
const formatTimeRemaining = (milliseconds) => {
  if (milliseconds < 1000) return '< 1秒';
  if (milliseconds < 60000) return `${Math.round(milliseconds / 1000)}秒`;
  return `${Math.round(milliseconds / 60000)}分钟`;
};

// 辅助函数：播放告警声音
const playAlertSound = (severity) => {
  const audio = new Audio();
  
  switch (severity) {
    case 'critical':
      audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YWoGAACBhYqFbF1fdH2Sop+Yj4FpVExFS1Vih5uuvaujlnhcQ0M3JRUM/vXo3ubTeWJXVVBRWmpvdGRXKi1qrDJ6CK3d1PX7u157R/+icluUc5RplGaEV4pJdkVvzb3CqNDa4cvZx6yyrcDQwrC+pdHdcbdRrz6RMnU8e0ZEPdpQgTbMLV3sZ2un9rP0M/T/8/7W63TvuOS02J/HtKKhlJ2jo62elZN1WktsnG3ksRSQrl/DaC7FJ/+fQ6HB4efauPvN/Z0NrDytesSijkepP7Njtl3YvunJ187Y4c7XsaySoZ+kxq28rI2ptEemzDXrHPMH+UvP0DPqJrU7ni2TNqhYunHQr+vN++9rzvpHRDuKaMCuxbOqyregeMS43O3dxsm+ta2SqI6nqrKwtblboHcglB21GsZPtFGLYQHF0NHYwMWwzTh9OIVwiqSclpib1qipm5bAiYA3ZrjFqZSrloeFc9flcnOQdNCjfqOgdm4PuR2LV6NwrJnNws7I1dzh/eiwrGNUSzYyW2ZtbwJbTVJZdA1qWEw8UGBUTmSAglZJXGhucIKFcpQldlFSL0JgYIdsaXt2aHB9lYOMo7KioMS5q5eGeWRmWnN8fG12eF1AOCgFFiCIZ04vRWyDdGBJTRhGfntMK1BdbXB0cH6Ljo5tWDEkHSpOVlNsb15OQ09rc5OlrdrRp5iMmqeahWBPSlVaSz04Myga7cZ1gnuFiIiFYks9UVFOSElJXWVoaVtVUVtshZOhm4+Aa1ZRZ26AdHOAemZqiHtoY0c9UnduZ2tpWEU8Qk5XcISOi5ecn5+bkoeEg3lwaGVoaWx1aWpvdXqWjIaEgHhwZk85OktOUVJOTEVAOjA6OB8RBQ0cJiw0MzY9MDIoHRCCb2p0eX+KgXZbW1dTUk9FR09fZoF8cGREPDo5Pj1BQkRKTVVYd252amlnXFxVUkpNQUVCSVddcn6Qop6blot9bmROXF1eXV9ka25vbHJvc36PjoR/dGhYRzQ2PT9JQ0ZLQ0E+NiUbEw0JDhYgKS0rKCkpJiIrIyIhIyIRCwkPGhsfLEI2MUU/Lz9APjs3LTMuP0VJT1VbVlRXYGZtdnl2ZGBQUENEQDo3NTo7S0xZXWZoaGlrY1pRREcvNzU6NDc5QUxNUlNMMzEuLCw5NUZPVWRoa21tZ2VbVEpKR0VAODc6PDhCNDA+IiQkIiAZGRQUDRMQDxQVExMYKU9IQkNAOz0/LikmJR0ZGh4gISceGBYRIyEdJCckHiImJSYiJSIcEw4LGh0aJDM1O0NMU1xka3B0dHR2amZdV1NXUUpGRDw6ODc2NzUyMTE3OkFGTFNZYF9fXlZYVVRURkI6OTw3ODI3NykpJyYlJCIoIh0bEg8KDAcGBwcI5e/Ht+Tk5f8MIFN/iJWkqKuvs7Guraqmo52Yk4yLkouEiXx0cnZiVVJiWVFaV2VeW1piY1lUX1NYUF5VWWlhMR4tTigDz3O0q7nNxM3By8bFwsPDwsK/vby8t7ezsLO1q62rpKinoJOakIR/fXt6c21qaGRkW1paV1ZNVUdBOz02MDctKjZSTU1NSEUiDQb13drMw8TFwbvCuaywrKuloaWelpeMkY2DgvL3/gIXHCc0NUFQWGFkZnmDfH2Fi4SPiYaMlYqEhoGBeHV7c3BmYV9aWVtXVlRAITI/f9hhtJ+sn6OMlp+ZmZ+mo6SYm5ibqKqopKWppKOwr7GopaGbmpiRjYeIgXZydG5mYVZRSklCNy4vJh0YFQ4IBQH9+O3u7Org3tzX0tLHublXV1ve3NbTz9DU2c7Pz9PRz8/Mx8vGyMHDwMC8vbizuLaxq7CsqKynoJ2Xl5COgIYzuWOkh6CSn4+Rko+OkpWYmZyanp2eoKeioKOloqShop+cmZWUjIyJhH9+enZwb2pmYFpQUUxDPTkyKyYgGBMLCQH8+fLp6eXe29nT0c7HwNbXXVxe4N7Z1sXZ0dHNztLQztLLyMfFw8TBvsC+vri3tLGprKyopqWhnZiUjpONim9sb6GrW1JDTlVbYmduY2ZeYGdnaGlscXJ2en+DhIqWk5SXlpSTkZCPjYyJhn98d3RybmhgYFpVT0lEQDs0LSskHxoTDgkHAvr28+7r5+Pg29jSz7zg4l1eYOLe2NXOytW708/Qz9DPzMvJxsXFwb69urW0sa+tqKenppiRiIeSkUg2PpCQN0xKY2hlam9sW19pdG55fH+AhYWKjo+RkZWWl5aVlZOSkY6MiYeEgHx3cnBoZF9aVU9JQz44MywoIRwXEQwHBAD69PHu6+fk39zZ1rnd4V5fYeJeYmJgX2FiY19gXl1fXVtfXFhaWVhWVlNUU1NRVFNRUlJPTkxISkdERURCQEA+PTs8PGM=';
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

const Dashboard = () => {
  // 基础状态
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [refreshRate, setRefreshRate] = useState('1m');
  const [showRefreshSettings, setShowRefreshSettings] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [activeDataConnection, setActiveDataConnection] = useState('api3'); // 默认使用模拟数据
  
  // 面板状态
  const [layout, setLayout] = useState({
    lg: [
      { i: 'cpu-panel', x: 0, y: 0, w: 4, h: 3 },
      { i: 'memory-panel', x: 4, y: 0, w: 4, h: 3 },
      { i: 'network-panel', x: 8, y: 0, w: 4, h: 3 },
      { i: 'resource-panel', x: 0, y: 3, w: 4, h: 3 },
      { i: 'overview-panel', x: 4, y: 3, w: 8, h: 3 },
    ]
  });
  
  const [panels, setPanels] = useState([
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
  ]);
  
  // 模态框状态
  const [addPanelVisible, setAddPanelVisible] = useState(false);
  const [alertSettingsVisible, setAlertSettingsVisible] = useState(false);
  const [dataConnectionsDrawerVisible, setDataConnectionsDrawerVisible] = useState(false);
  const [activeAlertPanel, setActiveAlertPanel] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm();
  const [alertForm] = Form.useForm();
  
  // 数据状态
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [currentData, setCurrentData] = useState({
    cpu: 0,
    memory: 0,
    network: 0,
    disk: 0,
    user: 0,
    load: 0,
    requests: 0,
    response_time: 0,
    errors: 0,
    queue: 0
  });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState([]);
  
  // 引用计时器和刷新间隔
  const timerRef = useRef(null);
  const lastRefreshTimeRef = useRef(Date.now());
  const currentIntervalRef = useRef(parseRefreshRate(refreshRate));
  const isRefreshingRef = useRef(false);
  
  // 检查警报
  const checkAlerts = useCallback((newData) => {
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
    
    // 更新活跃告警状态
    if (JSON.stringify(newActiveAlerts) !== JSON.stringify(activeAlerts)) {
      setActiveAlerts(newActiveAlerts);
    }
  }, [panels, activeAlerts]);
  
  // 获取数据单位
  const getUnitForDataKey = (dataKey) => {
    const dataSource = dataSources.find(ds => ds.key === dataKey);
    return dataSource ? dataSource.unit : '';
  };
  
  // 生成随机数据
  const generateRandomData = useCallback(() => {
    // 防止重复调用
    if (isRefreshingRef.current) {
      return;
    }
    
    try {
      // 标记正在刷新
      isRefreshingRef.current = true;
      setIsLoading(true);
      
      // 更新最后刷新时间
      lastRefreshTimeRef.current = Date.now();
      
      // 生成时间标签
      const timeLabels = generateTimeLabels(12);
      
      // 生成新的时间序列数据或更新现有数据
      let newTimeSeriesData;
      
      if (timeSeriesData.length === 0) {
        // 第一次初始化：生成所有数据点
        newTimeSeriesData = timeLabels.map(time => ({
          time,
          cpu: getRandomValue(20, 85, 1),
          memory: getRandomValue(30, 80, 1),
          network: getRandomValue(10, 70, 1),
          disk: getRandomValue(40, 90, 1),
          user: getRandomValue(10, 100),
          load: getRandomValue(1, 8, 2),
          requests: getRandomValue(50, 300, 0),
          response_time: getRandomValue(100, 500, 0),
          errors: getRandomValue(0, 5, 1),
          queue: getRandomValue(0, 20, 0)
        }));
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
        
        // 基于前一个值添加合理的波动
        const newDataPoint = {
          time: latestTime,
          cpu: getFluctuatedValue(prevData.cpu, 8, 5, 98, 1),
          memory: getFluctuatedValue(prevData.memory, 5, 10, 95, 1),
          network: getFluctuatedValue(prevData.network, 15, 5, 100, 1),
          disk: getFluctuatedValue(prevData.disk, 3, 30, 99, 1),
          user: getFluctuatedValue(prevData.user, 10, 1, 200),
          load: getFluctuatedValue(prevData.load, 1, 0.1, 10, 2),
          requests: getFluctuatedValue(prevData.requests, 30, 10, 500, 0),
          response_time: getFluctuatedValue(prevData.response_time, 50, 50, 1000, 0),
          errors: getFluctuatedValue(prevData.errors, 1, 0, 15, 1),
          queue: getFluctuatedValue(prevData.queue, 2, 0, 30, 0)
        };
        
        // 移除最旧的数据，添加新数据
        newTimeSeriesData = [...timeSeriesData.slice(1), newDataPoint];
      }
      
      // 更新饼图数据 - 资源分配
      const newPieData = [
        { type: '数据库', value: getRandomValue(20, 45) },
        { type: '应用服务', value: getRandomValue(20, 40) },
        { type: '缓存', value: getRandomValue(10, 25) },
        { type: '前端', value: getRandomValue(5, 15) },
        { type: '其他', value: getRandomValue(1, 10) },
      ];
      
      // 更新当前值前进行安全检查
      if (newTimeSeriesData.length > 0) {
        const latestData = newTimeSeriesData[newTimeSeriesData.length - 1];
        
        // 使用批量更新来避免多次重渲染
        setTimeSeriesData(newTimeSeriesData);
        setPieData(newPieData);
        setCurrentData({
          cpu: latestData.cpu,
          memory: latestData.memory,
          network: latestData.network,
          disk: latestData.disk,
          user: latestData.user,
          load: latestData.load,
          requests: latestData.requests,
          response_time: latestData.response_time,
          errors: latestData.errors,
          queue: latestData.queue
        });
        setLastUpdated(new Date());
        
        // 检查是否有告警触发
        checkAlerts(latestData);
      }
      
      // 重置计时器和进度条
      setTimeRemaining(currentIntervalRef.current || 0);
      setProgressPercent(0);
    } catch (error) {
      console.error('Error generating random data:', error);
      message.error('刷新数据时发生错误');
    } finally {
      // 不管成功与否，都需要结束加载状态
      setIsLoading(false);
      // 释放刷新标记
      setTimeout(() => {
        isRefreshingRef.current = false;
      }, 500); // 添加小延迟，防止快速连续点击
    }
  }, [timeSeriesData, checkAlerts]);
  
  // 处理数据源切换
  const handleDataSourceChange = (sourceId) => {
    setActiveDataConnection(sourceId);
    
    // 在真实环境中，这里会重新配置数据获取逻辑
    // 对于演示，我们只刷新数据
    message.success(`已切换到数据源: ${dataConnections.find(conn => conn.id === sourceId)?.name}`);
    generateRandomData();
  };
  
  // 从API获取数据 (模拟)
  const fetchDataFromAPI = async (sourceId) => {
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
        
        // 使用axios或fetch发起请求
        // const response = await axios.get(`${connection.url}/query`);
        // return response.data;
        
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
  
  // 处理刷新率变更
  const handleRefreshRateChange = (value) => {
    setRefreshRate(value);
    const newInterval = parseRefreshRate(value);
    currentIntervalRef.current = newInterval;
    
    // 清除现有计时器
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // 重置界面状态
    setTimeRemaining(newInterval || 0);
    setProgressPercent(0);
    
    // 如果不是关闭自动刷新，则设置新的计时器
    if (newInterval) {
      // 立即刷新一次
      generateRandomData();
      
      // 设置更新剩余时间的定时器
      timerRef.current = setInterval(() => {
        try {
          const elapsed = Date.now() - lastRefreshTimeRef.current;
          const remaining = Math.max(0, currentIntervalRef.current - elapsed);
          
          // 只在值变化时更新状态，减少不必要的渲染
          if (Math.abs(remaining - timeRemaining) > 1000) { // 只在变化超过1秒时更新
            setTimeRemaining(remaining);
          }
          
          // 更新进度条，同样只在显著变化时更新
          if (currentIntervalRef.current > 0) {
            const percent = 100 - (remaining / currentIntervalRef.current) * 100;
            if (Math.abs(percent - progressPercent) > 1) { // 变化超过1%才更新
              setProgressPercent(percent);
            }
          }
          
          // 如果时间到了，刷新数据
          if (remaining <= 0 && currentIntervalRef.current && !isRefreshingRef.current) {
            generateRandomData();
          }
        } catch (error) {
          console.error('Error in refresh timer:', error);
          // 出错时尝试清理计时器
          clearInterval(timerRef.current);
          timerRef.current = null;
          setIsLoading(false);
          isRefreshingRef.current = false;
        }
      }, 1000); // 每秒更新一次倒计时
    }
  };
  
  // 为面板设置单独的刷新率
  const setPanelRefreshRate = (panelId, rate) => {
    setPanels(panels.map(panel => 
      panel.id === panelId ? { ...panel, refreshRate: rate } : panel
    ));
    message.success(`已设置面板刷新率为 ${rate === 'off' ? '关闭自动刷新' : rate}`);
  };
  
  // 初始化
  useEffect(() => {
    // 首次加载数据
    generateRandomData();
    
    // 设置定时刷新
    const initialInterval = parseRefreshRate(refreshRate);
    currentIntervalRef.current = initialInterval;
    
    if (initialInterval) {
      // 设置更新剩余时间的定时器
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - lastRefreshTimeRef.current;
        const remaining = Math.max(0, currentIntervalRef.current - elapsed);
        
        setTimeRemaining(remaining);
        
        // 更新进度条
        if (currentIntervalRef.current > 0) {
          const percent = 100 - (remaining / currentIntervalRef.current) * 100;
          setProgressPercent(percent);
        }
        
        // 如果时间到了，刷新数据
        if (remaining <= 0 && currentIntervalRef.current && !isRefreshingRef.current) {
          generateRandomData();
        }
      }, 1000);
    }
    
    // 清理函数
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []); // 空依赖数组，仅在组件挂载时执行
  
  // 监听refreshRate变化
  useEffect(() => {
    // 当refreshRate变化时重设定时器
    handleRefreshRateChange(refreshRate);
  }, [refreshRate]);
  
  // 整理折线图数据格式
  const lineChartData = timeSeriesData.flatMap(item => ([
    { time: item.time, value: item.cpu, category: 'CPU' },
    { time: item.time, value: item.memory, category: '内存' },
    { time: item.time, value: item.network, category: '网络' }
  ]));
  
  // 图表配置
  const lineConfig = {
    data: lineChartData,
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
  
  const areaConfig = {
    data: timeSeriesData.map(item => ({ time: item.time, value: item.memory })),
    xField: 'time',
    yField: 'value',
    areaStyle: () => {
      return {
        fill: 'l(270) 0:#ffffff 0.5:#7ec2f3 1:#1890ff',
      };
    },
  };
  
  const columnConfig = {
    data: timeSeriesData.map(item => ({ time: item.time, value: item.network })),
    xField: 'time',
    yField: 'value',
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    meta: {
      time: { alias: '时间' },
      value: { alias: '网络流量' },
    },
  };
  
  const pieConfig = {
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
  
  const gaugeConfig = {
    percent: currentData.cpu / 100,
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
        formatter: () => 'CPU',
        style: ({
          fontSize: '16px',
          lineHeight: 1,
        }),
      },
      content: {
        formatter: () => `${currentData.cpu}%`,
        style: ({
          fontSize: '24px',
          lineHeight: 1,
        }),
      },
    },
  };
  
  const radarConfig = {
    data: [
      { name: 'CPU', value: currentData.cpu },
      { name: '内存', value: currentData.memory },
      { name: '磁盘', value: currentData.disk },
      { name: '网络', value: currentData.network },
      { name: '请求数', value: currentData.requests / 5 },
      { name: '响应时间', value: currentData.response_time / 10 },
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
    percent: currentData.memory / 100,
    statistic: {
      title: {
        style: {
          fontSize: '16px',
          lineHeight: 1,
        },
        formatter: () => '内存使用',
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
      { stage: '总请求', value: currentData.requests },
      { stage: '处理中', value: currentData.requests * 0.8 },
      { stage: '已完成', value: currentData.requests * 0.6 },
      { stage: '成功', value: currentData.requests * 0.5 },
    ],
    xField: 'stage',
    yField: 'value',
    legend: false,
  };
  
  const heatmapData = [];
  
  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 7; j++) {
      heatmapData.push({
        hour: String(i).padStart(2, '0') + ':00',
        day: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][j],
        value: getRandomValue(10, 100),
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
        return lineConfig;
      case 'resource':
        return pieConfig;
      default:
        return chartType === 'pie' ? pieConfig : lineConfig;
    }
  };
  
  // 根据图表类型和数据源获取配置
  const getChartConfigByType = (type, dataKey) => {
    switch (type) {
      case 'gauge':
        return {
          ...gaugeConfig,
          percent: currentData[dataKey] / 100,
          statistic: {
            ...gaugeConfig.statistic,
            title: {
              ...gaugeConfig.statistic.title,
              formatter: () => dataKey.toUpperCase(),
            },
            content: {
              ...gaugeConfig.statistic.content,
              formatter: () => `${currentData[dataKey]}%`,
            },
          },
        };
      case 'radar':
        return radarConfig;
      case 'ring':
        return {
          ...ringConfig,
          percent: currentData[dataKey] / 100,
          statistic: {
            ...ringConfig.statistic,
            title: {
              ...ringConfig.statistic.title,
              formatter: () => dataSources.find(ds => ds.key === dataKey)?.name || dataKey,
            },
          },
        };
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
  
  // 打开添加面板模态框
  const showAddPanelModal = () => {
    setAddPanelVisible(true);
  };
  
  // 打开警报设置模态框
  const showAlertSettings = (panel) => {
    setActiveAlertPanel(panel);
    
    // 准备初始值
    const initialValues = {
      alerts: panel.alerts || []
    };
    
    alertForm.setFieldsValue(initialValues);
    setAlertSettingsVisible(true);
  };
  
  // 处理取消添加面板
  const handleCancel = () => {
    form.resetFields();
    setAddPanelVisible(false);
  };
  
  // 处理取消警报设置
  const handleAlertCancel = () => {
    alertForm.resetFields();
    setAlertSettingsVisible(false);
    setActiveAlertPanel(null);
  };
  
  // 处理添加面板
  const handleAddPanel = async () => {
    try {
      setConfirmLoading(true);
      const values = await form.validateFields();
      
      // 为新面板创建唯一ID
      const newPanelId = `panel-${Date.now()}`;
      
      // 创建新面板
      const newPanel = {
        id: newPanelId,
        title: values.title,
        type: values.chartType,
        dataKey: values.dataSource,
        span: values.width,
        height: values.height || 300,
        refreshRate: values.refreshInterval ? values.refreshInterval : null,
        alerts: []
      };
      
      // 添加到面板列表
      setPanels([...panels, newPanel]);
      
      // 更新布局
      const newLayout = {
        ...layout,
        lg: [
          ...layout.lg,
          {
            i: newPanelId,
            x: (layout.lg.length % 3) * 4,
            y: Math.floor(layout.lg.length / 3) * 3,
            w: 4,
            h: 3
          }
        ]
      };
      setLayout(newLayout);
      
      // 显示成功消息
      message.success('成功添加新面板');
      
      // 重置表单并关闭模态框
      form.resetFields();
      setAddPanelVisible(false);
    } catch (error) {
      console.error('表单验证失败:', error);
    } finally {
      setConfirmLoading(false);
    }
  };
  
  // 处理保存警报设置
  const handleSaveAlerts = async () => {
    try {
      const values = await alertForm.validateFields();
      
      // 更新面板警报设置
      const updatedPanels = panels.map(panel =>
        panel.id === activeAlertPanel.id
          ? { ...panel, alerts: values.alerts }
          : panel
      );
      
      setPanels(updatedPanels);
      
      // 显示成功消息
      message.success('警报设置已保存');
      
      // 关闭模态框
      setAlertSettingsVisible(false);
      setActiveAlertPanel(null);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };
  
  // 移除面板
  const removePanel = (panelId) => {
    // 从面板列表中移除
    setPanels(panels.filter(panel => panel.id !== panelId));
    
    // 从布局中移除
    setLayout({
      ...layout,
      lg: layout.lg.filter(item => item.i !== panelId)
    });
    
    // 从活跃警报中移除
    setActiveAlerts(activeAlerts.filter(alert => alert.panelId !== panelId));
    
    message.success('已移除面板');
  };
  
  // 克隆面板
  const clonePanel = (panelId) => {
    const panel = panels.find(p => p.id === panelId);
    if (!panel) return;
    
    // 创建新的ID
    const newPanelId = `panel-clone-${Date.now()}`;
    
    // 克隆面板
    const clonedPanel = {
      ...panel,
      id: newPanelId,
      title: `${panel.title} (副本)`
    };
    
    // 添加到面板列表
    setPanels([...panels, clonedPanel]);
    
    // 更新布局
    const originalLayout = layout.lg.find(item => item.i === panelId);
    if (originalLayout) {
      const newLayout = {
        ...layout,
        lg: [
          ...layout.lg,
          {
            i: newPanelId,
            x: (originalLayout.x + 4) % 12,
            y: originalLayout.y + 3,
            w: originalLayout.w,
            h: originalLayout.h
          }
        ]
      };
      setLayout(newLayout);
    }
    
    message.success('已克隆面板');
  };
  
  // 手动刷新数据
  const handleManualRefresh = () => {
    if (isRefreshingRef.current) {
      message.info('正在刷新中，请稍候...');
      return;
    }
    message.info('正在刷新数据...');
    generateRandomData();
  };
  
  // 处理布局变更
  const handleLayoutChange = (newLayout, layouts) => {
    setLayout(layouts);
  };
  
  // 处理清除所有警报
  const clearAllAlerts = () => {
    setActiveAlerts([]);
    message.success('所有警报已清除');
  };
  
  // 处理清除特定警报
  const clearAlert = (alertId) => {
    setActiveAlerts(activeAlerts.filter(alert => alert.id !== alertId));
    message.success('警报已清除');
  };
  
  // 生成图表组件
  const renderChart = (panel) => {
    const { type, dataKey, height } = panel;
    
    // 安全检查：如果没有数据则显示加载中
    if (timeSeriesData.length === 0) {
      return <div style={{ height: height || 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>加载中...</div>;
    }
    
    const chartHeight = height || 200;
    const config = getChartConfigByType(type, dataKey);
    
    switch (type) {
      case 'line':
        return <Line {...config} height={chartHeight} />;
      case 'area':
        return <Area {...config} height={chartHeight} />;
      case 'column':
        return <Column {...config} height={chartHeight} />;
      case 'pie':
        return <Pie {...config} height={chartHeight} />;
      case 'multi-line':
        return <Line {...config} height={chartHeight} />;
      case 'gauge':
        return <Gauge {...config} height={chartHeight} />;
      case 'radar':
        return <Radar {...config} height={chartHeight} />;
      case 'ring':
        return <RingProgress {...config} height={chartHeight} />;
      case 'funnel':
        return <Funnel {...config} height={chartHeight} />;
      case 'heatmap':
        return <Heatmap {...config} height={chartHeight} />;
      case 'waterfall':
        return <Waterfall {...config} height={chartHeight} />;
      default:
        return <div>未支持的图表类型</div>;
    }
  };

  // 获取当前面板数据
  const getPanelCurrentValue = (dataKey) => {
    if (!currentData || timeSeriesData.length === 0) return '-';
    
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
      default: return '-';
    }
  };

  // 获取面板数据单位
  const getPanelUnit = (dataKey) => {
    const dataSource = dataSources.find(ds => ds.key === dataKey);
    return dataSource ? dataSource.unit : '';
  };

  // 获取面板统计颜色
  const getPanelColor = (dataKey, value) => {
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

  // 为面板准备的刷新率下拉菜单
  const panelRefreshItems = refreshOptions.map(option => ({
    key: option.value,
    label: option.label,
    onClick: (e) => {}  // 这个会在下面被覆盖
  }));
  
  // 为面板添加警报标签
  const getPanelAlertTag = (panel) => {
    if (!panel.alerts || panel.alerts.length === 0) return null;
    
    const value = getPanelCurrentValue(panel.dataKey);
    
    // 检查是否有任何警报被触发
    const triggeredAlerts = panel.alerts.filter(alert => alert.enabled && value >= alert.threshold);
    
    if (triggeredAlerts.length === 0) return null;
    
    const highestSeverity = triggeredAlerts.reduce((highest, alert) => {
      if (alert.type === 'critical') return 'critical';
      if (alert.type === 'warning' && highest !== 'critical') return 'warning';
      return highest;
    }, 'info');
    
    let color, icon;
    switch (highestSeverity) {
      case 'critical':
        color = '#f5222d';
        icon = <WarningOutlined />;
        break;
      case 'warning':
        color = '#faad14';
        icon = <WarningOutlined />;
        break;
      default:
        color = '#1890ff';
        icon = <InfoCircleOutlined />;
    }
    
    return (
      <Tag color={color} icon={icon}>
        {highestSeverity === 'critical' ? '严重警报' : '警告'}
      </Tag>
    );
  };
  
  // 面板操作菜单项
  const getPanelOperationMenuItems = (panelId) => [
    {
      key: 'edit',
      label: '编辑面板',
      icon: <SettingOutlined />,
      onClick: () => {}
    },
    {
      key: 'clone',
      label: '克隆面板',
      icon: <CopyOutlined />,
      onClick: () => clonePanel(panelId)
    },
    {
      key: 'alert',
      label: '设置警报',
      icon: <BellOutlined />,
      onClick: () => {
        const panel = panels.find(p => p.id === panelId);
        if (panel) showAlertSettings(panel);
      }
    },
    {
      key: 'export',
      label: '导出数据',
      icon: <DownloadOutlined />,
      onClick: () => message.info('导出功能待实现')
    },
    {
      key: 'remove',
      label: '移除面板',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => removePanel(panelId)
    }
  ];
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        theme={darkMode ? 'dark' : 'light'}
      >
        <div className="logo" style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
        <Menu
          theme={darkMode ? 'dark' : 'light'}
          mode="inline"
          defaultSelectedKeys={['1']}
          items={[
            {
              key: '1',
              icon: <DashboardOutlined />,
              label: '仪表盘',
            },
            {
              key: '2',
              icon: <SettingOutlined />,
              label: '设置',
            },
            {
              key: '3',
              icon: <BellOutlined />,
              label: <Badge count={activeAlerts.length} size="small">警报</Badge>,
            },
            {
              key: '4',
              icon: <DatabaseOutlined />,
              label: '数据源',
            },
          ]}
        />
        {!collapsed && activeAlerts.length > 0 && (
          <div style={{ 
            padding: '12px',
            margin: '16px', 
            background: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            borderRadius: '4px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <Text strong style={{ color: darkMode ? '#fff' : undefined }}>活跃警报</Text>
              <Button 
                type="link" 
                size="small" 
                onClick={clearAllAlerts}
                style={{ padding: 0, color: darkMode ? '#fff' : undefined }}
              >
                清除全部
              </Button>
            </div>
            <List
              size="small"
              dataSource={activeAlerts.slice(0, 3)}
              renderItem={alert => (
                <List.Item
                  actions={[
                    <Button type="link" size="small" onClick={() => clearAlert(alert.id)}>
                      清除
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge 
                        status={alert.type === 'critical' ? 'error' : 'warning'} 
                        style={{ marginTop: '6px' }}
                      />
                    }
                    title={
                      <Text style={{ color: darkMode ? '#fff' : undefined }}>
                        {alert.panelTitle}
                      </Text>
                    }
                    description={
                      <Text type="secondary" style={{ color: darkMode ? 'rgba(255,255,255,0.6)' : undefined }}>
                        {alert.value.toFixed(1)} {getPanelUnit(alert.dataKey)}
                      </Text>
                    }
                  />
                </List.Item>
              )}
              footer={activeAlerts.length > 3 ? (
                <div style={{ textAlign: 'center' }}>
                  <Button type="link" size="small">
                    查看全部 ({activeAlerts.length})
                  </Button>
                </div>
              ) : null}
            />
          </div>
        )}
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: darkMode ? '#001529' : '#fff',
          }}
        >
          <Row justify="space-between" align="middle" style={{ height: '100%' }}>
            <Col>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: '16px',
                  width: 64,
                  height: 64,
                  color: darkMode ? '#fff' : undefined,
                }}
              />
              <Title level={4} style={{ display: 'inline', margin: '0 16px', color: darkMode ? '#fff' : undefined }}>
                数据看板
              </Title>
              <Badge 
                count={activeAlerts.length} 
                style={{ marginLeft: 8 }}
                offset={[-8, 0]}
                overflowCount={99}
              >
                <Button
                  icon={<BellOutlined />}
                  type={activeAlerts.length > 0 ? "primary" : "default"}
                  danger={activeAlerts.some(a => a.type === 'critical')}
                  style={{ marginRight: 16 }}
                  onClick={() => {/* 显示警报列表 */}}
                >
                  警报
                </Button>
              </Badge>
            </Col>
            <Col>
              <Space size="middle" style={{ marginRight: 16 }}>
                <Dropdown
                  menu={{ 
                    items: dataConnections.map(conn => ({
                      key: conn.id,
                      label: conn.name,
                      icon: <DatabaseOutlined />,
                      disabled: conn.status === 'inactive',
                      onClick: () => handleDataSourceChange(conn.id)
                    }))
                  }}
                  trigger={['click']}
                >
                  <Button icon={<ApiOutlined />}>
                    {dataConnections.find(conn => conn.id === activeDataConnection)?.name || '选择数据源'}
                  </Button>
                </Dropdown>
                
                <RangePicker 
                  showTime 
                  style={{ width: 300 }} 
                />
                
                {/* 刷新控制区域 */}
                <Button 
                  type={showRefreshSettings ? "primary" : "default"}
                  icon={<ClockCircleOutlined />}
                  onClick={() => setShowRefreshSettings(!showRefreshSettings)}
                >
                  刷新设置
                </Button>
                
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={handleManualRefresh}
                  loading={isLoading}
                  disabled={isLoading} // 添加禁用状态防止重复点击
                >
                  立即刷新
                </Button>
                
                <Switch 
                  checkedChildren="暗色" 
                  unCheckedChildren="亮色" 
                  checked={darkMode} 
                  onChange={setDarkMode} 
                />
                
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={showAddPanelModal}
                >
                  添加面板
                </Button>
                
                <Button
                  icon={<SaveOutlined />}
                  onClick={() => message.success('仪表盘配置已保存')}
                >
                  保存配置
                </Button>
              </Space>
            </Col>
          </Row>
        </Header>
        
        {/* 刷新设置面板 */}
        {showRefreshSettings && (
          <div style={{
            padding: '15px 20px',
            background: darkMode ? '#001529' : '#f0f2f5',
            borderBottom: `1px solid ${darkMode ? '#303030' : '#d9d9d9'}`
          }}>
            <Row gutter={16} align="middle">
              <Col span={6}>
                <Space>
                  <Text strong style={{ color: darkMode ? 'white' : undefined }}>全局刷新频率：</Text>
                  <Select 
                    value={refreshRate} 
                    onChange={handleRefreshRateChange}
                    style={{ width: 150 }}
                  >
                    {refreshOptions.map(option => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </Space>
              </Col>
              
              <Col span={6}>
                {refreshRate !== 'off' && (
                  <Space>
                    <Text style={{ color: darkMode ? 'white' : undefined }}>
                      下次刷新在: {formatTimeRemaining(timeRemaining)}
                    </Text>
                    <Progress 
                      percent={progressPercent} 
                      showInfo={false} 
                      size="small" 
                      style={{ width: 100 }} 
                    />
                  </Space>
                )}
              </Col>
              
              <Col span={12}>
                <Text type="secondary" style={{ color: darkMode ? '#aaa' : undefined }}>
                  提示：您也可以为每个面板单独设置刷新频率，点击面板右上角的设置按钮。
                </Text>
              </Col>
            </Row>
          </div>
        )}
        
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: darkMode ? '#141414' : '#fff',
            overflowX: 'hidden'
          }}
        >
          {timeSeriesData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin size="large" />
              <div style={{ marginTop: 20 }}>
                <Statistic value="数据加载中..." />
              </div>
            </div>
          ) : (
            <ResponsiveGridLayout
              className="layout"
              layouts={layout}
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
              cols={{ lg: 12, md: 12, sm: 6, xs: 4 }}
              rowHeight={100}
              onLayoutChange={handleLayoutChange}
              isDraggable={true}
              isResizable={true}
              margin={[16, 16]}
            >
              {panels.map(panel => (
                <div key={panel.id}>
                  <Card
                    title={
                      <Space>
                        <DragOutlined style={{ cursor: 'move', opacity: 0.5 }} />
                        {panel.title}
                        {isLoading && <Badge status="processing" />}
                        {panel.refreshRate && panel.refreshRate !== 'off' && (
                          <Badge 
                            count={`每${panel.refreshRate}刷新`} 
                            style={{ backgroundColor: '#52c41a' }} 
                          />
                        )}
                        {getPanelAlertTag(panel)}
                      </Space>
                    }
                    bordered={true}
                    extra={
                      <Space>
                        <Dropdown 
                          menu={{ 
                            items: panelRefreshItems.map(item => ({
                              ...item, 
                              onClick: () => setPanelRefreshRate(panel.id, item.key)
                            }))
                          }} 
                          trigger={['click']}
                        >
                          <Button 
                            type="text" 
                            icon={<ClockCircleOutlined />} 
                            size="small"
                          />
                        </Dropdown>
                        <Button
                          type="text"
                          icon={<BellOutlined />}
                          size="small"
                          onClick={() => showAlertSettings(panel)}
                        />
                        <Dropdown
                          menu={{ items: getPanelOperationMenuItems(panel.id) }}
                          trigger={['click']}
                        >
                          <Button 
                            type="text" 
                            icon={<MoreOutlined />} 
                            size="small"
                          />
                        </Dropdown>
                      </Space>
                    }
                    style={{ height: '100%', overflow: 'hidden' }}
                  >
                    {panel.type !== 'pie' && panel.type !== 'gauge' && panel.type !== 'radar' && 
                     panel.type !== 'ring' && panel.type !== 'funnel' && panel.type !== 'heatmap' && 
                     panel.type !== 'waterfall' && panel.dataKey !== 'all' && (
                      <>
                        <Statistic 
                          title={`当前${panel.title}`}
                          value={getPanelCurrentValue(panel.dataKey)}
                          suffix={getPanelUnit(panel.dataKey)}
                          precision={panel.dataKey === 'load' || panel.dataKey === 'errors' ? 2 : 1}
                          valueStyle={{ 
                            color: getPanelColor(panel.dataKey, getPanelCurrentValue(panel.dataKey)) 
                          }}
                        />
                        <Divider style={{ margin: '12px 0' }} />
                      </>
                    )}
                    <div style={{ height: 'calc(100% - 80px)', minHeight: '120px' }}>
                      {renderChart(panel)}
                    </div>
                  </Card>
                </div>
              ))}
            </ResponsiveGridLayout>
          )}
        </Content>
        <Footer
          style={{
            textAlign: 'center',
            background: darkMode ? '#001529' : '#f0f2f5',
            color: darkMode ? '#fff' : undefined,
          }}
        >
          <Row justify="space-between">
            <Col>
              <Space>
                <Text style={{ color: darkMode ? '#fff' : undefined }}>
                  数据最后更新时间: {lastUpdated.toLocaleTimeString()}
                </Text>
                {refreshRate !== 'off' && (
                  <Text style={{ color: darkMode ? '#aaa' : 'gray' }}>
                    (下次刷新: {formatTimeRemaining(timeRemaining)})
                  </Text>
                )}
              </Space>
            </Col>
            <Col>
              <Space size="large">
                <Text style={{ color: darkMode ? '#fff' : undefined }}>
                  服务状态: <span style={{ color: '#52c41a' }}>●</span> 正常
                </Text>
                <Text style={{ color: darkMode ? '#fff' : undefined }}>
                  API: <span style={{ color: '#52c41a' }}>●</span> 正常
                </Text>
                <Text style={{ color: darkMode ? '#fff' : undefined }}>
                  数据源: <span style={{ color: '#52c41a' }}>●</span> 已连接
                </Text>
                <Badge count={activeAlerts.length} showZero>
                  <Text style={{ color: darkMode ? '#fff' : undefined }}>
                    活跃警报
                  </Text>
                </Badge>
              </Space>
            </Col>
          </Row>
        </Footer>
      </Layout>

      {/* 添加面板模态框 */}
      <Modal
        title="添加新面板"
        open={addPanelVisible}
        onOk={handleAddPanel}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            chartType: 'line',
            width: 8,
            height: 300,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="title"
                label="面板标题"
                rules={[{ required: true, message: '请输入面板标题' }]}
              >
                <Input placeholder="请输入面板标题" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dataSource"
                label="数据源"
                rules={[{ required: true, message: '请选择数据源' }]}
              >
                <Select 
                  placeholder="请选择数据源"
                  showSearch
                  optionFilterProp="label"
                >
                  {dataSources.map(source => (
                    <Option key={source.key} value={source.key} label={source.name}>
                      <Space>
                        <span>{source.name}</span>
                        <Tag color="blue">{source.category}</Tag>
                        {source.unit && <Tag color="green">{source.unit}</Tag>}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="chartType"
            label="图表类型"
            rules={[{ required: true, message: '请选择图表类型' }]}
          >
            <Radio.Group>
              <Space wrap>
                {chartTypes.map(type => (
                  <Radio value={type.value} key={type.value}>
                    <Space>
                      {type.icon} {type.label}
                    </Space>
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="width"
                label="面板宽度 (1-12列)"
                rules={[{ required: true, message: '请选择面板宽度' }]}
              >
                <Radio.Group>
                  <Radio.Button value={4}>1/3 宽</Radio.Button>
                  <Radio.Button value={6}>1/2 宽</Radio.Button>
                  <Radio.Button value={8}>2/3 宽</Radio.Button>
                  <Radio.Button value={12}>全宽</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="height"
                label="面板高度 (像素)"
              >
                <InputNumber min={200} max={600} step={50} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="refreshInterval"
            label="面板刷新间隔 (可单独设置)"
          >
            <Select placeholder="选择刷新间隔">
              {refreshOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 警报设置模态框 */}
      <Modal
        title={`警报设置 - ${activeAlertPanel?.title || ''}`}
        open={alertSettingsVisible}
        onOk={handleSaveAlerts}
        onCancel={handleAlertCancel}
        width={700}
      >
        <Alert
          message="警报将在指标超过阈值时触发通知。"
          description="您可以为每个面板设置多个警报，包括警告和严重警报。当指标恢复正常时，警报会自动解除。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Form
          form={alertForm}
          layout="vertical"
        >
          <Form.List name="alerts">
            {(fields, { add, remove }) => (
              <>
                {fields.map(field => (
                  <div key={field.key} style={{ marginBottom: 16, background: '#f5f5f5', padding: 16, borderRadius: 4 }}>
                    <Row gutter={16} align="middle">
                      <Col span={6}>
                        <Form.Item
                          {...field}
                          name={[field.name, 'type']}
                          label="警报级别"
                          initialValue="warning"
                          rules={[{ required: true, message: '请选择警报级别' }]}
                        >
                          <Select>
                            <Option value="warning">警告</Option>
                            <Option value="critical">严重</Option>
                            <Option value="info">信息</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...field}
                          name={[field.name, 'threshold']}
                          label={`阈值 (${getPanelUnit(activeAlertPanel?.dataKey || '')})`}
                          rules={[{ required: true, message: '请设置阈值' }]}
                        >
                          <Slider
                            min={0}
                            max={100}
                            marks={{
                              0: '0',
                              25: '25',
                              50: '50',
                              75: '75',
                              100: '100'
                            }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          {...field}
                          name={[field.name, 'threshold']}
                          label="具体值"
                          rules={[{ required: true, message: '请设置阈值' }]}
                        >
                          <InputNumber 
                            style={{ width: '100%' }} 
                            min={0} 
                            max={100}
                            formatter={value => `${value}${getPanelUnit(activeAlertPanel?.dataKey || '')}`}
                            parser={value => value?.replace(getPanelUnit(activeAlertPanel?.dataKey || ''), '')}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          {...field}
                          name={[field.name, 'enabled']}
                          label="启用状态"
                          valuePropName="checked"
                          initialValue={true}
                        >
                          <Switch />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <Button 
                          type="text" 
                          danger 
                          icon={<DeleteOutlined />}
                          onClick={() => remove(field.name)}
                          style={{ marginTop: 30 }}
                        />
                      </Col>
                    </Row>
                    <Form.Item
                      {...field}
                      name={[field.name, 'id']}
                      hidden
                      initialValue={`alert-${Date.now()}-${field.key}`}
                    >
                      <Input />
                    </Form.Item>
                  </div>
                ))}
                <Form.Item>
                  <Button 
                    type="dashed" 
                    onClick={() => add()} 
                    block 
                    icon={<PlusOutlined />}
                  >
                    添加警报条件
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
      
      {/* 数据连接抽屉 */}
      <Drawer
        title="数据源管理"
        placement="right"
        onClose={() => setDataConnectionsDrawerVisible(false)}
        open={dataConnectionsDrawerVisible}
        width={600}
      >
        <Tabs defaultActiveKey="1">
          <TabPane tab="数据源列表" key="1">
            <List
              dataSource={dataConnections}
              renderItem={conn => (
                <List.Item
                  actions={[
                    <Button 
                      type={activeDataConnection === conn.id ? "primary" : "default"}
                      disabled={conn.status === 'inactive'}
                      onClick={() => handleDataSourceChange(conn.id)}
                    >
                      {activeDataConnection === conn.id ? '已连接' : '连接'}
                    </Button>,
                    <Button>编辑</Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge 
                        status={conn.status === 'active' ? 'success' : 'default'} 
                        style={{ marginTop: 8 }}
                      />
                    }
                    title={conn.name}
                    description={
                      <>
                        <div>URL: {conn.url}</div>
                        <div>类型: {conn.type}</div>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </TabPane>
          <TabPane tab="添加数据源" key="2">
            <Form layout="vertical">
              <Form.Item label="数据源名称" required>
                <Input placeholder="输入一个描述性名称" />
              </Form.Item>
              <Form.Item label="数据源类型" required>
                <Select placeholder="选择数据源类型">
                  <Option value="prometheus">Prometheus</Option>
                  <Option value="rest">REST API</Option>
                  <Option value="graphite">Graphite</Option>
                  <Option value="influxdb">InfluxDB</Option>
                  <Option value="mock">模拟数据</Option>
                </Select>
              </Form.Item>
              <Form.Item label="URL" required>
                <Input placeholder="例如: http://prometheus:9090" />
              </Form.Item>
              <Form.Item label="刷新间隔">
                <Select defaultValue="1m">
                  {refreshOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item>
                <Button type="primary">测试连接</Button>
                <Button style={{ marginLeft: 8 }}>保存</Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Drawer>
    </Layout>
  );
};

export default Dashboard;