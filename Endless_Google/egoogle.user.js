// ==UserScript==
// @author          tumpio
// @name            Endless Google
// @description     Load more results automatically.
// @namespace       userscripts.org/users/439657
// @homepage        http://userscripts.org/scripts/show/410564
// @icon            http://s3.amazonaws.com/uso_ss/icon/410564/large.png
// @updateURL       https://userscripts.org/scripts/source/410564.meta.js
// @downloadURL     https://userscripts.org/scripts/source/410564.user.js
// @include         http://www.google.*
// @include         https://www.google.*
// @include         https://encrypted.google.*
// @grant           GM_xmlhttpRequest
// @version         0.0.1
// ==/UserScript==

// TODO: on page refresh, what to do?
// ^ possibilites: 1: return to the original position by reloading all previous pages again (default now)
//                 2: load only the first page (prevent restoring the scroll position)
//                 3: load only the last scrolled page (on refresh, load last requested page)
//                     beforeunload -> store last requested page with GM_setVariable() and reload it instead
// ^ user configurable would be the best

// FIXME: bug: Suggested images don't show up on requested pages

// FUTURE: replace footer with page no. UI
// FUTURE: Add page up/down and back to top/bottom controls UI + (go to the page #n)?
// FUTURE: Columns support?
// FUTURE: other styling page loading icon, results, favicons etc.?

// NOTE: Don't run on image search
if (location.href.indexOf("tbm=isch") > 0)
    return;
// NOTE: Do not run on iframes
if (window.top !== window.self)
    return;

var main = document.getElementById("main");
var rcnt = document.getElementById("rcnt");
var input = document.getElementById("gbqfq");
var old_scrollY = 0;
var scroll_events = 0;
var next_link = null;
var cols = [];

function requestNextPage(link) {
    //console.log("request next");
    //console.log(link);
    GM_xmlhttpRequest({
        method: "GET",
        url: link,
        onload: function (response) {
            var holder = document.createElement("div");
            holder.innerHTML = response.responseText;
            next_link = holder.querySelector("#pnnext").href;

            var next_col = document.createElement("div");
            next_col.className = "gar_col";
            next_col.appendChild(holder.querySelector("#center_col"));
            cols.push(next_col);
            //console.log("Page no: " + cols.length);
            if (!rcnt) // NOTE: late insertation of element on google instant
                rcnt = document.getElementById("rcnt");
            rcnt.appendChild(next_col);
            window.addEventListener('scroll', scroll, false);
        }
    });

}

function scroll(e) {
    var y = window.scrollY;
    if (scroll_events == 0) old_scrollY = y;
    var delta = e.deltaY || y - old_scrollY; // NOTE: e.deltaY for 'wheel' event
    if (delta > 0 && (window.innerHeight + y) >= document.body.clientHeight - 100) {
        //console.log("scroll end");
        
        window.removeEventListener('scroll', scroll, false); // NOTE: remove self?
        input.addEventListener('input', onNewSearch, false); // NOTE: to reset on a new search
        
        try {
            requestNextPage(next_link || document.getElementById("pnnext").href);
        } catch (err) {
            //console.error(err.name + ": " + err.message);
            // TODO: recovery? try again on new url hashchange?
        }
    }
    old_scrollY = y;
    scroll_events += 1;
}

// TODO: Work with new search queries on Google instant
// ^ Instead of hashchange use input focus and its value change-events
// ^ value changed (remove self) -> remove scroll event -> (add focusout event)
//     -> wait for focus out -> do RESET: add events back (scroll + input value changed) and reinitialize elements/variables
// TODO: working ok, maybe needs more testing
function reset() {
    //console.log("RESET");
    for (var i = 0; i < cols.length; i++)
        rcnt.removeChild(cols[i]);
    cols = [];
    next_link = null;
    old_scrollY = 0;
    scroll_events = 0;
    window.addEventListener('scroll', scroll, false);
}

function onNewSearch() {
    //console.log("input changed");
    input.removeEventListener('input', onNewSearch, false);
    window.removeEventListener('scroll', scroll, false);
    input.addEventListener('blur', reset, false);
}

window.addEventListener('scroll', scroll, false);
//console.log("loaded");