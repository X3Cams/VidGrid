// ==UserScript==
// @name        VidGrid
// @run-at       document-start
// @author        Mr. Jangles
// @description        Watch a selection of feeds on Chaturbate.com simultaneously within a single tab using VidGrid!
// @namespace        https://github.com/angelxaces/VidGrid/
// @version        1.0.1
// @updateURL        https://github.com/X3Cams/VidGrid/raw/master/VidGrid.user.js
// @downloadURL        https://github.com/X3Cams/VidGrid/raw/master/VidGrid.user.js
// @supportURL        https://github.com/X3Cams/VidGrid/issues
// @homepage        https://github.com/X3Cams
// @match        http*://chaturbate.com
// @match        http*://*chaturbate.com/*
// @match        http*://*chaturbate.com/*?*
// @match        http*://*chaturbate.com/tags/*
// @match        http*://*chaturbate.com/tags/*/*
// @match        http*://*chaturbate.com/*?page=*
// @match        http*://*chaturbate.com/*/*/?page=*
// @match        http*://*.chaturbate.com/*/*
// @match        http*://*.chaturbate.com/*?*
// @match        http*://*.chaturbate.com/*#*
// @match        http*://*.chaturbate.com/*&*
// @exclude        http*://a2z.com/
// @require        https://gist.githubusercontent.com/angelxaces/0c51c574014c2cd9b85bf6ce8d881c20/raw/64edafb61d2bd2966d3fea585e033fde3977e270/vidgridIncludes.js
// @resource        jqueryui https://gist.githubusercontent.com/angelxaces/0c51c574014c2cd9b85bf6ce8d881c20/raw/ca94e378ed7d0f20cb2128a0d9175b6251079366/jqueryui.css
// @icon        https://www.spreadshirt.com/image-server/v1/designs/11624206,width=178,height=178/stripper-pole-dancer-silhouette-darr.png
// @connect        *
// @connect        jquery.com
// @connect        github.com
// @connect        self
// @connect        chaturbate.com
// @connect        highwebmedia.com
// @connect        cloudflare.com
// @grant        unsafeWindow
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @license        MIT
// @noframes       
// ==/UserScript==
/* eslint-env   greasemonkey */
GM_addStyle (GM_getResourceText("jqueryui"));

