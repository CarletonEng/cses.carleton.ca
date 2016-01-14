define([
	"jquery", "site/PageGenerated", "site/router", "cses", "scriptup",
	"underscore", "site/ui/PersonSelect", "site/ui/PersonCompleter", "url1",
	"jss", "site/theme", "site/ui/toolbelt", "site/ui/TextbookList",
	"site/session"
], function(
	$, mkgen, router, cses, scriptup, _, PersonSelect, PersonComplete, URL, jss,
	theme, toolbelt, TextbookList, session
) {
	"use strict";
	
	function isadmin(){ return cses.authperms.indexOf("tbt") >= 0 }
	
	function uiSell(book){
		return scriptup("div", function(su){
			var buyer, auth, error;
			su("h3", "Sell Book");
			su("form", {
				on: {
					submit: function(e){
						e.preventDefault();
						
						book.sell(auth.value, buyer.value).done(undefined, function(r){
							error.text(r.msg);
						});
					},
				},
			}, function(su){
				su("label", "Buyer", function(su){
					buyer = new PersonSelect();
					this.append(buyer.$root);
				}); su("br");
				su("label", "Authorized By", function(su){
					su("input", {type: "text"}, function(su){
						auth = new PersonComplete(this);
					});
				});
				su("button", {type: "submit", text: "Sell"});
				error = su("p");
			});
		});
	}
	function uiPay(b){
		return scriptup("div", function(su){
			su("h3", "Pay Seller");
			
			var auth, error;
			su("form", {
				on: {
					submit: function(e){
						e.preventDefaultasvaervsavr();
						b.pay(auth.value).catch(function(e){
							error.text(e.msg);
						});
					}
				}
			}, function(su){
				su("label", "Authorized By", function(su){
					su("input", {type: "text"}, function(su){
						auth = new PersonComplete(this);
					});
				});
				su("button", {type: "submit", text: "Pay"});
				error = su("p");
			})
		});
	}
	
	function genadmin(su, book) {
		su("h2", "TBT Admin");
		
		su("a", {href: "/textbooktrade/book/"+book.id+"/history", text: "View History"});
		
		su("div", function(su){
			book.changed.add(function(){
				this.empty();
				
				if (book.buyer) {
					if (!book.paid) this.append(uiPay(book));
				} else
					this.append(uiSell(book));
			}, this);
		});
		
		su("form", function(su){
			su("button", "Delete");
			
			this.on("submit", function(e){
				e.preventDefault();
				
				if (confirm("Really delete this book?")) {
					book.delete().done(function(){
						router.go("/textbooktrade");
					});
				}
			});
		});
	}
	
	return mkgen(function($cont){
		document.title = "Textbook Trade — CSES";
		
		var path = document.location.pathname.split("/").slice(2);
		
		if (isadmin()) {
			var $t = toolbelt.tool("A", "Textbook Trade Admin");
			$t.one("click", function(){
				router.go("/admin/textbooktrade")
			});
			
			router.navigation.addOnce(function(){
				$t.remove();
			});
		}
		
		scriptup($cont, function(su){
			switch (path[0]) {
			case "":
				router.dropSlash();
				// Fix URL and continue.
			case undefined:
				su("h1", "Textbook Trade");
				su("p", "At the beginning of each semester CSES opens up its"
					+ " textbook trade where students looking to sell their"
					+ " textbooks can do so in a reliable and efficent manner"
					+ " through CSES.  We track all books and prices, and once"
					+ " a student has purchased your textbook the original"
					+ " owner will be notified and all money returned to them."
					+ " Textbook trade is a free service run out of our office"
					+ " for all members.  Contact your VP Services, Alex"
					+ " Whitlock, for more information."
				);
				
				su("div", function(su){
					cses.authtoken.done(function(t){
						if (!t) return;
						
						su("a", {
							text: "View your books",
							href: "/textbooktrade/mybooks",
						})
					})
				});
				
				su("h2", "Find a Book");
				var url = URL.parse(document.location.href);
				url.get = url.get || {};
				
				var populateBooks = function populateBooks(){
					url.get.course = course.val() || undefined;
					url.get.title  = title.val()  || undefined;
					url.get.sold   = sold.prop("checked");
					router.updateURL(URL.build(url));
					
					cses.TBTBook.find({
						course: course.val(),
						title: title.val(),
						sold: sold.prop("checked")? undefined : 0,
					}).done(function(r){
						list.empty().append(TextbookList(r));
					});
				}
				var populateBooksThrottled = _.debounce(populateBooks, 500);
				
				var course, title, sold;
				
				su("label", {text: "Filter by course: "}, function(su){
					course = su("input", {
						type: "text",
						val: url.get.course,
						placeholder: "Course code",
						spellcheck: false,
						on: {keyup: populateBooksThrottled},
					});
				}); su("br");
				su("label", {text: "Filter by Title: "}, function(su){
					title = su("input", {
						type: "text",
						val: url.get.title,
						placeholder: "Title",
						on: {keyup: populateBooksThrottled},
					});
				}); su("br");
				su("label", {text: "Show sold.",}, function(su){
					sold = su("input", {
						type: "checkbox",
						checked: url.get.sold,
						on: {change: populateBooks},
					});
				}); su("br");
				
				su("h2", "Results:").css("marginBottom", "0.4em");
				var list = su("div");
				populateBooks();
				break;
			case "book":
				var book = new cses.TBTBook(path[1]);
				book.load();
				switch (path[2]) {
				case undefined:
					su("dl", function(su){
						su("dt", "Title");
						su("dd", function(){
							book.titlechanged.add(function(t){this.text(t)}, this);
						});
						su("dt", "Edition");
						su("dd", function(){
							book.editionchanged.add(function(t){this.text(t)}, this);
						});
						su("dt", "Price");
						su("dd", function(){
							book.pricechanged.add(function(p){this.text("$ "+p)}, this);
						});
						su("dt", "Courses");
						su("dd", function(){
							book.courseschanged.add(function(c){
								this.text(c.join(", "))
							}, this);
						});
						if (isadmin()){
							su("dt", "Seller");
							su("dd", function(su){
								su("a", function(su){
									var self = this;
									book.sellerchanged.add(function(s){
										self.attr("href", "/people/"+s.id);
										s.namefullchanged.add(function(nf){
											self.text(nf);
										});
										s.load();
									});
								});
							});
							su("dt", "Paid Seller?");
							su("dd", function(su){
								book.paidchanged.add(function(s){
									this.text(s);
								}, this);
							});
							su("dt", "Bought By");
							su("dd", function(su){
								var self = this;
								book.buyerchanged.add(function(b){
									if (b) {
										self.empty();
										var a = su("a", {
											href: "/people/"+b.id,
										});
										b.namefullchanged.add(function(nf){
											a.text(nf);
										});
									} else {
										self.text("Not bought.");
									}
									b.load();
								});
							});
						}
					});
					cses.authtoken.done(function(){
						if (isadmin()) {
							genadmin(su, book);
						}
					});
					break;
				case "history":
					document.title = "Book History — CSES";
					su("h1", "History");
					su("ul", function(su){
						book.changeschanged.add(function(cs){
							cs.forEach(function(c){
								su("li", {
									css: {
										whiteSpace: "pre",
									}
								}, function(su){
									su("span", "At "+c.time+" ");
									su("a", {
										href: "/people/"+c.by.id,
										text: c.by.id,
									}, function(su){
										c.by.namefullchanged.add(function(n){
											this.text(n);
										}, this);
										c.by.load();
									});
									this.append(" ");
									su("span", c.desc);
								});
							});
						});
					});
					book.loadChanges();
					break;
				default:
					router.load("/404");
				}
				break;
			case "mybooks":
				document.title = "My Books — CSES";
				su("h1", "My Books");
				session.loginRequest("/textbooktrade/mybooks").done(function(){
					cses.TBTBook.find({
						involves: cses.authuser,
					}).done(function(r){
						su("div").append(TextbookList(r));
					});
				}, function(){
					router.go("/textbooktrade");
				});
				break;
			case "unpaid":
				document.title = "Unpaid Sellers — CSES";
				su("h1", "Unpaid Sellers");
				cses.TBTBook.find({
					sold: "1",
					paid: "0",
				}).done(function(r){
					su("div").append(TextbookList(r));
				}, function(e){
					su("p", e.msg);
				})
				break;
			default:
				router.load("/404");
			}
		});
	});
});
