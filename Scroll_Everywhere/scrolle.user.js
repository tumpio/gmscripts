// ==UserScript==
// @name            Scroll Everywhere
// @description     Scroll everywhere with right mouse button.
// @author          tumpio
// @oujs:author     tumpio
// @namespace       tumpio@sci.fi
// @homepageURL     https://openuserjs.org/scripts/tumpio/Scroll_Everywhere
// @supportURL      https://github.com/tumpio/gmscripts
// @icon            https://raw.githubusercontent.com/tumpio/gmscripts/master/Scroll_Everywhere/large.png
// @include         *
// @grant           none
// @version         0.3a
// @require         https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js
// ==/UserScript==

/* jshint multistr: true, strict: false, browser: true, devel: true */
/* global escape: true,GM_getValue: true,GM_setValue: true,GM_addStyle: true,GM_xmlhttpRequest: true */

// TODO: add slow scroll start mode
// FIXME: Linux/mac context menu on mousedown, probably needs browser level
// FUTURE: Options dialog

var mouseBtn, reverse, stopOnSecondClick, verticalScroll, startAnimDelay, cursorStyle, down,
    scrollevents, scrollBarWidth, cursorMask, isWin, fScrollX, fScrollY, fScroll, slowScrollStart, speed;


var button = document.createElement("div")
button.id = "autoscroll"
document.getElementById("autoscroll").innerHTML = '<button onclick="Autoscroll()" style="position: fixed;bottom: 0;left: 0;"><img src="https://www.iconfinder.com/icons/51758/download/png/64"></img></button>'
// NOTE: Do not run on iframes
if (window.top === window.self) {
    // USER SETTINGS
    mouseBtn = 3; // 1:left, 2:middle, 3:right mouse button
    reverse = false; // reversed scroll direction
    stopOnSecondClick = false; // keep scrolling until the left mouse button clicked
    verticalScroll = false; // vertical scrolling
    slowScrollStart = false; // slow scroll start on begin
    startAnimDelay = 150; // slow scroll start mode animation delay
    cursorStyle = "grab"; // cursor style on scroll
    speed= 10000; //speed of the auto-scroll function
    // END

    fScroll = ((reverse) ? fRevPos : fPos);
    fScrollX = ((verticalScroll) ? fScroll : noScrollX);
    fScrollY = fScroll;
    down = false;
    scrollevents = 0;
    scrollBarWidth = 2 * getScrollBarWidth();
    cursorMask = document.createElement('div');
    isWin = (window.navigator.appVersion.indexOf("Win") != -1 ? true : false);
    if (cursorStyle === "grab")
        cursorStyle = "-webkit-grabbing; cursor: -moz-grabbing";
    cursorMask.id = "SE_cursorMask_cursor";
    cursorMask.setAttribute("style", "position: fixed; width: 100%; height: 100%; zindex: 5000; top: 0px; left: 0px; cursor: " + cursorStyle + "; background: none; display: none;");
    document.body.appendChild(cursorMask);

    window.addEventListener("mousedown", rightMbDown, false);
}

function rightMbDown(e) {
    if (e.which == mouseBtn) {
        if (!down) {
            down = true;
            window.addEventListener("mousemove", waitScroll, false);
            if (!stopOnSecondClick)
                window.addEventListener("mouseup", stop, false);
        } else {
            stop();
        }
    }
}

function waitScroll(e) {
    scrollevents += 1;
    if (scrollevents > 2) {
        cursorMask.style.display = "";
        if (isWin)
            document.oncontextmenu = fFalse;
        window.removeEventListener("mousemove", waitScroll, false);
        window.addEventListener("mousemove", scroll, false);
    }
}

function scroll(e) {
    //scrollevents += 1;
    if (!stopOnSecondClick && e.buttons === 0) {
        stop();
        return;
    }
    window.scrollTo(
        fScrollX(
            window.innerWidth - scrollBarWidth,
            document.body.scrollWidth - window.innerWidth,
            e.clientX),
        fScrollY(
            window.innerHeight - scrollBarWidth,
            document.body.scrollHeight - window.innerHeight,
            e.clientY)
    );
}

function stop() {
    cursorMask.style.display = "none";
    if (isWin)
        document.oncontextmenu = !fFalse;
    down = false;
    scrollevents = 0;
    window.removeEventListener("mouseup", stop, false);
    window.removeEventListener("mousemove", scroll, false);
    window.removeEventListener("mousemove", waitScroll, false);
}

function noScrollX() {
    return document.documentElement.scrollLeft;
}

function fPos(win, doc, pos) {
    return doc * (pos / win);
}

function fRevPos(win, doc, pos) {
    return doc - fPos(win, doc, pos);
}

function getScrollBarWidth() {
    var style = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    var width = document.body.clientWidth;
    document.body.style.overflow = 'scroll';
    width -= document.body.clientWidth;
    if (!width) width = document.body.offsetWidth - document.body.clientWidth;
    document.body.style.overflow = style;
    return width;
}

function fFalse() {
    return false;
}

function slowF(x) {
    return 1 / (1 + Math.pow(Math.E, (-0.1 * x)));
}

function Autoscroll(speed) {
    $('html, body').animate({ scrollTop: $(document).height() - $(window).height() }, speed, function() {
        $(this).animate({ scrollTop: 0 }, speed);
    });
}

//need to implement a button to start the autoscroll fuctionality, it is fully working now but you will have to call the function from the js console.

