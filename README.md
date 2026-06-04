# VidNote AI

一个零依赖的本地视频播放器原型，支持本地视频播放、0.1x 精度倍速、字幕导入、AI 字幕、AI 视频要点总结和章节大纲。项目是纯静态网页，可以直接打开，也可以部署到 GitHub Pages。

## 功能

- 本地上传多个视频文件，生成播放列表。
- 播放、暂停、上一条、下一条、快退、快进、循环、音量、静音、全屏、画中画。
- 0.1x 到 4.0x 倍速播放，支持 0.1 精度调节和常用倍速预设。
- 上一帧、下一帧、时间轴拖动、时间标记、单条标记删除。
- 导入 `.srt` / `.vtt` 字幕，支持字幕叠加显示、偏移调节和 VTT 导出。
- AI 字幕：通过独立的字幕 API 配置，将当前视频以 multipart 方式提交给转写服务。
- AI 总结：通过独立的总结 API 配置，基于字幕或转写文本生成视频要点和章节大纲。

## 快速开始

直接打开：

```text
index.html
```

或者启动本地静态服务：

```bash
npm start
```

然后访问：

```text
http://127.0.0.1:4173
```

本项目不需要构建步骤，也不需要安装运行依赖；`npm start` 只使用 Node.js 内置模块启动本地静态服务。

## AI 配置

设置页分为两套独立配置，可以使用两个不同厂家的服务。

### 字幕 API

用于语音转文字和字幕生成。

```text
Base URL: https://api.openai.com
API Key: 你的 API Key
Endpoint: /v1/audio/transcriptions
字幕模型: whisper-1
字幕语言: zh
```

### 总结 API

用于视频要点总结和章节大纲。

```text
Base URL: https://api.openai.com
API Key: 你的 API Key
Endpoint: /v1/chat/completions
总结模型: gpt-4.1-mini
```

如果字幕和总结来自不同厂家，分别填写各自的 Base URL、API Key、Endpoint 和模型名即可。

## 注意事项

- 浏览器直接调用第三方 API 时，目标服务必须允许 CORS。
- API Key 会保存在当前浏览器的 `localStorage` 中，只适合个人本地使用。
- 如果要公开部署给多人使用，建议增加后端网关，避免 API Key 暴露，并处理大视频上传、鉴权和跨域限制。
- 画质不会凭空变高清；当前播放器播放的是上传的原始视频文件。

## 部署到 GitHub Pages

这个项目是纯静态网页，可以直接部署仓库根目录。

1. 将代码推送到 GitHub。
2. 打开仓库 `Settings`。
3. 进入 `Pages`。
4. Source 选择 `Deploy from a branch`。
5. Branch 选择 `main`，目录选择 `/root`。

## 项目结构

```text
.
├── index.html      # 页面结构
├── styles.css      # 视觉样式
├── app.js          # 播放器交互和 AI 请求逻辑
├── scripts/
│   └── serve.mjs   # 本地静态预览服务
├── .github/
│   └── workflows/
│       └── check.yml
├── package.json    # 本地预览和检查脚本
├── CONTRIBUTING.md
├── SECURITY.md
├── LICENSE
└── README.md
```

## 开发

运行语法检查：

```bash
npm run check
```

本地预览：

```bash
npm start
```

## License

MIT