/* eslint-env  jquery, greasemonkey */
$(function() {
	if (window.top != window.self){
		return;
	}
	var gm = function(){
		
		var self = this;
		
		this.STORAGE_KEY_NAME = "chaturbate_girls";
		this.LAYOUT_KEY_NAME = "chaturbate_layout";
		
		this.get_layout = function(){
			setTimeout(function(){
				var temp = 2;
				var layout_id = GM_getValue(self.LAYOUT_KEY_NAME);
				if (typeof layout_id == "undefined"){
					layout_id = temp;
				}
				
				var adder = function(lid){
					viewer.layout_id = lid;
					viewer.layout(lid);
				}
				var script = document.createElement("script");
				script.textContent = "(" + adder.toString() + ")("+layout_id+");";
				//document.body.appendChild(script);
			},0);
		}
		
		this.get_girls = function(){
			setTimeout(function(){
				var temp = '[]';
				var sJSON = GM_getValue(self.STORAGE_KEY_NAME);
				if (typeof sJSON == "undefined"){
					sJSON = temp;
				}
				var adder = function(savedGirls){
					$.each(savedGirls,function(){
						viewer.girls.push(new Girl(this));
					});
					if ( location.hash == "#live" ){
						viewer.show();
					}
				}
				var script = document.createElement("script");
				script.textContent = "(" + adder.toString() + ")("+sJSON+");";
				document.body.appendChild(script);
				
			},0);
		}
		
		this.set_girls = function(){
			setTimeout(function(){
				var data = JSON.stringify(unsafeWindow.jQuery.map(unsafeWindow.viewer.girls,function(o){ return o.username }));
				GM_setValue(self.STORAGE_KEY_NAME, data);
			},0);
		}
		
		this.set_layout = function(){
			setTimeout(function(){
				GM_setValue(self.LAYOUT_KEY_NAME, unsafeWindow.viewer.layout_id);
			},0);
		}
		return self;
	};
	
	if (cloneInto){
		var insideGM = new gm();
		var outsideGM = createObjectIn(unsafeWindow, {defineAs: "gm"});
		Object.keys(insideGM).forEach(function(key){
			try {
				if (typeof insideGM[key] == 'function'){
					exportFunction(insideGM[key], outsideGM, {defineAs: key});
				}
			} catch(e){
				
			}
		});
	}
	else {
		unsafeWindow.gm = new gm;
	}
	
	function main() {
		if (typeof jQuery != "undefined"){
			jQuery(document).ready(function(){
				function getKey(e) {
					if(window.event) { // IE
						return e.keyCode;
					} else if(e.which) { // Netscape/Firefox/Opera
						return e.which
					}
				}
				
				var exports = "getKey,toHtml,websiteHostName,Girl,viewer";
				
				var toHtml = function(data, template){
					return template.replace(/#(?:\{|%7B)(.*?)(?:\}|%7D)/g, function($1, $2){
						return ($2 in data) ? data[$2] : '';
					})
				}
				
				var websiteHostName = location.protocol + "//" + location.host + "/";
				
				var Girl = function(name){
					var user = name.replace(/\//g,"");
						var self = this;
						this.href = websiteHostName + user;
						this.username = user;
						this.src = websiteHostName + "embed/" + self.username + "/?join_overlay=1&room=" + self.username;
					}
					
					
					
					
					
					var viewer = new (function(){
						
						var self = this;
						
						var list_template = '<li id="#{username}" class="ui-state-default">'+
						'		<a target="_self" class="remove" href="javascript:void(0);viewer.remove(\'#{username}\',this)"><img src="https://static-assets.highwebmedia.com/tsdefaultassets/floating-player-close.svg" onclick="viewer.remove(\'#{username}\',this)" title="Close">Close</a>'+
						'		<a target="_blank" href="#{href}"><img src="https://static-assets.highwebmedia.com/images/cam.svg" class="handle" title="#{username}">#{username}\'s room</a>'+
						'		<object id="#{username}_video" width="745px" height="480px" data="#{src}" type="text/html"></object></li>';
						
						if(this.layout_id === 'undefined'){this.layout_id = 3};
						this.girls = [];
						this.all_girls = [];
						this.loaded = false;
						
						
						this.init = function(){
							
							$('.content').prepend("<div style='width:1500px; margin:3px 32px; padding:3px; border:1px solid #CCC;'> Use the <img src='https://static-assets.highwebmedia.com/images/cam.svg' align='absmiddle'> icon to add girls to the 'VidGrid' tab </div>");
							
							var template = '<div id="camGirls" style="visibility:hidden;">'+
							'<div id="camControls">'+
							'Username: <input type="text" name="camGirlUsername" id="camGirlUsername" onkeyup="if (getKey(event) == 13) viewer.add()" >'+
							'<input type="Button" value="Add" onclick="viewer.add()">'+
							'<input type="Button" value="Add Top 12" onclick="viewer.addTop12()">'+
							'<input type="Button" value="Remove All" onclick="viewer.removeAll()">'+
							'<input type="Button" value="Remove Offlines" onclick="viewer.clearEmptyCams()">'+
							'<input type="Button" value="Save" onclick="viewer.save()">'+
							'[ Layout: '+
							'<input type="Button" value="Semi-Compact" onclick="viewer.layout(1)" id="layout_1">'+
							'<input type="Button" value="Compact" onclick="viewer.layout(2)" id="layout_2">'+
							'<input type="Button" value="Full" onclick="viewer.layout(3)" id="layout_3">]'+
							'</div>'+
							'<ul id="girls_list"></ul>'+
							'</div>';
							$("#main .content").after(template);
							
							var css = '<style type="text/css">' +
							'#camGirls ul { margin: 0; padding:0; display:inline-block;}'+
							'#camGirls li { margin: 0; padding:0; width:500px; overflow:hidden; display:inline-block; height:456px; }'+
							'#camGirls object { margin: 0; padding:0; border:none; position:relative; width:1030px; height:528px; }'+
							'#camGirls .remove { cursor:pointer; display:inline; top:2px; left:1px; position:relative; float:left; z-index:99; }'+
							'#camGirls .handle { cursor:pointer; display:inline; top:2px; left:2px; position:relative; float:left; z-index:99; }'+
							'#camControls { border:1px solid #CCC; margin:2px; padding:3px; }'+
							'#camControls .active { border:1px solid black; background:#fff; color:#dc5500; }'+
							'#girls_list { list-style-type: none; margin: 0; padding: 0; }' +
							'#girls_list li { margin: 3px 3px 3px 0; padding: 1px; float: left; }'+
							'</style>';
							$('body').append(css);
							
							self.getSaved();
							self.fixRefresh();
							self.updateLayout();
							
							$(".sub-nav li").click(function(){
								var page = location.href;
								if (page.indexOf('#') >- 1)
								page = location.href.split("#")[0];
								var target = location.origin + $(this).find('a').attr('href');
								if (page != target){
									return true;
								}
								else {
									$("#main .content").show();
									$("#main #camGirls").css({"visibility":"hidden","height":"0px"});
									$(".sub-nav li").removeClass("active");
									$(this).addClass("active");
									location.hash = "#tab"
									return false;
								}
							});
							$("ul.sub-nav").append("<li class='gender-tab' ts='$g' style='display: inline-block; position: relative; font: 13.0029px / 16px UbuntuMedium, Arial, Helvetica, sans-serif;'><a href='javascript:viewer.show();'>VidGrid</a></li>");
							$("#followed_tab").css({"position":"relative"});
						}
						this.fixRefresh = function(){
							jQuery( "li.cams" ).live("click", function() {
								viewer.add_girl($(this).parents('li').find('a').attr('href'),this);
							}).css("cursor","pointer").attr("title","Add girl to VidGrid");
							//TODO: conditional for rooms that have already been added so that refresh doesn't reset the link, allowing dupilicates. duplicates aren't terrible as they only load one player, but it's sloppy and it's annoying me.
							//TODO: toggle to add/remove from list
						}
						this.show = function(){
							$(".sub-nav li").removeClass("active");
							$(".sub-nav li:last").addClass("active");
							$("#main .content").hide();
							$("#main #camGirls").css({"visibility":"","height":"auto"});
							location.hash = "#live"
							if (self.loaded == false){
								self.loaded = true;
								self.updateLayout();
							}
						}
						this.addTop12 = function(){
							$(".list > li:lt(12)").each(function(){
								self.add_girl($(this).find('a').attr('href'));
							});
							self.updateLayout();
						}
						this.add = function(){
							viewer.girls.push(new Girl($('#camGirlUsername').val()));
							$("#camGirlUsername").val("");
							self.updateLayout()
						}
						this.add_girl = function(username,obj){
							self.girls.push(new Girl(username));
							$(obj).html("Girl added to VidGrid");
							self.loaded = false;
							viewer.save();
						}
						this.remove = function(username,elem){
							$.each(self.girls, function(i,o){
								if (typeof o != "undefined" && o.username.toLowerCase().indexOf(username.toLowerCase()) >-1 ){
									self.girls.splice(i,1);
									$(elem).parent().remove();
								}
							});
							self.updateLayout();
						}
						this.clearEmptyCams = function(){
							$.ajax({
								url: "https://chaturbate.com/api/public/affiliates/onlinerooms?wm=KZ7tX&client_ip=request_ip&limit=500",
								success: function(result){
									console.log(this.xhrAPI);
									$(viewer.girls).each(function( i, v ) {
										for(n=0;n<result.results.length;n++){
											if(v.username == result.results[n].username){
												if(result.results[n].current_show != 'public'){
													viewer.remove(v.username);
												}
												break;
											}else if(n == result.results.length-1 && v.username != result.results[n].username){
												viewer.remove(v.username);
											}
										}
									});
								}, //success
								error: function(){
									return false;
								}
							});
						}
						this.removeAll = function(){
							self.girls = [];
							self.updateLayout();
						}
						this.updateLayout = function (){
							if ($("#camGirls:visible").length > 0) {
								$.each(self.girls, function(){
									if ($("li#"+this.username).length == 0){
										$("#girls_list").append(toHtml(this,list_template));
									}
								});
								$("#girls_list li").each(function(){
									var user = this.id;
									var isIncluded = $.map(viewer.girls,function(o,i){
										if (o.username == user){
											return true;
										}
									}).length > 0;
									if (isIncluded == false){
										$(this).remove();
									}
								});
								self.layout(self.layout_id);
							}
						}
						this.getSaved = function(){
							gm.get_layout();
							gm.get_girls();
						}
						this.save = function(){
							gm.set_girls();
							gm.set_layout();
							//alert("Saved");
						}
						this.layout = function(id){
							var columns; var columnWidth; var columnHeight; var minWidth; var top;
							self.layout_id = id;
							if (id == 1){
								columnWidth = 500;
								columnHeight = 470;
								top = 0;
							}
							else if (id == 2){
								minWidth = 400;
								columns = Math.floor($(window).width() / minWidth);
								columnWidth = Math.floor($(window).width() / columns) - 5;
								columnHeight = 375;
								top = -66;
							}
							else if (id == 3){
								columnWidth = 730;
								columnHeight = 465;
								top = 0;
							}
							$("#camControls input").removeClass('active')
							$("#layout_" + id).addClass('active')
							$("#camGirls li, div#videoPlayerDiv img").width(columnWidth);
							$("#camGirls li, div#videoPlayerDiv img").height(columnHeight);
							$("#camGirls object").css({ top: top+"px" });
						}
					}); //viewer
					$.each(exports.split(","),function(i,o){
						window[o] = eval(o);
					});
					window.viewer.init();
				});
			}
			
		} //main
		
		var script = document.createElement("script");
		script.textContent = "(" + main.toString() + ")();";
		document.body.appendChild(script);
		$('ul#girls_list').sortable();
		//$('#girls_list').disableSelection();
		
	});
	// Script was originally created by Teso Mayn https://github.com/Teso-Limited/Chaturbate-MultiCam
	// Modifications are made by Mr. Jangles https://github.com/X3Cams/VidGrid
