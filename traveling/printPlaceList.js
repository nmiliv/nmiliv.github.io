// TODO favicon issue
// TODO world map, or add coordinates somehow
// TODO graph showing all places and tag connections somehow... sorta like a subway map of sorts? so parent inherits all tags of child, all the way back to root.
// TODO do we want to make places collapsible? collapse or expand by default? Also buttons to collapse/expand all
// note: if you are searching through tag classes, remember to replace whitespace with dashes
// low hanging fruit: prettier comboboxes, text search --> text can wait till later. Comboboxes are more important at the moment, and probably the last thing needed before release
// next step: URLs and sharing

// text search: find items matching search, add all parents of matches (minimal content), add all children of matches (collapsed... ugh that means adding collapsible content.) Actually no, just do the normal thing of minimize parents, show all children.

const searchButton = document.getElementById("tagsearch-button");
const searchClearButton = document.getElementById("tagsearch-clear");
const searchBox = document.getElementById("tagsearch-text");
let searchtaglist = [];
function searchFunction(){
    if (searchBox.value !== "") pushIfUnique(searchtaglist, searchBox.value.split(/\s*,\s*/));// searchtaglist.push(...searchBox.value.split(/\s*,\s*/)); // regex matches comma surrounded by whitespace
    searchtaglist = searchtaglist.filter((el) => alltags.some((item) => item == el)); // remove duplicates
    reloadTags(document.getElementById("searchtaglist"), searchtaglist);
    makePlaceList(placelist(), searchtaglist); // ok it seems like this placelist is the problem... need a new plan. Likely just have a seperate manager for adding/removing new places from myplacelist. Actually seems like it works fine, I just had something written weird before.
    searchBox.value = "";
}
searchButton.addEventListener("click", () => searchFunction());
searchClearButton.addEventListener("click", () => {
    searchtaglist = [];
    reloadTags(document.getElementById("searchtaglist"), searchtaglist);
    makePlaceList(placelist()); // can use default argument since this clears the search
});
alltags = [];
window.onload = async function() {
    myplacelist = await returnPlaceList();
    makePlaceList(myplacelist); // ok to use default argument bc tag search is empty --> unless we start doing funny URL things
    // TODO how to do the funny url thing for searching?
    // TODO non-tag search (bc I don't expecct people to ctrl-f) --> this is gonna need some more planning oh how this will work
    reloadTags(document.getElementById("taglist"), taglist, placelist());
}
let myplacelist = [];


