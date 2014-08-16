// ==UserScript==
// @name            MajorGeeks Freeware Only
// @description     Improves MajorGeeks.com by removing programs with license shareware, adding auto sort options and blocking advertisement.
// @author          tumpio
// @oujs:author     tumpio
// @namespace       tumpio@sci.fi
// @homepageURL     https://openuserjs.org/scripts/tumpio/MajorGeeks_Freeware_Only
// @supportURL      https://github.com/tumpio/gmscripts
// @icon            https://raw.githubusercontent.com/tumpio/gmscripts/master/MajorGeeks_Freeware_Only/large.png
// @match           http://www.majorgeeks.com/*
// @match           http://mac.majorgeeks.com/*
// @run-at          document-start
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_addStyle
// @version         1.8.2
// ==/UserScript==

if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function (suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}
(function () {
    var url = window.location.href;
    var BlockAdds = GM_getValue("Block_Adds", true);
    if (BlockAdds && url.indexOf("mg/get") !== -1) {
        document.addEventListener("DOMContentLoaded", function () {
            removeAll(document.getElementsByClassName("geekad"));
            document.body.innerHTML = document.body.innerHTML.replace(
                    /<hr>[\s\S]*<!-- wrap -->/ig, "");
        }, false);
        return;
    }
    var mgeek = {
        name : "mgeek",
        items : [
            ["sortname", "Name"],
            ["sortdate", "Date"],
            ["sortpopularity", "Popular."],
            ["sortrating", "Rating"]
        ],
        style : ".geekyinsidecontent { margin-bottom: 20px; }",
        refreshUrl : function () {
            return "mg/" + GM_getValue("Sort_By_mgeek", "sortdate") + "/" + url.split(
                '/')[5];
        },
        removeShareFront : function () {
            for (var i = share.snapshotLength; i--; ) {
                share.snapshotItem(i).style.display = "none";
                share.snapshotItem(i).nextSibling.nextSibling.style.display =
                    "none";
            }
        },
        removeShare : function () {
            for (var i = share.snapshotLength; i--; ) {
                share.snapshotItem(i).style.display = "none";
                share.snapshotItem(i).nextSibling.nextSibling.style.display =
                    "none";
            }
        },
        restoreShareFront : function () {
            for (var i = share.snapshotLength; i--; ) {
                share.snapshotItem(i).style.display = "block";
                share.snapshotItem(i).style.background = "#ECF038";
                share.snapshotItem(i).nextSibling.nextSibling.style.display =
                    "block";
                share.snapshotItem(i).nextSibling.nextSibling.style.background =
                    "#ECF038";
            }
        },
        restoreShare : function () {
            for (var i = share.snapshotLength; i--; ) {
                share.snapshotItem(i).style.display = "block";
                share.snapshotItem(i).style.background = "#ECF038";
                share.snapshotItem(i).nextSibling.nextSibling.style.display =
                    "block";
                share.snapshotItem(i).nextSibling.nextSibling.style.background =
                    "#ECF038";
            }
        },
        getShare : function () {
            return document.evaluate(
                "//div[@class='geekytitle' and contains(string(), '$')]",
                document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
        },
        getMenuPosition : function () {
            return document.evaluate("//div[@class='geekycontent']", document,
                null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        },
        getMenuPositionFront : function () {
            return this.getMenuPosition();
        },
        placeMenu : function (position, menu) {
            position.removeChild(position.firstChild.nextSibling);
            this.placeMenuFront(position, menu);
        },
        placeMenuFront : function (position, menu) {
            position.insertBefore(menu, position.firstChild.nextSibling.nextSibling);
            removeAll(document.getElementsByTagName("br"));
        },
        replaceLinks : function () {
            var links = document.getElementsByClassName("colleft")[0].getElementsByTagName(
                    "a");
            for (var i = links.length; i--; ) {
                links[i].setAttribute("href", links[i].getAttribute("href").replace(
                        "sortname", sortBy));
            }
        },
        getAds : function () {
            var ads = new Array();
            if (url.indexOf("/details/") !== -1) {
                var iSpon = document.evaluate(
                        "//img[@alt='Sponsored Link']",
                        document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                if (iSpon !== null) {
                    ads.push(iSpon.nextSibling.nextSibling.nextSibling.nextSibling);
                    ads.push(iSpon.nextSibling.nextSibling.nextSibling);
                    ads.push(iSpon.nextSibling.nextSibling);
                    ads.push(iSpon.nextSibling);
                    ads.push(iSpon);
                }
                ads.push(document.evaluate(
                        "//span[@style='font-size: 1.25em;' or @style='font-size: 1.0em;']",
                        document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.parentNode);
                ads.push(document.evaluate(
                        "//table[@class='author']",
                        document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue);
            }
            var byGoogle = document.evaluate("//a[contains(string(), 'Ads by Google')]",
                    document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            if (byGoogle !== null && url.indexOf("mac.") !== -1)
                ads.push(byGoogle.parentNode);
            ads.push(document.evaluate(
                    "//div[@class='content' and contains(string(), 'Featured Software')]",
                    document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue);
            ads.push(document.getElementById("discovery-top"));
            ads.push(document.getElementById("MarketGid2606"));
            ads.push.apply(ads, document.getElementsByClassName("geekad"));
            ads.push.apply(ads, document.getElementsByClassName("altcontent"));
            return ads;
        }
    };
    var obj = mgeek;
    var sortBy = GM_getValue("Sort_By_" + obj.name, obj.items[1][0]);
    var menu = createMenu();
    var toggleButton, share, removeShare, restoreShare;
    if (sortBy !== obj.items[0][0])
        document.addEventListener(
            "DOMContentLoaded", function () {
            obj.replaceLinks();
        }, false);
    if (url.endsWith(".com/") || url.endsWith("/index.html") || url.indexOf(
            ".com/files/page/") !== -1)
        document.addEventListener("DOMContentLoaded", function () {
            placeMenuFront(menu);
            removeShare = function () {
                obj.removeShareFront();
            }
            restoreShare = function () {
                obj.restoreShareFront();
            };
            removeShareware();
        }, false);
    else
        document.addEventListener("DOMContentLoaded", function () {
            placeMenu(menu);
            removeShare = function () {
                obj.removeShare();
            }
            restoreShare = function () {
                obj.restoreShare();
            };
            removeShareware();
        }, false);
    document.addEventListener("DOMContentLoaded", function () {
        GM_addStyle(obj.style);
    }, false);
    if (BlockAdds)
        document.addEventListener("DOMContentLoaded", function () {
            removeAll(obj.getAds());
        }, false);

    //--- FUNCTIONS

    function createMenu() {
        var configEle = document.createElement('div');
        configEle.setAttribute("id", "mg_freeware_menu");
        configEle.setAttribute("align", "center");
        configEle.setAttribute("style", "padding: 10px;");
        var options = "[Auto Sort By: <select id='configure_autosort'>";
        for (var i = 0; i < obj.items.length; i++) {
            var x = obj.items[i];
            options += "<option id='" + "opt_" + i + "' value='" + x[0] + "'" +
            ((sortBy === x[0]) ? "selected='selected'" : "") + ">" + x[1] +
            "</option>";
        }
        options += "</select>Block Adds:<input id='block_ads' type='checkbox'" +
        ((BlockAdds) ? "checked='checked'" : "") + "></input>" +
        "Show Shareware:<input type='checkbox' id='toggle_sw'></input>]";
        configEle.innerHTML = options;
        return configEle;
    }

    function placeMenuFront(menu) {
        var position = obj.getMenuPositionFront();
        if (position !== null)
            obj.placeMenuFront(position, menu);
        addSaveListener(function () {
            window.location.reload();
        });
    }

    function placeMenu(menu) {
        var position = obj.getMenuPosition();
        if (position !== null)
            obj.placeMenu(position, menu);
        addSaveListener(function () {
            window.location = obj.refreshUrl();
        });
    }

    function addSaveListener(reload) {
        document.getElementById("configure_autosort").addEventListener('change', function () {
            saveConfig(reload);
        }, false);
        document.getElementById("block_ads").addEventListener('click', function () {
            saveConfig(reload);
        }, false);
    }

    function saveConfig(reload) {
        GM_setValue("Sort_By_" + obj.name, document.getElementById(
                "configure_autosort").value);
        GM_setValue("Block_Adds", document.getElementById("block_ads").checked);
        reload();
    }

    function removeShareware() {
        toggleButton = document.getElementById("toggle_sw");
        share = obj.getShare();
        if (share.snapshotLength > 0)
            removeShare();
        toggleButton.addEventListener('click', addListenerRestore, false);
    }

    function addListenerRestore() {
        restoreShare();
        toggleButton.removeEventListener('click', addListenerRestore, false);
        toggleButton.addEventListener('click', addListenerRemove, false);
    }

    function addListenerRemove() {
        removeShare();
        toggleButton.removeEventListener('click', addListenerRemove, false);
        toggleButton.addEventListener('click', addListenerRestore, false);
    }

    function remove(ele) {
        if (ele !== null)
            ele.parentNode.removeChild(ele);
    }

    function removeAll(array) {
        if (array.snapshotItem) {
            for (var i = array.snapshotLength; i--; ) {
                if (array.snapshotItem(i) !== null)
                    array.snapshotItem(i).parentNode.removeChild(array.snapshotItem(i));
            }
        } else {
            for (var j = array.length; j--; ) {
                if (array[j] !== null)
                    array[j].parentNode.removeChild(
                        array[j]);
            }
        }
    }
}());
