# Contributing

欢迎提交 issue 和 pull request。这个项目当前定位是一个轻量的静态网页播放器，所以贡献时请优先保持简单、可读、无构建依赖。

## 本地运行

```bash
npm start
```

然后访问：

```text
http://127.0.0.1:4173
```

## 检查

```bash
npm run check
```

## 代码风格

- HTML、CSS、JavaScript 使用 2 空格缩进。
- 不引入构建工具，除非功能已经明显超过静态页面能承载的范围。
- 新功能优先复用现有的 DOM 结构、样式变量和状态管理方式。
- AI API 相关改动需要兼容 OpenAI-style 接口，并避免硬编码私有 Key。

## Pull Request 建议

- 描述改动目的和用户可见行为。
- 说明测试过的浏览器或本地环境。
- 如果改动涉及 AI API，请附上请求格式或兼容说明。
