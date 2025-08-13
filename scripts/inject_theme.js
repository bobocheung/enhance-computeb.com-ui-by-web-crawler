const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'static_site_prerendered');
const SITE_ROOT = path.join(ROOT, 'computeb.com');
const THEME_DIR_SRC = path.join(__dirname, '..', 'theme');
const THEME_CSS_SRC = path.join(THEME_DIR_SRC, 'handdrawn.css');
const THEME_JS_SRC = path.join(THEME_DIR_SRC, 'handdrawn.js');

function walk(dir, files = []){
	for(const e of fs.readdirSync(dir, {withFileTypes:true})){
		const full = path.join(dir, e.name);
		if(e.isDirectory()) walk(full, files); else files.push(full);
	}
	return files;
}

function inject(file){
    let html = fs.readFileSync(file, 'utf8');
    const themeCssDest = path.join(ROOT, 'theme', 'handdrawn.css');
    const themeJsDest = path.join(ROOT, 'theme', 'handdrawn.js');
    const relCss = path.relative(path.dirname(file), themeCssDest).replace(/\\/g,'/');
    const relJs = path.relative(path.dirname(file), themeJsDest).replace(/\\/g,'/');
    const linkTag = `<link rel="stylesheet" href="${relCss}">`;
    const scriptTag = `<script defer src="${relJs}"></script>`;
    // Replace any existing theme link to point to correct relative path; otherwise inject
    if (html.includes('theme/handdrawn.css')) {
        html = html.replace(/<link[^>]+href=\"[^\"]*theme\/handdrawn\.css[^\"]*\"[^>]*>/g, linkTag);
    } else {
        html = html.replace('</head>', linkTag + '</head>');
    }
    if (!html.includes('theme/handdrawn.js')) {
        html = html.replace('</head>', scriptTag + '</head>');
    }
    fs.writeFileSync(file, html);
}

function copyTheme(){
	const destDir = path.join(ROOT, 'theme');
	if(!fs.existsSync(destDir)) fs.mkdirSync(destDir, {recursive:true});
    fs.copyFileSync(THEME_CSS_SRC, path.join(destDir, 'handdrawn.css'));
    if (fs.existsSync(THEME_JS_SRC)) {
        fs.copyFileSync(THEME_JS_SRC, path.join(destDir, 'handdrawn.js'));
    } else {
        fs.writeFileSync(path.join(destDir, 'handdrawn.js'), '');
    }
}

function main(){
	copyTheme();
	const htmls = walk(SITE_ROOT).filter(f=>f.endsWith('.html'));
	htmls.forEach(inject);
	console.log('Injected theme into', htmls.length, 'files.');
}

main();


