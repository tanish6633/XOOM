// Mobile Bottom Navigation Injection
(function () {
    // 1. Inject CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/mobile-core.css';
    document.head.appendChild(link);

    // 2. Define Navigation Items
    const navItems = [
        { name: 'Home', icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>', url: 'dashboard.html' },
        { name: 'Market', icon: '<line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line>', url: 'market.html' },
        { name: 'Inventory', icon: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line>', url: 'inventory.html' },
        { name: 'Chat', icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>', url: 'chat.html' },
        { name: 'Profile', icon: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>', url: 'profile.html' }
    ];

    // 3. Create Nav Element
    const nav = document.createElement('nav');
    nav.id = 'mobile-bottom-nav';

    // 4. Generate Links
    const currentPath = window.location.pathname.split('/').pop() || 'dashboard.html';

    navItems.forEach(item => {
        const isActive = currentPath.includes(item.url.split('.')[0]); // simple match

        const a = document.createElement('a');
        a.href = item.url;
        a.className = `nav-item ${isActive ? 'active' : ''}`;
        a.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                ${item.icon}
            </svg>
            <span>${item.name}</span>
        `;
        nav.appendChild(a);
    });

    // 5. Append to Body
    document.body.appendChild(nav);

    // 6. Add Bottom Padding Buffer so content isn't hidden
    const spacer = document.createElement('div');
    spacer.style.height = '80px';
    document.body.appendChild(spacer);

})();
