document.addEventListener('DOMContentLoaded', () => {

    // --- Theme Management ---
    const themeToggle = document.getElementById('themeToggle');
    // আপনার থিমের ক্লাস নামগুলো এখানে যোগ করুন (শুধুমাত্র আপনার দেওয়া কালার!)
    const themes = [
        'theme-default',        // 00FFFF (Default)
        'theme-custom-1',       // C71585
        'theme-custom-2',       // 9400D3
        'theme-custom-3',       // FF00FF
        'theme-custom-4',       // 00FA9A
        'theme-custom-5',       // 00BFFF
        'theme-custom-6'        // 0000CD
    ];
    let currentThemeIndex = 0;

    // localStorage থেকে শেষ নির্বাচিত থিম লোড করুন
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme && themes.includes(savedTheme)) {
        document.body.classList.add(savedTheme);
        currentThemeIndex = themes.indexOf(savedTheme);
    } else {
        // যদি localStorage এ কোনো থিম না থাকে, তাহলে ডিফল্ট থিম সেট করুন (প্রথমটি)
        document.body.classList.add(themes[0]);
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            // বর্তমান থিম ক্লাস বডি থেকে সরান
            document.body.classList.remove(themes[currentThemeIndex]);

            // পরবর্তী থিমে যান
            currentThemeIndex = (currentThemeIndex + 1) % themes.length;

            // নতুন থিম ক্লাস বডিতে যোগ করুন
            document.body.classList.add(themes[currentThemeIndex]);

            // Save the new theme to localStorage
            localStorage.setItem('selectedTheme', themes[currentThemeIndex]);

            // Format theme name for toast message
            const themeName = themes[currentThemeIndex].replace('theme-', '').replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            showToast(`Theme changed to: ${themeName}`, 2000);
        });
    }

    // --- Toast Message Function ---
    const toastElement = document.getElementById('toast');

    function showToast(message, duration = 3000) {
        if (toastElement) {
            // Clear any existing timeout to prevent rapid clicks from breaking it
            clearTimeout(toastElement.timeoutId);

            toastElement.textContent = message;
            toastElement.classList.add('show');

            toastElement.timeoutId = setTimeout(() => {
                toastElement.classList.remove('show');
            }, duration);
        }
    }

    // --- Custom Cursor Trail ---
    const enableCursorTrail = true; // Set to false to disable

    if (enableCursorTrail) {
        let cursorDots = [];
        const numDots = 10;

        for (let i = 0; i < numDots; i++) {
            const dot = document.createElement('div');
            dot.classList.add('cursor-dot');
            document.body.appendChild(dot);
            cursorDots.push(dot);
        }

        document.addEventListener('mousemove', (e) => {
            cursorDots.forEach((dot, index) => {
                setTimeout(() => {
                    dot.style.left = e.clientX + 'px';
                    dot.style.top = e.clientY + 'px';
                    // Reduce opacity and size as dots trail further
                    dot.style.opacity = 0.6 - (index * (0.6 / numDots));
                    dot.style.transform = `translate(-50%, -50%) scale(${1 - (index * 0.1)})`;
                }, index * 20);
            });
        });

        document.addEventListener('mouseleave', () => {
            cursorDots.forEach(dot => {
                dot.style.opacity = 0;
            });
        });
    }

    // --- Keyboard Navigation Enhancement ---
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('user-is-tabbing');
        }
    });

    document.addEventListener('mousedown', () => {
        document.body.classList.remove('user-is-tabbing');
    });

    // --- Project Card Link Loading Simulation ---
    document.querySelectorAll('.action-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            // Check if the link is just a placeholder
            if (button.getAttribute('href') === '#' || button.getAttribute('href') === '' || button.getAttribute('href') === null) {
                event.preventDefault(); // Prevent default link behavior
                showToast('Loading Please wait..!', 2000);
            } else {
                showToast('Loading project...', 1500);
            }
        });
    });

});
