// =========================================================================
        // 14. WIRO.AGENCY MULTI-PLANE RENAISSANCE PAINTING ZOOM ENGINE
        //     Scrolling the mouse wheel zooms deep INTO the nested Renaissance
        //     fresco paintings (Creation of Adam -> School of Athens Archway ->
        //     Inner Sanctuary) while parting painted clouds and revealing the
        //     5 OS chapters until landing in the Registration screen!
        // =========================================================================
        const GATE_Z_POSITIONS = [0, -1250, -2500, -3750, -5000];
        const MAX_CAMERA_Z = 5150;
        let currentCameraZ = 0;
        let targetCameraZ = 0;
        let currentStoryChapter = 0;
        let autoTransitionTriggered = false;
        let zTunnelAnimId = null;

        const chapterHints = [
            'Lớp tranh 01/05: Lăn chuột để đi sâu vào giữa bức bích họa Phục Hưng ↓',
            'Lớp tranh 02/05: Đi xuyên qua tầng mây vào câu chuyện sổ quỹ nhóm ↓',
            'Lớp tranh 03/05: Đi sâu vào vòm cung Trường Học Athens — Mã #DALAT26 & Chia Bill ↓',
            'Lớp tranh 04/05: Nhắc nợ khẩn 1 chạm, quét mã VietQR & Phân quyền 3 vai trò ↓',
            'Lớp tranh 05/05: Cuộn thêm 1 nhịp để đi xuyên tâm bức tranh vào màn Đăng Ký! 🚀'
        ];

        // Volumetric Painted Clouds that bloom from the center and part outward as you zoom into the painting
        const wiroZoomClouds = [
            { sideX: -1, sideY: -0.6, angle: -2.6, baseDist: 0.22, scale: 0.95, speed: 0.9, tone: 'warm' },
            { sideX:  1, sideY: -0.6, angle: -0.5, baseDist: 0.22, scale: 1.00, speed: 1.0, tone: 'warm' },
            { sideX: -1, sideY:  0.5, angle:  2.5, baseDist: 0.26, scale: 1.15, speed: 1.15, tone: 'gold' },
            { sideX:  1, sideY:  0.5, angle:  0.6, baseDist: 0.26, scale: 1.12, speed: 1.10, tone: 'gold' },
            { sideX: -1, sideY:  0.8, angle:  2.1, baseDist: 0.18, scale: 0.90, speed: 1.30, tone: 'ivory' },
            { sideX:  1, sideY:  0.8, angle:  1.0, baseDist: 0.18, scale: 0.92, speed: 1.25, tone: 'ivory' }
        ];

        function drawWiroPainterlyCloud(ctx, cx, cy, scale, tone, alpha = 1) {
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(cx, cy);
            ctx.scale(scale, scale);

            const puffs = [
                { dx: 0, dy: 0, r: 125 },
                { dx: -90, dy: 22, r: 92 },
                { dx: 92, dy: 18, r: 96 },
                { dx: -45, dy: -38, r: 82 },
                { dx: 48, dy: -35, r: 84 },
                { dx: -140, dy: 42, r: 68 },
                { dx: 140, dy: 40, r: 72 }
            ];

            puffs.forEach(p => {
                const gShadow = ctx.createRadialGradient(p.dx, p.dy + 16, p.r * 0.1, p.dx, p.dy + 16, p.r);
                gShadow.addColorStop(0, 'rgba(164, 138, 108, 0.34)');
                gShadow.addColorStop(0.65, 'rgba(186, 164, 138, 0.16)');
                gShadow.addColorStop(1, 'rgba(186, 164, 138, 0)');
                ctx.fillStyle = gShadow;
                ctx.beginPath();
                ctx.arc(p.dx, p.dy + 16, p.r, 0, Math.PI * 2);
                ctx.fill();
            });

            puffs.forEach(p => {
                const gLight = ctx.createRadialGradient(p.dx - p.r * 0.18, p.dy - p.r * 0.2, p.r * 0.05, p.dx, p.dy, p.r);
                if (tone === 'gold') {
                    gLight.addColorStop(0, 'rgba(255, 251, 240, 0.90)');
                    gLight.addColorStop(0.58, 'rgba(246, 231, 198, 0.62)');
                    gLight.addColorStop(1, 'rgba(240, 220, 182, 0)');
                } else {
                    gLight.addColorStop(0, 'rgba(255, 253, 248, 0.92)');
                    gLight.addColorStop(0.60, 'rgba(244, 236, 222, 0.62)');
                    gLight.addColorStop(1, 'rgba(232, 220, 204, 0)');
                }
                ctx.fillStyle = gLight;
                ctx.beginPath();
                ctx.arc(p.dx, p.dy, p.r, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.restore();
        }

        function initZTunnelScrollytelling() {
            const container = document.getElementById('cinematicIntroSplash');
            const bgCanvas = document.getElementById('wiroPaintingCanvas');
            const plane1 = document.getElementById('frescoPlane1');
            const plane2 = document.getElementById('frescoPlane2');
            const plane3 = document.getElementById('frescoPlane3');
            if (!container || !bgCanvas) return;

            const bgCtx = bgCanvas.getContext('2d');

            container.addEventListener('scroll', () => {
                if (autoTransitionTriggered) return;
                const maxScroll = container.scrollHeight - container.clientHeight;
                if (maxScroll <= 0) return;
                const progress = Math.min(1, Math.max(0, container.scrollTop / maxScroll));
                targetCameraZ = progress * MAX_CAMERA_Z;

                const pct = Math.round(progress * 100);
                const fillEl = document.getElementById('scrollyProgressFill');
                if (fillEl) fillEl.style.width = pct + '%';

                const pctBadge = document.getElementById('scrollyPercentBadge');
                if (pctBadge) pctBadge.textContent = `${pct}%`;

                const depthBadge = document.getElementById('scrollyDepthBadge');
                if (depthBadge) depthBadge.textContent = `ĐỘ SÂU TRANH: ${pct}%`;

                if (progress > 0.78) {
                    const chargePct = Math.min(100, Math.max(10, Math.round(((progress - 0.78) / 0.20) * 100)));
                    const cBar = document.getElementById('finalPortalChargeBar');
                    const cTxt = document.getElementById('finalPortalChargeText');
                    if (cBar) cBar.style.width = chargePct + '%';
                    if (cTxt) cTxt.textContent = chargePct + '%';
                }

                // Automatically enter Registration when zooming through the heart of the final painting (>= 98.5%)
                if (progress >= 0.985 && !autoTransitionTriggered) {
                    autoTransitionTriggered = true;
                    triggerStoryFinalTransition('register');
                }
            }, { passive: true });

            function renderPaintingZoomFrame(now) {
                const splash = document.getElementById('cinematicIntroSplash');
                if (!splash || splash.classList.contains('hidden')) {
                    zTunnelAnimId = requestAnimationFrame(renderPaintingZoomFrame);
                    return;
                }

                currentCameraZ += (targetCameraZ - currentCameraZ) * 0.10;
                const p = Math.min(1, Math.max(0, currentCameraZ / MAX_CAMERA_Z));
                const t = (now || 0) * 0.001;

                // 1. MULTI-PLANE RENAISSANCE PAINTING ZOOM (Going deep into the fresco!)
                // Plane 1 (Creation of Adam outer fresco): zooms from 1.0x up to 3.1x and fades out as we dive into the sky
                if (plane1) {
                    const sc1 = 1 + p * 2.15;
                    const op1 = Math.max(0, Math.min(0.68, 0.68 - Math.max(0, p - 0.32) * 1.45));
                    plane1.style.transform = `scale(${sc1.toFixed(3)})`;
                    plane1.style.opacity = op1.toFixed(3);
                }

                // Plane 2 (School of Athens Grand Archway): emerges from the center (0.42x -> 2.85x) as you zoom deeper
                if (plane2) {
                    const sc2 = 0.42 + p * 2.45;
                    let op2 = 0;
                    if (p < 0.15) op2 = (p / 0.15) * 0.45;
                    else if (p < 0.72) op2 = 0.45 + ((p - 0.15) / 0.57) * 0.25;
                    else op2 = Math.max(0, 0.70 - ((p - 0.72) / 0.28) * 0.70);
                    plane2.style.transform = `scale(${sc2.toFixed(3)})`;
                    plane2.style.opacity = op2.toFixed(3);
                }

                // Plane 3 (Inner Sanctuary Fresco): emerges deep inside Raphael's central arch (0.22x -> 1.85x)
                if (plane3) {
                    const sc3 = 0.22 + Math.max(0, p - 0.35) * 2.55;
                    const op3 = p < 0.35 ? 0 : Math.min(0.66, ((p - 0.35) / 0.45) * 0.66);
                    plane3.style.transform = `scale(${sc3.toFixed(3)})`;
                    plane3.style.opacity = op3.toFixed(3);
                }

                // 2. UPDATE 3D Z-POSITIONS OF THE 5 STORY CHAPTERS EMERGING FROM THE PAINTING
                let closestGateIdx = 0;
                let minAbsDist = Infinity;

                for (let i = 0; i < 5; i++) {
                    const gateEl = document.getElementById(`zGate-${i}`);
                    if (!gateEl) continue;

                    const relZ = GATE_Z_POSITIONS[i] + currentCameraZ;
                    const absDist = Math.abs(relZ);
                    if (absDist < minAbsDist) {
                        minAbsDist = absDist;
                        closestGateIdx = i;
                    }

                    let opacity = 0;
                    let blurPx = 0;

                    if (relZ <= 0) {
                        opacity = Math.max(0, Math.min(1, 1 - Math.abs(relZ) / 1750));
                        blurPx = Math.max(0, (Math.abs(relZ) - 420) / 340);
                    } else {
                        opacity = Math.max(0, 1 - relZ / 540);
                        blurPx = Math.min(8, relZ / 85);
                    }

                    if (opacity <= 0.01 || relZ > 650 || relZ < -2200) {
                        gateEl.style.opacity = '0';
                        gateEl.style.visibility = 'hidden';
                        gateEl.classList.remove('gate-interactive');
                    } else {
                        gateEl.style.visibility = 'visible';
                        gateEl.style.opacity = opacity.toFixed(3);
                        gateEl.style.transform = `translate3d(0px, 0px, ${relZ.toFixed(1)}px)`;
                        gateEl.style.filter = blurPx > 0.3 ? `blur(${blurPx.toFixed(1)}px)` : 'none';
                    }
                }

                for (let i = 0; i < 5; i++) {
                    const g = document.getElementById(`zGate-${i}`);
                    if (g) g.classList.toggle('gate-interactive', i === closestGateIdx);
                }

                if (closestGateIdx !== currentStoryChapter) {
                    currentStoryChapter = closestGateIdx;
                    for (let i = 0; i < 5; i++) {
                        const pill = document.getElementById(`chapPill-${i}`);
                        if (pill) pill.classList.toggle('active', i === closestGateIdx);
                    }
                    const hintEl = document.getElementById('scrollyBottomHint');
                    if (hintEl && chapterHints[closestGateIdx]) {
                        hintEl.textContent = chapterHints[closestGateIdx];
                    }
                }

                // 3. RENDER PARTING RENAISSANCE CLOUDS & SUNBEAMS (Zero wireframe lines!)
                const w = window.innerWidth;
                const h = window.innerHeight;
                if (bgCanvas.width !== w || bgCanvas.height !== h) {
                    bgCanvas.width = w;
                    bgCanvas.height = h;
                }
                const cx = w / 2;
                const cy = h / 2;
                bgCtx.clearRect(0, 0, w, h);

                // Warm heavenly sunbeams radiating from the center of the painting
                bgCtx.save();
                bgCtx.translate(cx, cy * 0.78);
                const numRays = 14;
                for (let i = 0; i < numRays; i++) {
                    const ang = (i / numRays) * Math.PI * 2 + t * 0.02 + p * 0.35;
                    const grad = bgCtx.createLinearGradient(0, 0, Math.cos(ang) * w * 0.65, Math.sin(ang) * w * 0.65);
                    grad.addColorStop(0, 'rgba(255, 246, 212, 0.24)');
                    grad.addColorStop(0.5, 'rgba(244, 222, 168, 0.08)');
                    grad.addColorStop(1, 'rgba(244, 222, 168, 0)');
                    bgCtx.fillStyle = grad;
                    bgCtx.beginPath();
                    bgCtx.moveTo(0, 0);
                    bgCtx.arc(0, 0, w * 0.75, ang - 0.042, ang + 0.042);
                    bgCtx.closePath();
                    bgCtx.fill();
                }
                bgCtx.restore();

                // Volumetric painted clouds that bloom from the center & part outward as you zoom into the painting
                wiroZoomClouds.forEach((cl, idx) => {
                    const cycle = (p * cl.speed * 1.65 + idx * 0.17) % 1;
                    const dist = (cl.baseDist + cycle * 0.58) * Math.max(w, h) * 0.65;
                    const x = cx + Math.cos(cl.angle) * dist * 1.15;
                    const y = cy + Math.sin(cl.angle) * dist * 0.78 + Math.sin(t * 0.6 + idx) * 8;
                    const sc = cl.scale * (0.65 + cycle * 1.15);
                    const alpha = cycle < 0.15 ? (cycle / 0.15) : (cycle > 0.80 ? (1 - cycle) / 0.20 : 1);
                    drawWiroPainterlyCloud(bgCtx, x, y, sc, cl.tone, alpha * 0.88);
                });

                zTunnelAnimId = requestAnimationFrame(renderPaintingZoomFrame);
            }

            if (zTunnelAnimId) cancelAnimationFrame(zTunnelAnimId);
            zTunnelAnimId = requestAnimationFrame(renderPaintingZoomFrame);
        }

        function scrollToStoryChapter(chapIdx) {
            const container = document.getElementById('cinematicIntroSplash');
            if (!container) return;
            const maxScroll = container.scrollHeight - container.clientHeight;
            const targetZ = Math.abs(GATE_Z_POSITIONS[chapIdx] || 0);
            const targetScroll = (targetZ / MAX_CAMERA_Z) * maxScroll;
            container.scrollTo({ top: targetScroll, behavior: 'smooth' });
            playUiSound('click');
        }

        function scrollNextStoryChapter() {
            if (currentStoryChapter < 4) {
                scrollToStoryChapter(currentStoryChapter + 1);
            } else {
                triggerStoryFinalTransition('register');
            }
        }

        function triggerStoryFinalTransition(authMode = 'register') {
            autoTransitionTriggered = true;
            const splash = document.getElementById('cinematicIntroSplash');
            switchRoleView('auth');
            switchAuthTab(authMode);
            if (splash) {
                splash.classList.add('splash-zoom-exit');
                setTimeout(() => {
                    splash.classList.add('hidden');
                    splash.classList.remove('splash-zoom-exit');
                }, 460);
            }
            playUiSound('success');
            notify(authMode === 'register'
                ? '✨ Đã đi xuyên qua bức tranh vào giao diện Đăng Ký! Bấm "Hoàn tất đăng ký" để mở Vòng Cổng Sáng.'
                : '✨ Đã mở giao diện Đăng Nhập! Bấm "Đăng nhập" để mở Vòng Cổng Sáng.');
        }

        function unlockAndJumpToAuth(authMode = 'register') {
            triggerStoryFinalTransition(authMode);
        }

        // Interactive Abstract Node-Harmony Visualizer inside the Landing Page Right Card
        function initLandingHarmonyCanvas() {
            const canvas = document.getElementById('landingHarmonyCanvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');

            function loop(now) {
                const landing = document.getElementById('view-landing');
                if (!landing || landing.classList.contains('hidden')) {
                    requestAnimationFrame(loop);
                    return;
                }
                const rect = canvas.parentElement.getBoundingClientRect();
                if (canvas.width !== rect.width || canvas.height !== rect.height) {
                    canvas.width = rect.width;
                    canvas.height = rect.height;
                }
                const w = canvas.width, h = canvas.height;
                const cx = w / 2, cy = h / 2;
                const t = now * 0.001;

                ctx.clearRect(0, 0, w, h);

                const radius = Math.min(w, h) * 0.34;
                ctx.strokeStyle = 'rgba(212, 255, 0, 0.22)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(cx, cy, radius, 0, Math.PI * 2);
                ctx.stroke();

                const pts = [];
                for (let i = 0; i < 6; i++) {
                    const a = (i / 6) * Math.PI * 2 + t * 0.4;
                    const r = radius + Math.sin(t * 2 + i) * 8;
                    pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
                }

                ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
                pts.forEach((p, idx) => {
                    const next = pts[(idx + 1) % pts.length];
                    ctx.beginPath();
                    ctx.moveTo(cx, cy);
                    ctx.lineTo(p.x, p.y);
                    ctx.lineTo(next.x, next.y);
                    ctx.stroke();

                    ctx.fillStyle = idx % 2 === 0 ? '#D4FF00' : '#38BDF8';
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                    ctx.fill();
                });

                requestAnimationFrame(loop);
            }
            requestAnimationFrame(loop);
        }

        document.addEventListener('squad:ready', () => {
            initZTunnelScrollytelling();
            initLandingHarmonyCanvas();
        });
