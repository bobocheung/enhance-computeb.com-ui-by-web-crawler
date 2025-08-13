const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const SRC_ROOT = path.join(__dirname, '..', 'static_site_prerendered', 'computeb.com');
const OUT_ROOT = path.join(__dirname, '..', 'static_site_redesigned');

function walk(dir, files = []){
	for(const e of fs.readdirSync(dir, {withFileTypes:true})){
		const full = path.join(dir, e.name);
		if(e.isDirectory()) walk(full, files); else if (e.name.toLowerCase()==='index.html') files.push(full);
	}
	return files;
}

function ensureDir(dir){ if(!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive:true}); }

function redesign(html, relRoot){
	const $ = cheerio.load(html);
	const title = $('title').text() || 'Page';

	// Remove analytics/scripts that are not needed offline
	$('script[src*="googletagmanager"], script[src*="google-analytics"], script[src*="doubleclick"], script:contains("gtm.js")').remove();

	// Extract meaningful content
	const main = $('<main class="rd-container"></main>');
	const header = $('<header class="rd-header"><h1 class="rd-title"></h1></header>');
	header.find('.rd-title').text(title);

	// Try to collect hero image or first banner
	const heroImg = $('img[src*="Banner"], img[src*="banner"], img').first().attr('src');
	if (heroImg) {
		main.append(`<section class="rd-hero"><img src="${heroImg}"></section>`);
	}

	// For list pages: capture grid/buttons content
	const gridButtons = $('.MuiGrid-item .MuiButton-root');
	if (gridButtons.length > 0) {
		const grid = $('<section class="rd-grid"></section>');
		gridButtons.each((_, el)=>{
			const text = $(el).text().trim();
			grid.append(`<div class="rd-card"><span>${text}</span></div>`);
		});
		main.append(grid);
	}

	// Else capture primary content blocks
	$('.MuiBox-root, section, article').slice(0,3).each((_,el)=>{
		const snippet = $(el).clone();
		// remove heavy iframes
		snippet.find('iframe').remove();
		main.append(`<section class="rd-section">${snippet.html()||''}</section>`);
	});

	// Build skeleton document
	const redesigned = `<!doctype html>
<html lang="zh-HK">
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>${title} · Hand-Drawn</title>
	<link rel="stylesheet" href="${relRoot}theme/handdrawn.css" />
	<link rel="stylesheet" href="${relRoot}theme/redesign.css" />
</head>
<body>
${header.prop('outerHTML')}
${main.prop('outerHTML')}
</body></nhtml>`;

	return redesigned;
}

function main(){
	if (fs.existsSync(OUT_ROOT)) fs.rmSync(OUT_ROOT, {recursive:true, force:true});
	ensureDir(OUT_ROOT);
	// copy theme assets
	ensureDir(path.join(OUT_ROOT, 'theme'));
	fs.copyFileSync(path.join(__dirname, '..', 'theme', 'handdrawn.css'), path.join(OUT_ROOT, 'theme', 'handdrawn.css'));
	fs.writeFileSync(path.join(OUT_ROOT, 'theme', 'redesign.css'), `
/* Layout */
.rd-container{ max-width: 1200px; margin: 32px auto; padding: 0 16px; }
.rd-header{ position: sticky; top: 0; background: #fffef9; padding: 12px 16px; border-bottom: 3px solid #1f1b16; z-index: 5; }
.rd-title{ font-size: 28px; }
.rd-hero img{ width: 100%; display: block; margin: 12px 0 24px; }
.rd-grid{ display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }
.rd-card{ background: #fff5f0; border: 2px solid #1f1b16; border-radius: 12px; padding: 16px; text-align: center; font-weight: 700; }
.rd-section{ background: #fffef9; border: 2px dashed #1f1b16; border-radius: 12px; margin: 16px 0; padding: 16px; }
`);

	const files = walk(SRC_ROOT);
	files.forEach(srcFile => {
		const rel = path.relative(SRC_ROOT, path.dirname(srcFile));
		const outDir = path.join(OUT_ROOT, rel);
		ensureDir(outDir);
		const html = fs.readFileSync(srcFile, 'utf8');
		const relRoot = path.relative(outDir, path.join(OUT_ROOT)).replace(/\\/g,'/');
		const out = redesign(html, relRoot ? relRoot + '/' : './');
		fs.writeFileSync(path.join(outDir, 'index.html'), out);
		console.log('Redesigned:', rel || '/');
	});
	console.log('Output at', OUT_ROOT);
}

main();


