// ==UserScript==
// @name      VidGrid Development OOP
// @run-at     document-start
// @description      Watch a selection of feeds on Chaturbate.com simultaneously within a single tab using VidGrid!
// @author          Mr. Jangles
// @match               http*://*.chaturbate.com/*&*
// @match            http*://chaturbate.com
// @match           http*://*chaturbate.com/*
// @match           http*://*chaturbate.com/*?*
// @match          http*://*chaturbate.com/tags/*
// @match       http*://*chaturbate.com/tags/*/*
// @match  http*://*chaturbate.com/*?page=*
// @match  http*://*chaturbate.com/*/*/#vidgrid
// @match  http*://*chaturbate.com/*/*/?page=*
// @match  http*://*.chaturbate.com/*/*
// @match  http*://*.chaturbate.com/*?*
// @match  http*://*.chaturbate.com/*#*
// @version           1.0.1
// @exclude  http*://a2z.com/
// @connect        *
// @resource jqueryImg https://github.com/angelxaces/VidGrid/blob/master/ui-bg_glass_60_eeeeee_1x400%5B1%5D.png
// @connect cdnjs.cloudflare.com
// @connect gihub.com
// @connect githubusercontent.com
// @connect self
// @grant        unsafeWindow
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @grant        GM.xmlHttpRequest
// @grant        GM_xmlhttpRequest
// @grant        GM_addElement
// @grant        GM_log
// @grant        GM_openInTab
// @grant window.close
// @grant window.focus
// @grant window.onurlchange
// @grant        GM_info
// @grant GM_notification
// @license        MIT
// @noframes
// @exclude    https://bam.nr-data.net
// @grant        GM.getResourceText
// @require https://gist.githubusercontent.com/angelxaces/54c0ad2092c2fc55746baae7834817c5/raw/1b47754c9759e87723c3480aa650ab58266bb4d0/videojs-8.3.0.js
// @require https://gist.githubusercontent.com/angelxaces/638f31009079f89cf4307e05487a5dc8/raw/e87ad813f21a33e78043540cf8d30066beafb461/vidgridLibraries.js
// @require https://cdn.jsdelivr.net/npm/intersection-observer@0.12.2/intersection-observer.js
// @resource jqueryui https://gist.githubusercontent.com/angelxaces/0d654827b4c5eacb3bedef4d0a122713/raw/136da74c14373c541d89bbb91634b5640a295afa/vidgridstyles.css
// @icon        https://www.spreadshirt.com/image-server/v1/designs/11624206,width=178,height=178/stripper-pole-dancer-silhouette-darr.png
// ==/UserScript==

/* eslint-env jquery, es6 */
"use strict";
let jqueryUiStyles = GM_getResourceText("jqueryui");
GM_addStyle(jqueryUiStyles);
GM_addStyle("ul#grid {width:100%; } ul#grid li {display:grid; height: 242px; width:400px;} #vg {height: 760px; width: 100%} .green, .rlr-selected { background-color: rgb(0, 255, 0) !important;}");
GM_addStyle(".ui-state-default,.ui-widget-content .ui-state-default,.ui-widget-header .ui-state-default,.ui-button,html .ui-button.ui-state-disabled:hover,html .ui-button.ui-state-disabled:active{border:1px solid #ccc;background:#eee url(\""+GM_getResourceText("jqueryImg")+"\") 50% 50% repeat-x;font-weight:bold;color:#3383bb}");


