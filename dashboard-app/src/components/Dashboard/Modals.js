import React from 'react';
import { Drawer, Form, Input, Radio, InputNumber, Select, Button, Alert, Row, Col, Space, Tag, Slider, Switch, Tabs, List, Badge, message } from 'antd';
import {
  PlusOutlined, WarningOutlined, DatabaseOutlined, CloseOutlined
} from '@ant-design/icons';
import { refreshOptions, dataConnections } from '../../utils/constants';

const { Option } = Select;
const { TabPane } = Tabs;

export const DataConnectionsDrawer = ({
  visible,
  onClose,
  activeDataConnection,
  handleDataSourceChange,
  onAddCustomDataSource
}) => {
  const [form] = Form.useForm();
  const [customDataSourceForm] = Form.useForm();

  const handleAddDataSource = () => {
    form.validateFields().then(values => {
      const newConnection = {
        id: `conn-${Date.now()}`,
        name: values.name,
        type: values.type,
        url: values.url,
        status: 'active',
        refreshRate: values.refreshRate || '1m'
      };

      message.success(`已添加数据源: ${values.name}`);
      handleDataSourceChange(newConnection.id);
      form.resetFields();
    });
  };

  // 添加自定义数据指标
  const handleAddCustomDataSource = () => {
    customDataSourceForm.validateFields().then(values => {
      // 创建新的数据源定义
      const newDataSource = {
        key: values.key,
        name: values.name,
        unit: values.unit,
        category: values.category
      };

      if (onAddCustomDataSource) {
        onAddCustomDataSource(newDataSource);
        message.success(`已添加自定义数据指标: ${values.name}`);
        customDataSourceForm.resetFields();
      }
    });
  };

  return (
    <Drawer
      title="数据源管理"
      placement="right"
      onClose={onClose}
      open={visible}
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
          <Form
            layout="vertical"
            form={form}
            initialValues={{
              type: 'mock',
              refreshRate: '1m'
            }}
          >
            <Form.Item
              label="数据源名称"
              name="name"
              rules={[{ required: true, message: '请输入数据源名称' }]}
            >
              <Input placeholder="输入一个描述性名称" />
            </Form.Item>
            <Form.Item
              label="数据源类型"
              name="type"
              rules={[{ required: true, message: '请选择数据源类型' }]}
            >
              <Select placeholder="选择数据源类型">
                <Option value="prometheus">Prometheus</Option>
                <Option value="rest">REST API</Option>
                <Option value="graphite">Graphite</Option>
                <Option value="influxdb">InfluxDB</Option>
                <Option value="mock">模拟数据</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="URL"
              name="url"
              rules={[{ required: true, message: '请输入URL' }]}
            >
              <Input placeholder="例如: http://prometheus:9090" />
            </Form.Item>
            <Form.Item
              label="刷新间隔"
              name="refreshRate"
            >
              <Select>
                {refreshOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={handleAddDataSource}>添加数据源</Button>
              <Button style={{ marginLeft: 8 }}>测试连接</Button>
            </Form.Item>
          </Form>
        </TabPane>
        <TabPane tab="添加自定义指标" key="3">
          <Alert
            message="添加自定义数据指标"
            description="您可以添加自定义的数据指标，系统将自动为其生成模拟数据。这些指标可以在添加面板时使用。"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Form
            layout="vertical"
            form={customDataSourceForm}
            initialValues={{
              category: '系统',
              unit: '%'
            }}
          >
            <Form.Item
              label="指标标识符"
              name="key"
              rules={[
                { required: true, message: '请输入指标标识符' },
                { pattern: /^[a-z0-9_]+$/, message: '标识符只能包含小写字母、数字和下划线' }
              ]}
            >
              <Input placeholder="例如: cpu_usage, memory_used" />
            </Form.Item>
            <Form.Item
              label="指标名称"
              name="name"
              rules={[{ required: true, message: '请输入指标名称' }]}
            >
              <Input placeholder="例如: CPU使用率, 内存使用量" />
            </Form.Item>
            <Form.Item
              label="指标类别"
              name="category"
              rules={[{ required: true, message: '请选择指标类别' }]}
            >
              <Select>
                <Option value="系统">系统</Option>
                <Option value="应用">应用</Option>
                <Option value="业务">业务</Option>
                <Option value="其他">其他</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="单位"
              name="unit"
            >
              <Select>
                <Option value="%">百分比 (%)</Option>
                <Option value="MB">兆字节 (MB)</Option>
                <Option value="GB">吉字节 (GB)</Option>
                <Option value="ms">毫秒 (ms)</Option>
                <Option value="req/s">请求/秒 (req/s)</Option>
                <Option value="">无单位</Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={handleAddCustomDataSource}>添加指标</Button>
            </Form.Item>
          </Form>
        </TabPane>
      </Tabs>
    </Drawer>
  );
};