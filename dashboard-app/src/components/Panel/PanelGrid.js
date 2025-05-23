import React from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import PanelCard from './PanelCard';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

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
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      rowHeight={100}
      onLayoutChange={(layout) => onLayoutChange({ lg: layout })}
      isDraggable
      isResizable
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
            onRefreshRateChange={(rate) => setPanelRefreshRate(panel.id, rate)}
            onShowAlertSettings={() => onShowAlertSettings(panel)}
            onRemove={() => onRemovePanel(panel.id)}
            onClone={() => onClonePanel(panel.id)}
          />
        </div>
      ))}
    </ResponsiveGridLayout>
  );
};

export default PanelGrid; 