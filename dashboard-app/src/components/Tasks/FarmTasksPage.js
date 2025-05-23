import React, { useState } from 'react';
import { Row, Col, Typography, Button, Card, Tag, Space, Modal, Dropdown, Menu, message } from 'antd';
import { PlusOutlined, MoreOutlined, EditOutlined, DeleteOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

// 模拟任务数据
const initialTasks = [
  { id: 'task-1', title: '检查1号地块土壤湿度', description: '携带工具前往1号地块，使用湿度传感器检查并记录数据。', dueDate: '2024-08-05', status: 'todo', priority: '高', assignee: '张三' },
  { id: 'task-2', title: '修剪果树 (区域A)', description: '对A区域的苹果树进行常规修剪。', dueDate: '2024-08-07', status: 'todo', priority: '中', assignee: '李四' },
  { id: 'task-3', title: '准备播种机', description: '清洁并检查播种机，确保所有部件正常工作。', dueDate: '2024-08-06', status: 'inprogress', priority: '高', assignee: '王五' },
  { id: 'task-4', title: '采购肥料 (10袋)', description: '前往农资店采购10袋复合肥。', dueDate: '2024-08-03', status: 'inprogress', priority: '中', assignee: '赵六' },
  { id: 'task-5', title: '完成水稻收割 (B区)', description: 'B区水稻已全部收割完毕并入库。', dueDate: '2024-07-30', status: 'completed', priority: '高', assignee: '张三' },
  { id: 'task-6', title: '提交上周工作报告', description: '整理并提交上周的农事活动报告。', dueDate: '2024-08-01', status: 'completed', priority: '中', assignee: '李四' },
  { id: 'task-7', title: '校准天气监测站设备', description: '检查并校准气象站的各项传感器。', dueDate: '2024-08-10', status: 'todo', priority: '低', assignee: '王五' },
];

const TaskCard = ({ task }) => {
  const menu = (
    <Menu>
      <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => message.info(`编辑任务: ${task.title}`)}>
        编辑
      </Menu.Item>
      <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => message.warning(`删除任务: ${task.title}`)}>
        删除
      </Menu.Item>
    </Menu>
  );

  return (
    <Card
      title={task.title}
      style={{ marginBottom: '16px' }}
      extra={
        <Dropdown overlay={menu} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      }
    >
      <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: '更多' }}>{task.description}</Paragraph>
      <Space direction="vertical" size="small">
        <Text type="secondary">
          <ClockCircleOutlined /> 截止日期: {task.dueDate}
        </Text>
        {task.assignee && <Text>负责人: <Tag>{task.assignee}</Tag></Text>}
        {task.priority && <Text>优先级: <Tag color={task.priority === '高' ? 'red' : task.priority === '中' ? 'orange' : 'blue'}>{task.priority}</Tag></Text>}
      </Space>
    </Card>
  );
};


const FarmTasksPage = () => {
  // eslint-disable-next-line no-unused-vars
  const [tasks, setTasks] = useState(initialTasks);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    message.success('模拟创建新任务成功！');
    setIsModalVisible(false);
    // Here you would typically add new task to the 'tasks' state
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const tasksByStatus = (status) => tasks.filter(task => task.status === status);

  return (
    <div style={{ padding: '20px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Title level={1}>农事任务看板</Title>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
            创建新任务
          </Button>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* 待处理列 */}
        <Col xs={24} sm={12} md={8}>
          <Title level={3} style={{ textAlign: 'center', marginBottom: '16px', padding: '8px', background: '#f0f2f5', borderRadius: '4px' }}>
            待处理 ({tasksByStatus('todo').length})
          </Title>
          {tasksByStatus('todo').map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </Col>

        {/* 进行中列 */}
        <Col xs={24} sm={12} md={8}>
          <Title level={3} style={{ textAlign: 'center', marginBottom: '16px', padding: '8px', background: '#e6f7ff', borderRadius: '4px' }}>
            进行中 ({tasksByStatus('inprogress').length})
          </Title>
          {tasksByStatus('inprogress').map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </Col>

        {/* 已完成列 */}
        <Col xs={24} sm={12} md={8}>
          <Title level={3} style={{ textAlign: 'center', marginBottom: '16px', padding: '8px', background: '#f6ffed', borderRadius: '4px' }}>
            已完成 ({tasksByStatus('completed').length})
          </Title>
          {tasksByStatus('completed').map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </Col>
      </Row>

      <Modal
        title="创建新农事任务 (占位)"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={handleOk}>
            创建任务
          </Button>,
        ]}
      >
        <p>这里将放置创建新任务的表单字段。</p>
        <p>例如：任务标题、描述、截止日期、负责人、优先级等。</p>
      </Modal>
    </div>
  );
};

export default FarmTasksPage;
