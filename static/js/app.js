/**
 * Pixel Factory - 前端逻辑
 * 现代化的图片生成应用
 */

// 全局状态
const state = {
    currentLightboxImage: null,
    currentPrompt: null,
    referenceImageData: null,
    selectedStyle: null,
    selectedRatio: '1:1',
    activeStyleCategory: null,
    userTemplates: [],
    // 图片缩放状态
    currentImageZoom: 100,
    minZoom: 50,
    maxZoom: 200
};

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initRatioSelectors();
    initTemplateButtons();
    initClearButtons();
    initImageUpload();
    initSectionToggles();
    initWithStyleSelector();
    initSingleForm();
    initBatchForm();
    initLightbox();
    initRefreshButton();
    initSaveTemplateButton();
    initUserTemplates();
    initImageZoom();
});

// 初始化标签切换
function initTabs() {
    const tabs = document.querySelectorAll('.nav-item');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 移除所有 active 类
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.workspace-content').forEach(c => c.classList.remove('active'));

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

// 初始化宽高比选择器
function initRatioSelectors() {
    // 单张生成的宽高比选择器
    const singleRatioSelector = document.getElementById('ratio-selector');
    if (singleRatioSelector) {
        initRatioSelector(singleRatioSelector, 'aspect-ratio');
    }

    // 批量生成的宽高比选择器
    const batchRatioSelector = document.getElementById('batch-ratio-selector');
    if (batchRatioSelector) {
        initRatioSelector(batchRatioSelector, 'batch-aspect-ratio');
    }
}

function initRatioSelector(container, inputId) {
    const buttons = container.querySelectorAll('.ratio-btn');
    const input = document.getElementById(inputId);

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            input.value = btn.dataset.ratio;
            state.selectedRatio = btn.dataset.ratio;

            // 自动添加宽高比到提示词末尾
            addRatioToPrompt(state.selectedRatio);
        });
    });
}

// 添加宽高比到提示词
function addRatioToPrompt(ratio) {
    const promptTextarea = document.getElementById('prompt');
    if (!promptTextarea) return;

    const currentPrompt = promptTextarea.value.trim();

    // 移除旧的宽高比标签（如果存在）
    const ratioPattern = /\s*--ar\s+\d+:\d+\s*$/g;
    const cleanedPrompt = currentPrompt.replace(ratioPattern, '').trim();

    // 添加新的宽高比
    promptTextarea.value = cleanedPrompt ? `${cleanedPrompt} --ar ${ratio}` : `--ar ${ratio}`;
}

// 更新宽高比显示（已弃用，保留用于兼容性）
function updateRatioDisplay() {
    // 不再需要显示更新，宽高比直接添加到提示词
}

// 初始化模板按钮
function initTemplateButtons() {
    const templateBtns = document.querySelectorAll('.template-chip');
    const promptTextarea = document.getElementById('prompt');

    templateBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const prompt = btn.dataset.prompt;
            const currentPrompt = promptTextarea?.value.trim() || '';

            if (currentPrompt) {
                // 如果已有提示词，追加
                promptTextarea.value = `${currentPrompt}, ${prompt}`;
            } else {
                promptTextarea.value = prompt;
            }
            promptTextarea.focus();
            showToast('模板已应用', 'success');
        });
    });
}

// 初始化清空按钮
function initClearButtons() {
    // 清空单张提示词
    const clearPromptBtn = document.getElementById('clear-prompt');
    const promptTextarea = document.getElementById('prompt');
    if (clearPromptBtn && promptTextarea) {
        clearPromptBtn.addEventListener('click', () => {
            promptTextarea.value = '';
            promptTextarea.focus();
        });
    }

    // 清空文本内容
    const clearTextContentBtn = document.getElementById('clear-text-content');
    const textContentTextarea = document.getElementById('text-content');
    if (clearTextContentBtn && textContentTextarea) {
        clearTextContentBtn.addEventListener('click', () => {
            textContentTextarea.value = '';
            textContentTextarea.focus();
        });
    }

    // 清空批量提示词
    const clearPromptsBtn = document.getElementById('clear-prompts');
    const promptsTextarea = document.getElementById('prompts');
    if (clearPromptsBtn && promptsTextarea) {
        clearPromptsBtn.addEventListener('click', () => {
            promptsTextarea.value = '';
            promptsTextarea.focus();
            updatePromptCount();
        });
    }

    // 批量提示词计数
    if (promptsTextarea) {
        promptsTextarea.addEventListener('input', updatePromptCount);
    }
}

