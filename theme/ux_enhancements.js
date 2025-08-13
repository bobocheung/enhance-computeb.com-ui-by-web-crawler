// Progressive, safe UI enhancements
(function(){
	try{
		// 1) AppBar shadow on scroll
		const appBar = document.querySelector('.MuiAppBar-root');
		if (appBar) {
			const onScroll = () => appBar.classList.toggle('is-scrolled', window.scrollY > 8);
			onScroll();
			addEventListener('scroll', onScroll, { passive: true });
		}

		// 2) Current nav item highlight
		document.querySelectorAll('nav a[href]').forEach(a => {
			const href = decodeURI(a.getAttribute('href'));
			if (location.pathname.includes(href)) a.setAttribute('aria-current', 'page');
		});

		// 3) Lazy images - keep layout, avoid reflow
		document.querySelectorAll('img:not([loading])').forEach(img => {
			img.loading = 'lazy';
			// keep current width/height to avoid pushing content down
			if (!img.getAttribute('width') && img.clientWidth) img.setAttribute('width', img.clientWidth);
			if (!img.getAttribute('height') && img.clientHeight) img.setAttribute('height', img.clientHeight);
		});

		// 4) Back-to-top button
		const toTop = document.createElement('button');
		Object.assign(toTop.style, { position:'fixed', right:'16px', bottom:'16px', display:'none', padding:'10px', borderRadius:'10px', zIndex:9999 });
		toTop.title = 'Back to top'; toTop.textContent='↑';
		toTop.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
		document.body.appendChild(toTop);
		addEventListener('scroll', () => { toTop.style.display = window.scrollY > 600 ? 'block' : 'none'; }, { passive:true });

		// 5) Skip link target
		const main = document.querySelector('#main') || document.querySelector('#root');
		if (main && !main.id) main.id = 'main';
		if (!document.querySelector('.skip-link')) {
			const a = document.createElement('a');
			a.href = '#main'; a.className='skip-link'; a.textContent='跳到主內容';
			document.body.prepend(a);
		}

		// 6) Offline routing guard (backup only, should rarely trigger)
		if (document.body.textContent.trim().startsWith('No such page') && location.pathname.startsWith('/computeb.com/')) {
			history.replaceState(null, '', location.pathname.replace('/computeb.com', '') || '/computeb.com/%E4%B8%BB%E9%A0%81/');
			location.reload();
		}
	}catch(e){/* no-op */}
})();


