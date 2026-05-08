#!/usr/bin/env node
/**
 * 玄天阁 - GitHub Issues API 初始化脚本
 * 用于创建初始Labels和访客录Issue
 * 
 * 使用前请设置环境变量:
 *   export GITHUB_TOKEN="your_github_pat_token"
 * 
 * 或直接修改下面的配置
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || 'YOUR_GITHUB_TOKEN_HERE';
const OWNER = 'TaiShang123';
const REPO = 'xuantian-pavilion';

if (GITHUB_TOKEN === 'YOUR_GITHUB_TOKEN_HERE') {
    console.error('❌ 请设置 GITHUB_TOKEN 环境变量或修改脚本中的 GITHUB_TOKEN');
    console.error('   export GITHUB_TOKEN="your_token"');
    process.exit(1);
}

const headers = {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json'
};

async function createLabel(name, color, description) {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/labels`;
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify({ name, color, description })
        });
        if (res.status === 201) {
            console.log(`✓ Label "${name}" 创建成功`);
            return true;
        } else if (res.status === 422) {
            console.log(`○ Label "${name}" 已存在`);
            return true;
        } else {
            const data = await res.json();
            console.log(`✗ Label "${name}" 创建失败:`, data.message || res.status);
            return false;
        }
    } catch (e) {
        console.error(`✗ Label "${name}" 请求失败:`, e.message);
        return false;
    }
}

async function createGuestbookIssue() {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/issues`;
    const body = JSON.stringify({
        title: '🗒️ 访客录 - 道友留名处',
        body: `# 访客录

欢迎诸道友入阁留名！

## 签名规则
- 请在下方留言，格式：道友名 + 心情/感悟
- 访客录永久置顶，欢迎常来

---

*守阁童子敬上*
`,
        labels: ['访客录', '公告']
    });
    
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers,
            body
        });
        if (res.status === 201) {
            const data = await res.json();
            console.log(`✓ 访客录Issue创建成功: #${data.number}`);
            return data.number;
        } else if (res.status === 422) {
            console.log('○ 访客录Issue可能已存在（标题重复）');
            return null;
        } else {
            const data = await res.json();
            console.log('✗ 访客录Issue创建失败:', data.message || res.status);
            return null;
        }
    } catch (e) {
        console.error('✗ 访客录Issue请求失败:', e.message);
        return null;
    }
}

async function init() {
    console.log('🔮 玄天阁 GitHub Issues API 初始化\n');
    console.log(`📦 仓库: ${OWNER}/${REPO}\n`);
    
    // 1. 创建Labels
    console.log('━━━ 创建Labels ━━━');
    const labels = [
        { name: '论道', color: '4CAF50', description: '论道厅话题' },
        { name: '问卦', color: '9C27B0', description: '问卦台记录' },
        { name: '论剑', color: 'F44336', description: '论剑场辩论' },
        { name: '访客录', color: '2196F3', description: '访客签名' },
        { name: '公告', color: 'FFC107', description: '站点公告' }
    ];
    
    for (const label of labels) {
        await createLabel(label.name, label.color, label.description);
        await new Promise(r => setTimeout(r, 500));
    }
    
    // 2. 创建访客录Issue
    console.log('\n━━━ 创建访客录Issue ━━━');
    await createGuestbookIssue();
    
    console.log('\n✅ 初始化完成!');
}

init().catch(console.error);
