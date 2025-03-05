import React from 'react';
import { Modal, Form, Input, Select, Button, Alert, Row, Col, Slider, Switch, InputNumber, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { getUnitForDataKey } from '../../utils/helpers';

const { Option } = Select;

const AlertSettingsModal = ({
  visible,
  panel,
  form,
  onCancel,
  onSave
}) => {
  if (!panel) return null;

  return (
    <Modal
      title={`警报设置 - ${panel.title}`}
      open={visible}
      onOk={onSave}
      onCancel={onCancel}
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
        form={form}
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
                        label={`阈值 (${getUnitForDataKey(panel.dataKey)})`}
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
                          formatter={value => `${value}${getUnitForDataKey(panel.dataKey)}`}
                          parser={value => value?.replace(getUnitForDataKey(panel.dataKey), '')}
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
  );
};

export default AlertSettingsModal;