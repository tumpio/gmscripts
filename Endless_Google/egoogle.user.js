// ==UserScript==
// @name            Endless Google
// @description     Load more results automatically and endlessly.
// @author          tumpio
// @namespace       tumpio@sci.fi
// @homepage        https://openuserjs.org/scripts/tumpio/tumpiosci.fi/Endless_Google
// @icon            https://github.com/tumpio/gmscripts/raw/master/Endless_Google/large.png
// @updateURL       https://github.com/tumpio/gmscripts/raw/master/Endless_Google/egoogle.user.js
// @downloadURL     https://github.com/tumpio/gmscripts/raw/master/Endless_Google/egoogle.user.js
// @include         http://www.google.*
// @include         https://www.google.*
// @include         https://encrypted.google.*
// @run-at          document-start
// @grant           GM_xmlhttpRequest
// @version         0.0.3
// ==/UserScript==

// TODO: on page refresh:
//  1: return to the original position by reloading all previous pages again, what if +100 pages opened!
//  2: load only the first page (prevent restoring the scroll position) (default now)
//      http://stackoverflow.com/questions/10742422/prevent-browser-scroll-on-html5-history-popstate
//  3: load only the last scrolled page (on refresh, load last requested page) (could be a good default, needs scroll up support)
//      beforeunload -> store last requested page with GM_setVariable() and reload it instead
// TODO: percentage of window height left on document to request next page
// TODO: onerror, onabort: show to user "page loading failed", button to retry

// FIXME: bug: Suggested images don't show up on new requested pages
// case: https://www.google.fi/webhp?tab=ww&ei=e0UjU9ynEKqkyAO46YD4DQ&ved=0CBEQ1S4#q=tetsaus
// workaround, hiding now

// FUTURE: Options dialog
// FUTURE: Replace footer with page #no info UI
// FUTURE: Add page up/down and back to top/bottom controls UI + (go to the page #n)?
// FUTURE: Add columns support
// FUTURE: show page loading icon
// FUTURE: show page fav-icons for results
// FUTURE: number results
// FUTURE: option to load static google css

if (location.href.indexOf("tbm=isch") !== -1) // NOTE: Don't run on image search
    return;
if (window.top !== window.self) // NOTE: Do not run on iframes
    return;

document.addEventListener('DOMContentLoaded', function () {

    // NOTE: Options
    var request_pct = 0.75; // percentage of page height to request next page, must be between 0-1
    var event_type = "scroll"; // or "wheel"
    var prevent_scrollPos = true; // prevent restoring scroll position on refresh

    var main = document.getElementById("main");
    var rcnt = document.getElementById("rcnt");
    var input = document.getElementById("gbqfq");
    var old_scrollY = 0;
    var scroll_events = 0;
    var next_link = null;
    var cols = [];
    var request_offsetHeight = 0;

    input.addEventListener("input", onNewSearch, false); // NOTE: listens for new search input to reset state
    window.addEventListener(event_type, scroll, false);
    window.onbeforeunload = function () {
        window.scrollTo(0, 0);
    };

    function requestNextPage(link) {
        console.log("request next");
        console.log(link);
        GM_xmlhttpRequest({
            method: "GET",
            url: link,
            onload: function (response) {
                var holder = document.createElement("div");
                holder.innerHTML = response.responseText;
                next_link = holder.querySelector("#pnnext").href;

                var next_col = document.createElement("div");
                next_col.className = "EG_col";
                next_col.appendChild(holder.querySelector("#center_col"));

                var rel_search = next_col.querySelector("#extrares");
                var rel_images = next_col.querySelector("#imagebox_bigimages");
                var rel_ads = next_col.querySelector("#tads");
                if (rel_search)
                    rel_search.style.display = "none"; // NOTE: Hides repeating "related searches"
                if (rel_images)
                    rel_images.style.display = "none"; // NOTE: Hides related images, that are broken (bug)
                if (rel_ads)
                    rel_ads.style.display = "none"; // NOTE: Hides repeating "search results ad"

                cols.push(next_col);
                console.log("Page no: " + cols.length);
                next_col.id = next_col.className + "_" + (cols.length - 1); // NOTE: add unique id for every new col

                if (!rcnt || cols.length === 1) // NOTE: needs to be rechecked on a state reset too, and late insertation of element on google instant
                    rcnt = document.getElementById("rcnt");
                rcnt.appendChild(next_col);
                window.addEventListener(event_type, scroll, false);
            }
        });

    }

    function scroll(e) {
        var y = window.scrollY;
        // if (scroll_events === 0) old_scrollY = y; // stops only if scroll position was on 2. page
        var delta = e.deltaY || y - old_scrollY; // NOTE: e.deltaY for "wheel" event
        if (delta > 0 && (window.innerHeight + y) >= (document.body.clientHeight - 100)) { // NOTE: using .clientHeight instead of .offsetheight
            console.log("scroll end");
            window.removeEventListener(event_type, scroll, false);

            try {
                requestNextPage(next_link || document.getElementById("pnnext").href);
            } catch (err) {
                console.error(err.name + ": " + err.message);
                // NOTE: recovery unnecessary, input event handles it with reset on new search
            }
        }
        old_scrollY = y;
        scroll_events += 1;
    }

    // NOTE: Resets the script state on a new search
    function reset() {
        console.log("RESET");
        input.removeEventListener("blur", reset, false);
        for (var i = 0; i < cols.length; i++)
            rcnt.removeChild(cols[i]);
        cols = [];
        next_link = null;
        old_scrollY = 0;
        scroll_events = 0;
        window.addEventListener(event_type, scroll, false);
        input.addEventListener("input", onNewSearch, false);
    }

    function onNewSearch() {
        console.log("input changed");
        input.removeEventListener("input", onNewSearch, false);
        window.removeEventListener(event_type, scroll, false);
        input.addEventListener("blur", reset, false);
    }
    console.log("egoogle.js initialized");
});
console.log("egoogle.js loaded");
