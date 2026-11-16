// 从 content/group.js 读取小组人数，生成 AO3 卡片用的 assets/ao3/members.svg。
// 本地：node tools/ao3-badge.js；推送到 GitHub 后由 .github/workflows/ao3-badge.yml 自动执行。
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'content/group.js'), 'utf8'), ctx);
const text = `${ctx.window.DOJIA_GROUP.members} 位组员`;
const size = 13, h = 18;
// 估算宽度：中日韩字符约 1em，数字／逗号约 0.6em，空格 0.3em
const w = Math.ceil([...text].reduce((s, c) => s + (/[　-鿿]/.test(c) ? 1 : c === ' ' ? .3 : .55) * size, 0)) + 1;
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(text)}"><text x="0" y="14" font-size="${size}" fill="#666" font-family="-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif">${esc(text)}</text></svg>\n`;
const out = path.join(root, 'assets/ao3/members.svg');
fs.mkdirSync(path.dirname(out), { recursive: true });
if (!fs.existsSync(out) || fs.readFileSync(out, 'utf8') !== svg) { fs.writeFileSync(out, svg); console.log('updated:', text); }
else console.log('unchanged:', text);
