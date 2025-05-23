import React from 'react';
import { Layout, Row, Col, Button, Space, Typography, Dropdown, Badge, Switch, Menu, Progress, Spin, Statistic, List, DatePicker, Select, message } from 'antd';
import {
  MenuFoldOutlined, MenuUnfoldOutlined, DashboardOutlined, SettingOutlined,
  BellOutlined, DatabaseOutlined, ApiOutlined, ClockCircleOutlined,
  ReloadOutlined, PlusOutlined, SaveOutlined, FileTextOutlined, CarryOutOutlined
} from '@ant-design/icons';
import PanelGrid from './PanelGrid';
import { formatTimeRemaining, getUnitForDataKey } from '../../utils/helpers';
import { refreshOptions, dataConnections } from '../../utils/constants';

const { Header, Sider, Content, Footer } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const DashboardLayout = ({
  collapsed,
  setCollapsed,
  darkMode,
  setDarkMode,
  refreshRate,
  setRefreshRate,
  showRefreshSettings,
  setShowRefreshSettings,
  timeRemaining,
  progressPercent,
  activeDataConnection,
  activeAlerts,
  lastUpdated,
  isLoading,
  panels,
  setPanels,
  layout,
  timeSeriesData,
  currentData,
  pieData,
  handleManualRefresh,
  handleDataSourceChange,
  handleRefreshRateChange,
  showAddPanelModal,
  clearAllAlerts,
  clearAlert,
  showAlertSettings,
  onLayoutChange,
  removePanel,
  clonePanel,
  // Step 3: Receive handleViewChange and currentView
  handleViewChange, 
  currentView,
  children // For Step 4 (rendering content)
}) => {
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
          selectedKeys={[currentView]} // Reflect current view
          onClick={({ key }) => handleViewChange(key)} // Use Menu's own onClick
          items={[
            {
              key: 'dashboard', // Changed key to match view identifier
              icon: <DashboardOutlined />,
              label: '仪表盘',
            },
            {
              key: 'settings', // Changed key
              icon: <SettingOutlined />,
              label: '设置',
            },
            {
              key: 'alerts_center', // Changed key
              icon: <BellOutlined />,
              label: <Badge count={activeAlerts.length} size="small">警报中心</Badge>,
            },
            {
              key: 'data_sources', // Changed key
              icon: <DatabaseOutlined />,
              label: '数据源管理',
            },
            {
              key: 'agricultural_reports', // Changed key
              icon: <FileTextOutlined />,
              label: '农业报告',
            },
            {
              key: 'farm_tasks', // Changed key
              icon: <CarryOutOutlined />,
              label: '农事任务',
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
                        {alert.value.toFixed(1)} {getUnitForDataKey(alert.dataKey)}
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
                  disabled={isLoading}
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
            // overflowX: 'hidden' // Removed for clarity, can be re-added if specific layout issues arise
          }}
        >
          {children} 
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
    </Layout>
  );
};

export default DashboardLayout;