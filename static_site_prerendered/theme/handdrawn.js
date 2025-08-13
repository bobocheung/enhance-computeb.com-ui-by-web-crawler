// Enhance UI richness: add sketchy borders to key sections and random tilt
(function(){
	try{
		// Random wiggle on cards/images
		document.querySelectorAll('img,.MuiPaper-root,.MuiCard-root').forEach((el, i)=>{
			const r = (Math.random()*1.2-0.6).toFixed(2);
			el.style.setProperty('--hd-r', r+'deg');
			el.setAttribute('data-hd-wiggle','');
		});
		// Add hand-drawn underline on headings
		document.querySelectorAll('h1,h2,h3,.MuiTypography-h5').forEach(h=>{
			h.classList.add('hd-underline');
		});
		// Convert plain CTA-looking buttons to chips accents
		document.querySelectorAll('button').forEach(btn=>{
			if(btn.textContent && btn.textContent.trim().length<=8){
				btn.classList.add('hd-chip');
			}
		});
	} catch(e){}
})();


