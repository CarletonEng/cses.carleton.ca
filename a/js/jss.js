// Copyright 2013-2014 Kevin Cox

/*******************************************************************************
*                                                                              *
*  This software is provided 'as-is', without any express or implied           *
*  warranty. In no event will the authors be held liable for any damages       *
*  arising from the use of this software.                                      *
*                                                                              *
*  Permission is granted to anyone to use this software for any purpose,       *
*  including commercial applications, and to alter it and redistribute it      *
*  freely, subject to the following restrictions:                              *
*                                                                              *
*  1. The origin of this software must not be misrepresented; you must not     *
*     claim that you wrote the original software. If you use this software in  *
*     a product, an acknowledgment in the product documentation would be       *
*     appreciated but is not required.                                         *
*                                                                              *
*  2. Altered source versions must be plainly marked as such, and must not be  *
*     misrepresented as being the original software.                           *
*                                                                              *
*  3. This notice may not be removed or altered from any source distribution.  *
*                                                                              *
*******************************************************************************/
define(function(){
	"use strict";
	
	var self = {}
	var all = []
	
	var style = document.createElement("style");
	style.setAttribute("nonce", "allow");
	style.type = "text/css";
	document.head.appendChild(style);
	var sheet = style.sheet;
	
	var nextid = 0;
	function uid(){ return "-jss-" + nextid++; }
	
	function makerule(selector, parent) {
		parent = parent || sheet;
		parent.insertRule(selector+"{}", 0);
		return parent.cssRules[0];
	}
	
	function Style(selector, style, parent) {
		var rule;
		
		// if (selector instanceof CSSRule) {
		// 	rule = selector;
		// }
		if (typeof selector == "object") {
			style = selector;
			selector = "&";
		}
		
		if (!rule) {
			this.classes = uid();
			selector = selector.replace(/&/g, "."+this.classes)
			
			var rule = makerule(selector, parent);
		}
		
		this.style = rule.style;
		
		if (style) {
			for (var k in style)
				this.style[k] = style[k];
		}
	}
	Object.defineProperties(Style.prototype, {
		selector: {get(){ return "."+this.classes }},
		toString: {value(){ return this.classes }},
	});
	
	function Media(media) {
		this.rule = makerule("@media "+media, this.rule);
	}
	Object.defineProperties(Media.prototype, {
		newStyle: {
			value: function media_newStyle(selector, style) {
				return new Style(selector, style, this.rule);
			},
		},
	});
	
	function StyleSet() {
		this._e = [].slice.call(arguments);
	}
	Object.defineProperties(StyleSet.prototype, {
		classes: {
			get: function(){
				return this._e.map(function(s){ return s.classes }).join(" ");
			},
		},
		selector: {
			get: function(){
				return this._e.map(function(s){ return s.selector }).join("");
			},
		},
		add: {
			value: function styleset_add(s) {
				this._e.append(s);
				return this;
			},
		},
		toString: {value: function styleset_toString(){ return this.classes }},
	});
	
	Object.defineProperties(self, {
		Style:    {value: Style   },
		StyleSet: {value: StyleSet},
		Media:    {value: Media   },
	});
	return self;
});
