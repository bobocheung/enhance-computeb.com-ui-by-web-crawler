const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const SRC = path.join(__dirname, '..', 'static_site_clean');
const OUT = path.join(__dirname, '..', 'static_site_clean_plus');

function copyDir(src, dest){
	if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true, force: true });
	fs.mkdirSync(dest, { recursive: true });
	for (const entry of fs.readdirSync(src, { withFileTypes: true })){
		const s = path.join(src, entry.name);
		const d = path.join(dest, entry.name);
		if (entry.isDirectory()) copyDir(s, d); else fs.copyFileSync(s, d);
	}
}

function walk(dir, files = []){
	for(const e of fs.readdirSync(dir, {withFileTypes:true})){
		const full = path.join(dir, e.name);
		if(e.isDirectory()) walk(full, files); else files.push(full);
	}
	return files;
}

function injectEnhancements(root){
	const themeDir = path.join(root, 'theme');
	if(!fs.existsSync(themeDir)) fs.mkdirSync(themeDir, { recursive:true });
	fs.copyFileSync(path.join(__dirname, '..', 'theme', 'ux_enhancements.css'), path.join(themeDir, 'ux_enhancements.css'));
	fs.copyFileSync(path.join(__dirname, '..', 'theme', 'ux_enhancements.js'), path.join(themeDir, 'ux_enhancements.js'));

	const htmlFiles = walk(root).filter(f => f.toLowerCase().endsWith('.html'));
	htmlFiles.forEach(file => {
		let html = fs.readFileSync(file, 'utf8');
		if(!html.includes('theme/ux_enhancements.css')){
			const relCss = path.relative(path.dirname(file), path.join(root,'theme','ux_enhancements.css')).replace(/\\/g,'/');
			const relJs = path.relative(path.dirname(file), path.join(root,'theme','ux_enhancements.js')).replace(/\\/g,'/');
			html = html.replace('</head>', `<link rel="stylesheet" href="${relCss}"><script defer src="${relJs}"></script></head>`);
			fs.writeFileSync(file, html);
		}
	});
}

function main(){
	if (!fs.existsSync(SRC)) {
		console.error('Source clean site not found at', SRC, '\nRun: npm run export:clean');
		process.exit(1);
	}
	copyDir(SRC, OUT);
	injectEnhancements(OUT);
	console.log('Clean Plus exported at', OUT);
	console.log('Preview: npx http-server static_site_clean_plus -p 8083');
}

main();


