define([
	"jquery",
	"site/PageGenerated",
	"site/session",
	"site/router",
	"cses",
	"scriptup",
	"site/ui/PersonAdd",
	"q1",
	"site/theme",
	"site/ui/PersonCompleter"
], function($,
	mkgen,
	session,
	router,
	cses,
	scriptup,
	PersonAdd,
	Q,
	theme,
	PersonCompleter
) {
	"use strict";
	
	function uiPerson(p){
		return scriptup("article", function(su){
			su("h1", function(su){
				p.namefullchanged.add(function(n){
					this.text(n);
				}, this);
			});
			
			su("ul", function(su){
				p.emailschanged.add(function(emails){
					this.empty()
					
					emails.forEach(function(e){
						su("li", function(su){
							su("a", {href: "mailto:"+e.email, text: e.email});
						});
					});
				}, this);
			});
		});
	}
	
	return mkgen("People — CSES", function($cont){
		var path = location.pathname.split("/");
		var uid = path[2];
		
		scriptup($cont, function(su){
			switch (uid) {
			case undefined:
				document.title = "Members — CSES";
				su("div", function(su){
					cses.authtoken.done(function(t){
						if (t) {
							su("a", {
								text: "View your profile.",
								href: "/people/"+cses.authuser.id,
							});
						}
					});
				});
				su("h1", "Find A CSES Member");
				su("form", function(su){
					var person = su("input", {
						type: "text",
					});
					var pc = new PersonCompleter(person);
					su("button", "Go");
					this.on("submit", function(e){
						e.preventDefault();
						router.go("/people/"+pc.value.id);
					});
				});
				break;
			case "new":
				document.title = "Add a Person";
				cses.hasPermission("personw").done(function(){
					var pa = new PersonAdd();
					pa.on("cses:personadd:added", function(e, p){
						router.go("/people/"+p.id);
					});
					$cont.append(pa);
				}, function(){
					session.loginRequest("/people/new");
				})
				break;
			case "self":
				session.loginPopup().done(function(){
					router.replace(location.pathname.replace("self", cses.authuser.id));
				}, function(e){
					console.log(e);
					router.replace("/");
				});
				break;
			default:
				switch (path[3]) {
				case undefined:
					var p = new cses.Person(uid);
					p.namefullchanged.add(function(n){ document.title = n+" — CSES" });
					this.append(uiPerson(p));
					p.load();
					
					cses.hasPermission("wheel").then(function(){
						su("form", function(su){
							this.on("submit", function(e){
								e.preventDefault();
								
								p.perms = permlist.val().split(",")
								p.save().done(function(){
									var after = "people/"+p.id;
									
									// If our permissions where changed we need
									// a new token, so login again.
									if (cses.authuser.id == p.id) {
										session.logout().finally(function(){
											session.loginRequest(after);
										}).done();
									}
									else
										router.load(after);
								}, function(e){
									su("p", {
										text: e.msg,
										css: {
											display: "none",
											color: theme.textBadColor,
											margin: "0.8em 0",
											textAlign: "left",
										},
									});
								});
							});
							var permlist = su("input", {
								type: "text",
								val: p.perms.join(","),
							});
							p.permschanged.add(function(perms){
								permlist.val(perms.join(","));
							});
							su("button", "Update Permissions");
						});
					});
					
					Q.allSettled([
						cses.hasPermission("personw"),
						cses.hasPermission("selfw"),
					]).spread(function(admin, user){
						if (admin.state == "fulfilled" || (
							user.state == "fulfilled" && uid == cses.authuser.id
						)) {
							su("form", function(su){
								this.on("submit", function(e){
									e.preventDefault();
									
									if (!pass.val()) {
										su("p", {
											text: "You must set a password.",
											css: {
												color: theme.textBadColor,
												margin: "0.8em 0",
												textAlign: "left",
											},
										});
										return;
									}
									if (pass.val() != pass2.val()) {
										su("p", {
											text: "Passswords don't match!",
											css: {
												color: theme.textBadColor,
												margin: "0.8em 0",
												textAlign: "left",
											},
										});
										return;
									}
									
									p.passwordSet(pass.val()).done(function(){
										su("p", {
											text: "Password Changed",
											css: {
												color: theme.textGoodColor,
												margin: "0.8em 0",
												textAlign: "left",
											},
										});
									}, function(e){
										isu("p", {
											text: e.msg,
											css: {
												color: theme.textBadColor,
												margin: "0.8em 0",
												textAlign: "left",
											},
										});
									});
								});
								var pass = su("input", {
									type: "password",
									placeholder:  "password",
								}); su("br");
								var pass2 = su("input", {
									type: "password",
									placeholder:  "password",
								});
								su("button", "Change Password");
							});
						}
					});
					break;
				default:
					router.load("404");
				}
			}
		});
	});
});
