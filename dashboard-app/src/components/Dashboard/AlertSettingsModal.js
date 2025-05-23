import React from 'react';
import { Modal, Form, Input, Select, Button, Alert, Row, Col, Slider, Switch, InputNumber, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { getUnitForDataKey } from '../../utils/helpers';
import { agriculturalAlertConditions, dataSources } from '../../utils/constants';

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
                    <Col span={5}>
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
                    <Col span={7}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'conditionKey']}
                        label="警报条件"
                        rules={[{ required: true, message: '请选择警报条件' }]}
                      >
                        <Select placeholder="选择条件">
                          {agriculturalAlertConditions
                            .filter(cond => cond.dataKey === panel.dataKey)
                            .map(cond => (
                              <Option key={cond.key} value={cond.key}>
                                {cond.name} ({cond.comparison === 'above' ? '>' : cond.comparison === 'below' ? '<' : '='} 阈值)
                              </Option>
                            ))}
                          {/* Fallback for non-agricultural or general conditions */}
                          {agriculturalAlertConditions.filter(cond => cond.dataKey === panel.dataKey).length === 0 && (
                             dataSources.some(ds => ds.key === panel.dataKey && ds.category !== '农田传感数据' && ds.category !== '遥感影像数据' && ds.category !== '气象数据') && (
                              <>
                                <Option value="above_threshold">高于阈值</Option>
                                <Option value="below_threshold">低于阈值</Option>
                              </>
                            )
                          )}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'threshold']}
                        label={`阈值 (${getUnitForDataKey(panel.dataKey)})`}
                        rules={[{ required: true, message: '请设置阈值' }]}
                      >
                        {/* Using InputNumber directly for more flexibility with agricultural data */}
                        <InputNumber 
                          style={{ width: '100%' }}
                          min={0} // Consider making min/max dynamic based on dataKey
                          // max={100} // Max might not always be 100 for agricultural data
                          formatter={value => `${value}${getUnitForDataKey(panel.dataKey) || ''}`}
                          parser={value => value?.replace(getUnitForDataKey(panel.dataKey) || '', '')}
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
                        style={{ marginTop: 30 }} // Adjust margin if needed due to new field
                      />
                    </Col>
                  </Row>
                  <Form.Item {...field} name={[field.name, 'id']} hidden initialValue={`alert-${Date.now()}-${field.key}`}><Input /></Form.Item>
                  {/* Store dataKey for easier access in helper, not directly used in form */}
                  <Form.Item {...field} name={[field.name, 'dataKey']} hidden initialValue={panel.dataKey}><Input /></Form.Item>
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