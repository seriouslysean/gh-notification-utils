function unwatchMergedAndClosedPrs(e) {
    e.preventDefault();
    document.querySelectorAll('.js-notifications-list-item').forEach((item) => {
        const isMerged = item.querySelector('.octicon-git-merge') !== null;
        const isClosed = item.querySelector('.octicon-git-pull-request.color-text-danger') !== null;
        if (isMerged || isClosed) {
            const unsubscribeForm = item.querySelector('button[title="Unsubscribe"]');
            if (unsubscribeForm !== null) {
                unsubscribeForm.click();
            }
        }
    });
}

function createContainer(title) {
    const container = document.createElement('div');
    container.classList.add('cs-github-notifications');
    const hr = document.createElement('hr');
    container.appendChild(hr);
    const p = document.createElement('p');
    p.className = 'h6 border-0 color-text-secondary py-2 pl-2 m-0';
    const node = document.createTextNode(title);
    p.appendChild(node);
    container.appendChild(p);
    return container;
}

function createList() {
    const list = document.createElement('ul');
    list.className = 'filter-list pt-2 pl-2';
    return list;
}

function createLink(text) {
    const link = document.createElement('a');
    link.className = 'filter-item';
    const node = document.createTextNode(text);
    link.appendChild(node);
    const item = document.createElement('li');
    item.appendChild(link);
    return item;
}

function init() {
    const target = document.querySelector('.notification-navigation');
    if (target === null) {
        // Unable to find notification sidebar
        return;
    }

    const container = createContainer('Utils');
    const list = createList();
    const unwatchLink = createLink('✌️ Unwatch PRs');
    unwatchLink.addEventListener('click', unwatchMergedAndClosedPrs);
    list.appendChild(unwatchLink);
    container.appendChild(list);
    // container.setAttribute('style', 'opacity: 0.5;');
    target.appendChild(container);
}

window.addEventListener('load', (event) => {
    init();
});
