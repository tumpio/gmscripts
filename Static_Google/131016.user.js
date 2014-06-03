// ==UserScript==
// @author          tumpio
// @name            Static Google
// @description     Google search interface always visible on screen, and some additional changes for more compact layout.
// @namespace       userscripts.org/users/439657
// @homepage        http://userscripts.org/scripts/show/131016
// @icon            http://s3.amazonaws.com/uso_ss/icon/131016/large.png
// @updateURL       https://userscripts.org/scripts/source/131016.meta.js
// @downloadURL     https://userscripts.org/scripts/source/131016.user.js
// @resource        css http://userstyles.org/styles/99153.css
// @include         http://www.google.*
// @include         https://www.google.*
// @include         https://encrypted.google.*
// @run-at          document-start
// @grant           GM_addStyle
// @grant           GM_getResourceText
// @version         1.9.0
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
