const websiteScraper = require('website-scraper');
const scrape = websiteScraper.default || websiteScraper;
const path = require('path');
const fs = require('fs');
const PuppeteerPlugin = require('website-scraper-puppeteer').default;
const puppeteer = require('puppeteer');

async function collectRoutes(seeds) {
	const browser = await puppeteer.launch({ headless: 'new' });
	const page = await browser.newPage();
	const discovered = new Set(seeds);
	for (const url of seeds) {
		await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
		const links = await page.$$eval('a[href]', as => as.map(a => a.getAttribute('href')));
		for (const href of links) {
			if (!href) continue;
			if (href.startsWith('https://computeb.com/')) {
				discovered.add(href);
			} else if (href.startsWith('/')) {
				discovered.add('https://computeb.com' + href);
			}
		}
	}
	await browser.close();
	const cleaned = Array.from(discovered).map(u => u.split('#')[0]).map(u => u.split('?')[0]);
	return Array.from(new Set(cleaned));
}

async function main() {
	const targetDir = path.join(__dirname, 'static_site_prerendered');
	const seeds = [
		'https://computeb.com/%E4%B8%BB%E9%A0%81',
		'https://computeb.com/%E8%87%AA%E9%81%B8%E7%A0%8C%E6%A9%9F',
		'https://computeb.com/%E8%85%A6%E7%B4%B0List',
		'https://computeb.com/About%20Us'
	];
	const urls = await collectRoutes(seeds);
	if (fs.existsSync(targetDir)) {
		fs.rmSync(targetDir, { recursive: true, force: true });
	}

	await scrape({
		directory: targetDir,
		urls,
		urlFilter: (url) => url.startsWith('https://computeb.com/'),
		subdirectories: [
			{ directory: 'css', extensions: ['.css'] },
			{ directory: 'js', extensions: ['.js'] },
			{ directory: 'images', extensions: ['.jpg', '.png', '.svg', '.webp', '.gif', '.ico'] },
		],
		sources: [
			{ selector: 'img', attr: 'src' },
			{ selector: 'link[rel="stylesheet"]', attr: 'href' },
			{ selector: 'script', attr: 'src' },
			{ selector: 'link[rel="manifest"]', attr: 'href' },
			{ selector: 'link[rel="icon"]', attr: 'href' }
		],
		plugins: [
			new PuppeteerPlugin({
				launchOptions: { headless: true },
				gotoOptions: { waitUntil: 'networkidle0', timeout: 60000 },
				scrollToBottom: { timeout: 1000, viewportN: 3 },
				blockNavigation: true
			})
		],
		request: {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
			}
		},
		maxDepth: 2,
		prettifyUrls: true,
		filenameGenerator: 'bySiteStructure'
	});

	console.log('Static site saved to:', targetDir);
}

main().catch((err) => {
	console.error('Scrape failed:', err);
	process.exit(1);
});


