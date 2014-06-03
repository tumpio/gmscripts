// ==UserScript==
// @name           YouTube720p
// @version        1.2b
// @author         tumpio
// @description    Adds &hd=1 to the end of current video URL @ document-start and to all other video watch URLs everywhere on YouTube.
// @include        http://www.youtube.com/*
// @include        https://www.youtube.com/*
// @run-at         document-start
// ==/UserScript==

var url = window.location.href;
var hd = "&hd=1";
window.addEventListener('load', function ()
{
  var links = document.evaluate(
      "//a[contains(@href, 'watch?v=')]", document, null,
      XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
  for (var i = links.snapshotLength; i--; )
  {
    links.snapshotItem(i).setAttribute("href",
      links.snapshotItem(i).getAttribute("href") + hd);
  }
}
);
if (GM_getValue("YouTube720p_URL", "") === url)
{
  GM_setValue("YouTube720p_URL", "");
  return;
}
if (url.indexOf("youtube.com/watch?") >= 0 && url.indexOf(hd) === -1)
{
  GM_setValue("YouTube720p_URL", url);
  window.location.href += hd;
}