$(function() {
    // Constants
    const vidgrid = {
        rooms: GM_getValue("rooms", Array()),
        stream: GM_getValue("stream", Array()),
        description: GM_getValue("description", Array())
    };

    //$('li.room_list_room a:first-child').on('click', function() { GM_openin_tab(location.origin + this.attr('href'), setParent, loadInBackground); return false; });
    // Variables
    var template = "<div id=\"vg\"><div id=\"camControls\">"+
        "Username: <input type=\"text\" name=\"camGirlUsername\" id=\"camGirlUsername\" >"+
        "<input type=\"Button\" value=\"Add\" onclick=\"\">"+
        "<input type=\"Button\" value=\"Add Top 12\" onclick=\"\">"+
        "<input type=\"Button\" value=\"Remove All\" onclick=\"\">"+
        "<input type=\"Button\" value=\"Remove Offlines\" onclick=\"\">"+
        "<input type=\"Button\" value=\"Save\" onclick=\"\">"+
        "[ Layout: "+
        "<input type=\"Button\" value=\"Semi-Compact\" onclick=\"\" id=\"layout_1\">"+
        "<input type=\"Button\" value=\"Compact\" onclick=\"\" id=\"layout_2\">"+
        "<input type=\"Button\" value=\"Full\" onclick=\"\" id=\"layout_3\">]"+
        "</div><ul id=\"grid\"></ul></div>";

    // Removes that "Knox-like" age-verification wall.
    $('.entrance_terms_overlay').remove();
    document.cookie = "agreeterms=1";
    // UI elements and modifications via jQuery
    $("#main.content").after(template);
    $("ul.sub-nav").append("<li id='vidgrid_tab' class='gender-tab'><a target='_self'>VidGrid</a></li>");
    // Button Insert: Show/Hide Favorites
    $("div.top-section").append("<input type='button' id= 'followed' value='Hide Favorites'>");
    $( "#followed" ).on("click", function() {
        $("div.icon_following").parent().toggle();
    });
    // Add functionality "VidGrid,"tab to top navigation
    $("#vidgrid_tab").on("click", function() {
        location.hash = "#vidgrid";
        vidgrid.init();
        // Boolean($(location.hash === "#vidgrid")) ? vidgrid.destroy() : vidgrid.init();
    });
    $("#grid").sortable({placeholder: "ui-state-highlight"}).disableSelection();
    // Add closing "X" icon before VideoJS DIV
    $("#grid li div").before( "<img class=\"close\" title=\"close\" alt=\"close\"  src=\"https://static-assets.highwebmedia.com/tsdefaultassets/floating-player-close.svg\">");
    // close video button
    $(".close").on("click", function() { this.parent.remove(); });

    //hides  trans  rooms
    $(".genders").offsetParent().remove();
    // hides male rooms
    $(".genderm").offsetParent().remove();
    $("div.ad").remove();
    // $('.room_thumbnail').replaceWith(function() { return '<div style="background-color: #0000FF; width:200px; height: 112px;"></div>';});

    vidgrid.closeVideo = function(element) {
        document.getElementById(element+"_li").remove();
        //console.log(element);
        let selected = $.inArray(element, vidgrid.rooms);
        vidgrid.rooms.splice(selected, 1);
        GM_setValue("rooms", vidgrid.rooms);
        videojs(element).dispose();
    };

    // Highlights selected rooms when page loads
    // While I could simply truncate selected rooms
    // this provides an opportunity to deselect rooms
    $("body").ready(function () {
        let x; //The declaration of x... in the scope of this function!
        for(x of $("a.no_select")) { //iterate through all of the anchors of class 'no_select.'
            if(vidgrid.rooms.includes(x.dataset.room) === true){ //if the anchor of the no_select class's room in the dataset has a matching value to what's stored in vidgrid...
                $(x).parent().addClass("rlr-selected"); //We make their thumbnail's background green ASAFP so the user knows it's been selected and another click will deselect the List-Item.
            }
        }
        $(".roomCard>*:not(div.follow_star)").on("click", function() {
            let el = this.offsetParent; //store the List-Item for a moment
            let name = this.offsetParent.querySelector("a.no_select").dataset.room; //grab the username from the anchor
            let rmId = $.inArray(name, vidgrid.rooms); //check whether the username is listed in the array in the rooms property
            function addRoster (user, item){ //Add the room to your vidgrid list
                vidgrid.extLibs(user, 2); // Run the xmlHTTPRequest.
                item.classList.add("rlr-selected"); //make the thumbnail background green
            }
            function dropRoster(id, item) { //Remove the user from your list.
                vidgrid.killUser(id); //If you've created your own snuff, you took this a little too literally.
                item.classList.remove("rlr-selected"); //make the thumbnail background default color.
            }
            vidgrid.rooms.includes(name) ? dropRoster(rmId, el) : addRoster(name, el); //Does vidgrid.rooms listing have the name in it that was clicked? if so, remove them; if not, add them!
        }).not("div.follow_star"); // Allows users follow a room without simultaneously (de)selecting it.
    });

    // I know there are easier ways of doing this but CRS is being a little cry-baby bitch and this works.
    vidgrid.extLibs = function(url,type) {
        var httpx = new XMLHttpRequest();
        httpx.onload = function () {
            if(httpx.status !== 200) {
                console.log("Well... shit");
                console.log("extLibs failed to load data because: " + httpx.status + resLoc);
                return;
            }
            let output;
            switch(type) {
                default: {
                    output = httpx.responseText;
                    alert(Text(output));
                    break;
                }
                case 0: {
                    let script = document.createElement("script");
                    script.textContent = httpx.response;
                    output = document.head.appendChild(script);
                    break;
                }
                case 1: {
                    let y = GM_addStyle(httpx.responseText);
                    output = $("body").append(y);
                    break;
                }
                case 2: {
                    let strm = JSON.parse(httpx.responseText).hls_source.substring(0, JSON.parse(httpx.responseText).hls_source.indexOf("?"));
                    let usr = JSON.parse(httpx.responseText).broadcaster_username;
                    //let rd = {stream: strm, description: JSON.parse(httpx.responseText).room_title, get video() { return vidgrid.module(this.model, this.stream)}};
                    let description = JSON.parse(httpx.responseText).room_title;
                    vidgrid.rooms.push(usr);
                    vidgrid.stream.push(strm);
                    vidgrid.description.push(description);
                    GM_setValue("rooms", vidgrid.rooms);
                    GM_setValue("stream", vidgrid.stream);
                    GM_setValue("description", vidgrid.description);
                    httpx.payLoad = GM_getValue("rooms");

                    output = httpx;
                    // console.table(httpx.payload);
                }
                    return output;
            }
        };
        let resLoc = (type === 2) ? location.origin + "/api/chatvideocontext/" + url : url;
        httpx.open("GET", resLoc);
        httpx.send();
        return httpx;
    };
    // TODO: cleanup

    // Remove location.hash without refreshing if the native page action doesn't require it.
    vidgrid.removeHash = function() {
        var uri = window.location.toString();
        if (uri.indexOf("#") > 0) {
            var clean_uri = uri.substring(0, uri.indexOf("#"));
            window.history.replaceState({}, document.title, clean_uri);
        }
    };
    vidgrid.destroy = function() {
        $("#vg").remove();
        $("#main .content").show();
        vidgrid.removeHash();
    };

    vidgrid.save = function() {
        GM_setValue("rooms", vidgrid.rooms);
        return GM_notification({
            text: "Your model selection has been saved to VidGrid!",
            title: "Saved",
            silent: true,
            timeout: 5000,
            highlight: true,
            onclick: () => alert("I was clicked!")
        });
    };


    vidgrid.killMod = function(user) {
        vidgrid.killUser(vidgrid.rooms.indexOf(user));
        $("li#li_x_"+user).remove();
        videojs(user).dispose();
    };
    // Removes broadcasters from VidGrid.
    vidgrid.killUser = function(id) {
        vidgrid.rooms.splice(id, 1);
        vidgrid.stream.splice(id,1);
        vidgrid.description.splice(id, 1);
        GM_setValue("rooms", vidgrid.rooms);
        GM_setValue("stream", vidgrid.stream);
        GM_setValue("description", vidgrid.description);
    };



    vidgrid.vBox = function(x) {
        let container = document.createElement("li");
        container.setAttribute("class", "ui-state-default");
        container.setAttribute("id", "li_"+vidgrid.rooms[x]);
        $("#grid").append(container);
    };


    $('video').on('error', function () { this.remove(); });
    vidgrid.init = function() {

        $(".sub-nav li").removeClass("active");
        $(".sub-nav li:last").addClass("active");
        $("#main").append('<div id="vidgrid"><ul id="grid"></ul></div>');
        $("#main .content").hide();
        $("#followed").hide();
        location.hash = "#vidgrid";
        vidgrid.rooms.forEach((el) => {
            $("#grid").append(vidgrid.vBox(vidgrid.rooms.indexOf(el)));
        });

        // Starting IntersectionObserver to make videos (un)load as they scroll in/out of view
        const targets = document.querySelectorAll("#grid li");

        const observerOptions = {
            root: null,
            threshold: 0.8
            // threshold: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
        };
        const observerCallback = (entries) => {

            entries.forEach((entry) => {
                //console.log(entry.target.id);
                let name = 'x'+entry.target.id.slice(3);
                let streamUrl = vidgrid.stream[vidgrid.rooms.indexOf(name.slice(1))];
                let entryEl = document.getElementById(entry.target.id);
                let entryElVid = $(entryEl).append(Object.assign(document.createElement('video'), {id: "x" + entry.target.id.slice(3), classList: "video-js loadin"}));

                if (entry.isIntersecting) {
                    $(entryElVid).ready(function() {
                        try {
                            videojs(name, {sources: [{type: "application/x-mpegURL", src: streamUrl}], liveui: true, autoplay:true, muted: true, controls: true});
                            videojs(name).on('error', () => {
                                //  vidgrid.killUser(vidgrid.rooms.indexOf(name.slice(3)));
                                videojs(name).dispose();
                            });
                        } catch (error) {
                            vidgrid.killUser(vidgrid.rooms.indexOf(name.slice(3)));
                        }

                        entry.target.setAttribute('class', "loaded");


                        videojs(name).play();
                    });
                } else {
                    //console.log(entry.target);
                    entry.target.classList.remove("loaded");
                    videojs(name).dispose();
                }
            });
        };
        const observer = new IntersectionObserver(observerCallback, observerOptions);
        targets.forEach((target) => observer.observe(target));

    };

    if(location.hash === "#vidgrid") {
        vidgrid.init();
    }
    unsafeWindow.vidgrid = vidgrid;
    unsafeWindow.videojs = videojs;
    //  unsafeWindow.xPlayer = xPlayer;
    unsafeWindow.$ = $;
    unsafeWindow.io = vidgrid.io;
    unsafeWindow.IntersectionObserver = window.IntersectionObserver;
    unsafeWindow.IntersectionObserverEntry = window.IntersectionObserverEntry;
    unsafeWindow.IntersectionObserver = document.IntersectionObserver;
    unsafeWindow.IntersectionObserverEntry = document.IntersectionObserverEntry;
    unsafeWindow.IntersectionObserverRatio = document.IntersectionObserverRatio;
    unsafeWindow.observer = document.observer;
    unsafeWindow.observer = window.observer;


});


// Script was originally created by Teso Mayn https://github.com/Teso-Limited/Chaturbate-MultiCam
// Modifications are made by Mr. Jangles https://github.com/X3Cams/VidGrid