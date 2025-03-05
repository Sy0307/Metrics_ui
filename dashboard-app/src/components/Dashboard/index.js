import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Form, message } from 'antd';
import DashboardLayout from './DashboardLayout';
import AddPanelModal from './AddPanelModal';
import AlertSettingsModal from './AlertSettingsModal';
import { DataConnectionsDrawer } from './Modals';
import { 
  generateMockData, parseRefreshRate, checkAlerts,
  fetchDataFromAPI
} from '../../utils/helpers';
import { initialPanels, initialLayout, dataConnections } from '../../utils/constants';

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
  const [layout, setLayout] = useState(initialLayout);
  const [panels, setPanels] = useState(initialPanels);
  
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
  
  // 保存自定义数据源
  const [customDataSources, setCustomDataSources] = useState([]);
  
  // 引用计时器和刷新间隔
  const timerRef = useRef(null);
  const lastRefreshTimeRef = useRef(Date.now());
  const currentIntervalRef = useRef(parseRefreshRate(refreshRate));
  const isRefreshingRef = useRef(false);
  
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
      
      // 生成新数据，传递自定义数据源
      const { newTimeSeriesData, newPieData } = generateMockData(timeSeriesData, customDataSources);
      
      // 更新当前值前进行安全检查
      if (newTimeSeriesData.length > 0) {
        const latestData = newTimeSeriesData[newTimeSeriesData.length - 1];
        
        // 创建更新的当前数据对象
        const updatedCurrentData = {
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
        };
        
        // 添加自定义数据源的当前值
        if (customDataSources && customDataSources.length > 0) {
          customDataSources.forEach(source => {
            if (latestData[source.key] !== undefined) {
              updatedCurrentData[source.key] = latestData[source.key];
            }
          });
        }
        
        // 使用批量更新来避免多次重渲染
        setTimeSeriesData(newTimeSeriesData);
        setPieData(newPieData);
        setCurrentData(updatedCurrentData);
        setLastUpdated(new Date());
        
        // 检查是否有告警触发
        const newActiveAlerts = checkAlerts(panels, latestData, activeAlerts);
        // 只有当警报状态改变时才更新
        if (JSON.stringify(newActiveAlerts) !== JSON.stringify(activeAlerts)) {
          setActiveAlerts(newActiveAlerts);
        }
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
  }, [timeSeriesData, panels, activeAlerts, customDataSources]);
  
  // 处理数据源切换
  const handleDataSourceChange = (sourceId) => {
    setActiveDataConnection(sourceId);
    
    // 在真实环境中，这里会重新配置数据获取逻辑
    // 对于演示，我们只刷新数据
    message.success(`已切换到数据源: ${dataConnections.find(conn => conn.id === sourceId)?.name}`);
    generateRandomData();
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
  const handleLayoutChange = (layouts) => {
    setLayout(layouts);
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
  
  // 添加自定义数据源
  const handleAddCustomDataSource = (newDataSource) => {
    // 添加新的自定义数据源
    setCustomDataSources(prevSources => [...prevSources, newDataSource]);
    
    // 重新生成数据以包含新的数据源
    generateRandomData();
  };
  
  // 修改Dashboard布局中的按钮，添加一个显示数据源管理抽屉的按钮
  const toggleDataConnectionsDrawer = () => {
    setDataConnectionsDrawerVisible(!dataConnectionsDrawerVisible);
  };

  return (
    <>
      <DashboardLayout
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        refreshRate={refreshRate}
        setRefreshRate={setRefreshRate}
        showRefreshSettings={showRefreshSettings}
        setShowRefreshSettings={setShowRefreshSettings}
        timeRemaining={timeRemaining}
        progressPercent={progressPercent}
        activeDataConnection={activeDataConnection}
        activeAlerts={activeAlerts}
        lastUpdated={lastUpdated}
        isLoading={isLoading}
        panels={panels}
        setPanels={setPanels}
        layout={layout}
        timeSeriesData={timeSeriesData}
        currentData={currentData}
        pieData={pieData}
        handleManualRefresh={handleManualRefresh}
        handleDataSourceChange={handleDataSourceChange}
        handleRefreshRateChange={handleRefreshRateChange}
        showAddPanelModal={showAddPanelModal}
        clearAllAlerts={clearAllAlerts}
        clearAlert={clearAlert}
        showAlertSettings={showAlertSettings}
        onLayoutChange={handleLayoutChange}
        removePanel={removePanel}
        clonePanel={clonePanel}
        toggleDataConnectionsDrawer={toggleDataConnectionsDrawer}
      />
      
      <AddPanelModal
        visible={addPanelVisible}
        form={form}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        onAdd={handleAddPanel}
        customDataSources={customDataSources}
      />
      
      <AlertSettingsModal
        visible={alertSettingsVisible}
        panel={activeAlertPanel}
        form={alertForm}
        onCancel={handleAlertCancel}
        onSave={handleSaveAlerts}
      />
      
      <DataConnectionsDrawer
        visible={dataConnectionsDrawerVisible}
        onClose={() => setDataConnectionsDrawerVisible(false)}
        activeDataConnection={activeDataConnection}
        handleDataSourceChange={handleDataSourceChange}
        onAddCustomDataSource={handleAddCustomDataSource}
      />
    </>
  );
};

export default Dashboard;