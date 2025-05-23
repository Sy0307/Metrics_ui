// dashboard-app/src/components/Reports/AgriculturalReportsPage.js
import React, { useState, useEffect } from 'react';
import { Select, DatePicker, Button, Card, Row, Col, Typography, Statistic, message } from 'antd';
import { Line } from '@ant-design/plots'; // 导入图表组件
import { dataSources } from '../../utils/constants'; // 导入数据源定义
import dayjs from 'dayjs'; // 使用 dayjs 替代 moment

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// 获取农业相关的数据源选项
const agriculturalDataOptions = dataSources.filter(
  ds => ['农田传感数据', '遥感影像数据', '气象数据'].includes(ds.category) &&
    !['crop_health_map', 'weather_forecast', 'historical_weather'].includes(ds.key) // 暂时排除非数值序列型数据
).map(ds => ({ label: `${ds.name} (${ds.key})`, value: ds.key }));


const AgriculturalReportsPage = ({ timeSeriesData, currentData }) => {
  const [selectedDataSourceKey, setSelectedDataSourceKey] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [dateRange, setDateRange] = useState([dayjs().subtract(7, 'day'), dayjs()]);
  const [reportChartData, setReportChartData] = useState([]);
  const [reportStatistics, setReportStatistics] = useState(null);
  const [isReportGenerated, setIsReportGenerated] = useState(false);

  // useEffect for logging props can be kept for debugging
  useEffect(() => {
    // console.log('Reports Page timeSeriesData:', timeSeriesData);
    // console.log('Reports Page currentData:', currentData);
    // Auto-select first available data source
    if (!selectedDataSourceKey && agriculturalDataOptions.length > 0) {
      setSelectedDataSourceKey(agriculturalDataOptions[0].value);
    }
  }, [timeSeriesData, currentData, selectedDataSourceKey]);

  const handleGenerateReport = () => {
    if (!selectedDataSourceKey) {
      message.error('请先选择一个传感器数据源！');
      return;
    }
    if (!timeSeriesData || timeSeriesData.length === 0) {
      message.warn('暂无时间序列数据可用于生成报告。');
      setReportChartData([]);
      setReportStatistics(null);
      setIsReportGenerated(true);
      return;
    }

    // 简化：暂时使用所有传入的 timeSeriesData
    const relevantData = timeSeriesData.map(item => ({
      time: item.time, // 假设 item.time 是可直接用于x轴的格式
      value: item[selectedDataSourceKey] !== undefined && item[selectedDataSourceKey] !== null ? Number(item[selectedDataSourceKey]) : null
    })).filter(item => item.value !== null && !isNaN(item.value));

    if (relevantData.length === 0) {
      message.warn(`所选数据源 "${selectedDataSourceKey}" 在当前时间序列中没有有效数据。`);
      setReportChartData([]);
      setReportStatistics(null);
      setIsReportGenerated(true); // 标记已生成（即使是空报告）
      return;
    }

    const values = relevantData.map(item => item.value);
    const sum = values.reduce((acc, val) => acc + val, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const count = values.length;

    setReportStatistics({
      avg: parseFloat(avg.toFixed(2)),
      min: parseFloat(min.toFixed(2)),
      max: parseFloat(max.toFixed(2)),
      count
    });
    setReportChartData(relevantData);
    setIsReportGenerated(true);
    message.success('报告已生成!');
  };

  const selectedDataSourceInfo = dataSources.find(ds => ds.key === selectedDataSourceKey);
  const yAxisTitle = selectedDataSourceInfo ? `${selectedDataSourceInfo.name} (${selectedDataSourceInfo.unit || ''})` : '值';

  const lineChartConfig = {
    padding: 'auto',
    xField: 'time',
    yField: 'value',
    xAxis: { title: { text: '时间点' } },
    yAxis: { title: { text: yAxisTitle }, minLimit: reportStatistics ? Math.floor(reportStatistics.min) : undefined }, // 确保y轴从最小值附近开始
    smooth: true,
    tooltip: { showCrosshairs: true, shared: true },
    meta: {
      value: { alias: yAxisTitle }
    }
  };


  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>传感器数据汇总报告</Title>
      <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
        <Col xs={24} sm={24} md={8} lg={6}>
          <Card title="报告配置">
            <Text strong>选择传感器数据源:</Text>
            <Select
              style={{ width: '100%', marginBottom: 16, marginTop: 8 }}
              placeholder="选择传感器数据源"
              options={agriculturalDataOptions}
              onChange={value => { setSelectedDataSourceKey(value); setIsReportGenerated(false); }}
              value={selectedDataSourceKey}
            />
            <Text strong>选择时间范围 (当前未使用):</Text>
            <RangePicker
              style={{ width: '100%', marginBottom: 16, marginTop: 8 }}
              onChange={(dates, dateStrings) => { setDateRange(dateStrings); setIsReportGenerated(false); }}
            // value={...} // If you want to make RangePicker a controlled component
            />
            <Button
              type="primary"
              onClick={handleGenerateReport}
              disabled={!selectedDataSourceKey}
              style={{ width: '100%' }}
            >
              生成报告
            </Button>
          </Card>
        </Col>
        <Col xs={24} sm={24} md={16} lg={18}>
          <Card title="报告预览">
            {isReportGenerated && reportStatistics ? (
              <div>
                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col span={6}><Statistic title="平均值" value={reportStatistics.avg} precision={2} suffix={selectedDataSourceInfo?.unit} /></Col>
                  <Col span={6}><Statistic title="最大值" value={reportStatistics.max} precision={2} suffix={selectedDataSourceInfo?.unit} /></Col>
                  <Col span={6}><Statistic title="最小值" value={reportStatistics.min} precision={2} suffix={selectedDataSourceInfo?.unit} /></Col>
                  <Col span={6}><Statistic title="数据点数" value={reportStatistics.count} /></Col>
                </Row>
                {reportChartData.length > 0 ? (
                  <Line {...lineChartConfig} data={reportChartData} />
                ) : (
                  <Text>图表无数据显示。</Text>
                )}
              </div>
            ) : (
              <Text>请选择传感器数据源并点击"生成报告"来查看汇总信息。</Text>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AgriculturalReportsPage;
