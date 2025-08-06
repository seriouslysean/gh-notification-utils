// GitHub Notification Utils

const TYPE_TO_SELECTOR = {
    'pr-merged': '.octicon-git-merge',
    'pr-closed': '.octicon-git-pull-request-closed',
    'issue-closed': '.octicon-issue-closed',
};

const TYPE_META = [
    { type: 'pr-merged', label: 'Merged PRs' },
    { type: 'pr-closed', label: 'Closed PRs' },
    { type: 'issue-closed', label: 'Closed Issues' }
];

const showPanelError = message => {
    let errorEl = document.getElementById('gh-notification-utils-panel-error');
    if (!errorEl) {
        const panel = document.getElementById('gh-notification-utils-panel');
        if (!panel) return;

        const content = panel.querySelector('.gh-notification-utils__content');
        if (!content) return;

        errorEl = document.createElement('div');
        errorEl.id = 'gh-notification-utils-panel-error';
        errorEl.className = 'gh-notification-utils__error';
        content.insertBefore(errorEl, content.firstChild);
    }

    errorEl.textContent = message;
    errorEl.style.display = 'block';
};

const hidePanelError = () => {
    const errorEl = document.getElementById('gh-notification-utils-panel-error');
    if (!errorEl) return;
    errorEl.style.display = 'none';
};

const unwatchNotificationsByType = type => {
    hidePanelError();

    const iconSelector = TYPE_TO_SELECTOR[type];
    if (!iconSelector) {
        showPanelError('Unknown type: ' + type);
        return;
    }

    const items = document.querySelectorAll('.js-notifications-list-item');
    let checkedCount = 0;

    items.forEach(item => {
        if (!item.querySelector(iconSelector)) return;

        const checkbox = item.querySelector('input[type="checkbox"]');
        if (!checkbox || checkbox.checked) return;

        checkbox.click();
        checkedCount++;
    });

    if (checkedCount === 0) {
        showPanelError('No notifications of this type found.');
        return;
    }

    requestAnimationFrame(() => {
        const unsubBtn = Array.from(
            document.querySelectorAll('form[action*="unsubscribe"] button[type="submit"]')
        ).find(btn => btn.textContent.trim().toLowerCase().includes('unsubscribe'));

        if (!unsubBtn) {
            showPanelError('Unsubscribe button not found.');
            return;
        }

        unsubBtn.click();
    });
};

const createFloatingPanel = () => {
    if (document.getElementById('gh-notification-utils-panel')) return;

    const panel = document.createElement('div');
    panel.id = 'gh-notification-utils-panel';
    panel.className = 'gh-notification-utils';

    const content = document.createElement('div');
    content.className = 'gh-notification-utils__content';
    panel.appendChild(content);

    const errorEl = document.createElement('div');
    errorEl.id = 'gh-notification-utils-panel-error';
    errorEl.className = 'gh-notification-utils__error';
    errorEl.style.display = 'none';
    content.appendChild(errorEl);

    const title = document.createElement('div');
    title.textContent = 'GH Notification Utils';
    title.className = 'gh-notification-utils__title';
    content.appendChild(title);

    const form = document.createElement('form');
    form.className = 'gh-notification-utils__form';
    form.onsubmit = e => e.preventDefault();
    content.appendChild(form);

    TYPE_META.forEach(({ type, label }) => {
        const labelEl = document.createElement('label');
        labelEl.className = 'gh-notification-utils__label';
        form.appendChild(labelEl);

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = type;
        checkbox.className = 'gh-notification-utils__checkbox';
        checkbox.checked = true;
        labelEl.appendChild(checkbox);

        const span = document.createElement('span');
        span.textContent = label;
        span.className = 'gh-notification-utils__checkbox-text';
        labelEl.appendChild(span);
    });

    const unwatchBtn = document.createElement('button');
    unwatchBtn.type = 'button';
    unwatchBtn.className = 'gh-notification-utils__button';
    unwatchBtn.textContent = 'Unwatch Selected';
    unwatchBtn.addEventListener('click', () => {
        const checkedTypes = Array.from(
            form.querySelectorAll('input[type="checkbox"]:checked')
        ).map(cb => cb.value);

        checkedTypes.forEach(unwatchNotificationsByType);
    });
    content.appendChild(unwatchBtn);

    const tab = document.createElement('button');
    tab.className = 'gh-notification-utils__tab';
    tab.setAttribute('aria-label', 'Toggle panel');
    tab.type = 'button';
    tab.innerHTML = '<span class="gh-notification-utils__tab-text">Hide</span>';
    panel.appendChild(tab);

    let collapsed = false;
    tab.addEventListener('click', () => {
        collapsed = !collapsed;
        panel.classList.toggle('gh-notification-utils--collapsed', collapsed);
        tab.querySelector('span').textContent = collapsed ? 'Show' : 'Hide';
    });

    document.body.appendChild(panel);
    return panel;
};

const isNotificationsPage = () => window.location.pathname.startsWith('/notifications');

const handlePanelVisibility = () => {
    const existingPanel = document.getElementById('gh-notification-utils-panel');

    if (isNotificationsPage()) {
        if (!existingPanel) createFloatingPanel();
        return;
    }

    if (existingPanel) existingPanel.remove();
};

const init = () => {
    handlePanelVisibility();

    ['turbo:render', 'turbo:load'].forEach(event =>
        document.addEventListener(event, handlePanelVisibility)
    );

    window.addEventListener('popstate', handlePanelVisibility);

    const observer = new MutationObserver(handlePanelVisibility);
    observer.observe(document.body, { childList: true, subtree: true });
};

window.addEventListener('load', init);
