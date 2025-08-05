
// --- Floating Panel UI and Bulk Unwatch Tool ---

const TYPE_TO_SELECTOR = {
    'pr-merged': '.octicon-git-merge',
    'pr-closed': '.octicon-git-pull-request-closed',
    'issue-closed': '.octicon-issue-closed',
};

const TYPE_META = [
    {
        type: 'pr-merged',
        label: 'Merged PRs'
    },
    {
        type: 'pr-closed',
        label: 'Closed PRs'
    },
    {
        type: 'issue-closed',
        label: 'Closed Issues'
    }
];

function showPanelError(message) {
    let errorEl = document.getElementById('gh-notification-utils-panel-error');
    if (!errorEl) {
        // If error element doesn't exist yet, create it
        const panel = document.getElementById('gh-notification-utils-panel');
        if (!panel) return;
        const content = panel.querySelector('.gh-notification-utils__content');
        if (!content) return;

        // Create error element
        errorEl = document.createElement('div');
        errorEl.id = 'gh-notification-utils-panel-error';
        errorEl.className = 'gh-notification-utils__error';

        // Insert at the top of content
        content.insertBefore(errorEl, content.firstChild);
    }

    // Set message and display
    errorEl.textContent = message;
    errorEl.style.display = 'block';
}

function hidePanelError() {
    const errorEl = document.getElementById('gh-notification-utils-panel-error');
    if (errorEl) errorEl.style.display = 'none';
}

function unwatchNotificationsByType(type) {
    hidePanelError();
    const iconSelector = TYPE_TO_SELECTOR[type];
    if (!iconSelector) {
        showPanelError('Unknown type: ' + type);
        return;
    }
    // 1. Check all notifications of the given type
    const items = document.querySelectorAll('.js-notifications-list-item');
    let checkedCount = 0;
    items.forEach(item => {
        if (item.querySelector(iconSelector)) {
            // Find the checkbox and check it
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox && !checkbox.checked) {
                checkbox.click();
                checkedCount++;
            }
        }
    });
    if (checkedCount === 0) {
        showPanelError('No notifications of this type found.');
        return;
    }
    // 2. Click the Unsubscribe button in the bulk action bar
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            const unsubBtn = Array.from(document.querySelectorAll('form[action*="unsubscribe"] button[type="submit"]'))
                .find(btn => btn.textContent.trim().toLowerCase().includes('unsubscribe'));
            if (unsubBtn) {
                unsubBtn.click();
            } else {
                showPanelError('Unsubscribe button not found.');
            }
        });
    });
}


function createFloatingPanel() {
    if (document.getElementById('gh-notification-utils-panel')) return;
    // Main container
    const panel = document.createElement('div');
    panel.id = 'gh-notification-utils-panel';
    panel.className = 'gh-notification-utils';

    // Panel content wrapper
    const content = document.createElement('div');
    content.className = 'gh-notification-utils__content';
    panel.appendChild(content);

    // Create error container at the top (initially hidden)
    const errorEl = document.createElement('div');
    errorEl.id = 'gh-notification-utils-panel-error';
    errorEl.className = 'gh-notification-utils__error';
    errorEl.style.display = 'none';
    content.appendChild(errorEl);

    // Title
    const title = document.createElement('div');
    title.textContent = 'GH Notification Utils';
    title.className = 'gh-notification-utils__title';
    content.appendChild(title);

    // Checkbox form
    const form = document.createElement('form');
    form.className = 'gh-notification-utils__form';
    form.onsubmit = e => e.preventDefault();

    TYPE_META.forEach(({ type, label }) => {
        const labelEl = document.createElement('label');
        labelEl.className = 'gh-notification-utils__label';
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
        form.appendChild(labelEl);
    });
    content.appendChild(form);

    // Unwatch button
    const unwatchBtn = document.createElement('button');
    unwatchBtn.type = 'button';
    unwatchBtn.className = 'gh-notification-utils__button';
    unwatchBtn.textContent = 'Unwatch Selected';
    unwatchBtn.addEventListener('click', () => {
        const checkedTypes = Array.from(form.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
        checkedTypes.forEach(type => unwatchNotificationsByType(type));
    });
    content.appendChild(unwatchBtn);

    // Tab (now inside the panel, absolutely positioned)
    const tab = document.createElement('button');
    tab.className = 'gh-notification-utils__tab';
    tab.setAttribute('aria-label', 'Toggle panel');
    tab.type = 'button';
    tab.innerHTML = '<span class="gh-notification-utils__tab-text">Hide</span>';
    panel.appendChild(tab);

    // Collapse/expand logic
    let collapsed = false;
    tab.addEventListener('click', () => {
        collapsed = !collapsed;
        if (collapsed) {
            panel.classList.add('gh-notification-utils--collapsed');
            tab.querySelector('span').textContent = 'Show';
        } else {
            panel.classList.remove('gh-notification-utils--collapsed');
            tab.querySelector('span').textContent = 'Hide';
        }
    });

    document.body.appendChild(panel);
}

window.addEventListener('load', createFloatingPanel);
