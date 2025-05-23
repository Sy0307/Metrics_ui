import React from 'react';
import { List, Typography, Tag, Button, Space, Card } from 'antd';
import { dataConnections } from '../../utils/constants'; // Step 2.1

const { Title, Text } = Typography;

const DataSourcesPage = () => { // Step 1.3
  return ( // Step 1.4
    <div style={{ padding: '20px' }}>
      <Title level={1} style={{ marginBottom: '24px' }}>数据源管理</Title>

      <Card>
        <List
          itemLayout="horizontal"
          dataSource={dataConnections} // Step 2.2
          renderItem={item => (
            <List.Item
              actions={[ // Step 2.2.5
                <Button key="refresh" type="primary" disabled>刷新状态</Button>,
                <Button key="edit" disabled>编辑</Button>,
                <Button key="delete" danger disabled>删除</Button>
              ]}
            >
              <List.Item.Meta
                title={<Text strong>{item.name}</Text>} // Step 2.2.1
                description={
                  <Space direction="vertical" size="small">
                    <Text>类型: <Tag>{item.type.toUpperCase()}</Tag></Text> {/* Step 2.2.2 */}
                    <Text>URL/端点: <Text code>{item.url}</Text></Text> {/* Step 2.2.3 */}
                  </Space>
                }
              />
              <div> {/* Step 2.2.4 */}
                <Text>状态: </Text>
                <Tag color={item.status === 'active' ? 'green' : 'grey'}>
                  {item.status === 'active' ? '活动' : '离线'}
                </Tag>
              </div>
            </List.Item>
          )}
        />
      </Card>

      <div style={{ marginTop: '24px', textAlign: 'right' }}>
        <Button type="primary" disabled>
          添加新数据源 (占位)
        </Button>
      </div>
    </div>
  );
};

export default DataSourcesPage; // Step 3
