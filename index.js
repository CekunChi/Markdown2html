/**
 * Markdown 转富文本工具 - 主逻辑
 * 功能：Markdown 解析、主题切换、图片上传、富文本复制
 */

// ============================================
// 全局变量与 DOM 元素
// ============================================
const markdownInput = document.getElementById('markdownInput');
const previewContent = document.getElementById('previewContent');
const charCount = document.getElementById('charCount');
const copyBtn = document.getElementById('copyBtn');
const clearBtn = document.getElementById('clearBtn');
const imageUpload = document.getElementById('imageUpload');
const imagePanel = document.getElementById('imagePanel');
const imageList = document.getElementById('imageList');
const closePanelBtn = document.getElementById('closePanelBtn');
const toast = document.getElementById('toast');
const themeBtns = document.querySelectorAll('.theme-btn');

// 存储上传的图片
let uploadedImages = [];

// ============================================
// Markdown 解析配置
// ============================================
marked.setOptions({
    highlight: function (code, lang) {
        // 代码高亮
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(code, { language: lang }).value;
            } catch (e) {
                console.error('代码高亮错误:', e);
            }
        }
        return hljs.highlightAuto(code).value;
    },
    breaks: true,        // 支持 GFM 换行
    gfm: true,           // 启用 GitHub Flavored Markdown
    headerIds: false,    // 不自动添加 header id
    mangle: false        // 不转义邮箱地址
});

// ============================================
// 核心功能函数
// ============================================

/**
 * 渲染 Markdown 到预览区
 */
function renderMarkdown() {
    const markdown = markdownInput.value;

    // 更新字数统计
    const count = markdown.replace(/\s/g, '').length;
    charCount.textContent = `${count} 字`;

    // 渲染 Markdown
    if (markdown.trim()) {
        previewContent.innerHTML = marked.parse(markdown);
    } else {
        previewContent.innerHTML = '<p class="empty-hint">在左侧输入 Markdown，这里会实时显示预览...</p>';
    }

    // 保存到本地存储
    localStorage.setItem('md2rich_content', markdown);
}

/**
 * 复制富文本到剪贴板
 */
async function copyRichText() {
    const content = previewContent.innerHTML;

    if (!content || content.includes('empty-hint')) {
        showToast('⚠️ 请先输入 Markdown 内容');
        return;
    }

    try {
        // 创建一个临时容器，用于复制
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = content;

        // 获取计算后的样式并内联
        const styledContent = inlineStyles(tempContainer);

        // 使用 Clipboard API 复制 HTML
        const blob = new Blob([styledContent], { type: 'text/html' });
        const clipboardItem = new ClipboardItem({
            'text/html': blob,
            'text/plain': new Blob([previewContent.innerText], { type: 'text/plain' })
        });

        await navigator.clipboard.write([clipboardItem]);
        showToast('✅ 复制成功！可直接粘贴到公众号', 'success');

        // 复制按钮动效
        copyBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            copyBtn.style.transform = '';
        }, 150);

    } catch (err) {
        console.error('复制失败:', err);
        // 降级方案：使用 execCommand
        fallbackCopy();
    }
}

/**
 * 降级复制方案
 */
function fallbackCopy() {
    try {
        const range = document.createRange();
        range.selectNodeContents(previewContent);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand('copy');
        selection.removeAllRanges();
        showToast('✅ 复制成功！可直接粘贴到公众号', 'success');
    } catch (err) {
        showToast('❌ 复制失败，请手动选择复制');
    }
}

/**
 * 内联样式处理（确保粘贴时保留样式）
 */
