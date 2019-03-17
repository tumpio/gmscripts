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
// @version         0.3c
// ==/UserScript==

/* jshint multistr: true, strict: false, browser: true, devel: true */
/* global escape: true,GM_getValue: true,GM_setValue: true,GM_addStyle: true,GM_xmlhttpRequest: true */

// TODO: add slow scroll start mode
// FIXME: Linux/mac context menu on mousedown, probably needs browser level
// FUTURE: Options dialog

var mouseBtn, reverse, stopOnSecondClick, verticalScroll, startAnimDelay, cursorStyle, down,
    scrollevents, scrollBarWidth, cursorMask, isWin, fScrollX, fScrollY, fScroll, slowScrollStart;

var middleIsStart, startX, startY, startScrollTop, startScrollLeft, lastScrollHeight;

var relativeScrolling, lastX, lastY, scaleX, scaleY, power, offsetMiddle;

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
    middleIsStart = false; // don't jump when the mouse starts moving
    relativeScrolling = false; // scroll the page relative to where we are now
    scaleX = 3; // how fast to scroll with relative scrolling
    scaleY = 3;
    power = 3; // when moving the mouse faster, how quickly should it speed up?
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
            setStartData(e);
            lastX = e.clientX;
            lastY = e.clientY;
            if (!slowScrollStart)
              scroll(e);
            window.addEventListener("mousemove", waitScroll, false);
            if (!stopOnSecondClick)
                window.addEventListener("mouseup", stop, false);
        } else {
            stop();
        }
    }
}

function setStartData(e) {
    lastScrollHeight = getScrollHeight();
    startX = e.clientX;
    startY = e.clientY;
    // On some pages, body.scrollTop changes whilst documentElement.scrollTop remains 0.
    // For example: https://docs.kde.org/trunk5/en/kde-workspace/kcontrol/autostart/index.html
    // See: https://stackoverflow.com/questions/19618545
    startScrollTop = document.documentElement.scrollTop || document.body.scrollTop || 0;
    startScrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft || 0;
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
    // If the site has just changed the height of the webpage (e.g. by auto-loading more content)
    // then we must adapt to the new height to avoid jumping.
    if (lastScrollHeight !== getScrollHeight()) {
        setStartData(e);
    }
    //scrollevents += 1;
    if (!stopOnSecondClick && e.buttons === 0) {
        stop();
        return;
    }
    if (relativeScrolling) {
      var diffX = e.clientX - lastX;
      var diffY = e.clientY - lastY;
      var distance = Math.sqrt(diffX * diffX + diffY * diffY);
      var velocity = 1 + distance * power / 100;
      var reverseScale = reverse ? -1 : 1;
      window.scrollTo(window.scrollX + diffX * scaleX * velocity * reverseScale, window.scrollY + diffY * scaleY * velocity * reverseScale);
      lastX = e.clientX;
      lastY = e.clientY;
      return;
    }
    // The original absolute scrolling
    window.scrollTo(
        fScrollX(
            window.innerWidth - scrollBarWidth,
            getScrollWidth() - window.innerWidth,
            e.clientX),
        fScrollY(
            window.innerHeight - scrollBarWidth,
            getScrollHeight() - window.innerHeight,
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
    if (middleIsStart) {
        if (pos < startY) {
            return startScrollTop * pos / startY;
        } else {
            return startScrollTop + (doc - startScrollTop) * (pos - startY) / (win - startY);
        }
    }
    return doc * (pos / win);
}

function fRevPos(win, doc, pos) {
    if (middleIsStart) {
        if (pos < startY) {
            return startScrollTop + (doc - startScrollTop) * (startY - pos) / startY;
        } else {
            return startScrollTop - startScrollTop * (pos - startY) / (win - startY);
        }
    }
    return doc - fPos(win, doc, pos);
}

function getScrollHeight(e) {
  return document.body.scrollHeight || document.documentElement.scrollHeight || 0;
}

function getScrollWidth(e) {
  return document.body.scrollWidth || document.documentElement.scrollWidth || 0;
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
