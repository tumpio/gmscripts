// ==UserScript==
// @name            Static Google
// @description     Google search interface always visible on screen, and some additional changes for more compact layout.
// @author          tumpio
// @oujs:author     tumpio
// @namespace       tumpio@sci.fi
// @homepageURL     https://openuserjs.org/scripts/tumpio/Static_Google
// @supportURL      https://github.com/tumpio/gmscripts
// @source          https://userstyles.org/styles/99153
// @icon            https://raw.githubusercontent.com/tumpio/gmscripts/master/Static_Google/large.png
// @resource        css http://userstyles.org/styles/99153.css#md5=cc035d8beb1114c99826212c0dfaab86
// @include         http://www.google.*
// @include         https://www.google.*
// @match           https://encrypted.google.com/*
// @noframes
// @run-at          document-start
// @grant           GM_addStyle
// @grant           GM_getResourceText
// @version         1.9.5
// ==/UserScript==

// Static css, from userstyle.org, remove @-moz-document
var css = GM_getResourceText("css").replace(/@-moz-document.*{([^]+)}/, "$1");

// Fix for Scriptish issue #90
// https://github.com/scriptish/scriptish/issues/90
if (document.head) // Greasemonkey
    GM_addStyle(css);
else { // Scriptish
    document.onreadystatechange = function () {
        GM_addStyle(css);
    };
}
