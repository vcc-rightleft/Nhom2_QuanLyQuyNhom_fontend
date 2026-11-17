function formatVND(amount) {
    return Math.round(Number(amount) || 0).toLocaleString("en-US") + " ₫";
}

function notify(message, isError = false) {
    let container = document.getElementById("cleanToastContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "cleanToastContainer";
        container.className = "fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none";
        document.body.appendChild(container);
    }

    const isWarn = isError || message.includes("Từ chối") || message.includes("Chặn") || message.includes("Lỗi") || message.includes("401");
    const item = document.createElement("div");
    item.className = "pointer-events-auto card-clean overflow-hidden bg-ink text-white shadow-bold";
    item.innerHTML = `
        <div class="p-4 flex items-center justify-between gap-3">
            <div class="flex items-center gap-2.5">
                <span class="w-2.5 h-2.5 rounded-full shrink-0 ${isWarn ? "bg-coral" : "bg-lime"}"></span>
                <span class="text-xs font-medium leading-relaxed">${message}</span>
            </div>
            <button onclick="this.closest('.card-clean').remove()" class="font-mono text-[10px] bg-lime text-ink font-bold px-2.5 py-1 rounded border border-ink shrink-0">ĐÓNG</button>
        </div>
        <div class="toast-progress ${isWarn ? "!bg-coral" : ""}"></div>
    `;
    container.appendChild(item);
    setTimeout(() => { if (item.parentElement) item.remove(); }, 4200);
}

function validateEmailOrPhone(value) {
    const val = (value || "").trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(0|\+84)[0-9]{8,10}$/;
    return emailRegex.test(val) || phoneRegex.test(val) || val.length >= 4;
}