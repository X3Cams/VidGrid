// ==UserScript==
// @name      VidGrid Development
// @run-at     document-start
// @namespace     https://github.com/angelxaces/VidGrid/
// @update        file://C:\Users\arjb1\source\repos\angelxaces\VidGrid\VidGrid.user.js
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
// @license        MIT
// @noframes
// @exclude    https://bam.nr-data.net
// @grant        GM.getResourceText
// @require https://gist.githubusercontent.com/angelxaces/638f31009079f89cf4307e05487a5dc8/raw/93304b143cd947d62b370a7c231936d432393d83/vidgridLibraries.js
// @resource jqueryui https://gist.githubusercontent.com/angelxaces/0d654827b4c5eacb3bedef4d0a122713/raw/d36707e2d4adee8d4b9a2df674394cdf5dd3da58/vidgridstyles.css
// @icon        https://www.spreadshirt.com/image-server/v1/designs/11624206,width=178,height=178/stripper-pole-dancer-silhouette-darr.png
// ==/UserScript==
/* eslint-env jquery */
GM_addStyle(GM_getResourceText("jqueryui"));




$(function() {
    $('ul#grid>li').css("resize", "both");
    $("ul.sub-nav").append("<li id='vidgrid' class='gender-tab' style='display: inline-block; position: relative; font: 13.0029px / 16px UbuntuMedium, Arial, Helvetica, sans-serif;'  onclick='vidGrid();'><a target='_self' href='#vidgrid'>VidGrid</a></li>");
    $("#followed_tab").css({"position":"relative"})
    $("ul.sub-nav").css("float", "left");
    $("div.top-section").append("<input type='button' id= 'followed' value='remove followed cams' style='float: left;'>");
    function disposeAll() {
        $.each(rooms.names, function(x,y) {
            try {
                videojs(y).dispose();
            }catch (error) {
                console.error('No player ' + error);
            }
        });
    }
    $('#grid').on('unload', function() {
        disposeAll();
    });

    /* $('#vidgrid').on('click', function() {
    location.hash === '#vidgrid' && Boolean(vidGrid()) ? $('#camGirls').show() : vidGrid()
    });*/


    var rooms = GM_getValue(
        'rooms',
        {
            names: Array(),
            streams: Array()
        });

   /* async function vidTemplate(names) {
        $.each(names, function(x,y) {
            let container = document.createElement("li", {"id": y +"_li", "class": "ui-state-default"});
            container.innerHTML = '<img class="close" title="close" alt="close"  src="https://static-assets.highwebmedia.com/tsdefaultassets/floating-player-close.svg">';
            container.innerHTML += '<img class="handle" title="' + y + '" alt="Open room in new tab" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAVklEQVR4Xn3PgQkAMQhDUXfqTu7kTtkpd5RA8AInfArtQ2iRXFWT2QedAfttj2FsPIOE1eCOlEuoWWjgzYaB/IkeGOrxXhqB+uA9Bfcm0lAZuh+YIeAD+cAqSz4kCMUAAAAASUVORK5CYII=">';
            container.innerHTML += '<video id="' + y + '_li" controls liveui="true" class="video-js"></video>';
            document.getElementById('grid').appendChild(container);

        });
    }
    function activateVideo(name, stream) {
        let player = videojs(name);
        player.loadMedia ({src: [{type: "application/x-mpegURL", src: stream}]});
        player.play();
    }*/
   var vg = !!vidGrid;
   unsafeWindow.disposeAll = async function() {
       $(rooms.names).each(function(x) {videojs(x).dispose(); }).then($("#camGirls").remove()).then(vidGrid);
   }
                           var disposeAll = unsafeWindow.disposeAll;
//(!!window.onurlchange === location.origin + "/" + location.hash  ? (!!vg ? disposeAll.then($("#camGirls").remove()).then(vidGrid) : vidgrid) : false);

    // Highlights selected rooms when page loads
    $('body').ready(function () {
        var tnails =  $('li.room_list_room');
        for(let i=0; i<tnails.length; i++) {
            $.each(rooms.names, function(x,y) {
                if( tnails[i].children[0].attributes.getNamedItem('data-room').value === y){
                    $(tnails[i]).css("background-color", "#0f0");
                }
            });
        }

        if(location.hash === "#vidgrid") {
            if(vidGrid) {
                disposeAll;
                return;
            }
           vidGrid;
        }
    });
    // I know there are easier ways of doing this but CRS is being a little cry-baby bitch and this works.
    unsafeWindow.extLibs = function(url,type) {
        var httpx = new XMLHttpRequest();
        httpx.onload = function () {
            if(httpx.status !== 200) {
                console.log('Well... shit');
                console.log('extLibs failed to load data because: ' + httpx.status + resLoc);
                return;
            }
            var output;
            switch(type) {
                default:
                    alert(text(httpx.responseText));
                    break;
                case 0:
                    let script = document.createElement('script');
                    script.textContent = httpx.response;
                    output = document.head.appendChild(script);
                    break;
                case 1:
                    let y = GM_addStyle(httpx.responseText);
                    output = $("body").append(y);
                    break;
                case 2:
                    httpx.vdata = JSON.parse(httpx.responseText);
                    //output = {jData: data, vData: Array(data.broadcaster_username, data.hls_source)}
                    let strm = JSON.parse(httpx.responseText).hls_source.substring(0, JSON.parse(httpx.responseText).hls_source.indexOf("?"));
                    let usr = JSON.parse(httpx.responseText).broadcaster_username;
                    rooms.names.push(usr);
                    rooms.streams.push(strm);
                    GM_setValue('rooms', rooms);
                    httpx.payLoad = GM_getValue('rooms');
                    output =  httpx;
            }

            return output;

        }

        let resLoc;
        type === 2 ? (resLoc = location.origin + "/api/chatvideocontext/" + url) : (resLoc = url);
        httpx.open("GET", resLoc);
        httpx.send();
        return httpx;
    };
    unsafeWindow.extLibs("https://cdnjs.cloudflare.com/ajax/libs/video.js/8.0.3/video.js", 0);
    window.videojs.options.controls = true;
    window.videojs.options.autoplay = true;
    window.videojs.options.preload = "auto";
    window.videojs.options.liveui = true;
    window.videojs.options.muted = true;
    window.videojs.options.fluid = true;
    window.videojs.options.id = rooms.names[i];
    window.videojs.options.autoSetup = false;

    // VidGrid navigation tab listener function.
    $(".sub-nav li").click(function(){
        var page = location.href;
        if (page.indexOf('#') >- 1)
            page = location.href.split("#")[0];
        var target = location.origin + $(this).find('a').attr('href');
        if (page !== target){
            return true;
        }
        else {
            $("#main .content").show();
            $("#main #camGirls").css({"visibility":"hidden","height":"0px"});
            $("followed").show();
            $(".sub-nav li").removeClass("active");
            $(this).addClass("active");
            location.hash = "#tab"
            //vidReset();
            return false;
        }
    });


    $("ul.sub-nav li").on("click", function() {
        if(this.id === "#vidgrid") {
            location.hash = "#vidgrid";
        }else{
            location.hash = '';
        }
    });

    $(".close").on("click", function() {
        let name = this.parentElement.id.slice(0, -3);
        let selected = $.inArray(name, rooms.name);
        rooms.names.splice(selected, 1);
        GM_setValue("rooms", rooms);
        window.videojs(name).dispose();
        $("#"+name+"_li").remove();
    });


   /* function Model(name, stream) {
        this.name = name;
        this.stream = stream;
        this.embed = function() {
            $("#grid").append(
                '<li id="'+this.name+'_li" class="ui-state-default">'+
                '<img class="close" title="close" alt="close"  src="https://static-assets.highwebmedia.com/tsdefaultassets/floating-player-close.svg">'+
                '<img class="handle" title="'+this.name+'" alt="Open room in new tab" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAVklEQVR4Xn3PgQkAMQhDUXfqTu7kTtkpd5RA8AInfArtQ2iRXFWT2QedAfttj2FsPIOE1eCOlEuoWWjgzYaB/IkeGOrxXhqB+uA9Bfcm0lAZuh+YIeAD+cAqSz4kCMUAAAAASUVORK5CYII=">'+
                '<video id="'+this.name+'" class="video-js"></video>'+
                '</li>'
            );
            let player = videojs(this.name, {sources: [{type: "application/x-mpegURL", src: this.stream}]});
            player.play();
        }
    }*/
    $("li.room_list_room").on("click", function() {
        let name = $(this).find('a').attr('data-room');
        let selected = rooms.names.includes(name);
        if(selected === false) {
            unsafeWindow.extLibs(name, 2);
            $(this).css("background-color", "#00ff00");
        }else{
            $(this).css("background-color", "#f0f1f1");
            unsafeWindow.remover(name);
        }
    });
    unsafeWindow.save = function() {
        GM_setValue('rooms', rooms);
    }



    var template = '<div id="camGirls" style="visibility: hidden;">'+
        '<div id="camControls">'+
        'Username: <input type="text" name="camGirlUsername" id="camGirlUsername" >'+
        '<input type="Button" value="Add" onclick="viewer.add()">'+
        '<input type="Button" value="Add Top 12" onclick="viewer.addTop12()">'+
        '<input type="Button" value="Remove All" onclick="viewer.removeAll()">'+
        '<input type="Button" value="Remove Offlines" onclick="viewer.clearEmptyCams()">'+
        '<input type="Button" value="Save" onclick="window.save">'+
        '[ Layout: '+
        '<input type="Button" value="Semi-Compact" onclick="viewer.layout(1)" id="layout_1">'+
        '<input type="Button" value="Compact" onclick="viewer.layout(2)" id="layout_2">'+
        '<input type="Button" value="Full" onclick="viewer.layout(3)" id="layout_3">]'+
        '</div>'+
        '</div>';
    $("#main .content").after(template);

    unsafeWindow.killPlayer = function(user) {
        console.log(user);
        videojs(user).isDisposed() ? console.log(user + " does not have a VideoJS Player.") : videojs(user).dispose();
    }

    unsafeWindow.killMod = function(user) {
        let selected = $.inArray(user, models);
        rooms.names.splice(selected, 1);
        rooms.streams.splice(selected, 1);
        GM_setValue("rooms", rooms);
    }
// Removes broadcasters from VidGrid.
//if called from VidGrid viewer, disposed of the player and removes the ListItem.
    unsafeWindow.remover = function(user) {
        if(location.hash === "#vidgrid") {
            videojs(user).dispose();
            $('#'+user+'_li').remove();
        }
        let item = $.inArray(user, rooms.names);
        rooms.names.splice(item, 1);
        rooms.streams.splice(item, 1);
        GM_setValue("rooms", rooms);
    }

    $('.close').on("click", function() {
        let rm = $(this).parent().attr('id');
        console.log('Is '+ rm + ' stil on the list? ' + rooms.names.includes(rm) + '!');
        console.trace(remover(this));
        console.log('How about now? ' + rooms.names.includes(rm) + '!');
    });


    var grid = function(rooms) {
        //if(!rooms.vidMod) { rooms.vidMod = $(rooms.names).each(function(x,y) { vidMod(y, rooms.streams[x]); });}
        window.videojs.options.controls = true;
        window.videojs.options.autoplay = true;
        window.videojs.options.preload = "auto";
        window.videojs.options.liveui = true;
        window.videojs.options.muted = true;
        window.videojs.options.fluid = true;
        window.videojs.options.autoSetup = false;



        async function vidMod(user) {
            //  if(videojs(user).isDisposed() === false) {videojs(user).dispose(); }

            $("#grid").append(
                '<li id="' + user+'_li" class="ui-state-default">' +
                '<img class="close" title="close" alt="close" onclick="remover(\''+user+'\')" src="https://static-assets.highwebmedia.com/tsdefaultassets/floating-player-close.svg">' +
                '<img class="handle" title="' + user+ '" alt="Open room in new tab" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAVklEQVR4Xn3PgQkAMQhDUXfqTu7kTtkpd5RA8AInfArtQ2iRXFWT2QedAfttj2FsPIOE1eCOlEuoWWjgzYaB/IkeGOrxXhqB+uA9Bfcm0lAZuh+YIeAD+cAqSz4kCMUAAAAASUVORK5CYII=">' +
                '<video id="' + user + '" controls liveui="true" class="video-js"></video>'+
                '</li>');
        }

        for(let i=0; i < rooms.names.length; i++)
        {
            vidMod(rooms.names[i], rooms.streams[i])
                .then(
                    function() {

                        let player = videojs(rooms.names[i]);
                        player.loadMedia ({src: [{type: "application/x-mpegURL", src: rooms.streams[i]}]});

                        player.play();
                    });
        }
    }
    unsafeWindow.grid = grid;
    unsafeWindow.vidGrid = async function(){

        $('#camGirls').show(400, 'swing', function(){

            $(this).css("visibility", "visible");
            $(".sub-nav li").removeClass("active");
            $(".sub-nav li:last").addClass("active");
            $("#main .content").hide();
            $(this).append('<ul id="grid"></ul>');
            $("followed").hide();
            (location.hash === '#vidgrid') ? true : location.hash = "#vidgrid";
            $( "#grid" ).sortable({
                placeholder: "ui-state-highlight"
            }).disableSelection();
        });
    }
       var vidGrid = unsafeWindow.vidGrid;
    $('#grid').ready(function() {
        unsafeWindow.vidGrid()
            .then(
                function () {grid(rooms);},
                function (err) {console.log(err);}
            );
    });


    unsafeWindow.rooms = rooms;

    $('span.genderm').offsetParent().remove();
    $('span.genders').offsetParent().remove();
    $( "button#followed" ).click(function() {
        $('div.icon_following').parent().toggle();
    });
    //hides  trans  rooms
    $('.genders').offsetParent().remove();
    // hides male rooms
    $('.genderm').offsetParent().remove();
    $('div.ad').remove();
    //$('.room_thumbnail').remove();

});


// Script was originally created by Teso Mayn https://github.com/Teso-Limited/Chaturbate-MultiCam
// Modifications are made by Mr. Jangles https://github.com/X3Cams/VidGrid


