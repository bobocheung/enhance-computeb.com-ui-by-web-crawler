const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const SRC = path.join(__dirname, '..', 'static_site_prerendered');
const OUT = path.join(__dirname, '..', 'static_site_clean');

function copyDir(src, dest){
	if (fs.existsSync(dest)) fs.rmSync(dest, {recursive: true, force: true});
	fs.mkdirSync(dest, {recursive: true});
	for (const entry of fs.readdirSync(src, {withFileTypes: true})){
		const s = path.join(src, entry.name);
		const d = path.join(dest, entry.name);
		if (entry.isDirectory()) copyDir(s, d); else fs.copyFileSync(s, d);
	}
}

function main(){
	copyDir(SRC, OUT);
	// run postprocess on OUT only (rewrite paths, root index)
	spawnSync(process.execPath, [path.join(__dirname, 'postprocess.js')], {
		stdio: 'inherit',
		env: { ...process.env, TARGET_DIR: OUT }
	});
	console.log('Clean export at', OUT);
}

main();