function makePlaceList(placelist, displaytaglist = [], textsearch = []){
    const mydiv = document.getElementById("logs");
    const placesuggestions = document.getElementById("suggestions");
    const tagsuggestions = document.getElementById("tag-suggest");
    while (placesuggestions.firstChild) placesuggestions.removeChild(placesuggestions.lastChild);
    // placesuggestions.innerHTML = "";
    while (tagsuggestions.firstChild) tagsuggestions.removeChild(tagsuggestions.lastChild);
    // tagsuggestions.innerHTML = "";
    tagslist = ["Restaurant", "Country", "State", "City", "Breakfast", "Lunch", "Dinner", "Hotel", "Park", "Next Time", "Transit"];
    // search objective: display places with certain tags, and display the full parent chain needed (though maybe ignore decriptions)
    const rootlist = [];
    const orphanlist = [];
    // linking
    placelist = JSON.parse(JSON.stringify(placelist)); // I guess we're just doing a fresh round of linking on each reload... not very efficient, but whatever i guess (if we don't, then we end up with double linking and so on, or need to check for duplicate linking which would take the same amount of time as rebuilding, or trust that every operation that modifies the placelist is able to neatly insert itself and handle all of the linking which would be doable but I don't feel like doing it. Also the client only calls this function on page loads or searches, so for now it shouldn't gum up too bad).
    for (const place of placelist){ // certain things need to be applied to all places before we do any filtering.
        if (place.name.toUpperCase().includes("TRANSIT")){
            if ('taglist' in place){
                if (!place.taglist.some((el) => el === "Transit")) taglist.push("Transit");
            } else {
                place.taglist = ["Transit"];
            }
        }
    }
    let displaylist = placelist;
    // if (displaytaglist.length !== 0 && !(displaytaglist.some((el) => el.toUpperCase() === "OTHER PLACES" || el.toUpperCase() === "NEXT TIME"))) {
    if (displaytaglist.length !== 0) {
        // if len=0, then only link a filtered view. If we're looking for a post-linking style place, then link the whole list
        // really, this sort of filtering from placelist to displaylist is optional, because places get filtered during printing anyway, but we still do some pre-filtering here for historical purposes. Anyhow, this comment is now longer than the code it is supposed to describe and there isn't really that much interesitng going on here, so I'll stop yapping.
        // ok holdup any next time will have an appropriate tag pre-linking
        const searchothers = displaytaglist.some((el) => el.toUpperCase() === "OTHER PLACES");
        displaylist = placelist.filter((element) => {
            // conditions: tags match search or text matches search, if any is met then include (true)
            // text searches within tag search results
            if (searchothers && element.content === "") return true;
            if (!('taglist' in element)) return false;
            return element.taglist.some((element2) => {
                return displaytaglist.includes(element2);
            });
        });
    } // TODO searching happens in the preceding if block
    for (const place of displaylist) {
        if (('parentName' in place) && place.parentName !== "") {
            const searchParent = placelist.find((element) => element.name === place.parentName);
            // cases: can't find parent, can find parent but children not initialized as array, can find parent and children initialized
            if (searchParent === undefined) {
                orphanlist.push(place);
            } else if (!('child' in searchParent)) {
                searchParent.child = [place];
                place.parent = searchParent;
                if (displaytaglist.length !== 0 && !displaylist.includes(searchParent)) displaylist.push(searchParent);
            } else if (typeof searchParent.child.find((element) => element.name === place.name) === 'undefined'){
                searchParent.child.push(place);
                place.parent = searchParent;
                if (displaytaglist.length !== 0  && !displaylist.includes(searchParent)) displaylist.push(searchParent);
            }
        } else {
            rootlist.push(place);
        }
        const newsuggestion = document.createElement("option");
        newsuggestion.value = place.name;
        placesuggestions.appendChild(newsuggestion);
        // placesuggestions.innerHTML += "<option value=\"" + place.name + "\">";
        if ('taglist' in place){
            for (tag of place.taglist) {
                if (!(tagslist.includes(tag))) {
                    tagslist.push(tag);
                }
            }
        }
    }
    for (tag of tagslist){
        const newsuggestion = document.createElement("option");
        newsuggestion.value = tag;
        tagsuggestions.appendChild(newsuggestion);
        // tagsuggestions.innerHTML += "<option value=\"" + tag + "\">";
        // const newtag = document.createElement("li"); // holdover code from w3 ARIA combobox
        // newtag.appendChild(document.createTextNode(tag));
        // newtag.id = "lb1-" + tag;
        // newtag.role = "option";
        // tagsuggestions.appendChild(newtag);
        // console.log("hi i am trying to add list item");
        // console.log(newtag);
        // tagsuggestions.innerHTML += "<li id=\"lb1-" + tag + "\" role=\"option\">" + tag + "</li>";
    }
    function printPlace(place, container, level=0, special=""){
        // if place has no children and does not contain search criteria, don't print it
        // if place does not contain search criteria, don't print content
        // so: meets search --> print everything, regardless of children (children decide whether they print or not, basically always assume that the children know what they are doing)
        // does not meet search but has children --> print name and children only
        // does not meet search and no children --> print nothing
        // name prints with search or children
        // content and tags print with search only
        // children print always
        let search;
        if (!('taglist' in place)) search = false;
        else search = place.taglist.some((element) => displaytaglist.includes(element));
        search = search || displaytaglist.length === 0; // if no search, then pretend all items were searched. If there is no taglist, then the place will never appear in a search (unless there was no search to begin with). If there is a taglist and a search, then need to figure out if this element was part of the search results or not.
        const newdiv = document.createElement("div");
        if (search || 'child' in place) {
            const header = document.createElement("h3");
            header.style.position = "sticky";
            header.style.margin = "0px";
            header.style.paddingTop = "20px";
            header.style.paddingBottom = "10px";
            header.style.top = (30*level) + "px"; // for each recursion level, offset the sticky position so that it doesn't overlap with the previous title
            header.style.zIndex = String(100-level);
            header.append(place.name);
            newdiv.appendChild(header);
        }
        if (search || (place.name.toUpperCase() === "OTHER PLACES")) { // so this is here because otherwise searching for e.g. City that returned an Other Places would result in Other Places not receiving the proper tag. Through some testing, it appears that this will not accidentally cause all Other Places to print when not searching for Other Places.
            if ('taglist' in place) {
                for (const tag of place.taglist) {
                    generateTag(tag, () => {
                        pushIfUnique(searchtaglist, tag);
                        searchFunction();
                    }, newdiv);
                    if (tag !== place.taglist.at(-1)) newdiv.appendChild(document.createTextNode(", "));
                }
                newdiv.appendChild(document.createElement("br"));
            }
            if (place.content !== "") {
                newdiv.appendChild(document.createTextNode(place.content));
            }
        }
        container.appendChild(newdiv);
        function printListingSpecial(text) {
            newdiv.appendChild(document.createTextNode(text));
            // some of these <p>'s aren't the same as add text node -- perhaps a stylistic choise we want to fix?
            const list = document.createElement("ul");
            for (const otherplace of place.child){
                const li = document.createElement("li");
                li.appendChild(document.createTextNode(otherplace.name));
                if ('taglist' in otherplace) {
                    li.appendChild(document.createTextNode(" ("));
                    for (const tag of otherplace.taglist) {
                        generateTag(tag, () => {
                            pushIfUnique(searchtaglist, tag);
                            searchFunction();
                        }, li);
                        if (tag !== otherplace.taglist.at(-1)) newdiv.appendChild(document.createTextNode(", ")); // TODO also make tag search prettier.
                    }
                    li.appendChild(document.createTextNode(")"));
                }
                list.appendChild(li);
            }
            newdiv.appendChild(list);
        }
        if (special === ""){
            if ('child' in place){
                const innderdiv = document.createElement("div");
                innderdiv.classList.add("travel-children"); // children go in this div, and right now we have no specials that display children, so OK to only have it here. If you are adding new specials options that display children, then you will need to make sure they get wrapped in the travel-childern div.
                innderdiv.id = place.name;
                newdiv.appendChild(innderdiv);
                printPlaceList(place.child, document.getElementById(place.name), level+1);
            }
        } else if (special === "other"){ // well I mean technically this information gets carried by the name, but also I can't be bothered right now
            printListingSpecial("These are places that I don’t have stories about, but that I otherwise think are alright.");
        } else if (special === "nexttime"){
            printListingSpecial("These are places that I haven't been to, but I think might be cool.");
        } else {
            if (document.getElementById('generate')) alert("Received special that doesn't exist\nitem name: " + place.name + "\nspecial type: " + special + "\nThis message should only appear on development pages, if you are not Noa/h then something has gone wrong (maybe send Noa/h an email about this?)");
        }// if you are here to add more specials options, and the special displays children, make sure the div is properly classed! (See above).
    }
    function printPlaceList(list, container, level=0){
        // ok so what if... as we go through the list, grab places with no content and no children, don't print them, and instead construct an other places object, and then print that
        list.sort((a,b) => {
            const nameA = a.name.toUpperCase();
            const nameB = b.name.toUpperCase();
            if (nameA.includes("TRANSIT") || nameB === "NEXT TIME") return -1; // ensure transit comes first and other places comes last
            if (nameB.includes("TRANSIT") || nameA === "NEXT TIME") return  1;
            if (nameA === "OTHER PLACES") return  1; // neither name is transit or next time, or we would have hit one of the previosu ifs
            if (nameB === "OTHER PLACES") return -1;
            if (nameA < nameB) return -1; // if not a special case, then regular sort
            if (nameA > nameB) return  1;
            return 0;
        });
        let otherplace = { child: [],}; // bodge so that we define otherplaces
        let nexttime = { child: [],};
        if (list.length !== 0){
            otherplace = {
                name: "Other Places",
                parentName: list[0].parentName, // I mean... everyone in the list should have the same parent. Things are Not Good otherwise.
                content: "",
                child: [],
                taglist: ["Other Places"],
                // reminder that the children might still have tags.
            };
            nexttime = {
                name: "Next Time",
                parentName: list[0].parentName,
                content: "",
                child: [],
                taglist: ["Next Time"],
            };
        }
        for (const item of list){
            if (item.content !== "" || ('child' in item)) printPlace(item, container, level); // item with content is normal, item with child is normal
            else if ('taglist' in item && item.taglist.some((el) => el.toUpperCase() === "NEXT TIME")){// item with next time tag goes to next time always
                nexttime.child.push(item);
                if (!tagslist.some((el) => el.toUpperCase() === 'NEXT TIME')) tagslist.push("Next Time");
            }
            // item with no content and no children goes to otherplace always
            else {
                otherplace.child.push(item);
                if (!tagslist.some((el) => el.toUpperCase() === 'OTHER PLACES')) tagslist.push("Other Places");
            }
        }
        if (otherplace.child.length !== 0) printPlace(otherplace, container, level, "other");
        if (nexttime.child.length !== 0) printPlace(nexttime, container, level, "nexttime");

    }
    clearPlaceList();
    // display: total child locations, total cities, total countries, number of orphans
    function createStatDiv(number, text, parent){
        const statdiv = document.createElement("div");
        statdiv.style = "margin: auto; text-align: center;";
        const header = document.createElement("h2");
        header.appendChild(document.createTextNode(number));
        statdiv.appendChild(header);
        const label = document.createElement("p");
        label.appendChild(document.createTextNode(text));
        statdiv.appendChild(label);
        // statdiv.innerHTML = "<h2>" + number + "</h2><p>" + text + "</p>";
        statdiv.id = text + "-stats";
        statdiv.style.paddingLeft = "20px";
        statdiv.style.paddingRight = "20px";
        parent.appendChild(statdiv);
        return statdiv;
    }
    statsdiv = document.createElement("div"); // style: display: flex
    statsdiv.style = "display: flex";
    createStatDiv(displaylist.length, "Total Entries", statsdiv);
    createStatDiv(displaylist.filter((element) => !('child' in element)).length, "Locations", statsdiv);
    createStatDiv(displaylist.filter((element) => {
        if ('taglist' in element) return element.taglist.some((element2) => element2 === "City");
        else return false;
    }).length, "Cities", statsdiv);
    createStatDiv(displaylist.filter((element) => {
        if ('taglist' in element) return element.taglist.some((element2) => element2 === "Country");
        else return false;
    }).length, "Countries", statsdiv);
    if (orphanlist.length > 0){
        const orphdiv = createStatDiv(orphanlist.length, "Orphans", statsdiv);
        orphdiv.style.backgroundColor = "hsl(60deg 60% 40%)";
    }
    mydiv.appendChild(statsdiv);


    printPlaceList(rootlist, mydiv);
    if (orphanlist.length !== 0){
        const orphheader = document.createElement("h2");
        orphheader.appendChild(document.createTextNode("Orphans"));
        mydiv.appendChild(orphheader);
        // mydiv.innerHTML += "<h2>orphans</h2>"
        printPlaceList(orphanlist, mydiv)
    }
    const cssStyle = document.createElement('style');
    cssStyle.type = 'text/css';
    for (let i = 0; i < tagslist.length; i++) cssStyle.appendChild(document.createTextNode(".tag-" + tagslist[i].replace(" ", "-") + "{background-color: hsl(" + i/tagslist.length*360 + "deg 60% 40%);}"));
    document.getElementsByTagName("head")[0].appendChild(cssStyle);
    alltags = tagslist;
}

