window.DEBUG = true; // Never actually checked if true.

+function(){
	"use strict";
	
	var paths = {
		jquery: [ // jQuery won't let us name it.
			"https://code.jquery.com/jquery-2.1.1.min",
			"https://cdn.jsdelivr.net/jquery/2.1.1/jquery.min",
			"https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.min",
		],
		// jquery_event_swipe: [
		// 	"https://cdn.jsdelivr.net/jquery.event.swipe/0.5.2/jquery.event.swipe.min",
		// ],
		jqueryte1: [
			"https://cdnjs.cloudflare.com/ajax/libs/jquery-te/1.4.0/jquery-te.min",
		],
		jssignals1: [
			"https://cdn.jsdelivr.net/js-signals/1.0.0/signals.min",
			"https://cdnjs.cloudflare.com/ajax/libs/js-signals/1.0.0/js-signals.min",
		],
		Paragon1: [
			"https://kevincox-cdn.appspot.com/Paragon-1.1.1.min",
			"/a/js/Paragon1",
		],
		q1: [
			"https://cdnjs.cloudflare.com/ajax/libs/q.js/1.0.1/q.min",
			"https://googledrive.com/host/0B5Q4xFi89w8sSHBHaUtMeXM5c28", // A slow worst-case.
		],
		store2: [
			//"https://cdn.jsdelivr.net/store/2.1.2/store2.min", Too old, doesn't define itself.
			"https://cdnjs.cloudflare.com/ajax/libs/store.js/1.3.14/store.min",
		],
		typeahead010: [
			"https://cdn.jsdelivr.net/typeahead.js/0.10.2/typeahead.bundle.min",
			"https://cdnjs.cloudflare.com/ajax/libs/typeahead.js/0.10.4/dist/typeahead.bundle.min",
		],
		underscore: [ // Underscore won't let us name it.
			"https://cdn.jsdelivr.net/underscorejs/1.6.0/underscore-min",
			"ttps://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min",
		],
		unslider0: [
			"https://cdn.jsdelivr.net/jquery.unslider/0.1/unslider.min",
			"https://cdn.rawgit.com/idiot/unslider/1.0.0/src/unslider.min",
		],
		url1: [
			"https://kevincox-cdn.appspot.com/url-1.0.4.min",
			"/a/js/url1",
		],
	};
	
	if (DEBUG) {
		///// Source versions for easy debugging.
		paths.jquery.unshift(
			"https://code.jquery.com/jquery-2.1.1",
			"https://cdn.jsdelivr.net/jquery/2.1.1/jquery",
			"https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery");
		paths.jssignals1.unshift(
			"https://cdn.jsdelivr.net/js-signals/1.0.0/signals",
			"https://cdnjs.cloudflare.com/ajax/libs/js-signals/1.0.0/js-signals");
		paths.q1.unshift(
			"https://cdnjs.cloudflare.com/ajax/libs/q.js/1.0.1/q");
		paths.unslider0.unshift(
			"https://cdn.jsdelivr.net/jquery.unslider/0.1/unslider",
			"https://cdn.rawgit.com/idiot/unslider/1.0.0/src/unslider");
	}
	
	require.config({
		baseUrl: document.scripts[1].src.slice(0, -"bootstrap.js".length),
		paths: paths,
		waitSeconds: 15,
		//enforceDefine: true,
		
		shim: {
			// jquery_event_swipe: {deps: ["jquery"]},
			jqueryte1: {deps: ["jquery"]},
			unslider0: {deps: ["jquery", /*"jquery_event_swipe"*/]},
		}
	});
	
	if (DEBUG) {
		// Turn on for better error messages.
		require(["q1"],function(Q){Q.longStackSupport = true});
		
		if (location.search.match(/[?&]nochrome(&|$)/)) {
			document.getElementById("header").style.display = "none";
			document.getElementById("footer").style.display = "none";
		}
	}
	
	// Start
	require(["site/theme", "site/ui/header", "site/ui/footer", "site/main"]);
}()
