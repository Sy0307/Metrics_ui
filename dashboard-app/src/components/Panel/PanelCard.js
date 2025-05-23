import React from 'react';
import { Card, Space, Button, Dropdown, Badge, Statistic, Divider, Tag, message } from 'antd';
import {
  DragOutlined,
  ClockCircleOutlined,
  BellOutlined,
  MoreOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  SettingOutlined,
  CopyOutlined,
  DownloadOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import {
  Line, Area, Column, Pie, Gauge, Radar, 
  Heatmap, Waterfall, RingProgress, Funnel 
} from '@ant-design/plots';
import { 
  getUnitForDataKey, getPanelCurrentValue, getPanelColor, 
  getChartConfigByType
} from '../../utils/helpers';
import { refreshOptions } from '../../utils/constants';

const PanelCard = ({
  panel,
  timeSeriesData,
  currentData,
  pieData,
  isLoading,
  darkMode,
  onRefreshRateChange,
  onShowAlertSettings,
  onRemovePanel,
  onClonePanel
}) => {
  // 为面板准备的刷新率下拉菜单
  const panelRefreshItems = refreshOptions.map(option => ({
    key: option.value,
    label: option.label,
    onClick: () => onRefreshRateChange(panel.id, option.value)
  }));

  // 面板操作菜单项
  const getPanelOperationMenuItems = () => [
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
      onClick: () => onClonePanel(panel.id)
    },
    {
      key: 'alert',
      label: '设置警报',
      icon: <BellOutlined />,
      onClick: () => onShowAlertSettings(panel)
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
      onClick: () => onRemovePanel(panel.id)
    }
  ];

  // 为面板添加警报标签
  const getPanelAlertTag = () => {
    if (!panel.alerts || panel.alerts.length === 0) return null;
    
    const value = getPanelCurrentValue(panel.dataKey, currentData);
    
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

  // 渲染图表组件
  const renderChart = () => {
    const { type, dataKey, height } = panel;
    
    // 安全检查：如果没有数据则显示加载中
    if (timeSeriesData.length === 0) {
      return <div style={{ height: height || 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>加载中...</div>;
    }
    
    const chartHeight = height || 200;
    const config = getChartConfigByType(type, dataKey, timeSeriesData, currentData, pieData);
    
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
      case 'map_marker':
        return <div style={{ height: chartHeight, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>地图标记点图表占位符</div>;
      case 'image_overlay':
        return <div style={{ height: chartHeight, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>影像叠加层图表占位符</div>;
      default:
        return <div style={{ height: chartHeight, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>未支持的图表类型</div>;
    }
  };

  return (
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
          {getPanelAlertTag()}
        </Space>
      }
      bordered={true}
      extra={
        <Space>
          <Dropdown 
            menu={{ items: panelRefreshItems }} 
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
            onClick={() => onShowAlertSettings(panel)}
          />
          <Dropdown
            menu={{ items: getPanelOperationMenuItems() }}
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
            value={getPanelCurrentValue(panel.dataKey, currentData)}
            suffix={getUnitForDataKey(panel.dataKey)}
            precision={panel.dataKey === 'load' || panel.dataKey === 'errors' ? 2 : 1}
            valueStyle={{ 
              color: getPanelColor(panel.dataKey, getPanelCurrentValue(panel.dataKey, currentData)) 
            }}
          />
          <Divider style={{ margin: '12px 0' }} />
        </>
      )}
      <div style={{ height: panel.height || 200, minHeight: '120px' }}>
        {renderChart()}
      </div>
    </Card>
  );
};

export default PanelCard;