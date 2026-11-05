# dsh-send-mode

在 DeepSeek Harness 输入框的工具栏里切换智能体运行时的发送行为：**排队** 或 **引导**。

![输入框工具栏中的排队/引导开关](docs/images/send-mode-toolbar.png)

## 两种模式

| 模式 | 运行中按 Enter / 点发送时 |
| --- | --- |
| **排队** | 消息进入队列，等当前回复结束后再发送。 |
| **引导** | 指令追加到当前任务，AI 尽快处理；处理前可能继续输出。 |

所选模式决定 Enter 键和发送按钮的行为；`Cmd/Ctrl+Enter` 始终使用另一模式。开关写入的是 DSH Host 的 `ui-conversation.busyEnter` 设置，因此与内置的「设置 → 通用 → 繁忙时的发送行为」是同一份状态，两边双向同步。

## 安装

从 [Releases](https://github.com/BeiSheng2333/dsh-send-mode/releases) 下载 `dsh-send-mode-1.0.0.tgz`：

```bash
dsh plugin --profile desktop add ./dsh-send-mode-1.0.0.tgz
```

也可以在 DSH 插件管理器中选择本仓库目录安装。安装后按提示重载或重启 DSH。

## 结构

- `client.js` — 在 `conversation.input.right` 注册分段开关，通过 `ctx.configForms.get('ui-conversation')` 读写 `busyEnter`。
- `index.js` — Host 侧空实现；这是一个纯客户端插件。
- `cordis.patch.yml` — 向 profile 插入 `dsh-send-mode` 条目。
- `locale/` — 插件卡片文案（界面文案在 `client.js` 中注册到 `send-mode` 命名空间）。
- `icon.svg` — 插件图标。

设置未加载时开关不渲染；写入失败时边框短暂变红并保留原选择。插件不发起网络请求，只读写本地 DSH 设置。

## 兼容性

- 在 DSH `0.2.1-rc.3` 的 Web 客户端上开发和验证。
- 依赖 DSH 自带的 `ui-conversation`（提供槽位和设置命名空间）与 `ui-settings`（提供 ConfigForms），两者默认启用。

## License

MIT © 2026 BeiSheng2333
