// ==UserScript==
// @name            DuckDuckGo Extended
// @description     Extends DDG by adding a customizable list of additional search engines for making fast searches from other engines.
// @namespace       userscripts.org/users/439657
// @homepage        http://userscripts.org/scripts/show/129505
// @icon            http://s3.amazonaws.com/uso_ss/icon/129505/large.png?1368599692
// @updateURL       https://userscripts.org/scripts/source/129505.meta.js
// @downloadURL     https://userscripts.org/scripts/source/129505.user.js
// @match           *://duckduckgo.com/*
// @exclude         *://duckduckgo.com/post2.html
// @match           http://mycroftproject.com/*
// @grant           GM_addStyle
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_xmlhttpRequest
// @version         2.0.2
// @author          tumpio
// ==/UserScript==

var ddg_e = {

    list: document.createElement("ol"),
    engines: [],

    default: "Google==https://encrypted.google.com/search?q={searchTerms}\
;;Images==http://www.picsearch.com/index.cgi?q={searchTerms}\
;;Wiki==https://en.wikipedia.org/w/index.php?title=Special%3ASearch&profile=default&search={searchTerms}\
;;Maps==https://maps.google.com/maps?q={searchTerms}\
;;YouTube==https://www.youtube.com/results?search_query={searchTerms}&aq=f\
;;IMDb==http://www.imdb.com/find?s=all&amp;q={searchTerms}\
;;Music==http://www.musicsmasher.net/#{searchTerms}\
;;Facebook==https://www.facebook.com/search.php?q={searchTerms}\
;;Google+==https://plus.google.com/s/{searchTerms}\
;;twitter==https://twitter.com/#!/search/realtime/{searchTerms}\
;;Amazon==https://www.amazon.com/gp/search?ie=UTF8&keywords={searchTerms}\
;;Torrents==https://torrentproject.com/?t={searchTerms}\
;;filesTube==http://www.filestube.com/search.html?q={searchTerms}\
;;Translate==http://translate.google.com/translate_t#auto|en|{searchTerms}",

    style: "#ddg_extented { float:left; width:100%; position:relative; top:5px; z-index:-1 }\
#ddg_extented ol { clear:left; float:right; list-style:none; position:relative; right:50%; text-align:center; margin:0; padding:0 }\
#ddg_extented li { display:inline; list-style:none; position:relative; left:50%; box-shadow:0 2px 5px 0 #888; margin:0; padding:0; background:#b60002 }\
#ddg_extented li:first-child { border-bottom-left-radius: 10px }\
#ddg_extented li:last-child { border-bottom-right-radius: 10px }\
#ddg_extented li a:link,li a:visited { text-decoration:none; color:#fff; font-size:1em; font-weight:700; padding:0 9px }\
#ddg_extented li a:hover { color:#91C5EE }\
#ddg_extented li:hover { box-shadow:0 3px 3px 0 #888 }\
#ddg_extented li.disabled a {pointer-events: none }\
body #header_wrapper #header #header_content_wrapper #header_content #header_button_wrapper #header_button #header_button_menu_wrapper #header_button_menu li.disabled {display: none!important;}\
#ddg_e_save a { color: #6CBD6A!important }\
#ddg_e_cancel a { color: #FF8861!important }",

    get: function () {
        var e = GM_getValue("engines", this.default).split(";;");
        var a = [];
        for (var i = 0; i < e.length; i++)
            a.push(e[i].split("=="));
        this.length = a.length;
        return a;
    },

    set: function () {
        var e = "";
        for (var i = 0; i < this.engines.length; i++) {
            e += ";;" + this.engines[i].textContent + "==" + this.engines[i].firstChild.getAttribute("data-engine");
        }
        GM_setValue("engines", e.substr(2));
    },

    newList: function () {
        var l = "";
        var e = this.get();
        var t = escape(document.getElementById("search_form_input").value);
        for (var i = 0; i < e.length; i++)
            l += '<li draggable="true" value=' + (i + 1) + '"><a data-engine="' + e[i][1] + '"href="' + e[i][1].replace("{searchTerms}", t) + '">' + e[i][0] + "</a></li>";
        this.list.innerHTML = l;
        this.engines = this.list.getElementsByTagName("li");
    },

    append: function (h) {
        var e = document.createElement("div");
        var b = window.getComputedStyle(h).backgroundColor;
        if (b.indexOf("255, 255, 255") < 0 && b.toLowerCase.indexOf("#ffffff") < 0)
            this.style += "#ddg_extented li { background:" + b + "!important }";
        GM_addStyle(this.style);
        e.setAttribute("id", "ddg_extented");
        e.appendChild(this.list);
        this.newList();
        h.appendChild(e);
    }
};