// 更新提示词计数
function updatePromptCount() {
    const promptsTextarea = document.getElementById('prompts');
    const countSpan = document.getElementById('prompt-count');
    if (promptsTextarea && countSpan) {
        const count = promptsTextarea.value
            .split('\n')
            .map(p => p.trim())
            .filter(p => p).length;
        countSpan.textContent = count;

        if (count > 10) {
            countSpan.style.color = 'var(--error-color)';
        } else {
            countSpan.style.color = 'var(--primary-color)';
        }
    }
}

// 初始化图片上传
function initImageUpload() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('reference-image');
    const uploadPreview = document.getElementById('upload-preview');
    const previewImg = document.getElementById('preview-img');
    const removeBtn = document.getElementById('remove-image');

    // 点击上传区域
    uploadArea?.addEventListener('click', () => {
        fileInput?.click();
    });

    // 文件选择
    fileInput?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleImageFile(file);
        }
    });

    // 拖拽上传
    uploadArea?.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea?.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea?.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageFile(file);
        } else {
            showToast('请上传图片文件', 'error');
        }
    });

    // 移除图片
    removeBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        clearImageUpload();
    });
}

// 处理图片文件
function handleImageFile(file) {
    // 检查文件大小（10MB）
    if (file.size > 10 * 1024 * 1024) {
        showToast('图片大小不能超过 10MB', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const base64 = e.target.result;
        state.referenceImageData = base64;

        // 显示预览
        const uploadArea = document.getElementById('upload-area');
        const uploadPreview = document.getElementById('upload-preview');
        const previewImg = document.getElementById('preview-img');

        if (uploadArea) uploadArea.style.display = 'none';
        if (uploadPreview) uploadPreview.style.display = 'block';
        if (previewImg) previewImg.src = base64;

        showToast('图片已上传', 'success');
    };
    reader.readAsDataURL(file);
}

// 清除图片上传
function clearImageUpload() {
    state.referenceImageData = null;

    const uploadArea = document.getElementById('upload-area');
    const uploadPreview = document.getElementById('upload-preview');
    const previewImg = document.getElementById('preview-img');
    const fileInput = document.getElementById('reference-image');

    if (uploadArea) uploadArea.style.display = 'block';
    if (uploadPreview) uploadPreview.style.display = 'none';
    if (previewImg) previewImg.src = '';
    if (fileInput) fileInput.value = '';
}

// 初始化侧边栏折叠功能
function initSectionToggles() {
    const toggles = document.querySelectorAll('.section-toggle');
    toggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const targetId = toggle.dataset.target;
            const section = toggle.closest('.sidebar-section');

            if (targetId) {
                const content = document.getElementById(targetId);
                const isExpanded = toggle.classList.contains('expanded');

                if (isExpanded) {
                    toggle.classList.remove('expanded');
                    section.classList.add('collapsed');
                    if (content) content.style.display = 'none';
                } else {
                    toggle.classList.add('expanded');
                    section.classList.remove('collapsed');
                    if (content) content.style.display = '';
                }
            }
        });
    });
}

