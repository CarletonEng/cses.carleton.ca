define([
	"jquery",
	"scriptup",
	"site/assets",
	"site/theme",
	"jss",
	"site/ui/Banner",
	"site/router",
], function(
	$,
	scriptup,
	assets,
	theme,
	jss,
	Banner,
	router
) {
	"use strict";
	
	var hbox = $("#header");
	var container  = $("<div>", {
		css: {
			position: "relative",
			zIndex: "10",
		},
	}).appendTo(hbox);
	
	var banner = window.banner = new Banner();
	banner.update("/");
	banner.$root.appendTo(hbox);
	banner.$root.css({
		width: "auto",
		maxWidth: "50rem",
		minHeight: "2em",
		margin: "auto",
		marginBottom: "1em",
	})
	
	router.navigation.add(function(){
		banner.update(location.pathname);
	});
	
	var links = [
		{text: "Services", href: "/services", sub: [
			{text: "Academic Concerns",             href: "/services/concerns"},
			{text: "Alexander's Office",            href: "/services/office"},
			{text: "Advertise Through Us",          href: "/services/advertise"},
			{text: "EngSwag",                       href: "/services/swag"},
			{text: "Equipment Loan Program",        href: "/services/elp"},
			{text: "Exam Library",                  href: "/services/examlibrary"},
			{text: "Leonardo's Lounge",             href: "/services/leos"},
			{text: "Student Group Funding",         href: "/services/sgf"},
			{text: "Student Group Resource Center", href: "/services/sgrc"},
			{text: "Textbook Library",              href: "https://elp.librarika.com/search"},
			{text: "Textbook Trade",                href: "/textbooktrade"},
		]},
		{text: "Publications", href: "/publications", sub: [
			{text: "Handbook",   href: "/publications/handbook"},
			{text: "Iron Times", href: "/publications/irontimes"},
			{text: "Passport",   href: "/publications/passport"},
		]},
		{text: "Get Involved", href: "/getinvolved", sub: [
			{text: "Find a Club",   href: "/getinvolved/findclub"},
			{text: "Make a Club",   href: "/getinvolved/makeclub"},
			{text: "Find an Event", href: "/getinvolved/findanevent", sub: [
				{text: "Annual Events",             href: "/getinvolved/findanevent/annual"},
				{text: "Calendar",                  href: "/getinvolved/findanevent/calendar"},
				{text: "Gallery",                   href: "/getinvolved/findanevent/gallery"},
				{text: "Engineering Competition",   href: "/getinvolved/findanevent/engcomp"},
				{text: "Febuary Feel Good Week",    href: "/getinvolved/findanevent/ffgw"},
				{text: "National Engineering Week", href: "/getinvolved/findanevent/new"},
			]},
			{text: "Directorships", href: "/getinvolved/directorships"},
			{text: "Conferences",   href: "/getinvolved/conferences"},
			{text: "Join Council!", href: "/getinvolved/council/join"},
		]},
		{text: "About Us", href: "/about", sub: [
			{text: "Our People",        href: "/about/people"},
			{text: "Affiliated Groups", href: "/about/groups"},
			{text: "Culture",           href: "/about/culture", sub: [
				{text: "Traditions",  href: "/about/culture/traditions"},
				{text: "Awards",      href: "/about/culture/awards"},
				{text: "Flightsuits", href: "/about/culture/flightsuits"},
				{text: "The Gong",    href: "/about/culture/thegong"},
				{text: "The Jacket",  href: "/about/culture/thejacket"},
				{text: "Pewter Mugs", href: "/about/culture/pewtermugs"},
			]},
		]},
		{text: "Governance", href: "/governance", sub: [
			{text: "Accountability",       href: "/governance/accountability"},
			{text: "Documents and Forms",  href: "/governance/docs"},
			{text: "Elections",            href: "/governance/elections"},
			{text: "Meetings and Minutes", href: "/governance/meetings"},
		]},
		{text: "Contact", href: "/contact"},
	];
	
	function uiDropdown(spec){
		return scriptup("ul", {
			// class: dropdownstyle.classes,
		}, function(su){
			spec.forEach(item => {
				su("li", su => {
					var a = su("a", {
						text: item.text,
						href: item.href,
					});
					if (item.sub) a.append(uiDropdown(item.sub));
				});
			});
		});
	}
	
	var mediaSmall = new jss.Media("(max-width: 69.99999em)");
	var mediaLarge = new jss.Media("(min-width: 70em)");
	
	var linkstyle = new jss.StyleSet(
		theme.chrome.headerLinkFont,
		new jss.Style({
			display: "inline-block",
			margin: "1em 0.7em",
			fontSize: "1.4em",
			position: "relative",
		}),
		new jss.Style("&:hover", {
			visibility: "hidden",
		}),
		new jss.Style("&:hover::before", {
			display: "block",
			visibility: "visible",
			content: 'attr(data-text)',
			fontWeight: "bolder",
			// textDecoration: "underline",
			position: "absolute",
			left: "0",
			right: "0",
			whiteSpace: "pre",
		}),
		
		// Small displays.
		mediaSmall.newStyle({
			margin: "0.2em 0",
		}),
		mediaSmall.newStyle("& ul", {
			display: "none",
		}),
		
		// Large Displays
		mediaLarge.newStyle("&:not(:hover) ul", {
			display: "none",
		}),
		mediaLarge.newStyle("& ul", {
			visibility: "visible",
			textAlign: "left",
			textTransform: "none",
			fontWeight: "300",
			zIndex: "50",
			width: "12em",
		}),
		mediaLarge.newStyle("&>ul", {
			position: "absolute",
			left: "0",
			top: "100%",
			fontSize: "0.8em",
		}),
		mediaLarge.newStyle("&>ul ul", {
			display: "none",
			position: "absolute",
			left: "100%",
			top: "-1px", // Subtract border.
		}),
		mediaLarge.newStyle("&>ul>li:hover ul", {
			display: "block",
		}),
		mediaLarge.newStyle("&>ul::before", {
			content: "''",
			display: "block",
			width: "1ch",
			height: "1ch",
			margin: "0.2em 0 -0.5ch 0.6em",
			transform: "rotateZ(45deg)",
			
			background: theme.chrome.bg,
			border: "1px solid hsl(0, 0%, 78%)",
			borderRight: "none",
			borderBottom: "none",
		}),
		mediaLarge.newStyle("& ul>li", {
			display: "block",
			border: "1px solid hsl(0, 0%, 78%)",
			background: theme.chrome.bg,
		}),
		mediaLarge.newStyle("& ul>li:not(:first-child)", {
			borderTop: "none",
		}),
		mediaLarge.newStyle("& ul>li>a", {
			position: "relative",
			display: "block",
			padding: "0.4em",
		}),
		mediaLarge.newStyle("& ul>li>a:hover", {
			background: "hsl(0,0%,78%)",
			border: "1px solid hsl(0, 0%, 78%)",
			margin: "-1px",
		})
	);
	var headerBig_continer = new jss.StyleSet(
		new jss.Style({
			textAlign: "center",
			marginBottom: "3em",
			
			background: "linear-gradient(to bottom, hsl(0,0%,100%),"+theme.chrome.bg+")",
			borderBottom: "0.1em solid hsl(0, 0%, 83%)",
			// boxShadow: "hsl(0, 0%, 60%) 0 0 3em -0.5em",
		}),
		new jss.Style("&>*", {
			display: "inline-block",
			verticalAlign: "bottom",
		}),
		
		mediaSmall.newStyle({
			display: "flex",
			flexDirection: "column",
		})
	);
	
	var stylelogo = new jss.StyleSet(
		// Large Screen.
		mediaLarge.newStyle({
			position: "relative",
			width: "8em",
			height: "7.5em",
			margin: "0 2em",
			padding: "0",
		}),
		mediaLarge.newStyle("&:before, &:after", {
			fontSize: "2em",
			position: "absolute",
			display: "block",
			width: "50vw",
			margin: "0.5em 1em",
			
			fontFamily: "Montserrat, sans-serif",
			fontWeight: "900",
			textTransform: "uppercase",
		}),
		mediaLarge.newStyle("&:before", {
			content: "'Carleton Student'",
			
			right: "100%",
			textAlign: "right",
		}),
		mediaLarge.newStyle("&:after", {
			content: "'Engineering Society'",
			left: "100%",
			textAlign: "left",
		}),
		
		// Small screen.
		mediaSmall.newStyle({
			display: "none",
		})
	);
	
	var stylegong = new jss.StyleSet(
		mediaLarge.newStyle({
			position: "absolute",
			width: "100%",
			left: "0",
			bottom: "-52%"
		})
	);
	
	var stylebasket = new jss.StyleSet(
		mediaLarge.newStyle({
			position: "absolute",
			width: "200%",
			left: "-50%",
			bottom: "-62%"
		})
	);
	
	function navlink(l) {
		return scriptup("a", {
			text: l.text,
			href: l.href,
			"data-text": l.text,
			class: linkstyle.classes,
		}, function(su){
			if (l.sub)
				this.append(uiDropdown(l.sub));
		});
	}
	
	scriptup(container, {
		class: headerBig_continer.classes,
	}, function(su){
		for (var i = 0; i < links.length/2; i++) {
			this.append(navlink(links[i]));
		}
		su("a", {
			href: "/",
			class: stylelogo.classes,
		}, function(su){
			su("img", {
				src: assets.headerBasket,
				class: stylebasket,
			});
			su("img", {
				src: assets.logo,
				alt: "CSES Logo",
				class: stylegong,
			});
		});
		for (var i = links.length/2; i < links.length; i++) {
			this.append(navlink(links[i]));
		}
	});
});