function generateTag(buttonText, callback, parent){
    // should return a string that can be added to innerHTML (this is a terrible way of doing things and won't work)
    // should return a button object, with the proper class names added (makePlaceList will handle CSS)
    // also should take in a function for what to do when clicked
    const ret = document.createElement("button");
    ret.classList.add("tag");
    ret.classList.add("tag-"+buttonText.replace(" ", "-"));
    ret.textContent = buttonText;
    // ret.innerHTML = buttonText;
    // ret.addEventListener("click", function(event){callback();console.log("lol");}); // oh try just callback no ()
    ret.addEventListener("click", callback);
    parent.appendChild(ret);
}

function clearPlaceList() {
    const mydiv = document.getElementById("logs");
    while(mydiv.firstChild) mydiv.removeChild(mydiv.lastChild);
    // mydiv.innerHTML = "";
}
async function getTextFile(str) {
    let responsetext = "";
    responsetext = await Promise.all([
    fetch(str).then(x => x.text())
    ]); // I have no clue what this does, but it works.
    return responsetext;
}
async function returnPlaceList() {
    const placelist = [];
    const textfile = await getTextFile('./places/place_file_list.txt');
    for (const filename of textfile[0].split("\n")) {
        if (filename !== "") {
            const requestURL = "./places/" + filename;
            const request = new Request(requestURL);
            const response = await fetch(request);
            const respJSON = await response.json();
            placelist.push(respJSON);
        }
    }
    return placelist;
}
function pushIfUnique(array, newitem) {
    if (Array.isArray(newitem)){
        for (const item of newitem) {
            if (!array.some((el) => el === item)) array.push(item);
        }
    }
    else if (!array.some((el) => el === newitem)) array.push(newitem);
}
const reloadTags = (tagsdiv, ftaglist) => {
    while (tagsdiv.firstChild) tagsdiv.removeChild(tagsdiv.lastChild);
    for (const item of ftaglist) {
        const newdiv = document.createElement("div");
        tagsdiv.appendChild(newdiv);
        generateTag(item, () => {
            ftaglist.splice(ftaglist.indexOf(item), 1);
            reloadTags(tagsdiv, ftaglist);
            makePlaceList(placelist(), searchtaglist);
        }, newdiv); // are we missing a reload place list here as well? --> probably not, as reloadtags is usually called alongside a makeplacelist (especially now with dtandardized tag creation)
    }
}