// 初始化风格选择器
function initWithStyleSelector() {
    const workspaceContainer = document.getElementById('style-selector-workspace');
    if (!workspaceContainer) return;

    // 创建横向标签布局
    workspaceContainer.innerHTML = `
        <div class="style-categories-tabs" id="style-categories-tabs"></div>
        <div class="style-content-area" id="style-content-area"></div>
    `;

    const tabsContainer = document.getElementById('style-categories-tabs');
    const contentArea = document.getElementById('style-content-area');

    // 渲染分类标签
    if (tabsContainer && typeof IMAGE_STYLES !== 'undefined') {
        Object.entries(IMAGE_STYLES).forEach(([key, category], index) => {
            const tab = document.createElement('button');
            tab.className = 'style-category-tab';
            tab.type = 'button';
            tab.dataset.category = key;
            tab.innerHTML = `<span class="category-icon">${category.icon}</span>${category.name}`;
            tabsContainer.appendChild(tab);

            // 创建对应的内容区域
            const contentDiv = document.createElement('div');
            contentDiv.className = 'style-category-content';
            contentDiv.dataset.category = key;
            contentDiv.innerHTML = `
                <div class="style-options-grid">
                    ${category.styles.map(style => `
                        <button type="button" class="style-option-chip ${state.selectedStyle?.id === style.id ? 'selected' : ''}"
                                data-style-id="${style.id}"
                                title="${style.description}">
                            <span class="style-icon">${style.icon}</span>
                            <span class="style-name">${style.name}</span>
                        </button>
                    `).join('')}
                </div>
            `;
            contentArea.appendChild(contentDiv);

            // 点击标签切换
            tab.addEventListener('click', () => {
                // 移除所有 active
                document.querySelectorAll('.style-category-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.style-category-content').forEach(c => c.classList.remove('active'));

                // 激活当前
                tab.classList.add('active');
                contentDiv.classList.add('active');
                state.activeStyleCategory = key;
            });

            // 绑定风格选项点击事件
            const styleChips = contentDiv.querySelectorAll('.style-option-chip');
            styleChips.forEach(chip => {
                chip.addEventListener('click', () => {
                    const styleId = chip.dataset.styleId;
                    selectStyle(styleId);
                });
            });
        });

        // 默认激活第一个分类
        const firstTab = tabsContainer.querySelector('.style-category-tab');
        if (firstTab) {
            firstTab.classList.add('active');
            const firstContent = contentArea.querySelector('.style-category-content');
            if (firstContent) firstContent.classList.add('active');
        }
    }

    // 选择风格
    function selectStyle(styleId) {
        const style = STYLE_MAP[styleId];
        if (!style) return;

        state.selectedStyle = style;

        // 更新 UI
        document.querySelectorAll('.style-option-chip').forEach(chip => {
            chip.classList.toggle('selected', chip.dataset.styleId === styleId);
        });

        // 填充提示词到输入框
        const promptTextarea = document.getElementById('prompt');
        const currentPrompt = promptTextarea?.value.trim() || '';

        if (currentPrompt) {
            // 如果已有提示词，询问用户如何处理
            showPromptMergeDialog(currentPrompt, style);
        } else {
            // 如果没有提示词，直接填充风格提示词
            if (promptTextarea) {
                promptTextarea.value = style.prompt;
                promptTextarea.focus();
                showToast(`已填充风格提示词: ${style.name}`, 'success');
            }
        }
    }

    // 显示提示词合并选项对话框
    function showPromptMergeDialog(currentPrompt, style) {
        const dialog = document.getElementById('prompt-merge-dialog');
        if (!dialog) return;

        // 显示对话框
        dialog.classList.add('active');

        // 存储当前状态供按钮使用
        window.promptMergeState = {
            current: currentPrompt,
            style: style
        };

        // 清理旧的事件监听器（如果存在）
        if (window.promptMergeDialogHandlers) {
            window.promptMergeDialogHandlers.forEach(handler => {
                if (handler.element && handler.event && handler.fn) {
                    handler.element.removeEventListener(handler.event, handler.fn);
                }
            });
        }

        // 创建新的事件处理函数
        const handlers = [];

        // 设置对话框按钮点击事件
        const dialogBtns = dialog.querySelectorAll('.dialog-btn');
        dialogBtns.forEach(btn => {
            const btnHandler = () => {
                const action = btn.dataset.action;
                if (action && window.handlePromptMerge) {
                    window.handlePromptMerge(action);
                }
            };
            btn.addEventListener('click', btnHandler);
            handlers.push({ element: btn, event: 'click', fn: btnHandler });
        });

        // 设置取消按钮
        const cancelBtn = document.getElementById('dialog-cancel');
        if (cancelBtn) {
            const cancelHandler = () => {
                closeDialog();
            };
            cancelBtn.addEventListener('click', cancelHandler);
            handlers.push({ element: cancelBtn, event: 'click', fn: cancelHandler });
        }

        // 点击背景关闭
        const bgClickHandler = (e) => {
            if (e.target === dialog || e.target.classList.contains('dialog-overlay')) {
                closeDialog();
            }
        };
        dialog.addEventListener('click', bgClickHandler);
        handlers.push({ element: dialog, event: 'click', fn: bgClickHandler });

        // 关闭对话框函数
        function closeDialog() {
            dialog.classList.remove('active');
            // 清理事件监听器
            handlers.forEach(handler => {
                handler.element.removeEventListener(handler.event, handler.fn);
            });
        }

        // 保存处理器引用供后续清理
        window.promptMergeDialogHandlers = handlers;
    }

    // 处理提示词合并
    window.handlePromptMerge = function(action) {
        const { current, style } = window.promptMergeState || {};
        const promptTextarea = document.getElementById('prompt');

        if (!promptTextarea) return;

        // 清理当前提示词中的宽高比标签（如果存在）
        const ratioPattern = /\s*--ar\s+\d+:\d+\s*$/g;
        const cleanedCurrent = current.replace(ratioPattern, '').trim();

        let newPrompt = '';
        switch (action) {
            case 'replace':
                newPrompt = style.prompt;
                break;
            case 'append':
                newPrompt = `${cleanedCurrent}, ${style.prompt}`;
                break;
            case 'prepend':
                newPrompt = `${style.prompt}, ${cleanedCurrent}`;
                break;
        }

        promptTextarea.value = newPrompt;

        // 如果有选中的宽高比，重新添加
        if (state.selectedRatio) {
            addRatioToPrompt(state.selectedRatio);
        }

        promptTextarea.focus();

        // 关闭对话框并清理事件监听器
        const dialog = document.getElementById('prompt-merge-dialog');
        if (dialog && window.promptMergeDialogHandlers) {
            dialog.classList.remove('active');
            window.promptMergeDialogHandlers.forEach(handler => {
                handler.element.removeEventListener(handler.event, handler.fn);
            });
            window.promptMergeDialogHandlers = null;
        }

        showToast('提示词已更新', 'success');
    };
}

