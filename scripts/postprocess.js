const fs = require('fs');
const path = require('path');

const TARGET_DIR = process.env.TARGET_DIR || path.join(__dirname, '..', 'static_site_prerendered');
const ROOT = TARGET_DIR;
const SITE_ROOT = path.join(ROOT, 'computeb.com');

function walk(dir, files = []) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) walk(full, files);
		else files.push(full);
	}
	return files;
}

function rewriteHtml(filePath) {
    let html = fs.readFileSync(filePath, 'utf8');
    // Prefix root-absolute href/src with /computeb.com/{path}
    html = html.replace(/(href|src)="\/(?!computeb\.com\/)([^"]*)"/g, '$1="/computeb.com/$2"');
    // Ensure common icon/manifest links point to computed base
    html = html.replace(/href="(?:\.\.\/)?logo\.png"/g, 'href="/computeb.com/logo.png"');
    html = html.replace(/href="(?:\.\.\/)?manifest\.json"/g, 'href="/computeb.com/manifest.json"');
    // Inject router base fix (strip /computeb.com prefix so SPA routes match)
    const fixScript = '<script>(function(){try{var base="/computeb.com";if(location.pathname.indexOf(base+"/")===0){history.replaceState(null,"",location.pathname.slice(base.length));}}catch(e){}})();</script>';
    if (!html.includes('history.replaceState(null,"",location.pathname.slice(base.length))')) {
        html = html.replace('</head>', fixScript + '</head>');
    }
    fs.writeFileSync(filePath, html);
}

function ensureRootIndex() {
	const idxPath = path.join(ROOT, 'index.html');
	if (!fs.existsSync(idxPath)) {
		const content = '<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=/computeb.com/%E4%B8%BB%E9%A0%81/">\n<script>location.replace("/computeb.com/%E4%B8%BB%E9%A0%81/")</script>';
		fs.writeFileSync(idxPath, content);
	}
}

function fixManifestAndIcons() {
    const manifestPath = path.join(SITE_ROOT, 'manifest.json');
    if (!fs.existsSync(manifestPath)) return;
    try {
        const raw = fs.readFileSync(manifestPath, 'utf8');
        const data = JSON.parse(raw);
        if (Array.isArray(data.icons)) {
            data.icons = data.icons.map(icon => {
                if (!icon || !icon.src) return icon;
                const src = icon.src.startsWith('/computeb.com/')
                    ? icon.src
                    : icon.src.startsWith('/')
                        ? '/computeb.com' + icon.src
                        : '/computeb.com/' + icon.src;
                const fileRel = src.replace('/computeb.com/', '');
                const fileAbs = path.join(SITE_ROOT, fileRel);
                if (!fs.existsSync(fileAbs)) {
                    const logoAbs = path.join(SITE_ROOT, 'logo.png');
                    if (fs.existsSync(logoAbs)) {
                        try { fs.copyFileSync(logoAbs, fileAbs); } catch {}
                    }
                }
                return { ...icon, src };
            });
        }
        fs.writeFileSync(manifestPath, JSON.stringify(data, null, 2));
    } catch {}
}

function main() {
	ensureRootIndex();
	const htmlFiles = walk(SITE_ROOT).filter(f => f.toLowerCase().endsWith('.html'));
	htmlFiles.forEach(rewriteHtml);
    fixManifestAndIcons();
    console.log('Postprocess complete:', htmlFiles.length, 'HTML files updated.');
}

main();


