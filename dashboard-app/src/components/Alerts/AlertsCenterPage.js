import React, { useState } from 'react';
import { Table, Typography, Tag, Button, Space, DatePicker, Select, Card, Row, Col } from 'antd';
import { FilterOutlined, EyeOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// 模拟告警数据
const mockAlertsData = [
  {
    id: 'alert-001',
    timestamp: '2024-08-15 10:30:00',
    severity: '严重',
    panelTitle: 'CPU使用率',
    dataKey: 'cpu',
    value: 95,
    threshold: 90,
    conditionName: '高于阈值',
    message: 'CPU使用率当前值为 95%, 超过阈值 90%。',
    status: '活动',
  },
  {
    id: 'alert-002',
    timestamp: '2024-08-15 09:15:00',
    severity: '警告',
    panelTitle: '土壤湿度 (1号地块)',
    dataKey: 'soil_moisture',
    value: 25,
    threshold: 30,
    conditionName: '土壤湿度过低',
    message: '土壤湿度当前值为 25%, 低于阈值 30%。',
    status: '活动',
  },
  {
    id: 'alert-003',
    timestamp: '2024-08-14 17:00:00',
    severity: '信息',
    panelTitle: '网络流量',
    dataKey: 'network',
    value: 75,
    threshold: 70,
    conditionName: '网络流量较高',
    message: '网络流量达到 75 Mbps。',
    status: '已解决',
  },
  {
    id: 'alert-004',
    timestamp: '2024-08-14 14:20:00',
    severity: '严重',
    panelTitle: '内存使用率',
    dataKey: 'memory',
    value: 92,
    threshold: 90,
    conditionName: '高于阈值',
    message: '内存使用率当前值为 92%, 超过阈值 90%。',
    status: '已确认',
  },
  // Add more mock alerts for pagination
  {
    id: 'alert-005',
    timestamp: '2024-08-13 11:00:00',
    severity: '警告',
    panelTitle: '空气温度 (大棚A)',
    dataKey: 'air_temp',
    value: 36,
    threshold: 35,
    conditionName: '空气温度过高',
    message: '空气温度达到 36°C, 超过阈值 35°C。',
    status: '活动',
  },
  {
    id: 'alert-006',
    timestamp: '2024-08-12 08:00:00',
    severity: '严重',
    panelTitle: 'NDVI植被指数 (地块B)',
    dataKey: 'ndvi_index',
    value: 0.2,
    threshold: 0.3,
    conditionName: 'NDVI植被指数偏低',
    message: 'NDVI指数为 0.2, 低于健康阈值 0.3。',
    status: '已解决',
  },
];

const AlertsCenterPage = () => {
  const [alertsData, setAlertsData] = useState(mockAlertsData);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const columns = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      sorter: (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
      defaultSortOrder: 'descend',
    },
    {
      title: '级别',
      dataIndex: 'severity',
      key: 'severity',
      filters: [
        { text: '严重', value: '严重' },
        { text: '警告', value: '警告' },
        { text: '信息', value: '信息' },
      ],
      onFilter: (value, record) => record.severity.includes(value),
      render: (severity) => {
        let color = 'default';
        if (severity === '严重') {
          color = 'error';
        } else if (severity === '警告') {
          color = 'warning';
        } else if (severity === '信息') {
          color = 'blue';
        }
        return <Tag color={color}>{severity}</Tag>;
      },
    },
    {
      title: '来源/面板',
      dataIndex: 'panelTitle',
      key: 'panelTitle',
      sorter: (a, b) => a.panelTitle.length - b.panelTitle.length,
    },
    {
      title: '信息',
      dataIndex: 'message',
      key: 'message',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: '活动', value: '活动' },
        { text: '已确认', value: '已确认' },
        { text: '已解决', value: '已解决' },
      ],
      onFilter: (value, record) => record.status.includes(value),
      render: (status) => {
        let color = 'default';
        if (status === '活动') color = 'red';
        else if (status === '已确认') color = 'orange';
        else if (status === '已解决') color = 'green';
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: '操作',
      key: 'actions',
      render: (text, record) => (
        <Space size="middle">
          <Button icon={<EyeOutlined />} disabled size="small">详情</Button>
          <Button icon={<CheckCircleOutlined />} disabled size="small">标记解决</Button>
        </Space>
      ),
    },
  ];

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  return (
    <div style={{ padding: '20px' }}>
      <Title level={1} style={{ marginBottom: '24px' }}>警报中心</Title>

      <Card style={{ marginBottom: '24px' }}>
        <Title level={4} style={{ marginBottom: '16px' }}>筛选告警</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <RangePicker style={{ width: '100%' }} disabled />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select placeholder="按级别筛选" style={{ width: '100%' }} disabled>
              <Option value="critical">严重</Option>
              <Option value="warning">警告</Option>
              <Option value="info">信息</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select placeholder="按状态筛选" style={{ width: '100%' }} disabled>
              <Option value="active">活动</Option>
              <Option value="acknowledged">已确认</Option>
              <Option value="resolved">已解决</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Button type="primary" icon={<FilterOutlined />} style={{ width: '100%' }} disabled>
              应用筛选
            </Button>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={alertsData}
          rowSelection={rowSelection}
          pagination={{ pageSize: 5 }} // Enabled pagination
        />
      </Card>
    </div>
  );
};

export default AlertsCenterPage;