// 单张生成表单
function initSingleForm() {
    const form = document.getElementById('single-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        let prompt = document.getElementById('prompt').value.trim();
        const textContent = document.getElementById('text-content').value.trim();
        const aspectRatio = document.getElementById('aspect-ratio').value;
        const resultDiv = document.getElementById('single-result');

        if (!prompt && !textContent) {
            showToast('请输入提示词或文本内容', 'error');
            return;
        }

        // 移除提示词中的 --ar 标签（因为宽高比单独传递）
        const ratioPattern = /\s*--ar\s+\d+:\d+\s*$/g;
        prompt = prompt.replace(ratioPattern, '').trim();

        // 合并提示词和文本内容
        let finalPrompt = prompt;
        if (textContent) {
            finalPrompt = prompt ? `${prompt}。${textContent}` : textContent;
        }

        // 查找生成按钮（在侧边栏中）
        const submitBtn = document.querySelector('.btn-generate');
        if (!submitBtn) {
            showToast('找不到生成按钮', 'error');
            return;
        }

        setLoading(submitBtn, true);

        // 显示生成进度
        resultDiv.innerHTML = `
            <div class="generation-progress">
                <div class="progress-header">
                    <div class="progress-icon">✨</div>
                    <div class="progress-text">正在生成图片...</div>
                    <div class="progress-subtext">AI 正在精心创作，请稍候</div>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                </div>
            </div>
        `;

        // 启动进度条动画
        const progressFill = resultDiv.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = '0%';
            setTimeout(() => {
                progressFill.style.width = '30%';
            }, 100);
            setTimeout(() => {
                progressFill.style.width = '60%';
            }, 1000);
            setTimeout(() => {
                progressFill.style.width = '90%';
            }, 3000);
        }

        try {
            const requestBody = {
                prompt: finalPrompt,
                text_content: textContent || null,
                aspect_ratio: aspectRatio
            };

            // 如果有参考图片，添加到请求中
            if (state.referenceImageData) {
                requestBody.reference_image = state.referenceImageData;
            }

            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            if (data.success) {
                // 完成进度条
                if (progressFill) {
                    progressFill.style.width = '100%';
                }

                // 显示文件命名对话框
                showFilenameDialog(data.filename, async (finalFilename) => {
                    // 如果文件名需要改变，调用重命名 API
                    if (finalFilename !== data.filename) {
                        try {
                            const renameResponse = await fetch('/api/rename', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    old_filename: data.filename,
                                    new_filename: finalFilename
                                })
                            });

                            const renameData = await renameResponse.json();

                            if (renameData.success) {
                                // 更新显示的文件名和 URL
                                data.filename = finalFilename;
                                data.url = renameData.url;
                            } else {
                                showToast(`重命名失败: ${renameData.error}`, 'error');
                            }
                        } catch (error) {
                            showToast(`重命名失败: ${error.message}`, 'error');
                        }
                    }

                    // 显示结果（带缩放控制）
                    const imageId = 'generated-img-' + Date.now();
                    resultDiv.innerHTML = `
                        <div class="result-image">
                            <div class="result-image-container" id="${imageId}-container">
                                <img id="${imageId}" data-result-image="${imageId}" src="${data.url}" alt="${escapeHtml(finalPrompt)}">
                                <div class="image-zoom-controls">
                                    <button class="zoom-btn zoom-out" data-image-id="${imageId}" title="缩小">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <circle cx="11" cy="11" r="8"/>
                                            <path d="M21 21l-4.35-4.35"/>
                                            <path d="M8 11h6"/>
                                        </svg>
                                    </button>
                                    <span class="zoom-level" id="${imageId}-level">100%</span>
                                    <button class="zoom-btn zoom-in" data-image-id="${imageId}" title="放大">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <circle cx="11" cy="11" r="8"/>
                                            <path d="M21 21l-4.35-4.35"/>
                                            <path d="M11 8v6M8 11h6"/>
                                        </svg>
                                    </button>
                                    <button class="zoom-btn zoom-reset" data-image-id="${imageId}" title="重置">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                                            <path d="M3 3v5h5"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="result-actions">
                            <button class="btn btn-secondary" onclick="openLightbox('${data.url}', '${escapeHtml(finalPrompt)}')">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                                </svg>
                                查看大图
                            </button>
                            <button class="btn btn-secondary" onclick="downloadImage('${data.url}', '${data.filename}')">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                    <path d="M7 10l5 5 5-5"/>
                                    <path d="M12 15V3"/>
                                </svg>
                                下载
                            </button>
                        </div>
                    `;

                    // 初始化该图片的缩放功能
                    initImageZoomControls(imageId);
                    showToast('图片生成成功！', 'success');
                });
            } else {
                resultDiv.innerHTML = '';
                showToast(`生成失败: ${data.error}`, 'error');
            }
        } catch (error) {
            resultDiv.innerHTML = '';
            showToast(`请求失败: ${error.message}`, 'error');
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
            showToast('请输入至少一个提示词', 'error');
            return;
        }

        if (prompts.length > 10) {
            showToast('最多支持 10 个提示词', 'error');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        setLoading(submitBtn, true);

        // 显示进度
        resultDiv.innerHTML = `
            <div class="batch-progress">
                <div class="loading-pulse" style="text-align: center; padding: 40px;">
                    <div style="font-size: 2rem; margin-bottom: 12px;">🎨</div>
                    <div>正在批量生成 ${prompts.length} 张图片...</div>
                    <div style="font-size: 0.875rem; color: var(--text-dim); margin-top: 8px;">请稍候，这可能需要一些时间</div>
                </div>
            </div>
        `;

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
            data.results.forEach((result) => {
                if (result.success) {
                    html += `
                        <div class="batch-item success" onclick="openLightbox('${result.url}', '${escapeHtml(result.prompt)}')">
                            <img src="${result.url}" alt="${escapeHtml(result.prompt)}">
                            <div class="prompt">${escapeHtml(result.prompt)}</div>
                        </div>
                    `;
                } else {
                    html += `
                        <div class="batch-item error">
                            <div class="error-msg">生成失败</div>
                            <div class="prompt">${escapeHtml(result.prompt)}</div>
                        </div>
                    `;
                }
            });
            html += '</div>';

            resultDiv.innerHTML = html;

            if (data.failed === 0) {
                showToast(`批量生成完成！成功: ${data.succeeded}`, 'success');
            } else {
                showToast(`批量生成完成！成功: ${data.succeeded}, 失败: ${data.failed}`, 'error');
            }
        } catch (error) {
            resultDiv.innerHTML = '';
            showToast(`请求失败: ${error.message}`, 'error');
        } finally {
            setLoading(submitBtn, false);
        }
    });
}

