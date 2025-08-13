const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const OUT_ROOT = path.join(__dirname, '..', 'static_site_prerendered', 'computeb.com');

const routes = [
	{ path: '%E8%87%AA%E9%81%B8%E7%A0%8C%E6%A9%9F', waitFn: 'document.querySelectorAll("button").length >= 5' },
	{ path: '%E8%85%A6%E7%B4%B0List', waitFn: 'document.querySelectorAll(".MuiGrid-item button").length >= 10' },
	{ path: 'About%20Us', waitFn: 'document.querySelector("#root") && document.querySelector("#root").innerText.trim().length > 100' }
];

function ensureDir(dir) {
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function prerenderPage(browser, route) {
	const url = `https://computeb.com/${route.path}`;
	const page = await browser.newPage();
	await page.goto(url, { waitUntil: 'networkidle0', timeout: 90000 });
    for (let i = 0; i < 3; i++) {
        await page.evaluate(() => window.scrollBy(0, document.body.scrollHeight));
        await new Promise(r => setTimeout(r, 600));
    }
	try {
		await page.waitForFunction(route.waitFn, { timeout: 20000 });
	} catch (_) {}
    await new Promise(r => setTimeout(r, 800));
	let html = await page.content();
	await page.close();

	const dir = path.join(OUT_ROOT, decodeURIComponent(route.path));
	ensureDir(dir);
	const file = path.join(dir, 'index.html');
	fs.writeFileSync(file, html);
	return file;
}

async function main() {
	const browser = await puppeteer.launch({ headless: 'new' });
	for (const r of routes) {
		const file = await prerenderPage(browser, r);
		console.log('Saved', file);
	}
	await browser.close();
}

main().catch(err => {
	console.error(err);
	process.exit(1);
});