function inlineStyles(container) {
    const clone = container.cloneNode(true);

    // 获取当前主题的样式变量
    const computedStyle = getComputedStyle(document.documentElement);
    const articleText = computedStyle.getPropertyValue('--article-text').trim() || '#3f3f3f';
    const articleHeading = computedStyle.getPropertyValue('--article-heading').trim() || '#1a1a1a';
    const articleLink = computedStyle.getPropertyValue('--article-link').trim() || '#576b95';
    const accentColor = computedStyle.getPropertyValue('--accent-color').trim() || '#3b82f6';
    const articleQuoteBg = computedStyle.getPropertyValue('--article-quote-bg').trim() || '#f7f7f7';
    const articleCodeBg = computedStyle.getPropertyValue('--article-code-bg').trim() || '#f6f8fa';
    const articleCodeText = computedStyle.getPropertyValue('--article-code-text').trim() || '#24292e';

    // 基础样式
    const baseStyle = `color: ${articleText}; font-size: 16px; line-height: 1.75; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;`;

    // 为各元素添加内联样式
    clone.querySelectorAll('h1').forEach(el => {
        el.style.cssText = `color: ${articleHeading}; font-size: 1.8em; font-weight: 700; text-align: center; padding-bottom: 0.5em; margin: 1.5em 0 0.8em; line-height: 1.4; border-bottom: 2px solid ${accentColor};`;
    });

    clone.querySelectorAll('h2').forEach(el => {
        el.style.cssText = `color: ${articleHeading}; font-size: 1.5em; font-weight: 700; padding-left: 12px; margin: 1.5em 0 0.8em; line-height: 1.4; border-left: 4px solid ${accentColor};`;
    });

    clone.querySelectorAll('h3').forEach(el => {
        el.style.cssText = `color: ${articleHeading}; font-size: 1.25em; font-weight: 700; margin: 1.5em 0 0.8em; line-height: 1.4;`;
    });

    clone.querySelectorAll('h4, h5, h6').forEach(el => {
        el.style.cssText = `color: ${articleHeading}; font-size: 1.1em; font-weight: 700; margin: 1.5em 0 0.8em; line-height: 1.4;`;
    });

    clone.querySelectorAll('p').forEach(el => {
        el.style.cssText = `${baseStyle} margin-bottom: 1em; text-align: justify;`;
    });

    clone.querySelectorAll('a').forEach(el => {
        el.style.cssText = `color: ${articleLink}; text-decoration: none; border-bottom: 1px solid ${articleLink};`;
    });

    clone.querySelectorAll('strong').forEach(el => {
        el.style.cssText = `color: ${articleHeading}; font-weight: 700;`;
    });

    clone.querySelectorAll('blockquote').forEach(el => {
        el.style.cssText = `margin: 1.5em 0; padding: 16px 20px; background: ${articleQuoteBg}; border-left: 4px solid ${accentColor}; border-radius: 0 6px 6px 0;`;
    });

    clone.querySelectorAll('pre').forEach(el => {
        el.style.cssText = `margin: 1.5em 0; padding: 16px 20px; background: ${articleCodeBg}; border-radius: 10px; overflow-x: auto;`;
    });

    clone.querySelectorAll('code').forEach(el => {
        if (el.parentElement.tagName !== 'PRE') {
            el.style.cssText = `font-family: 'SF Mono', 'Fira Code', 'Monaco', monospace; font-size: 0.9em; background: ${articleCodeBg}; color: ${articleCodeText}; padding: 2px 6px; border-radius: 4px;`;
        } else {
            el.style.cssText = `font-family: 'SF Mono', 'Fira Code', 'Monaco', monospace; font-size: 0.875em; line-height: 1.6; color: ${articleCodeText};`;
        }
    });

    clone.querySelectorAll('ul, ol').forEach(el => {
        el.style.cssText = `${baseStyle} margin: 1em 0; padding-left: 2em;`;
    });

    clone.querySelectorAll('li').forEach(el => {
        el.style.cssText = `${baseStyle} margin: 0.5em 0;`;
    });

    clone.querySelectorAll('table').forEach(el => {
        el.style.cssText = `width: 100%; margin: 1.5em 0; border-collapse: collapse; font-size: 0.95em;`;
    });

    clone.querySelectorAll('th, td').forEach(el => {
        el.style.cssText = `padding: 12px 16px; border: 1px solid #e2e8f0; text-align: left;`;
    });

    clone.querySelectorAll('th').forEach(el => {
        el.style.cssText += `background: #f1f5f9; font-weight: 600; color: ${articleHeading};`;
    });

    clone.querySelectorAll('img').forEach(el => {
        el.style.cssText = `max-width: 100%; height: auto; display: block; margin: 1.5em auto; border-radius: 10px;`;
    });

    clone.querySelectorAll('hr').forEach(el => {
        el.style.cssText = `margin: 2em 0; border: none; height: 1px; background: linear-gradient(to right, transparent, #e2e8f0, transparent);`;
    });

    return clone.innerHTML;
}

/**
 * 切换主题
 */
function switchTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);

    // 更新按钮状态
    themeBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });

    // 保存主题偏好
    localStorage.setItem('md2rich_theme', theme);
}

/**
 * 处理图片上传
 */
function handleImageUpload(files) {
    Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) {
            showToast('⚠️ 只支持图片文件');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target.result;
            const imageData = {
                id: Date.now() + Math.random(),
                name: file.name,
                base64: base64
            };

            uploadedImages.push(imageData);
            renderImageList();
            showToast('✅ 图片上传成功');

            // 显示图片面板
            imagePanel.classList.add('active');
        };
        reader.readAsDataURL(file);
    });
}