// 加载历史记录
async function loadHistory() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '<div class="empty-state loading-pulse">加载中...</div>';

    try {
        const response = await fetch('/api/images');
        const data = await response.json();

        if (data.images.length === 0) {
            historyList.innerHTML = '<div class="empty-state">暂无生成的图片<br><small>快去生成你的第一张图片吧！</small></div>';
            return;
        }

        let html = '';
        data.images.reverse().forEach(img => {
            html += `
                <div class="history-item" onclick="openLightbox('${img.url}', '历史图片')">
                    <img src="${img.url}" alt="${img.filename}" loading="lazy">
                    <div class="filename">${img.filename}</div>
                </div>
            `;
        });
        historyList.innerHTML = html;
    } catch (error) {
        historyList.innerHTML = `<div class="empty-state">加载失败: ${error.message}</div>`;
    }
}

// 初始化刷新按钮
function initRefreshButton() {
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadHistory();
            showToast('已刷新', 'success');
        });
    }
}

// 初始化灯箱
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const closeBtn = lightbox?.querySelector('.lightbox-close');

    closeBtn?.addEventListener('click', closeLightbox);

    lightbox?.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // 下载按钮
    const downloadBtn = document.getElementById('lightbox-download');
    downloadBtn?.addEventListener('click', () => {
        if (state.currentLightboxImage) {
            const filename = state.currentLightboxImage.split('/').pop();
            downloadImage(state.currentLightboxImage, filename);
        }
    });

    // 复制按钮
    const copyBtn = document.getElementById('lightbox-copy');
    copyBtn?.addEventListener('click', () => {
        if (state.currentPrompt) {
            navigator.clipboard.writeText(state.currentPrompt).then(() => {
                showToast('提示词已复制', 'success');
            }).catch(() => {
                showToast('复制失败', 'error');
            });
        }
    });

    // ESC 键关闭
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeLightbox();
        }
    });
}

