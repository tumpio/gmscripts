// ==UserScript==
// @name            MiddleClick Reload
// @description     F5 with mouse!
// @author          tumpio
// @oujs:author     tumpio
// @namespace       tumpio@sci.fi
// @homepageURL     https://openuserjs.org/scripts/tumpio/DuckDuckGo_Extended
// @supportURL      https://github.com/tumpio/gmscripts
// @icon            https://raw.githubusercontent.com/tumpio/gmscripts/master/MiddleClick_Reload/large.png
// @match           *://*/*
// @grant           none
// @run-at          document-start
// @version         0.0.2
// ==/UserScript==

document.addEventListener("click", function (e) {
    //console.log(e.target);
    if (e.button == 1 &&
        !e.target.getAttribute("href") &&
        !e.target.parentNode.getAttribute("href") &&
        e.target.tagName != "A" &&
        e.target.tagName != "INPUT" &&
        e.target.tagName != "TEXTAREA") {
        document.location.reload(false);
    }
}, true);