/**
 * 渲染图片列表
 */
function renderImageList() {
    if (uploadedImages.length === 0) {
        imageList.innerHTML = '<p class="empty-hint">暂无上传图片，点击上方按钮上传</p>';
        return;
    }

    imageList.innerHTML = uploadedImages.map(img => `
        <div class="image-item" data-id="${img.id}">
            <img src="${img.base64}" alt="${img.name}">
            <div class="image-item-actions">
                <button class="image-item-btn copy" onclick="copyImageMarkdown('${img.id}')">复制链接</button>
                <button class="image-item-btn delete" onclick="deleteImage('${img.id}')">删除</button>
            </div>
        </div>
    `).join('');
}

/**
 * 复制图片 Markdown 语法
 */
function copyImageMarkdown(id) {
    const img = uploadedImages.find(i => i.id == id);
    if (img) {
        const markdown = `![${img.name}](${img.base64})`;
        navigator.clipboard.writeText(markdown).then(() => {
            showToast('✅ 图片链接已复制，可粘贴到编辑器');
        });
    }
}

/**
 * 删除图片
 */
function deleteImage(id) {
    uploadedImages = uploadedImages.filter(i => i.id != id);
    renderImageList();
    showToast('🗑️ 图片已删除');
}

/**
 * 清除所有内容
 */
function clearContent() {
    if (markdownInput.value.trim() === '') {
        showToast('⚠️ 编辑器已经是空的');
        return;
    }

    // 确认对话框
    if (confirm('确定要清除所有内容吗？')) {
        markdownInput.value = '';
        renderMarkdown();
        localStorage.removeItem('md2rich_content');
        showToast('🗑️ 内容已清除', 'success');
    }
}

/**
 * 显示提示消息
 */
function showToast(message, type = '') {
    toast.textContent = message;
    toast.className = 'toast show' + (type ? ` ${type}` : '');

    setTimeout(() => {
        toast.className = 'toast';
    }, 2500);
}

// ============================================
// 事件绑定
// ============================================

// Markdown 输入实时渲染
markdownInput.addEventListener('input', renderMarkdown);

// 复制按钮
copyBtn.addEventListener('click', copyRichText);

// 清除按钮
clearBtn.addEventListener('click', clearContent);

// 主题切换
themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        switchTheme(btn.dataset.theme);
    });
});

// 图片上传
imageUpload.addEventListener('change', (e) => {
    handleImageUpload(e.target.files);
    e.target.value = ''; // 重置以便再次上传相同文件
});

// 关闭图片面板
closePanelBtn.addEventListener('click', () => {
    imagePanel.classList.remove('active');
});

// 拖拽上传图片
document.addEventListener('dragover', (e) => {
    e.preventDefault();
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length) {
        handleImageUpload(files);
    }
});

// 键盘快捷键
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S 保存（防止默认行为）
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        showToast('💾 内容已自动保存到本地');
    }

    // Ctrl/Cmd + Shift + C 复制富文本
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        copyRichText();
    }
});

// ============================================
// 初始化
// ============================================

function init() {
    // 恢复保存的主题
    const savedTheme = localStorage.getItem('md2rich_theme') || 'default';
    switchTheme(savedTheme);

    // 恢复保存的内容
    const savedContent = localStorage.getItem('md2rich_content');
    if (savedContent) {
        markdownInput.value = savedContent;
        renderMarkdown();
    }

    // 初始化渲染
    if (!savedContent) {
        // 添加示例内容
        markdownInput.value = `# 欢迎使用 MD2Rich

这是一个 **Markdown 转富文本** 工具，专为微信公众号优化。

## 主要功能

- 📝 实时 Markdown 编辑与预览
- 📋 一键复制富文本，直接粘贴到公众号
- 🎨 三套精美主题可选
- 🖼️ 支持图片上传转 Base64

## 代码高亮

\`\`\`python
def hello():
    print("Hello, World!")
\`\`\`

## 引用示例

> 这是一段引用文本，适合用来强调重要内容或引用他人观点。

## 表格示例

| 功能 | 说明 |
|------|------|
| 实时预览 | 所见即所得 |
| 一键复制 | 支持富文本 |

---

**💡 提示**：使用 \`Ctrl + Shift + C\` 快速复制富文本！
`;
        renderMarkdown();
    }
}

// 启动应用
init();
