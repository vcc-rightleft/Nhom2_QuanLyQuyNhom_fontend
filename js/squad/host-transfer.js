// =========================================================================
        // 11. HOST OWNERSHIP TRANSFER WORKFLOW (CHUYỂN QUYỀN HOST CHO NGƯỜI KHÁC)
        // =========================================================================
        let activeHostAccountName = '';

        function getCurrentHostMember() {
            return groupMembers.find(m => m.role === 'Host') || groupMembers[0];
        }

        function openTransferHostModal(targetMemberId) {
            const currentHost = getCurrentHostMember();
            const targetMember = groupMembers.find(m => Number(m.id) === Number(targetMemberId));
            if (!targetMember) return;

            document.getElementById('transferTargetMemberId').value = targetMember.id;
            document.getElementById('transferCurrentHostName').textContent = `${currentHost.name} (${currentHost.handle})`;
            document.getElementById('transferNewHostName').textContent = `${targetMember.name} (${targetMember.handle})`;
            document.getElementById('transferReasonNote').value = `Bàn giao quyền Host nhóm #${selectedSquadGroup()?.id || "—"} từ ${currentHost.name} sang ${targetMember.name}.`;
            openModal('modalTransferHost');
        }

        async function submitTransferHostRole(e) {
            e.preventDefault();
            try {
                const group = requireActiveHostGroup();
                const newHostId = Number(document.getElementById('transferTargetMemberId').value);
                if (!groupMembers.some(m => m.id === newHostId)) throw new Error('Thành viên không thuộc nhóm');
                await squadApi('/api/groups/'+group.id+'/transfer-host?new_host_id='+newHostId, {method:'POST'});
                await refreshServerGroups(group.id);
                closeModal('modalTransferHost');
                notify('Đã chuyển quyền Host trên MySQL.');
                switchRoleView('user');
            } catch(err) { notify('Chuyển Host thất bại: '+err.message); }
        }
