// ==UserScript==
// @name            Static Google
// @description     Google search interface always visible on screen, and some additional changes for more compact layout.
// @author          tumpio
// @namespace       tumpio@sci.fi
// @homepageURL     https://openuserjs.org/scripts/tumpio/Static_Google
// @supportURL      https://github.com/tumpio/gmscripts
// @resource        css https://raw.githubusercontent.com/tumpio/googlestatic/master/static-style.css
// @include         http://www.google.*
// @include         https://www.google.*
// @match           https://encrypted.google.com/*
// @noframes
// @run-at          document-start
// @grant           GM_addStyle
// @grant           GM_getResourceText
// @grant           GM.getResourceUrl
// @version         1.10.2
// @license         MIT
// ==/UserScript==

if (typeof GM_addStyle === "undefined") {
  (async function() {
      let link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = await GM.getResourceUrl("css");
      document.head.appendChild(link);
  })();
} else {
	GM_addStyle(GM_getResourceText('css'));
}
