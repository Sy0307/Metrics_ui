import React, { useState } from 'react';
import { Row, Col, Typography, Select, Button, DatePicker, Card, Divider, Space, message } from 'antd';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const AgriculturalReportsPage = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('plot_health'); // Default template

  const handleGenerateReport = () => {
    message.info(`即将生成报告 (模板: ${selectedTemplate}) - 功能开发中`);
    console.log('Generate report clicked for template:', selectedTemplate);
  };

  return (
    <div style={{ padding: '20px' }}>
      <Title level={1} style={{ marginBottom: '24px' }}>农业报告中心</Title>
      <Divider />

      <Row gutter={[24, 24]}>
        {/* 报告配置区 */}
        <Col xs={24} md={8} lg={7}>
          <Title level={2} style={{ marginBottom: '16px' }}>报告配置</Title>
          
          <Card>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Text strong style={{ marginBottom: '8px', display: 'block' }}>选择报告模板:</Text>
                <Select 
                  defaultValue={selectedTemplate} 
                  style={{ width: '100%' }} 
                  onChange={(value) => setSelectedTemplate(value)}
                >
                  <Option value="plot_health">地块健康报告</Option>
                  <Option value="sensor_summary">传感器数据汇总报告</Option>
                  <Option value="crop_cycle_tracking">作物生长周期追踪报告 (示例)</Option>
                  <Option value="pest_disease_warning">病虫害预警报告 (示例)</Option>
                </Select>
              </div>

              <div>
                <Text strong style={{ marginBottom: '8px', display: 'block' }}>选择报告参数 (占位):</Text>
                <Paragraph type="secondary">根据选中的模板，此处将显示不同的参数选项。</Paragraph>
                
                <Space direction="vertical" style={{ width: '100%' }}>
                  <DatePicker.RangePicker style={{ width: '100%' }} disabled />
                  <Select placeholder="选择地块 (占位)" style={{ width: '100%' }} disabled>
                    <Option value="plot_a">地块A</Option>
                    <Option value="plot_b">地块B</Option>
                  </Select>
                  {selectedTemplate === 'sensor_summary' && (
                    <Select placeholder="选择传感器类型 (占位)" style={{ width: '100%' }} disabled>
                      <Option value="temp">温度</Option>
                      <Option value="humidity">湿度</Option>
                    </Select>
                  )}
                </Space>
              </div>
              
              <Button 
                type="primary" 
                onClick={handleGenerateReport} 
                style={{ width: '100%' }}
                // disabled // Enable to test onClick message
              >
                生成报告
              </Button>
            </Space>
          </Card>
        </Col>

        {/* 报告展示区 */}
        <Col xs={24} md={16} lg={17}>
          <Title level={2} style={{ marginBottom: '16px' }}>报告预览</Title>
          <Card style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Paragraph type="secondary" style={{ textAlign: 'center' }}>
              选择报告模板并配置参数后，将在此处显示报告内容。
              <br />
              (例如：图表、数据表格、分析摘要等)
            </Paragraph>
            {/* Example placeholder for a chart image or table */}
            {/* <img src="https://via.placeholder.com/600x300.png?text=模拟图表" alt="模拟图表" style={{maxWidth: '100%', marginTop: '20px'}}/> */}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AgriculturalReportsPage;