// 打开灯箱
function openLightbox(url, prompt) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = lightbox?.querySelector('.lightbox-image');
    const lightboxPrompt = lightbox?.querySelector('.lightbox-prompt');

    state.currentLightboxImage = url;
    state.currentPrompt = prompt;

    if (lightboxImage) {
        lightboxImage.src = url;
    }
    if (lightboxPrompt) {
        lightboxPrompt.textContent = prompt;
    }

    lightbox?.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// 关闭灯箱
function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox?.classList.remove('active');
    document.body.style.overflow = '';
    state.currentLightboxImage = null;
    state.currentPrompt = null;
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

// Toast 通知
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('active');

    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
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
        showToast('下载已开始', 'success');
    } catch (error) {
        showToast('下载失败', 'error');
    }
}

// 生成默认文件名（基于日期时间）
function generateDefaultFilename() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}_${hours}${minutes}${seconds}.png`;
}

// 显示文件命名对话框
function showFilenameDialog(currentFilename, onConfirm) {
    const dialog = document.getElementById('filename-dialog');
    const input = document.getElementById('filename-input');
    const defaultSpan = document.getElementById('default-filename');
    const confirmBtn = document.getElementById('filename-confirm');
    const cancelBtn = document.getElementById('filename-cancel');

    // 生成默认文件名
    const defaultFilename = generateDefaultFilename();
    defaultSpan.textContent = defaultFilename;

    // 清空输入框
    input.value = '';

    // 显示对话框
    dialog.classList.add('active');

    // 聚焦输入框
    setTimeout(() => input.focus(), 100);

    // 定义处理函数
    const handleConfirm = () => {
        const userFilename = input.value.trim();
        let finalFilename = userFilename || defaultFilename;

        // 确保文件名以 .png 结尾
        if (!finalFilename.toLowerCase().endsWith('.png')) {
            finalFilename += '.png';
        }

        closeDialogAndConfirm(finalFilename);
    };

    const handleCancel = () => {
        closeDialogAndConfirm(defaultFilename);
    };

    const closeDialogAndConfirm = (filename) => {
        // 移除所有事件监听器
        confirmBtn.removeEventListener('click', confirmHandler);
        cancelBtn.removeEventListener('click', cancelHandler);
        input.removeEventListener('keydown', keydownHandler);
        dialog.removeEventListener('click', bgClickHandler);

        // 关闭对话框
        dialog.classList.remove('active');

        // 调用回调
        if (onConfirm) {
            onConfirm(filename);
        }
    };

    // 创建事件处理函数（用于后续移除）
    const confirmHandler = () => handleConfirm();
    const cancelHandler = () => handleCancel();
    const keydownHandler = (e) => {
        if (e.key === 'Enter') {
            handleConfirm();
        }
    };
    const bgClickHandler = (e) => {
        if (e.target === dialog || e.target.classList.contains('dialog-overlay')) {
            handleCancel();
        }
    };

    // 绑定事件监听器
    confirmBtn.addEventListener('click', confirmHandler);
    cancelBtn.addEventListener('click', cancelHandler);
    input.addEventListener('keydown', keydownHandler);
    dialog.addEventListener('click', bgClickHandler);
}

// 获取宽高比小数
function getAspectRatioDecimal(ratio) {
    const [w, h] = ratio.split(':').map(Number);
    return w / h;
}

// HTML 转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== 用户模板功能 =====

// 初始化保存模板按钮
function initSaveTemplateButton() {
    const saveBtn = document.getElementById('save-template-btn');
    const dialog = document.getElementById('save-template-dialog');
    const confirmBtn = document.getElementById('save-template-confirm');
    const cancelBtn = document.getElementById('save-template-cancel');
    const nameInput = document.getElementById('template-name-input');

    saveBtn?.addEventListener('click', () => {
        const promptTextarea = document.getElementById('prompt');
        const textContentTextarea = document.getElementById('text-content');
        const currentPrompt = promptTextarea?.value.trim();
        const currentTextContent = textContentTextarea?.value.trim() || '';

        if (!currentPrompt && !currentTextContent) {
            showToast('请先输入提示词或文本内容', 'error');
            return;
        }

        dialog.classList.add('active');
        nameInput.value = '';
        setTimeout(() => nameInput.focus(), 100);
    });

    const handleSave = async () => {
        const promptTextarea = document.getElementById('prompt');
        const textContentTextarea = document.getElementById('text-content');
        const currentPrompt = promptTextarea?.value.trim() || '';
        const currentTextContent = textContentTextarea?.value.trim() || '';
        const templateName = nameInput.value.trim();

        if (!templateName) {
            showToast('请输入模板名称', 'error');
            nameInput.focus();
            return;
        }

        // 合并提示词和文本内容用于保存
        let combinedPrompt = currentPrompt;
        if (currentTextContent) {
            combinedPrompt = currentPrompt ? `${currentPrompt}。${currentTextContent}` : currentTextContent;
        }

        try {
            const response = await fetch('/api/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: templateName,
                    prompt: combinedPrompt,
                    // 额外保存原始的提示词和文本内容，用于恢复
                    prompt_only: currentPrompt,
                    text_content: currentTextContent
                })
            });

            const data = await response.json();

            if (data.success) {
                showToast('模板已保存', 'success');
                dialog.classList.remove('active');
                loadUserTemplates();
            } else {
                showToast(`保存失败: ${data.error}`, 'error');
            }
        } catch (error) {
            showToast(`保存失败: ${error.message}`, 'error');
        }
    };

    confirmBtn?.addEventListener('click', handleSave);

    nameInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            handleSave();
        }
    });

    cancelBtn?.addEventListener('click', () => {
        dialog.classList.remove('active');
    });

    dialog?.addEventListener('click', (e) => {
        if (e.target === dialog || e.target.classList.contains('dialog-overlay')) {
            dialog.classList.remove('active');
        }
    });
}

// 初始化用户模板功能
function initUserTemplates() {
    loadUserTemplates();
}

// 加载用户模板列表
async function loadUserTemplates() {
    const templatesList = document.getElementById('user-templates-list');

    try {
        const response = await fetch('/api/templates');
        const data = await response.json();

        state.userTemplates = data.templates || [];

        if (state.userTemplates.length === 0) {
            templatesList.innerHTML = '<div class="empty-templates">暂无保存的模板</div>';
            return;
        }

        templatesList.innerHTML = state.userTemplates.map(template => `
            <div class="user-template-item" data-template-id="${template.id}">
                <button type="button" class="user-template-btn" data-template-id="${template.id}" title="点击应用模板">
                    <span class="template-name">${escapeHtml(template.name)}</span>
                </button>
                <div class="template-actions">
                    <button type="button" class="template-action-btn delete-template" data-template-id="${template.id}" title="删除模板">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');

        bindUserTemplateEvents();

    } catch (error) {
        templatesList.innerHTML = `<div class="empty-templates">加载失败: ${error.message}</div>`;
    }
}

