# Metrics_ui

一个灵活、强大的数据监控看板，提供类似Grafana的数据可视化和自定义面板功能。

![image.png](https://s2.loli.net/2025/03/05/eyF6QKE9vdiq37G.png)
插图来自[这里](https://www.pixiv.net/artworks/105249921)

## 📊 项目概述

Metrics_ui是一个基于React和Ant Design打造的现代化数据监控看板。它提供直观的数据可视化界面，支持多种图表类型，允许用户自定义数据面板，并具有灵活的实时数据刷新功能。无论是系统监控、业务指标跟踪还是性能分析，Metrics_ui都能满足您的需求。

![Metrics_ui预览](https://s2.loli.net/2025/03/05/srO7xFnZlmWzQB1.png)

## ✨ 主要特性

- **动态数据面板**：支持添加、删除和自定义数据面板
- **多种图表类型**：折线图、面积图、柱状图、饼图等
- **实时数据更新**：灵活控制全局或单个面板的刷新频率
- **自适应布局**：面板大小和位置可自定义，满足不同显示需求
- **暗色/亮色主题**：内置主题切换，适应不同工作环境
- **指标告警**：基于阈值的颜色编码指示系统
- **时间范围选择**：支持自定义数据显示的时间范围
- **响应式设计**：适配不同屏幕尺寸的设备

## 🛠️ 技术栈

- **前端框架**：React 17+
- **UI组件库**：Ant Design 4+
- **图表库**：Ant Design Plots / Recharts
- **状态管理**：React Hooks
- **样式**：CSS-in-JS

## 📥 安装指南

### 前提条件

- Node.js 14.0.0 或更高版本
- npm 6.14.0 或更高版本

### 安装步骤

1. 克隆仓库：

```bash
git clone https://github.com/yourusername/metrics_ui.git
cd metrics_ui
```

2. 安装依赖：

```bash
npm install

# 或使用Yarn
yarn install
```

3. 启动开发服务器：

```bash
npm start

# 或使用Yarn
yarn start
```

应用将在开发模式下运行，访问 [http://localhost:3000](http://localhost:3000) 查看。

## 🚀 部署指南

### 构建生产版本

```bash
npm run build

# 或使用Yarn
yarn build
```

构建后的文件将生成在`build`文件夹，可以部署到任何静态文件服务器。

### 使用Docker部署

1. 创建Dockerfile（已包含在项目中）：

```dockerfile
FROM node:14-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. 构建Docker镜像：

```bash
docker build -t metrics_ui .
```

3. 运行Docker容器：

```bash
docker run -p 80:80 metrics_ui
```

### 使用Nginx配置

TODO

### 环境变量配置

可以通过`.env`文件或直接在服务器上设置以下环境变量：

```
REACT_APP_API_URL=https://your-backend-api.com
REACT_APP_REFRESH_INTERVAL=60000
```

## 📝 使用指南

### 添加新面板

1. 点击顶部导航栏中的"添加面板"按钮
2. 在弹出的对话框中配置面板参数：
   - 面板标题
   - 数据源
   - 图表类型
   - 面板尺寸
   - 刷新频率（可选）
3. 点击"确定"按钮完成添加

### 设置刷新频率

1. 点击顶部导航栏中的"刷新设置"按钮
2. 在下拉菜单中选择全局刷新频率
3. 或者点击单个面板右上角的时钟图标，为该面板单独设置刷新频率

### 自定义时间范围

使用顶部导航栏中的日期选择器，选择要查看的数据时间范围。

### 切换主题

点击顶部导航栏中的主题切换开关，在暗色和亮色主题之间切换。

## 🤝 贡献指南

欢迎为Metrics_ui贡献代码或提出建议！请遵循以下步骤：

1. Fork本仓库
2. 创建您的特性分支(`git checkout -b feature/amazing-feature`)
3. 提交您的更改(`git commit -m 'Add some amazing feature'`)
4. 推送到分支(`git push origin feature/amazing-feature`)
5. 打开一个Pull Request

## 📄 许可证

根据MIT许可证发布。

## 👏 致谢

- [Ant Design](https://ant.design/) - UI组件库
- [Recharts](https://recharts.org/) - 图表库
- [React](https://reactjs.org/) - 前端框架

