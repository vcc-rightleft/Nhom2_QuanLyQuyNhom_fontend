// =========================================================================
        // 12. LUMINOUS ORGANIC PORTAL / IRIS BURN REVEAL ENGINE (FROM TIKTOK VIDEO)
        // =========================================================================
        let portalAnimId = null;
        let portalSparks = [];

        function playPortalWhooshSound(mode = 'open') {
            if (!interactiveFxEnabled) return;
            try {
                if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                if (audioCtx.state === 'suspended') audioCtx.resume();
                const now = audioCtx.currentTime;
                if (mode === 'close') {
                    // Low resonant contraction sweep
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(340, now);
                    osc.frequency.exponentialRampToValueAtTime(95, now + 0.45);
                    gain.gain.setValueAtTime(0.11, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.46);
                    osc.start(now);
                    osc.stop(now + 0.48);
                } else {
                    // Shimmering harmonic expansion chord (C5 - G5 - B5 - D6)
                    [523.25, 783.99, 987.77, 1174.66].forEach((freq, idx) => {
                        const osc = audioCtx.createOscillator();
                        const gain = audioCtx.createGain();
                        osc.connect(gain);
                        gain.connect(audioCtx.destination);
                        osc.type = 'triangle';
                        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
                        gain.gain.setValueAtTime(0.08, now + idx * 0.06);
                        gain.gain.exponentialRampToValueAtTime(0.0008, now + idx * 0.06 + 0.75);
                        osc.start(now + idx * 0.06);
                        osc.stop(now + idx * 0.06 + 0.78);
                    });
                }
            } catch (e) {}
        }

        // Draw the dark mask with an organic wavy hole and a blazing multi-layered glowing rim
        function drawOrganicPortalFrame(ctx, w, h, baseRadius, timeSec, glowIntensity = 1.0) {
            const cx = w / 2;
            const cy = h / 2;
            ctx.clearRect(0, 0, w, h);

            // 1. Fill full screen with deep obsidian ink (#09090d)
            ctx.save();
            ctx.fillStyle = '#09090d';
            ctx.fillRect(0, 0, w, h);

            // Helper to trace the organic multi-frequency undulating contour
            const numPoints = 140;
            function traceOrganicPath(radiusOffset = 0, phaseShift = 0) {
                ctx.beginPath();
                const rBase = Math.max(0, baseRadius + radiusOffset);
                for (let i = 0; i <= numPoints; i++) {
                    const angle = (i / numPoints) * Math.PI * 2;
                    // Organic noise waves (like the irregular glowing cloud/energy portal in the video)
                    const wave1 = Math.sin(angle * 3 + timeSec * 2.4 + phaseShift) * 0.075;
                    const wave2 = Math.cos(angle * 5 - timeSec * 1.9 + phaseShift) * 0.048;
                    const wave3 = Math.sin(angle * 8 + timeSec * 3.6) * 0.025;
                    const wave4 = Math.cos(angle * 13 - timeSec * 4.2) * 0.012;
                    // Tapering wave amplitude when very small or very huge
                    const waveScale = Math.min(1, rBase / 90);
                    const r = rBase * (1 + (wave1 + wave2 + wave3 + wave4) * waveScale);
                    const x = cx + Math.cos(angle) * r;
                    const y = cy + Math.sin(angle) * r;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
            }

            // 2. Cut out the organic hole using destination-out so the underlying page or onboarding deck shines through!
            if (baseRadius > 2) {
                ctx.globalCompositeOperation = 'destination-out';
                traceOrganicPath(0, 0);
                ctx.fill();
            }

            // 3. Draw the blazing multi-layered luminous rim (Outer Violet/Coral Aura -> Amber/Lime Core -> Pure White Hot Edge)
            ctx.globalCompositeOperation = 'source-over';
            if (baseRadius > 1 && glowIntensity > 0.02) {
                // Layer A: Wide Atmospheric Violet-Coral Glow
                ctx.save();
                traceOrganicPath(4, 0.2);
                ctx.strokeStyle = `rgba(124, 58, 237, ${0.55 * glowIntensity})`;
                ctx.lineWidth = 28;
                ctx.shadowColor = '#FF5E36';
                ctx.shadowBlur = 45;
                ctx.stroke();
                ctx.restore();

                // Layer B: Warm Amber / Electric Lime Corona
                ctx.save();
                traceOrganicPath(1.5, -0.15);
                ctx.strokeStyle = `rgba(212, 255, 0, ${0.85 * glowIntensity})`;
                ctx.lineWidth = 10;
                ctx.shadowColor = '#D4FF00';
                ctx.shadowBlur = 30;
                ctx.stroke();
                ctx.restore();

                // Layer C: Ultra-bright White-Hot Inner Filament (The crisp glowing border in the video)
                ctx.save();
                traceOrganicPath(0, 0);
                ctx.strokeStyle = `rgba(255, 255, 255, ${0.98 * glowIntensity})`;
                ctx.lineWidth = 3.5;
                ctx.shadowColor = '#FFFFFF';
                ctx.shadowBlur = 18;
                ctx.stroke();
                ctx.restore();

                // Spawn & render floating luminous embers along the expanding rim
                if (Math.random() < 0.85) {
                    for (let s = 0; s < 3; s++) {
                        const ang = Math.random() * Math.PI * 2;
                        const dist = baseRadius * (0.96 + Math.random() * 0.08);
                        portalSparks.push({
                            x: cx + Math.cos(ang) * dist,
                            y: cy + Math.sin(ang) * dist,
                            vx: Math.cos(ang) * (0.6 + Math.random() * 1.8),
                            vy: Math.sin(ang) * (0.6 + Math.random() * 1.8) - 0.5,
                            radius: 1.5 + Math.random() * 2.5,
                            alpha: 0.95,
                            color: Math.random() > 0.4 ? '#D4FF00' : '#FFFFFF'
                        });
                    }
                }
            }

            // Render active sparks
            for (let i = portalSparks.length - 1; i >= 0; i--) {
                const sp = portalSparks[i];
                sp.x += sp.vx;
                sp.y += sp.vy;
                sp.alpha -= 0.028;
                if (sp.alpha <= 0) {
                    portalSparks.splice(i, 1);
                    continue;
                }
                ctx.save();
                ctx.beginPath();
                ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
                ctx.fillStyle = sp.color;
                ctx.globalAlpha = sp.alpha * glowIntensity;
                ctx.shadowColor = sp.color;
                ctx.shadowBlur = 10;
                ctx.fill();
                ctx.restore();
            }

            ctx.restore();
        }

        // Core Animator: Animates portal radius from startR -> endR, with optional hold/wobble phase
        function animatePortalRadius({ startR, endR, durationMs, onMidpoint, onComplete, keepWobbling = false }) {
            if (portalAnimId) cancelAnimationFrame(portalAnimId);
            const canvas = document.getElementById('portalCanvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');

            function resize() {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
            resize();

            const startTime = performance.now();
            let midpointCalled = false;

            function frame(now) {
                const elapsed = now - startTime;
                const t = Math.min(elapsed / durationMs, 1);
                // Smooth cubic ease-in-out
                const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
                const currentR = startR + (endR - startR) * eased;
                const timeSec = now * 0.001;

                // Update percentage indicator on center frame
                const pctEl = document.getElementById('portalPercentText');
                if (pctEl) {
                    const maxD = Math.hypot(canvas.width, canvas.height) * 0.62;
                    const pct = Math.min(100, Math.max(0, Math.round((currentR / maxD) * 100)));
                    pctEl.textContent = `PORTAL ${pct}%`;
                }

                if (!midpointCalled && t >= 0.5 && typeof onMidpoint === 'function') {
                    midpointCalled = true;
                    onMidpoint();
                }

                drawOrganicPortalFrame(ctx, canvas.width, canvas.height, currentR, timeSec, 1.0);

                if (t < 1) {
                    portalAnimId = requestAnimationFrame(frame);
                } else {
                    if (typeof onComplete === 'function') onComplete();
                    if (keepWobbling) {
                        function wobbleLoop(nowWobble) {
                            drawOrganicPortalFrame(ctx, canvas.width, canvas.height, endR, nowWobble * 0.001, 1.0);
                            portalAnimId = requestAnimationFrame(wobbleLoop);
                        }
                        portalAnimId = requestAnimationFrame(wobbleLoop);
                    }
                }
            }
            portalAnimId = requestAnimationFrame(frame);
        }

        // Luồng 1: Chuyển cảnh Đóng Vòng Sáng -> Đổi Giao Diện -> Mở Bung Vòng Sáng Ra Toàn Màn Hình (Cho Đăng nhập & Mã mời)
        function runCurtainRoleTransition(targetRole, plaqueText, toastMessage) {
            const overlay = document.getElementById('portalRevealOverlay');
            const stage = document.getElementById('portalOnboardingStage');

            overlay.classList.remove('hidden');
            stage.classList.remove('stage-active');
            portalSparks = [];

            const maxRadius = Math.hypot(window.innerWidth, window.innerHeight) * 0.68;

            // Phase 1: Contract glowing portal from full screen down to a tight glowing core
            playPortalWhooshSound('close');
            animatePortalRadius({
                startR: maxRadius,
                endR: 12,
                durationMs: 520,
                onComplete: () => {
                    // Switch underlying role workspace while the portal is contracted at the center
                    switchRoleView(targetRole);
                    playPortalWhooshSound('open');

                    // Phase 2: Expand the glowing organic portal outward across the entire screen
                    animatePortalRadius({
                        startR: 12,
                        endR: maxRadius * 1.15,
                        durationMs: 1050,
                        onComplete: () => {
                            if (portalAnimId) cancelAnimationFrame(portalAnimId);
                            overlay.classList.add('hidden');
                            if (toastMessage) notify(toastMessage);
                        }
                    });
                }
            });
        }

        // Luồng 2: Khi Đăng ký tài khoản mới -> Vòng sáng thu lại rồi mở dần ra từ tâm kèm viền sáng rực rỡ bao quanh Bảng Giới Thiệu Tân Thủ!
        function openWesternOnboarding(userName = 'Phan Đức Anh') {
            const overlay = document.getElementById('portalRevealOverlay');
            const stage = document.getElementById('portalOnboardingStage');
            const nameEl = document.getElementById('onboardUserName');

            if (nameEl) nameEl.textContent = userName;

            overlay.classList.remove('hidden');
            stage.classList.remove('stage-active');
            portalSparks = [];

            const maxRadius = Math.hypot(window.innerWidth, window.innerHeight) * 0.68;
            const targetOnboardingRadius = Math.min(window.innerWidth, window.innerHeight) * 0.56;

            // Bước 1: Thu vòng sáng từ ngoài vào tâm (Đóng màn)
            playPortalWhooshSound('close');
            animatePortalRadius({
                startR: maxRadius,
                endR: 12,
                durationMs: 500,
                onComplete: () => {
                    // Bước 2: Từ tâm, vòng sáng viền lửa/neon nở rộng dần ra để lộ Bảng Giới Thiệu Tính Năng!
                    playPortalWhooshSound('open');
                    setTimeout(() => {
                        stage.classList.add('stage-active');
                        launchConfettiBurst();
                        lucide.createIcons();
                    }, 220);

                    animatePortalRadius({
                        startR: 12,
                        endR: targetOnboardingRadius,
                        durationMs: 1050,
                        keepWobbling: true // Giữ viền sáng uốn lượn sống động bao quanh bảng giới thiệu!
                    });
                }
            });
        }

        function highlightOnboardStep(stepNum) {
            const tips = {
                1: '<strong>Bước 1 (Mã nhóm cố định):</strong> Mỗi nhóm chỉ dùng 1 mã duy nhất (VD: #DALAT26). Bạn bè nhập mã là vào thẳng nhóm, không lo hết hạn!',
                2: '<strong>Bước 2 (Chia bill thông minh):</strong> Host có thể tạo hóa đơn chia đều hoặc chia theo từng món ăn, tự động làm tròn chuẩn số nguyên VND.',
                3: '<strong>Bước 3 (Quét VietQR & Nhắc nợ):</strong> Khi bị Host nhắc nợ sẽ có cảnh báo lớn hiện lên, bấm 1 chạm mở ngay mã VietQR điền sẵn số tiền!'
            };
            [1, 2, 3].forEach(n => {
                const c = document.getElementById(`onboardCard-${n}`);
                if (!c) return;
                if (n === stepNum) {
                    c.className = "card-subtle p-4 cursor-pointer border-2 border-ink bg-lime/35 space-y-2.5";
                } else {
                    c.className = "card-subtle p-4 cursor-pointer space-y-2.5";
                }
            });
            const tipEl = document.getElementById('onboardDynamicTip');
            if (tipEl && tips[stepNum]) {
                tipEl.innerHTML = tips[stepNum];
            }
        }

        // Luồng 3: Khi người mới bấm nút trên Bảng Giới Thiệu -> Vòng sáng khép nhẹ rồi bùng nổ mở rộng 100% ra toàn màn hình để vào bàn làm việc chính!
        function closeWesternOnboarding(targetRole = 'user') {
            const overlay = document.getElementById('portalRevealOverlay');
            const stage = document.getElementById('portalOnboardingStage');

            stage.classList.remove('stage-active');

            const currentRadius = Math.min(window.innerWidth, window.innerHeight) * 0.56;
            const maxRadius = Math.hypot(window.innerWidth, window.innerHeight) * 0.75;

            // Thu nhẹ vòng sáng vào tâm để chuyển màn hình nền
            playPortalWhooshSound('close');
            animatePortalRadius({
                startR: currentRadius,
                endR: 12,
                durationMs: 420,
                onComplete: () => {
                    const prevFlag = hasUnreadUrgentReminder;
                    hasUnreadUrgentReminder = false;
                    switchRoleView(targetRole);
                    hasUnreadUrgentReminder = prevFlag;

                    // Bung vòng sáng rực rỡ lan tỏa toàn màn hình mở ra không gian làm việc chính
                    playPortalWhooshSound('open');
                    animatePortalRadius({
                        startR: 12,
                        endR: maxRadius,
                        durationMs: 980,
                        onComplete: () => {
                            if (portalAnimId) cancelAnimationFrame(portalAnimId);
                            overlay.classList.add('hidden');
                            notify(`⚡ Chào mừng bạn đến với không gian ${targetRole.toUpperCase()} trên SQUAD.CASH!`);
                        }
                    });
                }
            });
        }
