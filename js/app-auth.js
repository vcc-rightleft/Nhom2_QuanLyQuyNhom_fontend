// =========================================================================
// APP-AUTH.JS — Bổ trợ tiện ích cho trang auth.html
// (Không ghi đè switchRoleView, fillDemoLogin, render*Workspace của api-auth/auth-guard/home-auth)
// =========================================================================

window.FASTAPI_URL =
    typeof APP_CONFIG !== "undefined" && APP_CONFIG.API_BASE_URL
        ? APP_CONFIG.API_BASE_URL
        : "http://127.0.0.1:8000";

window.interactiveFxEnabled = true;
window.audioCtx = null;

if (typeof lucide !== "undefined") {
    lucide.createIcons();
}

function playUiSound(type = "click") {
    if (!window.interactiveFxEnabled) return;
    try {
        if (!window.audioCtx) {
            window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (window.audioCtx.state === "suspended") window.audioCtx.resume();
        const osc = window.audioCtx.createOscillator();
        const gain = window.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(window.audioCtx.destination);

        const now = window.audioCtx.currentTime;
        if (type === "click") {
            osc.type = "triangle";
            osc.frequency.setValueAtTime(520, now);
            osc.frequency.exponentialRampToValueAtTime(180, now + 0.045);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
            osc.start(now);
            osc.stop(now + 0.05);
        } else if (type === "success") {
            osc.type = "sine";
            osc.frequency.setValueAtTime(587.33, now);
            osc.frequency.setValueAtTime(880, now + 0.07);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
            osc.start(now);
            osc.stop(now + 0.23);
        } else if (type === "error") {
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(180, now);
            osc.frequency.setValueAtTime(130, now + 0.08);
            gain.gain.setValueAtTime(0.09, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.21);
        }
    } catch (_) {}
}

async function pingFastApiBackend(silent = false) {
    const dot = document.getElementById("apiPulseDot");
    const lbl = document.getElementById("apiStatusLabel");
    try {
        const res = await fetch(`${window.FASTAPI_URL}/api/health`, { method: "GET" });
        if (res.ok) {
            if (dot) dot.classList.remove("offline");
            if (lbl) lbl.textContent = "FastAPI: ONLINE";
            if (!silent && typeof notify === "function") {
                notify("Kết nối trực tiếp tới FastAPI (http://127.0.0.1:8000) thành công!");
            }
            return true;
        }
    } catch (_) {
        if (dot) dot.classList.add("offline");
        if (lbl) lbl.textContent = "Backend: OFFLINE";
        if (!silent && typeof notify === "function") {
            notify("Không kết nối được tới FastAPI (http://127.0.0.1:8000). Hãy kiểm tra lại server Uvicorn.", true);
        }
    }
    return false;
}

// Gắn Axios Response Interceptor để tự động đăng xuất khi nhận 401 từ Backend
if (typeof window.apiClient !== "undefined" && window.apiClient.interceptors) {
    window.apiClient.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error?.response?.status === 401) {
                const reqUrl = error.config?.url || "";
                // Không tự logout nếu đang gọi sai mật khẩu ở chính API /auth/login
                if (!reqUrl.includes("/auth/login") && typeof logoutUser === "function") {
                    if (typeof notify === "function") {
                        notify("Phiên đăng nhập đã hết hạn (401). Vui lòng đăng nhập lại!", true);
                    }
                    logoutUser();
                }
            }
            return Promise.reject(error);
        }
    );
}