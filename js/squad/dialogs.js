// ---------------- 7. MODAL & TOAST HELPERS ----------------
        function openModal(id) {
            document.getElementById(id).classList.remove('hidden');
        }
        function closeModal(id) {
            document.getElementById(id).classList.add('hidden');
        }

        function notify(message) {
            const container = document.getElementById('cleanToastContainer');
            const item = document.createElement('div');
            item.className = "pointer-events-auto card-clean p-4 bg-ink text-white flex items-center justify-between gap-3 shadow-bold";
            item.innerHTML = `
                <span class="text-xs font-medium leading-relaxed">${message}</span>
                <button onclick="this.parentElement.remove()" class="font-mono text-[10px] bg-lime text-ink font-bold px-2 py-1 rounded">ĐÓNG</button>
            `;
            container.appendChild(item);
            setTimeout(() => {
                if (item.parentElement) item.remove();
            }, 4200);
        }