var options = {

    list: [],
    strings: [
        ["Find new", "Find and add new search engines from MyCroft", newEngine],
        ["Reorder", "Drag and drop search engines", enableDrag],
        ["Rename", "Click to rename search engines", enableRename],
        ["Remove", "Click to remove search engines", enableRemove],
        ["Restore all", "Restores all default search engines", restoreEngines],
        ["Save", "Saves modified search engines", saveActions],
        ["Cancel", "Cancels all recent modifications", cancelActions]
    ],

    create: function (m) {
        m.innerHTML += '<li class="nav-menu__heading">DDG Extended</li>';
        for (var i = 0, li; i < this.strings.length; i++) {
            li = document.createElement("li");
            li.className = "nav-menu__item";
            li.style.display = "list-item";
            li.innerHTML = '<a href="#" tabindex="-1" title="' + this.strings[i][1] + '"><span>' + this.strings[i][0] + "</span></a>";
            li.addEventListener("click", this.strings[i][2], false);
            this.list.push(li);
            m.appendChild(this.list[i]);
        }
        this.list[5].style.display = "none";
        this.list[6].style.display = "none";
        this.list[5].id = "ddg_e_save";
        this.list[6].id = "ddg_e_cancel";
    },

    toggle: function () {
        for (var i = 0; i < this.list.length; i++) {
            if (this.list[i].style.display === "none")
                this.list[i].style.display = "list-item";
            else
                this.list[i].style.display = "none";
        }
    }

};

