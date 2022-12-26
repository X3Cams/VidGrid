// ==UserScript==
// @name      VidGrid Development
// @run-at     document-start
// @namespace     https://github.com/angelxaces/VidGrid/
// @description      Watch a selection of feeds on Chaturbate.com simultaneously within a single tab using VidGrid!
// @author          Mr. Jangles
// @match               http*://*.chaturbate.com/*&*
// @match            http*://chaturbate.com
// @match           http*://*chaturbate.com/*
// @match           http*://*chaturbate.com/*?*
// @match          http*://*chaturbate.com/tags/*
// @match       http*://*chaturbate.com/tags/*/*
// @match  http*://*chaturbate.com/*?page=*
// @match  http*://*chaturbate.com/*/*/?page=*
// @match  http*://*.chaturbate.com/*/*
// @match  http*://*.chaturbate.com/*?*
// @match  http*://*.chaturbate.com/*#*
// @version           1.0.1
// @exclude  http*://a2z.com/
// @connect        *
// @connect cdnjs.cloudflare.com
// @connect gihub.com
// @connect githubusercontent.com
// @grant        unsafeWindow
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @grant        GM.xmlHttpRequest
// @grant        GM_xmlhttpRequest
// @grant        GM_addElement
// @grant        GM_log
// @grant        GM_info
// @license        MIT
// @noframes
// @grant        GM.getResourceText
// @require https://gist.github.com/angelxaces/0c51c574014c2cd9b85bf6ce8d881c20/raw/244c7e663aa9b23c7cd3c10d1ba184f583ad953a/jquery.js
// @resource jqueryui https://gist.githubusercontent.com/angelxaces/0d654827b4c5eacb3bedef4d0a122713/raw/981db29926473870f617404091547e5a69b7ec25/vidgridstyles.css
// @icon        https://www.spreadshirt.com/image-server/v1/designs/11624206,width=178,height=178/stripper-pole-dancer-silhouette-darr.png
// ==/UserScript==
/* eslint-env jquery */
GM_addStyle(GM_getResourceText("jqueryui"));

