// ==UserScript==
// @name            YouTube720p
// @description     Adds &hd=1 to the end of current video URL @ document-start.
// @author          tumpio
// @oujs:author     tumpio
// @namespace       tumpio@sci.fi
// @homepageURL     https://openuserjs.org/scripts/tumpio/YouTube720p
// @supportURL      https://github.com/tumpio/gmscripts
// @include         http://www.youtube.com/watch?v=*
// @include         https://www.youtube.com/watch?v=*
// @exclude         https://www.youtube.com/watch?v=*&hd=1*
// @run-at          document-start
// @version         1.3
// ==/UserScript==

window.location.replace(window.location.href + "&hd=1")
