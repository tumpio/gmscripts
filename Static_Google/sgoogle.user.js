// ==UserScript==
// @name            Static Google
// @description     Google search interface always visible on screen, and some additional changes for more compact layout.
// @author          tumpio
// @oujs:author     tumpio
// @namespace       tumpio@sci.fi
// @homepageURL     https://openuserjs.org/scripts/tumpio/DuckDuckGo_Extended
// @supportURL      https://github.com/tumpio/gmscripts
// @icon            https://raw.githubusercontent.com/tumpio/gmscripts/master/Static_Google/large.png
// @resource        css http://userstyles.org/styles/99153.css
// @include         http://www.google.*
// @include         https://www.google.*
// @include         https://encrypted.google.*
// @run-at          document-start
// @grant           GM_addStyle
// @grant           GM_getResourceText
// @version         1.9.1
// ==/UserScript==

// Do not run on iframes > image search
if (window.top !== window.self) {
    return;
}

// Static css, from userstyle.org
var css = GM_getResourceText("css");

// Fix for Scriptish issue #90
// https://github.com/scriptish/scriptish/issues/90
if (document.head) // Greasemonkey
    GM_addStyle(css);
else { // Scriptish
    document.onreadystatechange = function () {
        GM_addStyle(css);
        return;
    };
}
