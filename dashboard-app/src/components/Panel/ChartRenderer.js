import React from 'react';
import {
  Line, Area, Column, Pie, Gauge, Radar, 
  Heatmap, Waterfall, RingProgress, Funnel 
} from '@ant-design/plots';
import { getChartConfigByType } from '../../utils/helpers';

const ChartRenderer = ({ 
  type, 
  dataKey, 
  height = 200, 
  timeSeriesData = [], 
  currentData = {}, 
  pieData = [] 
}) => {
  // 安全检查：如果没有数据则显示加载中
  if (timeSeriesData.length === 0) {
    return (
      <div 
        style={{ 
          height: height, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center' 
        }}
      >
        加载中...
      </div>
    );
  }

  const config = getChartConfigByType(type, dataKey, timeSeriesData, currentData, pieData);
  
  switch (type) {
    case 'line':
      return <Line {...config} height={height} />;
    case 'area':
      return <Area {...config} height={height} />;
    case 'column':
      return <Column {...config} height={height} />;
    case 'pie':
      return <Pie {...config} height={height} />;
    case 'multi-line':
      return <Line {...config} height={height} />;
    case 'gauge':
      return <Gauge {...config} height={height} />;
    case 'radar':
      return <Radar {...config} height={height} />;
    case 'ring':
      return <RingProgress {...config} height={height} />;
    case 'funnel':
      return <Funnel {...config} height={height} />;
    case 'heatmap':
      return <Heatmap {...config} height={height} />;
    case 'waterfall':
      return <Waterfall {...config} height={height} />;
    default:
      return <div>未支持的图表类型: {type}</div>;
  }
};

export default ChartRenderer;