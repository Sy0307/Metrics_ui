import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Row, Col, Space, Tag, Radio, InputNumber } from 'antd';
import { chartTypes, dataSources } from '../../utils/constants';

const { Option } = Select;

// 定义刷新间隔选项
const refreshOptions = [
    { value: 5000, label: '5秒' },
    { value: 10000, label: '10秒' },
    { value: 30000, label: '30秒' },
    { value: 60000, label: '1分钟' },
    { value: 300000, label: '5分钟' },
    { value: 'manual', label: '手动刷新' }
];

const EditPanelModal = ({
    visible,
    panel,
    form,
    confirmLoading,
    onCancel,
    onSave,
    customDataSources = []
}) => {
    // 合并标准数据源和自定义数据源
    const allDataSources = [...dataSources];

    // 添加自定义数据源到选项中
    if (customDataSources && customDataSources.length > 0) {
        customDataSources.forEach(source => {
            // 确保没有重复的key
            if (!allDataSources.some(ds => ds.key === source.key)) {
                allDataSources.push(source);
            }
        });
    }

    // 当面板数据变化时，更新表单值
    useEffect(() => {
        if (panel && visible) {
            form.setFieldsValue({
                title: panel.title,
                dataSource: panel.dataKey,
                chartType: panel.type,
                width: panel.span || 8,
                height: panel.height || 300,
                refreshInterval: panel.refreshRate || 'manual'
            });
        }
    }, [panel, visible, form]);

    if (!panel) return null;

    return (
        <Modal
            title={`编辑面板 - ${panel.title}`}
            open={visible}
            onOk={onSave}
            confirmLoading={confirmLoading}
            onCancel={onCancel}
            width={700}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    title: panel.title,
                    dataSource: panel.dataKey,
                    chartType: panel.type,
                    width: panel.span || 8,
                    height: panel.height || 300,
                    refreshInterval: panel.refreshRate || 'manual'
                }}
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="title"
                            label="面板标题"
                            rules={[{ required: true, message: '请输入面板标题' }]}
                        >
                            <Input placeholder="请输入面板标题" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="dataSource"
                            label="数据源"
                            rules={[{ required: true, message: '请选择数据源' }]}
                        >
                            <Select
                                placeholder="请选择数据源"
                                showSearch
                                optionFilterProp="label"
                            >
                                {/* 标准数据源组 */}
                                <Select.OptGroup label="标准数据源">
                                    {dataSources.map(source => (
                                        <Option key={source.key} value={source.key} label={source.name}>
                                            <Space>
                                                <span>{source.name}</span>
                                                <Tag color="blue">{source.category}</Tag>
                                                {source.unit && <Tag color="green">{source.unit}</Tag>}
                                            </Space>
                                        </Option>
                                    ))}
                                </Select.OptGroup>

                                {/* 自定义数据源组 */}
                                {customDataSources && customDataSources.length > 0 && (
                                    <Select.OptGroup label="自定义数据源">
                                        {customDataSources.map(source => (
                                            <Option key={source.key} value={source.key} label={source.name}>
                                                <Space>
                                                    <span>{source.name}</span>
                                                    <Tag color="purple">{source.category}</Tag>
                                                    {source.unit && <Tag color="green">{source.unit}</Tag>}
                                                    <Tag color="cyan">自定义</Tag>
                                                </Space>
                                            </Option>
                                        ))}
                                    </Select.OptGroup>
                                )}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    name="chartType"
                    label="图表类型"
                    rules={[{ required: true, message: '请选择图表类型' }]}
                >
                    <Radio.Group>
                        <Space wrap>
                            {chartTypes.map(type => (
                                <Radio value={type.value} key={type.value}>
                                    <Space>
                                        {type.icon} {type.label}
                                    </Space>
                                </Radio>
                            ))}
                        </Space>
                    </Radio.Group>
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="width"
                            label="面板宽度 (1-12列)"
                            rules={[{ required: true, message: '请选择面板宽度' }]}
                        >
                            <Radio.Group>
                                <Radio.Button value={4}>1/3 宽</Radio.Button>
                                <Radio.Button value={6}>1/2 宽</Radio.Button>
                                <Radio.Button value={8}>2/3 宽</Radio.Button>
                                <Radio.Button value={12}>全宽</Radio.Button>
                            </Radio.Group>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="height"
                            label="面板高度 (像素)"
                        >
                            <InputNumber min={200} max={600} step={50} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    name="refreshInterval"
                    label="面板刷新间隔 (可单独设置)"
                >
                    <Select placeholder="选择刷新间隔">
                        {refreshOptions.map(option => (
                            <Option key={option.value} value={option.value}>
                                {option.label}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EditPanelModal; 