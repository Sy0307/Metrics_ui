import React from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import PanelCard from '../Panel/PanelCard';

// 创建响应式Grid布局
const ResponsiveGridLayout = WidthProvider(Responsive);

const PanelGrid = ({
  panels,
  layout,
  timeSeriesData,
  currentData,
  pieData,
  isLoading,
  darkMode,
  onLayoutChange,
  setPanelRefreshRate,
  onShowAlertSettings,
  onRemovePanel,
  onClonePanel
}) => {
  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={layout}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
      cols={{ lg: 12, md: 12, sm: 6, xs: 4 }}
      rowHeight={100}
      onLayoutChange={(layout, layouts) => onLayoutChange(layouts)}
      isDraggable={true}
      isResizable={true}
      margin={[16, 16]}
    >
      {panels.map(panel => (
        <div key={panel.id}>
          <PanelCard
            panel={panel}
            timeSeriesData={timeSeriesData}
            currentData={currentData}
            pieData={pieData}
            isLoading={isLoading}
            darkMode={darkMode}
            onRefreshRateChange={setPanelRefreshRate}
            onShowAlertSettings={onShowAlertSettings}
            onRemovePanel={onRemovePanel}
            onClonePanel={onClonePanel}
          />
        </div>
      ))}
    </ResponsiveGridLayout>
  );
};

export default PanelGrid;