// 绑定用户模板事件
function bindUserTemplateEvents() {
    const templatesList = document.getElementById('user-templates-list');

    const templateBtns = templatesList.querySelectorAll('.user-template-btn');
    templateBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const templateId = btn.dataset.templateId;
            const template = state.userTemplates.find(t => t.id === templateId);

            if (template) {
                applyUserTemplate(template);
            }
        });
    });

    const deleteBtns = templatesList.querySelectorAll('.delete-template');
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const templateId = btn.dataset.templateId;

            if (confirm('确定要删除这个模板吗？')) {
                await deleteUserTemplate(templateId);
            }
        });
    });
}

// 应用用户模板
function applyUserTemplate(template) {
    const promptTextarea = document.getElementById('prompt');
    const currentPrompt = promptTextarea?.value.trim() || '';

    if (currentPrompt) {
        showPromptMergeDialogForTemplate(currentPrompt, template);
    } else {
        if (promptTextarea) {
            promptTextarea.value = template.prompt;
            promptTextarea.focus();
            showToast(`已应用模板: ${template.name}`, 'success');
        }
    }
}

// 显示模板提示词合并对话框
function showPromptMergeDialogForTemplate(currentPrompt, template) {
    const dialog = document.getElementById('prompt-merge-dialog');
    if (!dialog) return;

    dialog.classList.add('active');

    window.promptMergeState = {
        current: currentPrompt,
        template: template
    };

    // 清理旧的事件监听器（如果存在）
    if (window.promptMergeTemplateDialogHandlers) {
        window.promptMergeTemplateDialogHandlers.forEach(handler => {
            if (handler.element && handler.event && handler.fn) {
                handler.element.removeEventListener(handler.event, handler.fn);
            }
        });
    }

    // 创建新的事件处理函数
    const handlers = [];

    const dialogBtns = dialog.querySelectorAll('.dialog-btn');
    dialogBtns.forEach(btn => {
        const btnHandler = () => {
            const action = btn.dataset.action;
            handlePromptMergeForTemplate(action);
            closeDialog();
        };
        btn.addEventListener('click', btnHandler);
        handlers.push({ element: btn, event: 'click', fn: btnHandler });
    });

    const cancelBtn = document.getElementById('dialog-cancel');
    if (cancelBtn) {
        const cancelHandler = () => {
            closeDialog();
        };
        cancelBtn.addEventListener('click', cancelHandler);
        handlers.push({ element: cancelBtn, event: 'click', fn: cancelHandler });
    }

    const bgClickHandler = (e) => {
        if (e.target === dialog || e.target.classList.contains('dialog-overlay')) {
            closeDialog();
        }
    };
    dialog.addEventListener('click', bgClickHandler);
    handlers.push({ element: dialog, event: 'click', fn: bgClickHandler });

    // 关闭对话框函数
    function closeDialog() {
        dialog.classList.remove('active');
        // 清理事件监听器
        handlers.forEach(handler => {
            handler.element.removeEventListener(handler.event, handler.fn);
        });
    }

    // 保存处理器引用供后续清理
    window.promptMergeTemplateDialogHandlers = handlers;
}