$(function () {
    videojs.options.controls = true;
    videojs.options.autoplay = "muted";
    videojs.options.liveui = true;

    unsafeWindow.extLibs = function (url, type) {
        let source = null;
        if (type === "data") {
            source = "https://chaturbate.com/api/chatvideocontext/" + url;
        } else {
            source = url;
        }
        GM.xmlHttpRequest({
            url: source,
            method: "GET",
            headers: {
                "origin": "*"
            },
            onload: function (x) {
                if (type === "css") {
                    GM_addStyle(x.responseText);
                } else if (type === "script") {
                    let y = document.createElement("script");
                    y.text = x.responseText;
                    y.type = "text/javascript";
                    $("body").append(y);
                }
            },
            synchronous: false
        });
    };
    //unsafeWindow.extLibs("https://gist.githubusercontent.com/angelxaces/0d654827b4c5eacb3bedef4d0a122713/raw/981db29926473870f617404091547e5a69b7ec25/vidgridstyles.css", "css");
    unsafeWindow.extLibs("https://gist.github.com/angelxaces/0c51c574014c2cd9b85bf6ce8d881c20/raw/244c7e663aa9b23c7cd3c10d1ba184f583ad953a/jquery.js", "script");
    $(".sub-nav li").click(function () {
        var page = location.href;
        if (page.indexOf('#') > - 1)
            page = location.href.split("#")[0];
        var target = location.origin + $(this).find('a').attr('href');
        if (page != target) {
            return true;
        }
        else {
            $("#main .content").show();
            $("#main #camGirls").css({ "visibility": "hidden", "height": "0px" });
            $(".sub-nav li").removeClass("active");
            $(this).addClass("active");
            location.hash = "#tab"
            return false;
        }
    });
    $("ul.sub-nav").append("<li id='vidgrid' class='gender-tab' ts='$g' style='display: inline-block; position: relative; font: 13.0029px / 16px UbuntuMedium, Arial, Helvetica, sans-serif;'><a href='#live'>VidGrid</a></li>");
    $("#followed_tab").css({ "position": "relative" });

    var removeModels = unsafeWindow.removeModels;
    unsafeWindow.removeModels = function () {
        let id = this.parentElement.id;
        videojs(id + "_video").dispose();
        $.remove("li#" + id);
        for (let i = 0; i < rooms.length; i++) {
            if (unsafeWindow.rooms[i][0] == this.parentElement.id) {
                unsafeWindow.rooms.splice(i, 1);
                GM_setValue('selectedRooms', unsafeWindow.rooms);
            }
        }
    };





    // $("ul#room_list li.room_list_room").each(function(x,y) {if($.inArray(y.firstElementChild.dataset.room, unsafeWindow.models) > -1) {$(this).css("background-color", "#00ff00");}}), 3400);

    $("li.room_list_room").on("click", function () {
        let name = $(this).find('a').attr('data-room');
        if (!GM_getValue("models")) { GM_setValue("models", Array()); }
        if (!GM_getValue("streams")) { GM_setValue("streams", Array()); }
        let models = GM_getValue("models");
        let streams = GM_getValue("streams");
        let selected = $.inArray(name, models);
        if (selected == -1) {
            $(this).css("background-color", "#00ff00");
            $.get("https://chaturbate.com/api/chatvideocontext/" + name, function (z) {
                models.push(name);
                GM_setValue("models", models);
                streams.push(z.hls_source.substr(0, z.hls_source.indexOf("?")));
                GM_setValue("streams", streams);
            });

        } else {
            $(this).css("background-color", "#ffffff");
            models.splice(selected, 1);
            streams.splice(selected, 1);
            GM_setValue("models", models);
            GM_setValue("streams", streams);

        }
    });



    var template = '<div id="camGirls" style="visibility:hidden;">' +
        '<div id="camControls">' +
        'Username: <input type="text" name="camGirlUsername" id="camGirlUsername" onkeyup="if (getKey(event) == 13) viewer.add()" >' +
        '<input type="Button" value="Add" onclick="viewer.add()">' +
        '<input type="Button" value="Add Top 12" onclick="viewer.addTop12()">' +
        '<input type="Button" value="Remove All" onclick="viewer.removeAll()">' +
        '<input type="Button" value="Remove Offlines" onclick="viewer.clearEmptyCams()">' +
        '<input type="Button" value="Save" onclick="viewer.save()">' +
        '[ Layout: ' +
        '<input type="Button" value="Semi-Compact" onclick="viewer.layout(1)" id="layout_1">' +
        '<input type="Button" value="Compact" onclick="viewer.layout(2)" id="layout_2">' +
        '<input type="Button" value="Full" onclick="viewer.layout(3)" id="layout_3">]' +
        '</div>' +
        '</div>';
    $("#main .content").after(template);

    var css = '<style type="text/css">' +
        '.roomAdded { background-color: #00ff00; }' +
        'ul#grid { list-style-type: none; margin: 0; padding: 0; width: 100%; }' +
        'ul#grid li { margin: 0 5px 5px 5px; padding: 5px; font-size: 1.2em; float:left;}' +
        'html>body #grid li { line-height: 1.2em; }' +
        '.ui-state-highlight { line-height: 1.2em; }' +
        '#camGirls .remove { cursor:pointer; display:inline; top:2px; left:1px; position:relative; float:left; z-index:99; }' +
        '#camGirls .handle { cursor:pointer; display:inline; top:2px; left:2px; position:relative; float:left; z-index:99; }' +
        '#camControls { border:1px solid #CCC; margin:2px; padding:3px; }' +
        '#camControls .active { border:1px solid black; background:#fff; color:#dc5500; }' +
        '</style>';



    unsafeWindow.grid = function () {
        let rooms = Array();
        for (let i = 0; i < unsafeWindow.models.length; i++) {
            rooms.push(Array(unsafeWindow.models[i], unsafeWindow.streams[i]));
            let caster = unsafeWindow.models[i];

            //GM_log(i, unsafeWindow.models[i]+"_video", unsafeWindow.streams[i], unsafeWindow.models[i]);
            let options = `data-setup=\'{"controls": true, "autoplay": true, "preload": "auto", "muted": true}\'`;
            $("#grid").append('<li id="' + caster + '_li" class="ui-state-default"><a target="_self" class="remove" href="javascript:void(0);" onclick="javascript:videojs(' + caster + ').dispose();$("#' + caster + '_li").remove();">' +
                '<img src="https://static-assets.highwebmedia.com/tsdefaultassets/floating-player-close.svg" onclick="viewer.remove(\'#{username}\',this)" title="Close">Close</a>' +
                '<a target="_blank" href="' + location.origin + '/' + caster + '"><img src="https://static-assets.highwebmedia.com/images/cam.svg" class="handle" title="' + caster + '">' + caster + '\'s room</a>' +
                '<video id="' + caster + '" class="video-js"><source type="application/x-mpegURL" src="' + unsafeWindow.streams[i] + '"></video>' +
                '</li>');


            let player = videojs(caster, { controls: true, autoplay: 'muted', liveui: true, sources: [{ type: "application/x-mpegURL", src: unsafeWindow.streams[i] }] });
            player.play();
            //   player.reloadSourceOnError();
            player.on("error", function () {
                window.videojs(caster).dispose();
                $("#" + caster + "_li").remove();
                $.get("https://chaturbate.com/api/chatvideocontext/" + caster, function (z) {
                    if (z.room_status == "public") {
                        $("#grid").append('<li id="' + caster + '_li" class="ui-state-default"><a target="_self" class="remove" href="javascript:void(0);" onclick="javascript:window.videojs(' + caster + ').dispose();$("#' + caster + '_li").remove();">' +
                            '<img src="https://static-assets.highwebmedia.com/tsdefaultassets/floating-player-close.svg" onclick="viewer.remove(\'#{username}\',this)" title="Close">Close</a>' +
                            '<a target="_blank" href="' + location.origin + '/' + caster + '"><img src="https://static-assets.highwebmedia.com/images/cam.svg" class="handle" title="' + caster + '">' + caster + '\'s room</a>' +
                            '<video id="' + caster + '" class="video-js"><source type="application/x-mpegURL" src="' + unsafeWindow.streams[i] + '"></video>' +
                            '</li>');
                        let player = videojs(caster, { controls: true, autoplay: 'muted', liveui: true, sources: [{ type: "application/x-mpegURL", src: unsafeWindow.streams[i] }] });
                        player.play();

                    } else {
                        window.videojs(caster).dispose();
                        $("#" + caster + "_li").remove();
                        unsafeWindow.models.splice(i, 1);
                        GM_setValue('models', unsafeWindow.models);
                        unsafeWindow.streams.splice(i, 1);
                        GM_setValue('streams', unsafeWindow.streams);
                        alert(caster + " has logged off and their feed has been removed from VidGrid.");
                    }
                });
            });
            /* const playerElement = document.querySelector("#"+unsafeWindow.models[i]+"_video");

            playerElement.addEventListener("error", (event) => {
                console.log(event.target.error.message);
                $.get("https://chaturbate.com/api/chatvideocontext/"+name, function (z){
                    if(z.room_status !== "public"){videojs(playerElement).dispose(); $("#"+unsafeWindow.models[i]).remove();}else{videjs(playerElement).play(); }
                });
            })*/
        }

        /*         $(unsafeWindow.models).each(function(x,y) {
            $("#grid").append('<li id="'+y+'_li" class="ui-state-default"><a target="_self" class="remove" href="javascript:void(0);" onclick="javascript:removeModels()">'+
                              '<img src="https://static-assets.highwebmedia.com/tsdefaultassets/floating-player-close.svg" onclick="viewer.remove(\'#{username}\',this)" title="Close">Close</a>'+
                              '<a target="_blank" href="'+location.origin+'/'+y+'"><img src="https://static-assets.highwebmedia.com/images/cam.svg" class="handle" title="'+y+'">'+y+'\'s room</a>'+
                              '<video id="'+y+'" class="video-js">
                              '</li>');
        }); */


    }
    var grid = unsafeWindow.grid;

    $('body').append(css);

    unsafeWindow.models = GM_getValue("models");
    unsafeWindow.streams = GM_getValue("streams");


    unsafeWindow.vidGrid = function () {
        unsafeWindow.extLibs("https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.13.2/jquery-ui.js", "script");
        $('#camGirls').show(400, 'swing', function () {
            $(this).css("visibility", "visible");
            $(".sub-nav li").removeClass("active");
            $(".sub-nav li:last").addClass("active");
            $("#main .content").hide();
            $(this).append('<ul id="grid"></ul>');
            unsafeWindow.grid();
            location.hash = "#live";

            $("#grid").sortable({
                placeholder: "ui-state-highlight"
            });
            $("#grid").disableSelection();

            if (self.loaded === false) {
                self.loaded = true;
            }
        });
    };
    if (window.location.hash == "#live") { $("#camGirls").show(); } else { $("#camGirls").hide(); };
    $('#vidgrid').click(unsafeWindow.vidGrid);




    $('span.genderm').offsetParent().remove();
    $('span.genders').offsetParent().remove();
    $("button#followed").click(function () {
        $('div.icon_following').parent().toggle();
    });
    $('.genders').offsetParent().remove();
    $('.genderm').offsetParent().remove();
    $('div.ad').remove();
    $('#girls_list').disableSelection()
    //$('.room_thumbnail').remove();
});


// Script was originally created by Teso Mayn https://github.com/Teso-Limited/Chaturbate-MultiCam
// Modifications are made by Mr. Jangles https://github.com/X3Cams/VidGrid


