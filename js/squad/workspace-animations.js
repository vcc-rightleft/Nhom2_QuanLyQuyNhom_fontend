// =========================================================================
        // 15. POST-OPENING WORKSPACE ANIMATION ENGINE (PHẦN SAU CỦA WEB)
        //     - Continuous Interactive Renaissance Ambient Canvas (#appAmbientCanvas)
        //     - Staggered Spring Cascade on every Role Switch, Sub-Tab & Table Render
        //     - 3D Perspective Mouse-Tilt & Spotlight Glare on Interactive Cards
        //     - Automatic Number Count-Up for all KPIs across Landing/User/Host/Admin
        // =========================================================================
        let mouseNormX = 0;
        let mouseNormY = 0;
        let cursorTrailMotes = [];

        window.addEventListener('mousemove', (e) => {
            mouseNormX = (e.clientX / Math.max(1, window.innerWidth)) - 0.5;
            mouseNormY = (e.clientY / Math.max(1, window.innerHeight)) - 0.5;

            // Spawn subtle golden cursor trail motes when in the main workspace
            const splash = document.getElementById('cinematicIntroSplash');
            if (splash && splash.classList.contains('hidden') && Math.random() < 0.35) {
                cursorTrailMotes.push({
                    x: e.clientX + (Math.random() - 0.5) * 14,
                    y: e.clientY + (Math.random() - 0.5) * 14,
                    vx: (Math.random() - 0.5) * 0.8,
                    vy: -0.5 - Math.random() * 0.9,
                    r: 1.8 + Math.random() * 2.4,
                    alpha: 0.75,
                    color: Math.random() > 0.45 ? '#D4FF00' : '#b88924'
                });
                if (cursorTrailMotes.length > 35) cursorTrailMotes.shift();
            }
        }, { passive: true });

        // 15.1 Continuous Living Renaissance Background Canvas for Main App
        function initAppAmbientCanvas() {
            const canvas = document.getElementById('appAmbientCanvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');

            const ambientClouds = [
                { xRatio: 0.10, yRatio: 0.16, scale: 0.85, speed: 0.012, parallax: 28, tone: 'warm' },
                { xRatio: 0.90, yRatio: 0.15, scale: 0.90, speed: -0.010, parallax: 32, tone: 'gold' },
                { xRatio: 0.06, yRatio: 0.58, scale: 0.95, speed: 0.008, parallax: 40, tone: 'ivory' },
                { xRatio: 0.94, yRatio: 0.62, scale: 0.92, speed: -0.009, parallax: 36, tone: 'warm' }
            ];

            const floatingGoldDust = Array.from({ length: 36 }, () => ({
                x: Math.random(),
                y: Math.random(),
                r: 1.2 + Math.random() * 2.2,
                speedY: 0.00015 + Math.random() * 0.00025,
                phase: Math.random() * Math.PI * 2
            }));

            function renderAmbient(now) {
                // Only render when the opening splash is hidden (or fading out) so we save GPU during intro
                const splash = document.getElementById('cinematicIntroSplash');
                if (splash && !splash.classList.contains('hidden') && !splash.classList.contains('splash-zoom-exit')) {
                    requestAnimationFrame(renderAmbient);
                    return;
                }

                const w = window.innerWidth;
                const h = window.innerHeight;
                if (canvas.width !== w || canvas.height !== h) {
                    canvas.width = w;
                    canvas.height = h;
                }
                ctx.clearRect(0, 0, w, h);

                const t = (now || 0) * 0.001;
                const cx = w / 2 - mouseNormX * 24;
                const cy = h * 0.18 - mouseNormY * 18;

                // A. Rotating Golden Renaissance Sunbeams & Sacred Astrolabe Rings at Top
                ctx.save();
                ctx.translate(cx, cy);
                for (let i = 0; i < 12; i++) {
                    const ang = (i / 12) * Math.PI * 2 + t * 0.025;
                    const grad = ctx.createLinearGradient(0, 0, Math.cos(ang) * w * 0.55, Math.sin(ang) * w * 0.55);
                    grad.addColorStop(0, 'rgba(250, 232, 180, 0.20)');
                    grad.addColorStop(0.6, 'rgba(240, 215, 150, 0.05)');
                    grad.addColorStop(1, 'rgba(240, 215, 150, 0)');
                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.arc(0, 0, w * 0.6, ang - 0.04, ang + 0.04);
                    ctx.closePath();
                    ctx.fill();
                }

                // Rotating dashed golden geometry halo
                ctx.rotate(t * 0.04);
                ctx.strokeStyle = 'rgba(184, 137, 36, 0.16)';
                ctx.lineWidth = 1.2;
                ctx.setLineDash([6, 10]);
                ctx.beginPath();
                ctx.arc(0, 0, Math.min(w, h) * 0.34, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();

                // B. Drifting Painterly Clouds along the edges reacting to mouse parallax
                if (typeof drawWiroPainterlyCloud === 'function') {
                    ambientClouds.forEach((cl, idx) => {
                        const driftX = Math.sin(t * 0.35 + idx * 1.7) * 28 - mouseNormX * cl.parallax;
                        const driftY = Math.cos(t * 0.45 + idx) * 10 - mouseNormY * (cl.parallax * 0.6);
                        drawWiroPainterlyCloud(
                            ctx,
                            cl.xRatio * w + driftX,
                            cl.yRatio * h + driftY,
                            cl.scale,
                            cl.tone,
                            0.55
                        );
                    });
                }

                // C. Floating Golden Dust Motes
                ctx.save();
                floatingGoldDust.forEach((d, idx) => {
                    d.y -= d.speedY;
                    if (d.y < -0.05) d.y = 1.05;
                    const px = (d.x * w) + Math.sin(t * 0.8 + d.phase) * 18 - mouseNormX * 16;
                    const py = (d.y * h) - mouseNormY * 12;
                    const pulse = 0.25 + 0.35 * Math.sin(t * 2.2 + d.phase);
                    ctx.fillStyle = idx % 2 === 0 ? '#b88924' : '#7C3AED';
                    ctx.globalAlpha = pulse;
                    ctx.beginPath();
                    ctx.arc(px, py, d.r, 0, Math.PI * 2);
                    ctx.fill();
                });
                ctx.restore();

                // D. Interactive Mouse Cursor Trail Sparkles
                for (let i = cursorTrailMotes.length - 1; i >= 0; i--) {
                    const m = cursorTrailMotes[i];
                    m.x += m.vx;
                    m.y += m.vy;
                    m.alpha -= 0.024;
                    if (m.alpha <= 0) {
                        cursorTrailMotes.splice(i, 1);
                        continue;
                    }
                    ctx.save();
                    ctx.fillStyle = m.color;
                    ctx.globalAlpha = m.alpha;
                    ctx.beginPath();
                    ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }

                requestAnimationFrame(renderAmbient);
            }
            requestAnimationFrame(renderAmbient);
        }

        // 15.2 Staggered Spring Cascade Animator for Sections, Cards & Table Rows
        function triggerCascadeWithin(containerEl) {
            if (!containerEl) return;

            // 1. Animate major cards & sections
            const blocks = containerEl.querySelectorAll(
                ':scope > section, :scope > .card-clean, .grid > .card-clean, .grid > .card-subtle, .grid > .card-lime, .grid > .card-violet, .grid > .card-coral, .grid > .card-cyan, .grid > .card-amber'
            );
            blocks.forEach((el, idx) => {
                el.classList.remove('stagger-card-in');
                void el.offsetWidth;
                el.style.animationDelay = `${Math.min(idx * 65, 380)}ms`;
                el.classList.add('stagger-card-in');
            });

            // 2. Animate table rows & dynamic list items sequentially
            const rows = containerEl.querySelectorAll(
                'tbody tr, #userInvoicesList > div, #invoiceAllocationPreviewList > div, #retentionCandidatesList > div'
            );
            rows.forEach((row, idx) => {
                row.classList.remove('row-cascade-in');
                void row.offsetWidth;
                row.style.animationDelay = `${Math.min(idx * 45 + 90, 450)}ms`;
                row.classList.add('row-cascade-in');
            });

            // 3. Attach 3D Mouse-Tilt & Spotlight Glare to interactive feature/KPI/group cards
            attachInteractive3DTilt(containerEl);
        }

        // 15.3 3D Perspective Tilt & Radial Spotlight Glare on Interactive Cards
        function attachInteractive3DTilt(root = document) {
            const tiltSelectors = [
                '#view-landing .grid > .card-clean',
                '#userGroupsGrid > .card-clean',
                '#userInvoicesList > .card-subtle',
                '.card-lime',
                '.card-violet',
                '.card-coral',
                '.card-cyan',
                '.card-amber'
            ];
            const cards = root.querySelectorAll(tiltSelectors.join(','));
            cards.forEach(card => {
                if (card.dataset.tiltBound === '1') return;
                card.dataset.tiltBound = '1';
                card.classList.add('neo-tilt-ready');

                const glare = document.createElement('div');
                glare.className = 'neo-spotlight-glare';
                card.appendChild(glare);

                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const pctX = (x / Math.max(1, rect.width)) - 0.5;
                    const pctY = (y / Math.max(1, rect.height)) - 0.5;
                    const rotX = (-pctY * 7).toFixed(2);
                    const rotY = (pctX * 7).toFixed(2);

                    card.style.setProperty('--mouse-x', `${x}px`);
                    card.style.setProperty('--mouse-y', `${y}px`);
                    card.style.transform = `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg) translate(-2px, -2px)`;
                });

                card.addEventListener('mouseleave', () => {
                    card.style.transform = '';
                });
            });
        }

        // 15.4 Hook Cascade & Count-Up Animations into All Role Switches, Sub-Tab Switches & Table Renders
        const _baseSwitchRoleView = switchRoleView;
        switchRoleView = function(role) {
            _baseSwitchRoleView(role);
            const activeMain = document.getElementById(`view-${role}`);
            if (activeMain) {
                triggerCascadeWithin(activeMain);
            }
            if (role === 'admin') {
                animateVndElement(document.querySelector('#view-admin .card-violet .font-mono.text-3xl'), 1845200000);
            }
        };

        const _baseSwitchAuthTab = switchAuthTab;
        switchAuthTab = function(tab) {
            _baseSwitchAuthTab(tab);
            const formEl = document.getElementById(`authForm-${tab}`);
            if (formEl) {
                formEl.classList.remove('stagger-card-in');
                void formEl.offsetWidth;
                formEl.style.animationDelay = '0ms';
                formEl.classList.add('stagger-card-in');
            }
        };

        const _baseSwitchUserSubTab = switchUserSubTab;
        switchUserSubTab = function(sub) {
            _baseSwitchUserSubTab(sub);
            const subEl = document.getElementById(`uSubContent-${sub}`);
            if (subEl) {
                triggerCascadeWithin(subEl);
            }
            if (sub === 'ledger') {
                let sumIn = 0, sumOut = 0;
                fundTransactions.forEach(tx => {
                    if (tx.type === 'in') sumIn += tx.amount;
                    else sumOut += tx.amount;
                });
                animateVndElement(document.getElementById('userLedgerIn'), sumIn, '+');
                animateVndElement(document.getElementById('userLedgerOut'), sumOut, '-');
                animateVndElement(document.getElementById('userLedgerBalance'), sumIn - sumOut);
            }
        };

        const _baseSwitchHostTab = switchHostTab;
        switchHostTab = function(tab) {
            _baseSwitchHostTab(tab);
            const tabEl = document.getElementById(`hTabContent-${tab}`);
            if (tabEl) {
                triggerCascadeWithin(tabEl);
            }
            if (tab === 'fund') {
                animateVndElement(document.getElementById('hostFundBalanceDisplay'), (userJoinedGroups[0]?.balance || 0));
            }
        };

        const _baseSwitchAdminTab = switchAdminTab;
        switchAdminTab = function(tab) {
            _baseSwitchAdminTab(tab);
            const tabEl = document.getElementById(`aTabContent-${tab}`);
            if (tabEl) {
                triggerCascadeWithin(tabEl);
            }
        };

        
        // Hook row cascade animations into dynamic filter/table re-renders
        ['renderUserDebts', 'renderUserInvoices', 'renderUserLedger', 'renderHostMembersTable', 'renderHostFundLedger', 'renderHostDebtsTable', 'renderAdminAccountsTable', 'renderAdminGroupsTable'].forEach(fnName => {
            const origFn = window[fnName];
            if (typeof origFn === 'function') {
                window[fnName] = function(...args) {
                    const res = origFn.apply(this, args);
                    const rows = document.querySelectorAll('main:not(.hidden) tbody tr, main:not(.hidden) #userInvoicesList > div');
                    rows.forEach((row, idx) => {
                        row.classList.remove('row-cascade-in');
                        void row.offsetWidth;
                        row.style.animationDelay = `${Math.min(idx * 40, 360)}ms`;
                        row.classList.add('row-cascade-in');
                    });
                    attachInteractive3DTilt(document.querySelector('main:not(.hidden)') || document);
                    return res;
                };
            }
        });

        // Add floating bob to Host's #DALAT26 sticker card
        document.addEventListener('squad:ready', () => {
            initAppAmbientCanvas();
            const hostCodeSticker = document.getElementById('hostSingleGroupCode')?.closest('.card-lime');
            if (hostCodeSticker) hostCodeSticker.classList.add('float-bob-slow');
            const landingView = document.getElementById('view-landing');
            if (landingView) triggerCascadeWithin(landingView);
        });