var mycroft = {

    plugins: null,

    addLinks: function (p) {

        if (p) {
            this.plugins = document.evaluate('//a[@href="/jsreq.html"]',
                p, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            var reviews = document.evaluate('//a[.="[Review]"]',
                p, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            var addLink = document.createElement("a");
            addLink.setAttribute("href", "#");
            addLink.setAttribute("style", "margin-left:5px; color:#000099");
            addLink.innerHTML = "[Add to DDG]";
            for (var i = 0, tmp; i < reviews.snapshotLength; i++) {
                tmp = addLink.cloneNode(true);
                tmp.setAttribute("data-ind", i);
                tmp.addEventListener("click", this.addNewEngine, false);
                reviews.snapshotItem(i).parentNode.insertBefore(tmp, reviews.snapshotItem(i).nextSibling);
            }
        }

    },

    addNewEngine: function () {
        var current = GM_getValue("engines", ddg_e.default);
        var i = this.getAttribute("data-ind");
        var name = mycroft.plugins.snapshotItem(i).innerHTML.split(" (")[0].split(" -")[0];
        var newEngine = mycroft.plugins.snapshotItem(i).getAttribute("onClick").split("'")[1];
        var newName = prompt("This engine will be added to DDG Extended.\nGive a name or cancel.", name);
        if (newName && newName.length > 0) {
            this.innerHTML = "[Added]";
            this.removeEventListener("click", this.addNewEngine, false);
            this.style.color = "#009900";
            this.removeAttribute("href");

            GM_xmlhttpRequest({
                method: "GET",
                url: "http://mycroftproject.com/externalos.php/" + newEngine + ".xml",
                onload: function (response) {
                    var responseXML = null;
                    // Inject responseXML into existing Object (only appropriate for XML content).
                    if (!response.responseXML) {
                        responseXML = new DOMParser()
                            .parseFromString(response.responseText, "text/xml");
                    }
                    var engine = responseXML.getElementsByTagName("Url");
                    if (engine.length > 0 && engine[0].getAttribute("template"))
                        GM_setValue("engines", current + ";;" + newName + "==" + engine[0].getAttribute("template"));
                }
            });
        }
    }
};

// FUNCTIONS
function onHashChange() {
    if (window.location.hash.indexOf("{searchTerms}") !== -1)
        window.location.hash = "";
    window.addEventListener("hashchange", function () {
        if (window.location.hash.indexOf("{searchTerms}") !== -1)
            window.location.href = window.location.hash.substr(1).replace("{searchTerms}", escape(document.getElementById("search_form_input").value));
    }, false);
}

function onColorChange(h, c) {
            console.log(c);
    if (c !== null) {
            console.log("asd");
        c.addEventListener("change", function () {
            var b = window.getComputedStyle(h).backgroundColor;
            console.log(b);
            for (var i = 0; i < ddg_e.engines.length; i++)
                ddg_e.engines[i].style.background = b;
        }, false);
    }
}

function restoreEngines() {
    if (confirm("Do you want to restore the default search engines?")) {
        GM_setValue("engines", ddg_e.default);
        ddg_e.newList();
    }
}

function saveActions() {
    disableEvents();
    ddg_e.set();
}

function cancelActions() {
    disableEvents();
    ddg_e.newList();
}

function enableDrag() {
    options.toggle();
    for (var i = 0; i < ddg_e.engines.length; i++) {
        ddg_e.engines[i].style.cursor = "move";
        ddg_e.engines[i].className = "disabled";
        ddg_e.engines[i].addEventListener("dragstart", handleDragStart, false);
        ddg_e.engines[i].addEventListener("dragover", handleDragOver, false);
        ddg_e.engines[i].addEventListener("drop", handleDrop, false);
    }
}

function enableRemove() {
    options.toggle();
    for (var i = 0; i < ddg_e.engines.length; i++) {
        ddg_e.engines[i].style.cursor = "crosshair";
        ddg_e.engines[i].className = "disabled";
        ddg_e.engines[i].addEventListener("click", remove, false);
    }
}

function enableRename() {
    options.toggle();
    for (var i = 0; i < ddg_e.engines.length; i++) {
        ddg_e.engines[i].style.cursor = "text";
        ddg_e.engines[i].className = "disabled";
        ddg_e.engines[i].addEventListener("click", rename, false);
    }
}

function disableEvents() {
    options.toggle();
    for (var i = 0; i < ddg_e.engines.length; i++) {
        ddg_e.engines[i].style.cursor = "auto";
        ddg_e.engines[i].removeAttribute("class");
        ddg_e.engines[i].removeEventListener("dragstart", handleDragStart, false);
        ddg_e.engines[i].removeEventListener("dragover", handleDragOver, false);
        ddg_e.engines[i].removeEventListener("drop", handleDrop, false);
        ddg_e.engines[i].removeEventListener("click", remove, false);
        ddg_e.engines[i].removeEventListener("click", rename, false);
    }
}

function remove() {
    this.parentNode.removeChild(this);
}

function rename() {
    var n = prompt("Rename search engine", this.textContent);
    if (n && n.length > 0 && n.length < 20)
        this.firstChild.innerHTML = n;
}

function newEngine() {
    var n = prompt("Search and add new search engines from MyCroft.\nYou can search by name and url.", "");
    if (n && n.length > 0)
        window.location.href = "http://mycroftproject.com/search-engines.html?name=" + n;
}


/* Pure javascript and html5 drag-and-drop for an ordered list
 * source: https://gist.github.com/robophilosopher/7520460
 */
var dragSrcEl, drop_index, numLis, count, token1, token2;

function handleDragStart(e) {
    dragSrcEl = this;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", this.innerHTML);
}

function handleDragOver(e) {
    if (e.preventDefault) e.preventDefault();
    return false;
}

function handleDrop(e) {
    if (e.stopPropagation) e.stopPropagation();
    if (e.preventDefault) e.preventDefault();
    drop_index = this.value;
    numLis = parseInt(drop_index - dragSrcEl.value);
    count = Math.abs(numLis);
    if (dragSrcEl != this) {
        // swap data when premises are adjacent
        if (Math.abs(numLis) == 1) {
            dragSrcEl.innerHTML = this.innerHTML;
            this.innerHTML = e.dataTransfer.getData("text/html");
        }
        // propagate data from non-adjacent drops
        if (Math.abs(numLis) > 1) {
            token1 = this.innerHTML;
            this.innerHTML = e.dataTransfer.getData("text/html");
            var i, counter;
            // bring premise up list
            if (numLis < -1) {
                for (i = drop_index, counter = 0; counter < count; counter++, i++) {
                    token2 = ddg_e.engines[i].innerHTML;
                    ddg_e.engines[i].innerHTML = token1;
                    token1 = token2;
                }
            }
            // bring premise down list
            if (numLis > 1) {
                for (i = drop_index - 1, counter = 0; counter < count; counter++, i--) {
                    token2 = ddg_e.engines[i - 1].innerHTML;
                    ddg_e.engines[i - 1].innerHTML = token1;
                    token1 = token2;
                }
            }
        }
    }
    return false;
}

// START
if (window.location.href.indexOf("http://mycroftproject.com/") !== -1) {
    mycroft.addLinks(document.getElementById("plugins"));
} else {
    var header = document.getElementById("header_wrapper");
    var menu = document.getElementById("header_button_menu").getElementsByClassName("nav-menu__list")[0];
    if (header) {
        ddg_e.append(header);
        options.create(menu);
        onColorChange(header, document.getElementById("setting_kj"));
    }
}