// 处理模板提示词合并
function handlePromptMergeForTemplate(action) {
    const { current, template } = window.promptMergeState || {};
    const promptTextarea = document.getElementById('prompt');

    if (!promptTextarea) return;

    const ratioPattern = /\s*--ar\s+\d+:\d+\s*$/g;
    const cleanedCurrent = current.replace(ratioPattern, '').trim();

    let newPrompt = '';
    switch (action) {
        case 'replace':
            newPrompt = template.prompt;
            break;
        case 'append':
            newPrompt = `${cleanedCurrent}, ${template.prompt}`;
            break;
        case 'prepend':
            newPrompt = `${template.prompt}, ${cleanedCurrent}`;
            break;
    }

    promptTextarea.value = newPrompt;

    if (state.selectedRatio) {
        addRatioToPrompt(state.selectedRatio);
    }

    promptTextarea.focus();

    // 关闭对话框并清理事件监听器
    const dialog = document.getElementById('prompt-merge-dialog');
    if (dialog && window.promptMergeTemplateDialogHandlers) {
        dialog.classList.remove('active');
        window.promptMergeTemplateDialogHandlers.forEach(handler => {
            handler.element.removeEventListener(handler.event, handler.fn);
        });
        window.promptMergeTemplateDialogHandlers = null;
    }

    showToast(`已应用模板: ${template.name}`, 'success');
}

// 删除用户模板
async function deleteUserTemplate(templateId) {
    try {
        const response = await fetch(`/api/templates/${templateId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            showToast('模板已删除', 'success');
            loadUserTemplates();
        } else {
            showToast(`删除失败: ${data.error}`, 'error');
        }
    } catch (error) {
        showToast(`删除失败: ${error.message}`, 'error');
    }
}

// ===== 图片缩放功能 =====

// 初始化图片缩放功能（全局初始化）
function initImageZoom() {
    // 这里可以添加全局的图片缩放相关初始化
    // 目前主要通过 initImageZoomControls 为每个生成的图片单独初始化
}

// 初始化单个图片的缩放控件
function initImageZoomControls(imageId) {
    const container = document.getElementById(`${imageId}-container`);
    const img = document.getElementById(imageId);
    const zoomOutBtn = container.querySelector('.zoom-out');
    const zoomInBtn = container.querySelector('.zoom-in');
    const zoomResetBtn = container.querySelector('.zoom-reset');
    const zoomLevelSpan = document.getElementById(`${imageId}-level`);

    // 为该图片创建独立的缩放状态
    const imageState = {
        zoom: 100,
        minZoom: state.minZoom,
        maxZoom: state.maxZoom
    };

    // 更新图片缩放
    function updateZoom(newZoom) {
        imageState.zoom = Math.max(imageState.minZoom, Math.min(imageState.maxZoom, newZoom));
        img.style.transform = `scale(${imageState.zoom / 100})`;
        zoomLevelSpan.textContent = `${imageState.zoom}%`;

        // 更新按钮状态
        zoomOutBtn.disabled = imageState.zoom <= imageState.minZoom;
        zoomInBtn.disabled = imageState.zoom >= imageState.maxZoom;

        // 添加/移除 zoomed 类
        if (imageState.zoom > 100) {
            img.classList.add('zoomed');
        } else {
            img.classList.remove('zoomed');
        }
    }

    // 缩小按钮
    zoomOutBtn.addEventListener('click', () => {
        updateZoom(imageState.zoom - 25);
    });

    // 放大按钮
    zoomInBtn.addEventListener('click', () => {
        updateZoom(imageState.zoom + 25);
    });

    // 重置按钮
    zoomResetBtn.addEventListener('click', () => {
        updateZoom(100);
    });

    // 点击图片切换缩放
    img.addEventListener('click', () => {
        if (imageState.zoom === 100) {
            updateZoom(150);
        } else {
            updateZoom(100);
        }
    });

    // 鼠标滚轮缩放
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -25 : 25;
        updateZoom(imageState.zoom + delta);
    }, { passive: false });

    // 初始化状态
    updateZoom(100);
}
