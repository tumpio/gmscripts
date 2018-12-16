// ==UserScript==
// @name            Endless Google
// @description     Load more results automatically and endlessly.
// @author          tumpio
// @oujs:author     tumpio
// @namespace       tumpio@sci.fi
// @homepageURL     https://github.com/tumpio/gmscripts
// @icon            https://github.com/tumpio/gmscripts/raw/master/Endless_Google/large.png
// @include         http://www.google.*
// @include         https://www.google.*
// @include         https://encrypted.google.*
// @run-at          document-start
// @version         0.0.5
// @noframes
// ==/UserScript==

if (location.href.indexOf("tbm=isch") !== -1) // NOTE: Don't run on image search
    return;
if (window.top !== window.self) // NOTE: Do not run on iframes
    return;

const centerElement = "#center_col";
const loadWindowSize = 1.6;
const filtersAll = ["#foot", "#bottomads"];
const filtersCol = filtersAll.concat(["#extrares", "#imagebox_bigimages"]);

const css = `
.page-number {
  position: relative;
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
	margin-bottom: 2em;
	color: #808080;
}
.page-number::before {
  content: "";
  background-color: #ededed;
  height: 1px;
  width: 100%;
  margin: 1em 3em;
}`;

let pageNumber = 1;
let prevScrollY = 0;
let nextPageLoading = false;

function requestNextPage() {
    let nextPage = new URL(location.href);
    if (!nextPage.searchParams.has("q")) return;
  
    nextPageLoading = true;
    nextPage.searchParams.set("start", String(pageNumber * 10));

    fetch(nextPage.href)
        .then(response => response.text())
        .then(text => {
            let parser = new DOMParser();
            let htmlDocument = parser.parseFromString(text, "text/html");
            let content = htmlDocument.documentElement.querySelector(centerElement);
            content.id = "col_" + pageNumber;
      
            filter(content, filtersCol);
            
            let pageMarker = document.createElement("div");
            pageMarker.textContent = String(pageNumber + 1);
            pageMarker.className = "page-number";
            
            let col = document.createElement("div");
            col.className = "next-col";
            col.appendChild(pageMarker);
            col.appendChild(content);
            document.querySelector(centerElement).appendChild(col);
    				
            pageNumber++;
            nextPageLoading = false;
        });
}

function onScrollDocumentEnd() {
    let y = window.scrollY;
    let delta = y - prevScrollY;
    if (!nextPageLoading && delta > 0 && isDocumentEnd(y)) {
        requestNextPage();
    }
    prevScrollY = y;
}

function isDocumentEnd(y) {
    return y + window.innerHeight * loadWindowSize >= document.body.clientHeight;
}

function filter(node, filters) {
    for (let filter of filters) {
        let child = node.querySelector(filter);
        if (child) {
	          child.parentNode.removeChild(child);
        }
    }
}

function init() {
    prevScrollY = window.scrollY;
    window.addEventListener("scroll", onScrollDocumentEnd);
  	filter(document, filtersAll);
    let style = document.createElement("style");
    style.type = "text/css";
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
}

document.addEventListener("DOMContentLoaded", init);
