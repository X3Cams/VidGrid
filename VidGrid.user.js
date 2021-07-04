// ==UserScript==
// @run-at        document-start
// @name          VidGrid
// @author        Mr. Jangles
// @description   Watch a selection of feeds on Chaturbate.com simultaneously within a single tab using VidGrid!
// @namespace     VidGrid
// @version       1.0.1
// @updateURL     https://github.com/angelxaces/VidGrid/blob/master/VidGrid.user.js
// @downloadURL   https://github.com/angelxaces/VidGrid/blob/master/VidGrid.user.js
// @supportURL    https://github.com/X3Cams/VidGrid/issues
// @homepage      https://github.com/X3Cams
// @match         https://chaturbate.com/*
// @match         http://chaturbate.com
// @match         http*://*chaturbate.com/*
// @match         http*://*chaturbate.com/*?*
// @match         http*://*chaturbate.com/tag/*
// @match         http*://*chaturbate.com/tags/*
// @match         http*://*chaturbate.com/*?page=*
// @include       *chaturbate.com*
// @include       http*://*.chaturbate.com/*/*
// @include       http*://*.chaturbate.com/*?*
// @include       http*://*.chaturbate.com/*&*
// @exclude       http://serve.ads.chaturbate.com/*
// @require       https://code.jquery.com/jquery-2.1.4.min.js#sha256-8WqyJLuWKRBVhxXIL1jBDD7SDxU936oZkCnxQbWwJVw=
// @icon          https://www.spreadshirt.com/image-server/v1/designs/11624206,width=178,height=178/stripper-pole-dancer-silhouette-darr.png
// @grant         unsafeWindow
// @grant         GM_registerMenuCommand
// @grant         GM_openInTab
// @grant         GM_getValue
// @grant         GM_setValue
// @license       MIT
// @noframes
// ==/UserScript==

// Taking care of the Adult Content, "bouncer." --Thanks to the Authors(s) of the
// "Chatterbate Enhanced" script.
document.cookie = 'noads=1; expires=' + now.toUTCString() + '; path=/';
document.cookie = 'agreeterms=1; expires=' + later.toUTCString() + '; path=/';
document.cookie = 'np3=1; expires=' + later.toUTCString() + '; path=/';
// Copied from -> https://openuserjs.org/scripts/stixmaster/Chaturbate_Enhanced 

$(function() {
    if (window.top != window.self)
        return;

    var gm = function(){

        var self = this;

        this.STORAGE_KEY_NAME = "chaturbate_girls";
        this.LAYOUT_KEY_NAME = "chaturbate_layout";

        this.get_layout = function(){
            setTimeout(function(){
                var temp = 2;
                var layout_id = GM_getValue(self.LAYOUT_KEY_NAME);
                if (typeof layout_id == "undefined")
                    layout_id = temp;

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
                if (typeof sJSON == "undefined")
                    sJSON = temp;
                var adder = function(savedGirls){
                    $.each(savedGirls,function(){
                        viewer.girls.push(new Girl(this));
                    });
                    if ( location.hash == "#live" )
                        viewer.show();
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
                    // Want a little sneak peak at what's to come? Uncomment (delet the "//") on line 142 and put them at the beginning of 143
                    //this.src = "https://chaturbate.com/fullvideo/?b="  + self.username;
                    this.src = websiteHostName + "embed/"  + self.username + "/?join_overlay=1&room="  + self.username;
                }


                var viewer = new (function(){

                    var self = this;

                    var list_template = '<li id="#{username}">'+
                        '		<img src="http://ccstatic.highwebmedia.com/static/images/ico-01.png" class="remove" onclick="viewer.remove(\'#{username}\',this)">'+
                        '		<a target="_blank" href="#{href}"><img src="http://ccstatic.highwebmedia.com/static/images/ico-cams.png" class="handle" title="#{username}"></a>'+
                        '		<iframe src="#{src}"></iframe>'+
                        '	</li>';

                    this.layout_id = 2;
                    this.girls = [];
                    this.all_girls = [];
                    this.loaded = false;

                    this.init = function(){

                        $('.content').prepend("<div style='width:1500px; margin:3px 32px; padding:3px; border:1px solid #CCC;'> Use the <img src='http://ccstatic.highwebmedia.com/static/images/ico-cams.png' align='absmiddle'> icon to add girls to the 'VidGrid' tab </div>");

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
                            '#camGirls iframe { margin: 0; padding:0; border:none; position:relative; width:1030px; height:528px; }'+
                            '#camGirls .remove { cursor:pointer; display:inline; top:2px; left:1px; position:relative; float:left; z-index:99; }'+
                            '#camGirls .handle { cursor:pointer; display:inline; top:2px; left:2px; position:relative; float:left; z-index:99; }'+
                            '#camControls { border:1px solid #CCC; margin:2px; padding:3px; }'+
                            '#camControls .active { border:1px solid black; background:#fff; color:#dc5500; }'+
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

                        var li = $("<li class='gender-tab' style='display:inline-block; position:absolute;'>").html("<a href='javascript:viewer.show();'>VidGrid</a>");

                        $(".sub-nav").append(li);
                    }

                    this.fixRefresh = function(){
                        jQuery( "li.cams" ).live("click", function() {
                            viewer.add_girl($(this).parents('li').find('a').attr('href'),this);
                        }).css("cursor","pointer").attr("title","Add girl to VidGrid");
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
                        $("#girls_list iframe").each(function(){
                            var username = $(this).parents("li")[0].id;
                            //need to find a window variable that'll indicate when the flash object is there and it's offline
                            if ($(this.contentWindow.document).find('#movie').length == 0)
                                 self.remove(username);
                        });
                    }

                    this.removeAll = function(){
                        self.girls = [];
                        self.updateLayout();
                    }

                    this.updateLayout = function(){
                        if ($("#camGirls:visible").length > 0) {
                            $.each(self.girls, function(){
                                if ($("li#"+this.username).length == 0)
                                    $("#girls_list").append(toHtml(this,list_template));
                            });
                            $("#girls_list li").each(function(){
                                var user = this.id;
                                var isIncluded = $.map(viewer.girls,function(o,i){
                                    if (o.username == user){
                                        return true;
                                    }
                                }).length > 0;
                                if (isIncluded == false)
                                    $(this).remove();
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
                        self.layout_id = id;
                        if (id == 1){
                            var columWidth = 500;
                            var columnHeight = 470;
                            var top = 0;
                        }
                        else if (id == 2){
                            var minWidth = 400;
                            var columns = Math.floor($(window).width() / minWidth);
                            var columWidth = Math.floor($(window).width() / columns) - 5;
                            var columnHeight = 375;
                            var top = -66;
                        }
                        else if (id == 3){
                            var columWidth = 1030;
                            var columnHeight = 544;
                            var top = 0;
                        }
                        $("#camControls input").removeClass('active')
                        $("#layout_" + id).addClass('active')
                        $("#camGirls li").width(columWidth);
                        $("#camGirls li").height(columnHeight);
                        $("#camGirls iframe").css({ top: top+"px" });
                    }

                });
                $.each(exports.split(","),function(i,o){
                    window[o] = eval(o);
                });
                window.viewer.init();
            });
        }
    }

    var script = document.createElement("script");
    script.textContent = "(" + main.toString() + ")();";
    document.body.appendChild(script);
});
// Script was originally created by Teso Mayn https://github.com/Teso-Limited/Chaturbate-MultiCam
// Modifications are made by Mr. Jangles https://github.com/X3Cams/VidGrid
