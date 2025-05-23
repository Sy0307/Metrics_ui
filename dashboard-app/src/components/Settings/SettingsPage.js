import React from 'react';
import { Card, Typography, Divider, Checkbox, Select, Button } from 'antd';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const SettingsPage = () => {
  return (
    <div style={{ padding: '20px' }}>
      <Title level={1} style={{ marginBottom: '24px' }}>设置</Title>

      <Card title={<Title level={3}>界面语言</Title>} style={{ marginBottom: '24px' }}>
        <Paragraph>
          当前语言: <Text strong>中文 (模拟)</Text>
        </Paragraph>
        <Select defaultValue="zh-CN" style={{ width: 200 }} disabled>
          <Option value="zh-CN">中文 (简体)</Option>
          <Option value="en-US">English (US)</Option>
        </Select>
        <Paragraph style={{ marginTop: '10px', color: '#888' }}>
          (语言切换功能将在未来版本中提供。)
        </Paragraph>
      </Card>

      <Divider />

      <Card title={<Title level={3}>通知设置</Title>} style={{ marginBottom: '24px' }}>
        <Paragraph>
          <Checkbox checked={true} disabled> 通过邮件接收告警通知 (模拟复选框)</Checkbox>
        </Paragraph>
        <Paragraph>
          <Checkbox checked={false} disabled> 接收系统更新通知 (模拟复选框)</Checkbox>
        </Paragraph>
        <Paragraph style={{ marginTop: '10px', color: '#888' }}>
          (详细通知配置将在未来版本中提供。)
        </Paragraph>
      </Card>

      <Divider />

      <Card title={<Title level={3}>数据显示</Title>} style={{ marginBottom: '24px' }}>
        <Paragraph>
          默认时间范围: <Text strong>最近24小时 (模拟)</Text>
        </Paragraph>
        <Paragraph>
          图表颜色主题: <Text strong>默认 (模拟)</Text>
        </Paragraph>
        <Select defaultValue="default" style={{ width: 200, marginTop: '5px' }} disabled>
          <Option value="default">默认主题</Option>
          <Option value="dark_mode_friendly">深色模式友好</Option>
          <Option value="high_contrast">高对比度</Option>
        </Select>
        <Paragraph style={{ marginTop: '10px', color: '#888' }}>
          (自定义数据显示选项将在未来版本中提供。)
        </Paragraph>
      </Card>

      <Divider />

      <Card title={<Title level={3}>账户信息</Title>} style={{ marginBottom: '24px' }}>
        <Paragraph>
          用户名: <Text strong>demo_user (模拟)</Text>
        </Paragraph>
        <Paragraph>
          角色: <Text strong>管理员 (模拟)</Text>
        </Paragraph>
        <Button type="primary" disabled style={{ marginTop: '10px' }}>修改密码 (占位)</Button>
        <Paragraph style={{ marginTop: '10px', color: '#888' }}>
          (账户管理功能将在未来版本中提供。)
        </Paragraph>
      </Card>
    </div>
  );
};

export default SettingsPage;
