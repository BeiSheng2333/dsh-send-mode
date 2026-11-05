window.__ModuleLoader__.load({
  id: 'dsh-send-mode',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const NS = 'send-mode';
    const QUEUE = 'queue';
    const STEER = 'steer';
    const BEHAVIORS = [QUEUE, STEER];

    const zh = {
      'group.aria': '发送模式',
      'mode.queue': '排队',
      'mode.steer': '引导',
      'mode.queue.title': '排队发送：等当前回复结束后再发送',
      'mode.steer.title': '引导发送：把指令追加到当前任务，AI 会尽快处理',
      'hint': '忙碌时的发送模式：Enter 和发送按钮使用所选模式，Cmd/Ctrl+Enter 使用另一模式',
      'error': '切换发送模式失败，请重试'
    };
    const en = {
      'group.aria': 'Send mode',
      'mode.queue': 'Queue',
      'mode.steer': 'Steer',
      'mode.queue.title': 'Queue: send after the current reply finishes',
      'mode.steer.title': 'Steer: append the instruction to the current task and let the AI handle it soon',
      'hint': 'Send mode while busy: Enter and the Send button use the selected mode; Cmd/Ctrl+Enter uses the other',
      'error': 'Could not change the send mode, please try again'
    };

    const CSS = `
.dsh-send-mode {
  display: inline-flex;
  align-items: center;
  align-self: stretch;
  gap: 2px;
  padding: 2px;
  margin-right: 2px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(127, 127, 127, 0.28));
  border-radius: 7px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #666);
  font-size: 12px;
  line-height: 18px;
  white-space: nowrap;
  box-sizing: border-box;
}
.dsh-send-mode.is-error {
  border-color: var(--dsw-alias-state-error-primary, #e5484d);
}
.dsh-send-mode__option {
  appearance: none;
  -webkit-appearance: none;
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 7px;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: inherit;
  font: inherit;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  transition: background 120ms ease, color 120ms ease;
}
.dsh-send-mode__option:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgba(127, 127, 127, 0.14));
  color: var(--dsw-alias-label-primary, #222);
}
.dsh-send-mode__option:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary, #5686fe);
  outline-offset: 1px;
}
.dsh-send-mode__option.is-selected {
  background: var(--dsw-alias-interactive-bg-hover, rgba(127, 127, 127, 0.14));
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, #5686fe) 18%, transparent);
  color: var(--dsw-alias-brand-primary, #5686fe);
  font-weight: 600;
}
`;

    function injectStyle() {
      const element = document.createElement('style');
      element.setAttribute('data-plugin-css', 'dsh-send-mode/composer.css');
      element.textContent = CSS;
      document.head.appendChild(element);
      return () => element.remove();
    }

    function readMode(snapshot) {
      if (!snapshot || snapshot.status !== 'ready') return null;
      const value = snapshot.value;
      return value && value.busyEnter === STEER ? STEER : QUEUE;
    }

    function SendModeToggle({ t, form }) {
      const [snapshot, setSnapshot] = React.useState(() => (form ? form.getSnapshot() : null));
      const [pending, setPending] = React.useState(null);
      const [failed, setFailed] = React.useState(false);

      React.useEffect(() => {
        if (!form) return undefined;
        const sync = () => {
          const next = form.getSnapshot();
          setSnapshot(next);
          const nextMode = readMode(next);
          setPending((previous) => (previous !== null && nextMode === previous ? null : previous));
        };
        sync();
        return form.subscribe(sync);
      }, [form]);

      React.useEffect(() => {
        if (!failed) return undefined;
        const timer = setTimeout(() => setFailed(false), 2400);
        return () => clearTimeout(timer);
      }, [failed]);

      if (!form || typeof t !== 'function') return null;

      const current = readMode(snapshot);
      if (current === null) return null;

      const active = pending || current;
      const choose = (mode) => {
        if (pending !== null || mode === current) return;
        setPending(mode);
        setFailed(false);
        let result;
        try {
          result = form.set('busyEnter', mode);
        } catch {
          setPending(null);
          setFailed(true);
          return;
        }
        Promise.resolve(result).then((accepted) => {
          if (accepted === false) {
            setPending(null);
            setFailed(true);
          }
        }, () => {
          setPending(null);
          setFailed(true);
        });
      };

      return h('div', {
        className: 'dsh-send-mode' + (failed ? ' is-error' : ''),
        role: 'group',
        'aria-label': t('group.aria'),
        title: failed ? t('error') : t('hint'),
        'data-dsh-send-mode': active
      }, BEHAVIORS.map((mode) => h('button', {
        key: mode,
        type: 'button',
        className: 'dsh-send-mode__option' + (active === mode ? ' is-selected' : ''),
        'aria-pressed': active === mode,
        'aria-label': t('mode.' + mode + '.title'),
        title: t('mode.' + mode + '.title'),
        onClick: () => choose(mode)
      }, t('mode.' + mode))));
    }

    const inject = ['slots', 'locale', 'configForms'];

    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'send-mode: dictionaries');
      const t = ctx.locale.bind(NS);
      const form = ctx.configForms.get('ui-conversation');

      ctx.effect(() => injectStyle(), 'send-mode: composer styles');

      ctx.slots.inject('conversation.input.right', () => ctx.slots.register({
        name: 'conversation.input.right',
        id: 'dsh-send-mode-toggle',
        order: 10,
        locale: NS,
        inject: () => ({ t, form })
      }, SendModeToggle));
    }

    return { inject, apply };
  }
});
