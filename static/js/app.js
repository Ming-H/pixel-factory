// Pixel Factory 前端逻辑

document.addEventListener('DOMContentLoaded', () => {
    // 初始化标签切换
    initTabs();

    // 初始化表单
    initSingleForm();
    initBatchForm();

    // 加载历史记录
    if (document.getElementById('history-tab').classList.contains('active')) {
        loadHistory();
    }

    // 刷新按钮
    document.getElementById('refresh-btn')?.addEventListener('click', loadHistory);
});

// 标签切换
function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 移除所有 active 类
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            // 添加 active 类
            tab.classList.add('active');
            document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active');

            // 如果是历史标签，加载历史
            if (tab.dataset.tab === 'history') {
                loadHistory();
            }
        });
    });
}

// 单张生成表单
function initSingleForm() {
    const form = document.getElementById('single-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const prompt = document.getElementById('prompt').value.trim();
        const aspectRatio = document.getElementById('aspect-ratio').value;
        const resultDiv = document.getElementById('single-result');

        if (!prompt) {
            showMessage(resultDiv, '请输入提示词', 'error');
            return;
        }

        // 显示加载状态
        const submitBtn = form.querySelector('button[type="submit"]');
        setLoading(submitBtn, true);
        resultDiv.innerHTML = '<div class="message">正在生成图片...</div>';

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: prompt,
                    aspect_ratio: aspectRatio
                })
            });

            const data = await response.json();

            if (data.success) {
                resultDiv.innerHTML = `
                    <div class="result-image">
                        <img src="${data.url}" alt="${data.prompt}">
                    </div>
                    <div class="result-actions">
                        <button class="btn btn-secondary" onclick="openImage('${data.url}')">查看大图</button>
                        <button class="btn btn-secondary" onclick="downloadImage('${data.url}', '${data.filename}')">下载</button>
                    </div>
                `;
                showMessage(resultDiv, '图片生成成功！', 'success');
            } else {
                showMessage(resultDiv, `生成失败: ${data.error}`, 'error');
            }
        } catch (error) {
            showMessage(resultDiv, `请求失败: ${error.message}`, 'error');
        } finally {
            setLoading(submitBtn, false);
        }
    });
}

// 批量生成表单
function initBatchForm() {
    const form = document.getElementById('batch-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const promptsText = document.getElementById('prompts').value.trim();
        const aspectRatio = document.getElementById('batch-aspect-ratio').value;
        const resultDiv = document.getElementById('batch-result');

        const prompts = promptsText.split('\n').map(p => p.trim()).filter(p => p);

        if (prompts.length === 0) {
            showMessage(resultDiv, '请输入至少一个提示词', 'error');
            return;
        }

        // 显示加载状态
        const submitBtn = form.querySelector('button[type="submit"]');
        setLoading(submitBtn, true);
        resultDiv.innerHTML = '<div class="message">正在批量生成图片...</div>';

        try {
            const response = await fetch('/api/generate/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompts: prompts,
                    aspect_ratio: aspectRatio
                })
            });

            const data = await response.json();

            let html = '<div class="batch-results">';
            data.results.forEach((result, index) => {
                if (result.success) {
                    html += `
                        <div class="batch-item success">
                            <img src="${result.url}" alt="${result.prompt}">
                            <div class="prompt">${result.prompt}</div>
                        </div>
                    `;
                } else {
                    html += `
                        <div class="batch-item error">
                            <div class="error-msg">生成失败</div>
                            <div class="prompt">${result.prompt}</div>
                        </div>
                    `;
                }
            });
            html += '</div>';

            resultDiv.innerHTML = html;
            showMessage(resultDiv, `批量生成完成！成功: ${data.succeeded}, 失败: ${data.failed}`, 'success');

            // 刷新历史记录
            loadHistory();
        } catch (error) {
            showMessage(resultDiv, `请求失败: ${error.message}`, 'error');
        } finally {
            setLoading(submitBtn, false);
        }
    });
}

// 加载历史记录
async function loadHistory() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '<div class="empty-state">加载中...</div>';

    try {
        const response = await fetch('/api/images');
        const data = await response.json();

        if (data.images.length === 0) {
            historyList.innerHTML = '<div class="empty-state">暂无生成的图片</div>';
            return;
        }

        let html = '';
        data.images.forEach(img => {
            html += `
                <div class="history-item" onclick="openImage('${img.url}')">
                    <img src="${img.url}" alt="${img.filename}">
                    <div class="filename">${img.filename}</div>
                </div>
            `;
        });
        historyList.innerHTML = html;
    } catch (error) {
        historyList.innerHTML = `<div class="empty-state">加载失败: ${error.message}</div>`;
    }
}

// 设置按钮加载状态
function setLoading(button, loading) {
    if (loading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

// 显示消息
function showMessage(container, message, type = 'success') {
    const existingMessage = container.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    container.insertBefore(messageDiv, container.firstChild);
}

// 打开图片
function openImage(url) {
    window.open(url, '_blank');
}

// 下载图片
async function downloadImage(url, filename) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
    } catch (error) {
        console.error('下载失败:', error);
    }
}
