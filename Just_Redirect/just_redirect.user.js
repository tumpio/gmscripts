// ==UserScript==
// @name            Just redirect!
// @description     Go to the destination url without any page in the middle attacks.
// @author          tumpio
// @oujs:author     tumpio
// @namespace       tumpio@sci.fi
// @homepageURL     https://openuserjs.org/scripts/tumpio/Just_Redirect
// @supportURL      https://github.com/tumpio/gmscripts
// @include         /^https?://.*https?://.*/
// @run-at          document-start
// @grant           none
// @version         0.1
// ==/UserScript==

var url = window.location.href;
var i = url.search(/.https?:\/\//);
window.location.replace(url.substring(i + 1));
