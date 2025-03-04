import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Layout, Menu, Card, Row, Col, Typography, Dropdown, Button, 
  Space, DatePicker, Select, Switch, Statistic, Divider, Modal,
  Form, Input, Radio, InputNumber, message, Badge, Progress
} from 'antd';
import {
  DashboardOutlined, SettingOutlined, MoreOutlined,
  ReloadOutlined, PlusOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
  LineChartOutlined, AreaChartOutlined, BarChartOutlined, PieChartOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { Line, Area, Column, Pie } from '@ant-design/plots';

const { Header, Sider, Content, Footer } = Layout;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// 数据源选项
const dataSources = [
  { key: 'cpu', name: 'CPU使用率' },
  { key: 'memory', name: '内存使用率' },
  { key: 'network', name: '网络流量' },
  { key: 'disk', name: '磁盘使用率' },
  { key: 'user', name: '用户会话数' },
  { key: 'load', name: '系统负载' },
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

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [refreshRate, setRefreshRate] = useState('1m');
  const [showRefreshSettings, setShowRefreshSettings] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  
  // 面板管理状态
  const [panels, setPanels] = useState([
    { id: 'cpu-panel', title: 'CPU使用率', type: 'line', dataKey: 'cpu', span: 8, refreshRate: null },
    { id: 'memory-panel', title: '内存使用率', type: 'area', dataKey: 'memory', span: 8, refreshRate: null },
    { id: 'network-panel', title: '网络流量', type: 'column', dataKey: 'network', span: 8, refreshRate: null },
    { id: 'resource-panel', title: '资源分配', type: 'pie', dataKey: 'resource', span: 8, refreshRate: null },
    { id: 'overview-panel', title: '系统指标概览', type: 'multi-line', dataKey: 'all', span: 16, refreshRate: null },
  ]);
  
  // 添加面板模态框状态
  const [addPanelVisible, setAddPanelVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm();
  
  // 数据状态
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [currentData, setCurrentData] = useState({
    cpu: 0,
    memory: 0,
    network: 0,
    disk: 0,
    user: 0,
    load: 0
  });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  
  // 引用计时器和刷新间隔
  const timerRef = useRef(null);
  const lastRefreshTimeRef = useRef(Date.now());
  const currentIntervalRef = useRef(parseRefreshRate(refreshRate));
  const isRefreshingRef = useRef(false); // 新增：跟踪刷新状态
  
  // 生成随机数据 - 修复卡顿问题
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
          load: getRandomValue(1, 8, 2)
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
              load: 5
            };
        
        // 基于前一个值添加合理的波动
        const newDataPoint = {
          time: latestTime,
          cpu: getFluctuatedValue(prevData.cpu, 8, 5, 98, 1),
          memory: getFluctuatedValue(prevData.memory, 5, 10, 95, 1),
          network: getFluctuatedValue(prevData.network, 15, 5, 100, 1),
          disk: getFluctuatedValue(prevData.disk, 3, 30, 99, 1),
          user: getFluctuatedValue(prevData.user, 10, 1, 200),
          load: getFluctuatedValue(prevData.load, 1, 0.1, 10, 2)
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
          load: latestData.load
        });
        setLastUpdated(new Date());
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
  }, []); // 移除对timeSeriesData的依赖
  
  // 处理刷新率变更 - 修复定时器问题
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
  
  // 初始化 - 修复依赖问题
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
      case 'all':
        return lineConfig;
      case 'resource':
        return pieConfig;
      default:
        return chartType === 'pie' ? pieConfig : lineConfig;
    }
  };

  // 打开添加面板模态框
  const showAddPanelModal = () => {
    setAddPanelVisible(true);
  };

  // 处理取消添加面板
  const handleCancel = () => {
    form.resetFields();
    setAddPanelVisible(false);
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
        refreshRate: values.refreshInterval ? values.refreshInterval : null
      };
      
      // 添加到面板列表
      setPanels([...panels, newPanel]);
      
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

  // 移除面板
  const removePanel = (panelId) => {
    setPanels(panels.filter(panel => panel.id !== panelId));
    message.success('已移除面板');
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

  // 生成图表组件
  const renderChart = (panel) => {
    const { type, dataKey, height } = panel;
    
    // 安全检查：如果没有数据则显示加载中
    if (timeSeriesData.length === 0) {
      return <div style={{ height: height || 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>加载中...</div>;
    }
    
    const chartHeight = height || 200;
    const config = getDataConfig(dataKey, type);
    
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
      default: return '-';
    }
  };

  // 获取面板数据单位
  const getPanelUnit = (dataKey) => {
    switch (dataKey) {
      case 'cpu': return '%';
      case 'memory': return '%';
      case 'network': return 'Mbps';
      case 'disk': return '%';
      case 'user': return '';
      case 'load': return '';
      default: return '';
    }
  };

  // 获取面板统计颜色
  const getPanelColor = (dataKey, value) => {
    if (dataKey === 'cpu' || dataKey === 'memory' || dataKey === 'disk') {
      if (value > 90) return '#cf1322'; // 危险
      if (value > 70) return '#faad14'; // 警告
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
          ]}
        />
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
            </Col>
            <Col>
              <Space size="middle" style={{ marginRight: 16 }}>
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
                  提示：您也可以为每个面板单独设置刷新频率，点击面板右上角的"设置"按钮。
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
          }}
        >
          {timeSeriesData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Statistic value="数据加载中..." />
            </div>
          ) : (
            <Row gutter={[16, 16]}>
              {panels.map(panel => (
                <Col span={panel.span} key={panel.id}>
                  <Card
                    title={
                      <Space>
                        {panel.title}
                        {isLoading && <Badge status="processing" />}
                        {panel.refreshRate && panel.refreshRate !== 'off' && (
                          <Badge 
                            count={`每${panel.refreshRate}刷新`} 
                            style={{ backgroundColor: '#52c41a' }} 
                          />
                        )}
                      </Space>
                    }
                    bordered={false}
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
                          icon={<SettingOutlined />} 
                          size="small"
                        />
                        <Button 
                          type="text" 
                          icon={<MoreOutlined />} 
                          size="small"
                        />
                        <Button 
                          type="text" 
                          danger
                          size="small"
                          onClick={() => removePanel(panel.id)}
                        >
                          移除
                        </Button>
                      </Space>
                    }
                    style={{ height: '100%' }}
                  >
                    {panel.type !== 'pie' && panel.dataKey !== 'all' && (
                      <>
                        <Statistic 
                          title={`当前${panel.title}`}
                          value={getPanelCurrentValue(panel.dataKey)}
                          suffix={getPanelUnit(panel.dataKey)}
                          precision={panel.dataKey === 'load' ? 2 : 1}
                          valueStyle={{ 
                            color: getPanelColor(panel.dataKey, getPanelCurrentValue(panel.dataKey)) 
                          }}
                        />
                        <Divider />
                      </>
                    )}
                    {renderChart(panel)}
                  </Card>
                </Col>
              ))}
            </Row>
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
                <Select placeholder="请选择数据源">
                  {dataSources.map(source => (
                    <Option key={source.key} value={source.key}>{source.name}</Option>
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
              <Space direction="vertical">
                <Radio value="line">
                  <Space>
                    <LineChartOutlined /> 折线图
                  </Space>
                </Radio>
                <Radio value="area">
                  <Space>
                    <AreaChartOutlined /> 面积图
                  </Space>
                </Radio>
                <Radio value="column">
                  <Space>
                    <BarChartOutlined /> 柱状图
                  </Space>
                </Radio>
                <Radio value="pie">
                  <Space>
                    <PieChartOutlined /> 饼图
                  </Space>
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="width"
                label="面板宽度 (1-24列)"
                rules={[{ required: true, message: '请选择面板宽度' }]}
              >
                <Radio.Group>
                  <Radio.Button value={8}>1/3 宽</Radio.Button>
                  <Radio.Button value={12}>1/2 宽</Radio.Button>
                  <Radio.Button value={16}>2/3 宽</Radio.Button>
                  <Radio.Button value={24}>全宽</Radio.Button>
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
    </Layout>
  );
};

export default Dashboard;