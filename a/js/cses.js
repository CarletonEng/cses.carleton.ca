+function(root, cses){
	"use strict";
	
	if (typeof define == "function" && define["amd"]) { // AMD
		define(["jquery", "q1", "url1", "Paragon1", "reqwest1"], cses);
	} else if (typeof module == "object" && module.exports) { // Node
		module["exports"] = cses(
			require("jquery"),
			require("q"),
			require("url"),
			require("Paragon"),
			require("reqwest")
		);
	} else {
		root["cses"] = cses(jQuery, Q, url, Paragon, reqwest);
	}
}(this, function CSES($, Q, URL, Paragon, reqwest){
	"use strict";
	var cses = window.cses = {};
	var api = "https://api.cses.carleton.ca";
	if (typeof location == "object") {
		if (location.hostname == "cses.carleton.ca")
			; // Use default.
		else if (location.hostname == "cses.engsoc.org"){
			api = "https://api-cses.engsoc.org";
			console.log("Here", location.hostname);
		}
		else if (location.hostname == "cses.kevincox.ca")
			api = "https://api.cses.kevincox.ca";
		else {
			console.log("WTF");
			api = URL.parse(location.href);
			api = URL.build({
				host: api.host,
				port: 8080,
				scheme: api.scheme,
				user: api.user,
				pass: api.pass,
			});
		}
	}
	var authtoken_ = Q("");
	
	/// Super method.
	function superm(self, sup, prop) {
		return sup.prototype[prop].apply(self, [].prototype.slice.call(arguments, 3));
	}
	/// Super get.
	function superg(self, sup, prop) {
		return Object.getOwnPropertyDescriptor(sup.prototype, prop).get.call(self);
	}
	/// Super set.
	function supers(self, sup, prop, val) {
		return Object.getOwnPropertyDescriptor(sup.prototype, prop).set.call(self, val);
	}
	
	function Response(url, xhr){
		this.xhr = xhr;
		this.url = url;
	}
	Object.preventExtensions(Response);
	Object.defineProperties(Response.prototype, {
		status: {
			get: function response_status_get(){
				return this.xhr.status;
			},
			enumerable: true,
		},
		raw: {
			get: function response_raw_get(){
				return this.done? this.xhr.responseText : undefined;
			},
		},
		done: {
			get: function response_done_get(){
				return this.xhr.readyState == 4;
			},
		},
		msg: {
			get: function response_msg_get(){
				if (!this.done) return "In flight";
				
				// Trim off code.
				return this.xhr.statusText || "API not accessible.";
			},
		},
		success: {
			get: function response_error_get(){
				if (!this.done)
					throw new TypeError("Response has not yet completed.");
				
				return this.status >= 200 && this.status < 300;
			},
			enumerable: true,
		},
	});
	Object.preventExtensions(Response.prototype);
	
	function ResponseJSON() {
		Response.apply(this, arguments);
	}
	Object.preventExtensions(ResponseJSON);
	ResponseJSON.prototype = Object.create(Response.prototype, {
		constructor: {value: ResponseJSON},
		
		success: {
			get: function responseJSON_error_get(){
				return superg(this, Response, "success") && !this.json.e;
			}
		},
		
		json: {
			get: function responseJSON_json_get(){
				if (this._json) return this._json;
				if (!this.raw)  return undefined;
				
				return this._json = JSON.parse(this.raw);
			},
		},
		
		msg: {
			get: function responseJSON_msg_get(){
				return (this.json && this.json.msg) || superg(this, Response, "msg")
			},
		},
		
		toString: {
			value: function responseJSON_toString(){
				return "<ResponseJSON "+this.url+" "+this.status+" ("+this.msg+")>";
			}
		}
	});
	Object.preventExtensions(ResponseJSON.prototype);
	
	var PersonModel = Paragon.create({
		id: 0,
		perms: 0,
		name: "",
		namefull: "",
		number: undefined,
		emails: undefined,
	});
	/** A Person.
	 * 
	 * A person has the following attributes.
	 * 
	 * @property {String} id A hex string uniquely identifying the user.
	 * @property {String} name Their informal name, this is what you should call them.
	 * @property {String} namefull Their legal name.
	 * @property {String} perms An array of permissions they have.
	 *
	 * @class Person
	 * @param id {String} The user id.
	 */
	function Person(id) {
		PersonModel.call(this);
		
		this.id = id;
		this.perms = [];
		this.name = "";
		this.namefull = "";
		this.emails = [];
	}
	Object.defineProperties(Person, {
		find: {
			value: function Person_find(q){
				return cses.request("GET", "/person", {
					get: {
						name: q.name,
						number: q.number,
					},
				}).then(function(r){
					return r.json.people.map(function(p){
						var r = new Person(p.id);
						r.name = p.name;
						r.namefull = p.namefull;
						r.number = p.number;
						return r;
					});
				});
			},
		},
	});
	Object.preventExtensions(Person);
	Person.prototype = Object.create(PersonModel.prototype, {
		constructor: {value: Person},
		
		/** Load fields from server.
		 * 
		 * This function updates all fields from the values on the server.
		 * 
		 * @return [Q.Promise] A promise.
		 */
		load: {
			value: function Person_load() {
				var self = this;
				
				return cses.request("GET", "/person/"+this.id).then(function(r){
					self.perms    = r.json.perms;
					self.name     = r.json.name;
					self.namefull = r.json.namefull;
					self.number   = r.json.number;
					self.emails   = r.json.emails;
				});
			},
		},
		
		/** Persist changes to server.
		 * 
		 * This function persists set fields to the server.
		 * 
		 * @return [Q.Promise] A promise.
		 */
		save: {
			value: function Person_save(){
				var self = this;
				var url = this.id? "/person/"+this.id : "/person";
				return cses.request("PUT", url, {
					post: {
						name:     this.name || undefined,
						namefull: this.namefull || undefined,
						number:   this.number || undefined,
						emails:   this.id? undefined : (this.emails || undefined),
						perms:    this.perms,
					},
				}).then(function(r){
					self.id = r.json.id;
					return self;
				});
			},
		},
		
		passwordSet: {
			value: function person_passwordSet(pass){
				return cses.request("PUT", "/person/"+this.id+"/pass", {
					post: {
						pass: pass,
					},
				});
			},
		},
	});
	Object.preventExtensions(Person.prototype);
	
	var PostModel = Paragon.create({
		id: "",
		type: "article",
		title: "",
		content: {value: $("<div>")},
	});
	
	function Post(id) {
		PostModel.call(this);
		
		this.id = id;
	}
	Object.defineProperties(Post, {
		find: {
			value: function Post_find(o){
				return cses.request("GET", "/post", {
					auth: false,
					get: {
						dir: o.dir,
					}
				}).then(function(r){
					//TODO: Wrap.
					return r.json.posts;
				});
			},
		},
	});
	Object.preventExtensions(Post);
	Post.prototype = Object.create(PostModel.prototype, {
		constructor: {value: Post},
		
		load: {
			value: function post_load(){
				var self = this;
				return cses.request("GET", "/post/"+this.id, {
					auth: false,
				}).then(function(r){
					self.slug    = r.json.slug;
					self.title   = r.json.title;
					self.type    = r.json.type
					self.content = $("<div>", {html: r.json.content});
				});
			},
		},
		
		save: {
			value: function post_save(){
				var self = this;
				return cses.request("PUT", "/post/"+this.id, {
					post: {
						title:   self.title,
						type:    self.type,
						content: self.content.html(),
					},
				});
			},
		},
	});
	Object.preventExtensions(Post.prototype);
	
	var TBTBookModel = Paragon.create({
		id: undefined,
		title: "",
		edition: "",
		author: "",
		price: undefined,
		paid: undefined,
		seller: undefined,
		buyer:  undefined,
		courses: {value: []},
		changes: {value: []},
	});
	
	function TBTBook(id) {
		TBTBookModel.call(this);
		
		this.id = id;
	}
	Object.defineProperties(TBTBook, {
		find: {
			value: function TBTBook_find(q) {
				q = q || {};
				return cses.request("GET", "/tbt/book", {
					get: {
						course: q.course || undefined,
						title:  q.title  || undefined,
						sold:   !!q.sold,
					}
				}).then(function(r){
					return r.json.books.map(function(rb){
						return new TBTBook(rb);
					});
				});
			},
		},
		
		stats: {
			value: function TBTBook_stats() {
				return cses.request("GET", "/tbt/book/stats").then(function(res){
					return res.json;
				});
			},
		},
	});
	Object.preventExtensions(TBTBook);
	TBTBook.prototype = Object.create(TBTBookModel.prototype, {
		constructor: {value: TBTBook},
		
		load: {
			value: function tbtbook_load() {
				var self = this;
				return cses.request("GET", "/tbt/book/"+this.id).then(function(r){
					self.title   = r.json.title;
					self.edition = r.json.edition;
					self.author  = r.json.author;
					self.price   = r.json.price;
					self.paid    = r.json.paid;
					self.courses = r.json.courses;
					self.seller  = new Person(r.json.seller);
					self.buyer   = r.json.buyer && new Person(r.json.buyer) || undefined;
					self.courses = r.json.courses;
				});
			},
		},
		
		loadChanges: {
			value: function tbtbook_loadChanges() {
				var self = this;
				return cses.request("GET", "/tbt/book/"+this.id+"/changes")
				           .then(function(r){
					self.changes = r.json.changes.map(function(c){
						return {
							by: new Person(c.by),
							time: new Date(c.time*1000),
							desc: c.desc,
						};
					});
				});
			},
		},
		
		save: {
			value: function tbtbook_save(authorizer) {
				var self = this;
				var url = this.id? "/tbt/book/"+this.id : "/tbt/book";
				return cses.request("PUT", url, {
					post: {
						title:      this.title,
						edition:    this.edition,
						author:     this.author,
						courses:    this.courses,
						price:      this.price,
						seller:     this.seller && this.seller.id,
						buyer:      this.buyer && this.buyer.id,
						authorizer: authorizer.id,
					},
				}).then(function(r){
					self.id = r.json.id;
					return r;
				});
			},
		},
		
		delete: {
			value: function tbtbook_delete(){
				return cses.request("DELETE", "/tbt/book/"+this.id);
			}
		},
		
		sell: {
			value: function tbtbook_sell(auth, to) {
				var self = this;
				return cses.request("PUT", "/tbt/book/"+this.id, {
					post: {
						authorizer: auth.id,
						buyer:      to.id,
					}
				}).then(function(){
					self.buyer = to;
				});
			},
		},
		
		pay: {
			value: function tbtbook_pay(auth){
				var self = this;
				return cses.request("PUT", "/tbt/book/"+this.id, {
					post: {
						authorizer: auth.id,
						paid: true,
					}
				}).then(function(r){
					self.paid = true;
				});
			}
		}
	});
	Object.preventExtensions(TBTBook.prototype);
	
	function BannerImage(s,w,h){
		this.src    = s;
		this.width  = w;
		this.height = h;
	}
	Object.defineProperties(BannerImage, {
		_fromAPI: {
			value: function BannerImage__fromAPI(j){
				return new BannerImage(cses.blobprefix+j.blob, j.w, j.h);
			},
		},
	});
	Object.preventExtensions(BannerImage);
	Object.preventExtensions(BannerImage.prototype);
	
	var BannerModel = Paragon.create({
		images: {value: []},
		desc:   "",
		href: "",
	});
	function Banner() {
		BannerModel.call(this);
	}
	Object.defineProperties(Banner, {
		fetchAll: {
			value: function Banner_fetchAll(){
				return cses.request("GET", "/banner", {
					auth: false,
				}).then(function(r){
					return {
						banners: r.json.banners.map(Banner._fromAPI),
					};
				});
			},
		},
		_fromAPI: {
			value: function Banner__fromAPI(j){
				var r = new Banner();
				r.desc = j.alt;
				r.href = j.href;
				r.images = j.images.map(BannerImage._fromAPI);
				return r;
			},
		},
	});
	Object.preventExtensions(Banner);
	Banner.prototype = Object.create(BannerModel.prototype, {
		constructor: {value: Banner},
		
		imageForWidth: {
			value: function banner_imageForWidth(w){
				if (!this.images.length) return undefined;
				if (typeof w == "undefined") w = window.innerWidth
				
				return this.images.reduce(function(a, b){
					/*
					 * a b w r
					 * -------
					 * 1 2 3 b
					 * 2 1 3 a
					 * 2 3 1 a
					 * 3 2 1 b
					 * 1 3 2 a
					 * 2 3 1 b
					 */
					return a.width > b.width? (
						w > a.width? a : b
					) : (
						w > b.width? b : a
					);
				})
			}
		}
	});
	Object.preventExtensions(Banner.prototype);
	
	var calendars = [
		"mmblktn9tkvj50r24fcp9ejk5o%40group.calendar.google.com",
		"qph9lt0jmmn0r6valqfhj5rre0%40group.calendar.google.com",
		"sqejs0pqa5ln2qcs91tvk5jahg%40group.calendar.google.com",
		"en.canadian%23holiday%40group.v.calendar.google.com",
	];
	
	function Event() { }
	Object.defineProperties(Event, {
		fetch: {
			value: function Event_fetch(number){
				number = number || 10;
				
				var u = "https://www.googleapis.com/calendar/v3/" +
					"calendars/{id}/events" +
					"?orderBy=starttime" +
					"&singleEvents=true" +
					"&timeMin=" + new Date().toISOString() +
					"&maxResults=" + number +
					"&fields=items(description%2ChtmlLink%2Cstart%2Cend%2Csummary)" +
					"&key=AIzaSyCoTrCEScDiR5PZYbfopk0vHE_YDPiiIYw";
				
				return Q.allSettled(
					calendars.map(function(id){
						var url = u.replace("{id}", id);
						return reqwest({
							url: url,
							crossOrigin: true,
						}).then(function(r){
							return r.items.map(function(e){
								var r = new Event();
								r.title = e.summary;
								r.desc  = e.description;
								r.href  = e.htmlLink;
								if (e.start.dateTime) {
									r.start = new Date(e.start.dateTime);
								} else {
									// No way to get proper timezone, so just
									// assume it is the user's timezone.
									
									var p = e.start.date.split("-");
									r.start = new Date(+p[0],+p[1]-1,+p[2]);
								}
								if (e.end.dateTime) {
									r.end = new Date(e.end.dateTime);
								} else {
									var p = e.end.date.split("-");
									r.end = new Date(+p[0],+p[1]-1,+p[2]);
									
									// Subtract 1ms so it ends the day before.
									r.end -= 1;
								}
								return r;
							});
						});
					})
				).then(function(eventsp){
					var events = [];
					eventsp.forEach(function(ep){
						if (ep.state == "fulfilled") {
							events.push.apply(events, ep.value);
						} else {
							console.log("Fetching calendar failed.", ep);
						}
					});
					
					events.sort(function(a,b){ return a.start - b.start });
					
					return events;
				})
			}
		}
	});
	
	function uploadFile(f) {
		return cses.authtoken.then(function(auth){
			var r = Q.defer();
			var req = new XMLHttpRequest()
			
			var url = api+"/blob";
			
			req.open("PUT", url);
			req.setRequestHeader("Authorization", "Bearer "+auth);
			req.setRequestHeader("Content-Type", f.type);
			
			req.onreadystatechange = function(e){
				if (req.readyState == 4) {
					if (req.status >= 200 && req.status < 300)
						r.resolve(req.responseText);
					else
						r.reject(req.responseText);
				}
			};
			req.upload.onprogress = function(e){
				r.notify({
					complete: e.loaded,
					total:    e.total,
					percent:  e.loaded/e.total,
				});
			}
			
			req.send(f);
			
			return r.promise.then(function(rtext){
				var j = JSON.parse(rtext);
				j.http_status     = req.status
				j.http_statustext = req.statusText;
				j.url = url+"/"+j.id+"/"+f.name;
				return j;
			}, function(etext){
				var j = JSON.parse(etext);
				j.http_status     = req.status
				j.http_statustext = req.statusText;
				throw j;
			});
		});
	}
	
	Object.defineProperties(cses, {
		/** Make a raw request to the API.
		 * 
		 * Note: Try to avoid this method, instead use the higher-level methods
		 * and classes provided.
		 * 
		 * @param method [string] containing the HTTP method to use.
		 * @param path [String] the request URL path component.
		 * @param opt [Object] An options object.  The following keys have
		 *   meaning:
		 *   - auth: If provided is used as the authorization token for the
		 *       request or false to not use authorization. Otherwise the
		 *       global default token is used.
		 *   - get: If provided it is a object that will be used to build the
		 *       query string.
		 *   - post:
		 *       If provided will be serialized and used as the body of the
		 *       request.
		 * 
		 * @return [Promise<Response>] The response.
		 */
		request: {
			value: function CSES_request(method, path, opt) {
				opt = opt || {};
				if (typeof opt.auth == "undefined") opt.auth = cses.authtoken;
				
				var burl = api + path;
				if (opt.get)
					burl += "?"+URL.buildget(opt.get);
				
				return Q(opt.auth).then(function(auth){
					var r = Q.defer();
					
					var req = new XMLHttpRequest();
					req.open(method, burl);
					
					if (auth)
						req.setRequestHeader("Authorization", "Bearer "+auth);
					
					if (opt.post) {
						req.setRequestHeader("Content-Type", "application/json");
						req.send(JSON.stringify(opt.post));
					} else
						req.send();
					
					var response = new ResponseJSON(burl, req);
					
					req.onreadystatechange = function cses_request_readystate(){
						if (!response.done) return;
						
						if (response.success) r.resolve(response);
						else {
							console.log("Request Failed", response);
							r.reject(response);
						}
					};
					
					return r.promise;
				});
			},
			enumerable: true,
		},
		
		/** The default authorization for requests.
		 * 
		 * This property will read a promise that will never be rejected.
		 * Writing a promise to this value will set the promise however the
		 * passed in promise must be fulfilled, never rejected.
		 * 
		 * The promise will be fulfilled with the auth token or "".
		 */
		authtoken: {
			get: function CSES_authtoken_get(){
				return authtoken_;
			},
			set: function CSES_authtoken_set(tokp) {
				authtoken_ = Q(tokp).then(function(tok){
					if (typeof tok != "string") tok = "";
					
					if (!tok) {
						cses.authperms = [];
						cses.authuser  = undefined;
					}
					return tok;
				}).catch(undefined, function(e){
					console.log("Error setting authtoken.", e);
					return false;
				});
			},
			enumerable: true,
		},
		/** A Person representing the auth token's user.
		 * 
		 * Note that this is not necessarily `load`ed.
		 * 
		 * This will be a valid user when `cses.authtoken` is fulfilled with a
		 * non-empty string.  This will be `undefined` when `cses.authtoken` is
		 * fulfilled with an empty string.
		 */
		authuser: {writable: true},
		/** The current auth token's permissions.
		 * 
		 * This is an array of strings representing the permissions.
		 * 
		 * This will always be an array but it will be empty when
		 * `cses.authtoken` is an empty string.
		 */
		authperms: {value: [], writable: true},
		
		/** Login to the API.
		 * 
		 * If called with two arguments they will be used as the username and
		 * password to request a new auth token.
		 * 
		 * If called with one argument it will be assumed to be an auth token
		 * and it will be validated and used to fetch the user information.
		 *
		 * Returns a promise that will be fulfilled with an undefined value if
		 * the login was successful, and rejected with an undefined value if
		 * the login failed.
		 */
		authorize: {
			value: function CSES_authorize(user, pass) {
				var def = Q.defer();
				cses.authtoken = def.promise;
				
				// If one argument, authtoken provided.
				if (typeof pass == "undefined") {
					return cses.request("GET", "/auth", {
						auth: user,
					}).then(function(r){
						cses.authperms = r.json.perms;
						cses.authuser = new Person(r.json.user);
						def.resolve(user);
						return r;
					}, function(r){
						def.resolve(false);
						throw r;
					});
				}
				
				// Two arguments, user/pass.
				return cses.request("POST", "/auth", {
					auth: false,
					post: {
						user: user,
						pass: pass,
					},
				}).then(function(r){
					cses.authperms = r.json.perms;
					cses.authuser = new Person(r.json.user);
					def.resolve(r.json.token);
					return r;
				}, function(r){
					def.resolve(false);
					throw r;
				});
			},
			enumerable: true,
		},
		/** Log out.
		 * 
		 * This removes the current auth token from the library and invalidates
		 * it on the server.
		 * 
		 * @return A promise that will be fulfilled when the token has been
		 *         successfully invalidated.
		 */
		unauthorize: {
			value: function CSES_unauthorize(){
				var r = cses.request("POST", "/auth/invalidate");
				cses.authtoken = false;
				return r;
			},
		},
		
		/** Check if user has permissions.
		 * 
		 * Returns a promise that will be fulfilled iff the user is logged in
		 * and has all of the permissions.  The promise is rejected if the user
		 * is not logged in or is missing a permission.
		 */
		hasPermission: {
			value: function CSES_hasPermission(){
				var args = arguments;
				return cses.authtoken.then(function(t){
					if (!t) throw false;
					
					for (var i = arguments.length; i--; )
						if (cses.authperms.indexOf(args[i]) < 0)
							throw false;
					
					return true;
				});
			},
		},
		
		blobprefix: {value: api+"/blob/"},
		
		/** The Person constructor.
		 */
		Person: {value: Person, enumerable: true},
		/** The Post constructor.
		 */
		Post: {value: Post, enumerable: true},
		
		/** Upload a file.
		 * 
		 * @param File
		 * @return A promise for response.
		 */
		uploadFile: {value: uploadFile, enumerable: true},
		
		/** A book in the textbook trade.
		 */
		TBTBook: {value: TBTBook, enumerable: true},
		
		/** A banner.
		 */
		Banner: {value: Banner, enumerable: true},
		
		Event: {value: Event, enumerable: true},
	});
	Object.preventExtensions(cses);
	
	return cses;
});
