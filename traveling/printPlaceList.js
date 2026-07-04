// TODO favicon issue
// TODO world map, or add coordinates somehow, or the date of writing or time of visit...
// TODO click on images to enlarge them
// TODO other places are erroneously getting a last updated tag
//  graph showing all places and tag connections somehow... sorta like a subway map of sorts? so parent inherits all tags of child, all the way back to root.
// note: if you are searching through tag classes, remember to replace whitespace with dashes
// low hanging fruit: text search --> text can wait till later
// next step: URLs and sharing
// images strat: upload images through button, display a list of images below the upload button. Number them starting at img-1 etc. Display images under the button are each their own button, which deletes the image when you click. Uploading an image should also give it a URL that we can then use later...
// footnotes strategy: use spans with class footnotes, on load, pull internal text and replace with numbers and link, and generate footnote table at the bottom as usual. so like <span class="footnote">footnote content</span> diplays as <span class="headnote">[0]</span> with <li> at the bottom.

// text search: find items matching search, add all parents of matches (minimal content), add all children of matches (collapsed... ugh that means adding collapsible content.) Actually no, just do the normal thing of minimize parents, but show all children unollapsed.


// These are done, just need verification:

// these places need writing: medvescak, cat cafe zagreb, salsa bar in Soho, Malithi bar, cloughjordan cafe, pt teyes, meridian missisippi, CA and bay area transits etc need re-writing, pizza place in tahoe or truckee or something? skiing in general? colma lol. los altos hills --> nice place to go biking. gorgas house! village of providence. MSP airport, don't really like the footnote as is. black mesa in NM, madison AL
// these places need linking (maybe we should automate this? either way, it would require trawling everything again): london underground needs linking help, Derry needs linking as well. Beast mode. Pt reyes and birling gap (predicted), northport, boojums
// things to check for on trawl: linking, pictures, might have dropped some transits, jack brown consistency, chicago transit name?
// formatting checks: airports, transit, external links
// thse places need pictures: toybox bistro
// fix castro street, needs to list all of the places there. --> this might actually be a tags issue
// would be cool if we had a map of california and where each region is, especially since i'm kinda eyeballing these instead of using any formal definitions.
// why are some cities broken up into neighborhoods but others aren't? This was done mostly based on vibes, which is highly dependent on how much time I have spent there. Reach out to fix.
// seriosuly, recheck all the transit agency names and make sure the format is consistent


// choices that need to be made:
// Horley should.. Horley something idk. London airports are an absolute mess. Maybe cities with multiple airports should just have an airports category? Also should airports display above alpha listed places like transit does?
// TODO do we want to add people/bands/etc? (cork Red Sun, Limerick DJ Egg, Huntsville music and people, marquette bimbo)

// giving up:
// TODO remove tag should force preview update

// formatting:
// better paragraph breaks, also more space after tags
// clean up area, region, etc tags. Kind of a mess right now.
// need to clean up market/mall/plaza listings, also those need to be a category somehow. Maybe add a new category for missing places?


// these are still not done:
// text search
// TODO once text search is done, add the australia easter egg
// TODO add headers and footers to all of the website stuff
// TODO mobile layout, footnotes break on mobile.

// once finished:
// send final product to: northeast crew, Anna, Soup, Eli REU, Gabby?

// So for some reason the evil >:( tag will not be assigned a color, but honestly that's pretty funna and imma keep it that way lol. Update: this is now a feature not a bug.

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];


const searchClearButton = document.getElementById("tagsearch-clear");
let searchtaglist = [];
function searchFunction(){
    searchtaglist = searchtaglist.filter((el) => alltags.some((item) => item == el)); // remove duplicates
    reloadTags(document.getElementById("searchtaglist"), searchtaglist);
    makePlaceList(placelist(), searchtaglist);
}
searchClearButton.addEventListener("click", () => {
    searchtaglist = [];
    reloadTags(document.getElementById("searchtaglist"), searchtaglist);
    makePlaceList(placelist()); // can use default argument since this clears the search
});
alltags = [];
let taglist = [];
window.onload = async function() {
    myplacelist = await returnPlaceList();
    makePlaceList(myplacelist); // ok to use default argument bc tag search is empty --> unless we start doing funny URL things
    const tagElement = document.getElementById("taglist");
    if(tagElement !== null) reloadTags(tagElement, taglist, placelist()); // seems like this works fine lol...
    loadSearchTags();
    loadTagGroups();
    load_favorites();
    load_recents();
}

function create_fave_new(item){
    const newdiv = document.createElement("div");
    const textdiv = document.createElement("div");
    textdiv.textContent = item.name + ((item.parentName !== "") ? " (" + item.parentName + ")" : "");
    const jump_button = document.createElement("button");
    jump_button.textContent = "Jump!";
    jump_button.addEventListener("click", () => {window.location.href = "#" + item.name.replaceAll(" ", "-") + "-header";});
    jump_button.style.float = "right";
    newdiv.classList.add("fave-list");
    newdiv.style.display = "flex";
    newdiv.style.alignItems= "center";
    textdiv.style.flexGrow = "1";
    jump_button.style.flexBasis = "0";
    newdiv.appendChild(textdiv);
    newdiv.appendChild(jump_button);
    return newdiv;
}

function load_favorites(){
    const favorites = myplacelist.filter(item => {
        // console.log("Checking", item);
        if('taglist' in item) return item.taglist.some((el) => el.toUpperCase() === "FAVORITE");
        else return false;
    });
    const favesdiv = document.createElement("div");
    // favesdiv.classList.add("bordered");
    favesdiv.style.maxHeight = "200pt";
    favesdiv.style.overflowY = "auto";
    favesdiv.classList.add("scroll-shadows");
    for (const item of favorites){
        // console.log(item);
        // console.log(item.name);
        // const favorite = document.createElement("span");
        // favorite.textContent = item.name + " (" + item.parentName + ")";
        // const jump_button = document.createElement("button");
        // jump_button.textContent = "Jump!";
        // jump_button.addEventListener("click", () => {window.location.href = "#" + item.name.replaceAll(" ", "-") + "-header";});
        // jump_button.style.float = "right";
        // favorite.classList.add("fave-list");
        // favorite.appendChild(jump_button);
        const favorite = create_fave_new(item);
        favesdiv.appendChild(favorite);
    }
    document.getElementById("favorite-places").appendChild(favesdiv);
}
function load_recents(){
    const timesort = (a, b) => {
        if (!("timestamp" in a)) a.timestamp = 0;
        if (!("timestamp" in b)) b.timestamp = 0;
        return b.timestamp - a.timestamp;
    }
    myplacelist.sort((a, b) => timesort(a, b));
    // try to load the first ten (or first five), and then continue loading so long as the jump is less than one day
    const recentslist = myplacelist.slice(0, 10);
    for(let index = 10; index < myplacelist.length && timesort(myplacelist[index-1], myplacelist[index]) < 86400000; index++) recentslist.push(myplacelist[index]);

    const recentsdiv = document.createElement("div");
    recentsdiv.style.maxHeight = "200pt";
    recentsdiv.style.overflowY = "auto";
    recentsdiv.classList.add("scroll-shadows");
    let currdate = new Date();
    // TODO add option to load more places!
    for (const item of recentslist){
        // console.log(item);
        // console.log(item.name);
        if (currdate - item.timestamp > 86400000){
            currdate = item.timestamp;
            const breaker = document.createElement("div");
            const textspan = document.createElement("span"); //⮞  ⮜
            textspan.innerHTML = "<i>" + ((typeof currdate === "object") ? currdate.getDate() + " " + monthNames[currdate.getMonth()] + " " + currdate.getFullYear() : "A long time ago") + "</i>";
            breaker.style.display = "flex";
            breaker.style.justifyContent = "center";
            textspan.flexBasis = "0";
            const line = document.createElement("hr");
            line.style.flexGrow = "1";
            const line2 = document.createElement("hr");
            line2.style.flexGrow = "1";
            breaker.appendChild(line);
            breaker.appendChild(textspan);
            breaker.appendChild(line2);
            // breaker.style.position = "sticky"; // TODO maybe sometime in the future...
            // breaker.style.top = "0";
            recentsdiv.appendChild(breaker);
        }
        // const recent = document.createElement("div");
        // recent.textContent = item.name + " (" + item.parentName + ")";
        // const jump_button = document.createElement("button");
        // jump_button.textContent = "Jump!";
        // jump_button.addEventListener("click", () => {window.location.href = "#" + item.name.replaceAll(" ", "-") + "-header";});
        // jump_button.style.float = "right";
        // recent.classList.add("fave-list");
        // recent.appendChild(jump_button);
        const recent = create_fave_new(item);
        recentsdiv.appendChild(recent);
    }
    document.getElementById("new-additions").appendChild(recentsdiv);
}

// new additions: sort all posts from newest to oldest (posts with no date go at the end), find the date of the tenth post, find the lowest post on the list that matches that date, and then dispaly that. Add a button that syas "load more" that moves up at least ten more posts. Add breaks for each day. Display at the top should show how far we're going. Sticky the date breaks. Posts with no date are marked "begniing of time"

let myplacelist = [];
const loadSearchTags = () => {
    const newdiv = document.getElementById("searchtagoptions");
    while (newdiv.firstChild) newdiv.removeChild(newdiv.lastChild);
    for (const tag of alltags){
        generateTag(tag, () => {
            pushIfUnique(searchtaglist, tag);
            searchFunction();
        }, newdiv);
    }
};
// to do finihs unfocus, can't do that now or else i'll miss my trains stop bc i'm too tired. I need to go out more often :)'

const taggroups = [{name: "Food", taglist: ["Bakery", "Bar", "Breakfast", "Cafe", "Dinner", "Lunch", "Restaurant", "Snack"]}, {name: "Locale", taglist: ["Area", "Borough", "City", "Community Area", "Country", "District", "Hill", "Island", "Neighborhood", "Province", "Region", "State", "Suburb", "Town"]}, {name: "Place", taglist: ["Attraction", "Library", "Lookout", "Mall", "Market", "Museum", "Park", "Plaza", "Sports", "Store", "Thing", "Venue"]}, {name: "Jaunt", taglist: ["Bike Ride", "Hike", "Kayak", "Ski", "Swim"]}, {name: "Transportation", taglist: ["Transit", "Airport", "Train Station"]}];

// todo add milwaukee post office... or just more post offices in general

const loadTagGroups = () => {
    const newdiv = document.getElementById("search-tag-group-options");
    while (newdiv.firstChild) newdiv.removeChild(newdiv.lastChild);
    for (const tag of taggroups){
        generateGroupTag( tag.name, () => {
            pushIfUnique(searchtaglist, tag.taglist);
            searchFunction();
        }, newdiv);
    }
};


function printPlaceList(list, container, level=0, displaytags=[]){
    // ok so what if... as we go through the list, grab places with no content and no children, don't print them, and instead construct an other places object, and then print that
    list.sort((a,b) => sortAlphaSpecial(a,b));
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
        if (item.content !== "" || ('child' in item)) printPlace(item, container, level, "", displaytags=displaytags); // item with content is normal, item with child is normal
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
    if (otherplace.child.length !== 0) printPlace(otherplace, container, level, "other", displaytags=displaytags);
    if (nexttime.child.length !== 0) printPlace(nexttime, container, level, "nexttime", displaytags=displaytags);

}
function printPlace(place, container, level=0, special="", displaytags = []){
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
    else search = place.taglist.some((element) => displaytags.includes(element));
    search = search || displaytags.length === 0; // if no search, then pretend all items were searched. If there is no taglist, then the place will never appear in a search (unless there was no search to begin with). If there is a taglist and a search, then need to figure out if this element was part of the search results or not.
    const newdiv = document.createElement("div");
    if (search || 'child' in place) {
        const header = document.createElement("h3");
        header.style.position = "sticky";
        header.style.margin = "0px";
        // header.style.paddingTop = "20px";
        header.style.paddingBottom = "10px";
        header.style.top = (30*level) + "px"; // for each recursion level, offset the sticky position so that it doesn't overlap with the previous title
        header.style.zIndex = String(100-level);
        header.id = place.name.replaceAll(" ", "-") + "-header";
        if(place.name.includes("New York")) header.append("New York");
        else header.append(place.name);
        if ('taglist' in place) if (place.taglist.some((el) => el.toUpperCase() === "FAVORITE")) header.append(Object.assign(document.createElement("span"), {textContent: " ★", classList: "fave-star"}));
        if (typeof inputs !== 'undefined') {
            const editButton = document.createElement("button");
            editButton.id = place.name + "-edit-button";
            editButton.textContent = "Edit";
            editButton.addEventListener("click", () => {
                inputs.name.value = place.name;
                inputs.parent.value = place.parentName;
                if ('taglist' in place) taglist = place.taglist; // note: this used to be a deep copy but i'm unsure why...
                reloadTags(document.getElementById("taglist"), taglist);
                inputs.content.value = place.content;
                // TODO maybe remove things from the master list if they go back to editing?
                console.log(myplacelist.findIndex(el => place.name === el.name));
                console.log(myplacelist.splice(myplacelist.findIndex(el => place.name === el.name), 1)); //maybe it's ok to just search for places with matching name? since I think we have to avoid name collisions anyway...
                // TODO ugh need to check that we're not pulling negative one, might still need to pull from newplacelist
                loadNewPlaces();
                updateSampleOutput(placeFromInputs());
            });
            header.appendChild(editButton);
        }
        newdiv.appendChild(header);
        newdiv.style.marginTop = "20px"
    }
    if (search || (place.name.toUpperCase() === "OTHER PLACES")) { // so this is here because otherwise searching for e.g. City that returned an Other Places would result in Other Places not receiving the proper tag. Through some testing, it appears that this will not accidentally cause all Other Places to print when not searching for Other Places.
        if ('taglist' in place) {
            for (const tag of place.taglist.sort((a,b) => sortAlphaSpecial(a,b))) {
                generateTag(tag, () => {
                    pushIfUnique(searchtaglist, tag);
                    searchFunction();
                }, newdiv);
            }
            newdiv.appendChild(document.createElement("br"));
        }
        if (place.content !== "") {
            const textdiv = document.createElement("div");
            textdiv.innerHTML = place.content; // we use innerHTML magic here to preserve HTML magic in footnote generation and images and italics and such.
            textdiv.style.marginTop = "10px";
            newdiv.appendChild(textdiv);
            newdiv.appendChild(document.createElement("br"));
        }
        const timediv = document.createElement("div");
        timediv.style.fontStyle = "italic";
        try{
            timediv.textContent = "Last updated " + (("timestamp" in place && typeof place.timestamp === "object") ? (place.timestamp.getDate() + " " + monthNames[place.timestamp.getMonth()] + " " + place.timestamp.getFullYear() + ".") : "a long time ago.");
        }catch{
            console.log(place);
            console.log("timestamp" in place);
            console.log(typeof place.timestamp);
            console.log(place.timestamp);
        }
        newdiv.appendChild(timediv);
    }
    container.appendChild(newdiv);
    function printListingSpecial(text) {
        newdiv.appendChild(document.createTextNode(text));
        const list = document.createElement("ul");
        for (const otherplace of place.child){
            const li = document.createElement("li");
            li.appendChild(document.createTextNode(otherplace.name));
            if ('taglist' in otherplace) {
                li.appendChild(document.createTextNode(" ("));
                for (const tag of otherplace.taglist.sort((a,b) => sortAlphaSpecial(a,b))) {
                    generateTag(tag, () => {
                        pushIfUnique(searchtaglist, tag);
                        searchFunction();
                    }, li);
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
            printPlaceList(place.child, document.getElementById(place.name), level+1, displaytags=displaytags);
        }
    } else if (special === "other"){ // well I mean technically this information gets carried by the name, but also I can't be bothered right now
        printListingSpecial("These are places that I don’t have stories about, but that I otherwise think are alright.");
        // other places must be checked whether any object in placelist qualifies for an other-places tag regardless of if it will be displayed
    } else if (special === "nexttime"){
        printListingSpecial("These are places that I haven't been to, but I think might be cool.");
        // next time tag will always be pushed by the linker, since next time is specified at object creation
    } else {
        if (document.getElementById('generate')) alert("Received special that doesn't exist\nitem name: " + place.name + "\nspecial type: " + special + "\nThis message should only appear on development pages, if you are not Noa/h then something has gone wrong (maybe send Noa/h an email about this?)");
    }// if you are here to add more specials options, and the special displays children, make sure the div is properly classed! (See above).
}
function sortAlphaSpecial(a,b) {
    if (typeof a === 'string') a = {name: a};
    if (typeof b === 'string') b = {name: b};
    const nameA = a.name.toUpperCase();
    const nameB = b.name.toUpperCase();
    if (nameA.includes("FAVORITE")) return -1;
    if (nameB.includes("FAVORITE")) return 1;
    if (nameA.includes("TRANSIT") || nameA.includes("PRIJEVOZ") || nameB === "NEXT TIME") return -1; // ensure transit comes first and other places comes last
    if (nameB.includes("TRANSIT") || nameB.includes("PRIJEVOZ") || nameA === "NEXT TIME") return  1;
    if (nameA === "OTHER PLACES") return  1; // neither name is transit or next time, or we would have hit one of the previosu ifs
    if (nameB === "OTHER PLACES") return -1;
    if (nameA < nameB) return -1; // if not a special case, then regular sort
    if (nameA > nameB) return  1;
    return 0;
}

function makePlaceList(placelist, displaytaglist = [], textsearch = []){
    const mydiv = document.getElementById("logs");
    const placesuggestions = document.getElementById("suggestions");
    const tagsuggestions = document.getElementById("tag-suggest");
    while (placesuggestions.firstChild) placesuggestions.removeChild(placesuggestions.lastChild);
    while (tagsuggestions.firstChild) tagsuggestions.removeChild(tagsuggestions.lastChild);
    tagslist = ["Other Places"]; // Other Places will be the only default tag lol. For legacy reasons.
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
    if (displaytaglist.length !== 0) {
        // if len!=0, then only link a filtered view. If we're looking for a post-linking style place, then link the whole list
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
    }
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
        statdiv.id = text + "-stats";
        statdiv.style.paddingLeft = "20px";
        statdiv.style.paddingRight = "20px";
        parent.appendChild(statdiv);
        return statdiv;
    }
    statsdiv = document.createElement("div");
    statsdiv.style = "display: flex; flex-wrap: wrap;";
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


    printPlaceList(rootlist, mydiv, 0, displaytaglist);
    if (orphanlist.length !== 0){
        const orphheader = document.createElement("h2");
        orphheader.appendChild(document.createTextNode("Orphans"));
        mydiv.appendChild(orphheader);
        printPlaceList(orphanlist, mydiv, 0, displaytaglist)
    }
    for (const place of placelist) {
        if ('taglist' in place) {
            for (const tag of place.taglist) pushIfUnique(tagslist, tag);
        }
    }
    alltags = tagslist;
    alltags.sort((a,b) => sortAlphaSpecial(a,b));
    const cssStyle = document.createElement('style');
    cssStyle.type = 'text/css';
    alltaglen = alltags.length;
    if (alltags.some((el) => el.toUpperCase() === "FAVORITE")){
        alltaglen = alltaglen - 1;
        cssStyle.appendChild(document.createTextNode(".tag-Favorite" + "{background-color: hsl(" + 55 + "deg 60% 40%);}"));
    }
    for (let i = 0; i < alltaglen; i++) if (!/[>:\(\)]/.test(alltags[i])) if (alltags[i].toUpperCase() !== "FAVORITE") cssStyle.appendChild(document.createTextNode(".tag-" + alltags[i].replaceAll(" ", "-") + "{background-color: hsl(" + i/alltaglen*360 + "deg 60% 40%);}"));
    document.getElementsByTagName("head")[0].appendChild(cssStyle);
    loadSearchTags();
    loadTagGroups();
    updateFootnotes();
}

function updateFootnotes(){
    // ok and now for footnotes...
    const footnotes = document.getElementsByClassName("footnote");
    const footlist = document.getElementById("footnotes");
    while (footlist.firstChild) footlist.removeChild(footlist.lastChild);
    const tooltipContainer = document.querySelector(".tooltip-container"); // why is this a query selector?? Nobody knows. The code was copy pasted in that manner.

    var newlist = "";
    var counter = 1;
    // yes I made a whole system for re-arranging footnotes and making sure they are correctly numbered. Is there a library for this? Probably. Unfortunately I am an engineer and like solving problems that didn't need a new solution.
    for (const headnote of footnotes) {
        headnote.id = "headnote-" + counter;
        let foottext = "";
        if ('foottext' in headnote.dataset) foottext = headnote.dataset.foottext;
        else foottext = headnote.innerHTML;
        const footnote = document.createElement("li");
        footnote.id = "footnote-" + counter;
        footnote.innerHTML = foottext;
        // replace internal footnote text
        headnote.innerHTML = "[<a href=\"#" + footnote.id + "\" data-toggle=\"tooltip\">" + counter + "</a>]";
        headnote.dataset.foottext = foottext;
        // add footnote to the list
        footlist.appendChild(footnote);
        // link everything
        headnote.addEventListener("mouseenter", (e) => {
            if (e.pageX < getWidth()/2){
                tooltipContainer.style.left = `${e.pageX}px`;
            } else {
                tooltipContainer.style.left = `${e.pageX - getWidth()*0.25}px`;
            }
            tooltipContainer.style.top = `${e.pageY}px`;
            tooltipContainer.innerHTML = footnote.innerHTML;
            tooltipContainer.style.display = 'block';
            tooltipContainer.style.opacity = 1;
        });
        headnote.addEventListener("mouseout", (e) => {
            tooltipContainer.style.display = 'none';
            tooltipContainer.style.opacity = 0;
        });
        footnote.innerHTML = "<a href=\"#" + headnote.id + "\">" + "^</a> " + footnote.innerHTML;
        newlist += footnote.outerHTML + "\n";
        counter++;
    }
    tooltipContainer.addEventListener('mouseenter', () => {

        tooltipContainer.style.display = 'block';
        tooltipContainer.style.opacity = 1;

    })
    tooltipContainer.addEventListener('mouseout', () => {

        tooltipContainer.style.display = 'none';
        tooltipContainer.style.opacity = 0;

    })
    if (!footlist.firstChild) footlist.appendChild(document.createTextNode("no footnotes :)"));
}

function getWidth() {
  return Math.max(
    document.body.scrollWidth,
    document.documentElement.scrollWidth,
    document.body.offsetWidth,
    document.documentElement.offsetWidth,
    document.documentElement.clientWidth
  );
}

function generateTag(buttonText, callback, parent){
    // should return a string that can be added to innerHTML (this is a terrible way of doing things and won't work)
    // attempt number two!
    // should return a button object, with the proper class names added (makePlaceList will handle CSS)
    // also should take in a function for what to do when clicked
    const ret = document.createElement("button");
    ret.classList.add("tag");
    ret.classList.add("tag-"+buttonText.replaceAll(" ", "-"));
    if(buttonText.toUpperCase() === "FAVORITE") ret.textContent = "★";
    else ret.textContent = buttonText;
    ret.addEventListener("click", callback);
    parent.appendChild(ret);
}

function generateGroupTag(buttonText, callback, parent){
    const ret = document.createElement("button");
    ret.classList.add("tag");
    ret.classList.add("tag-group");
    ret.classList.add("tag-group-"+buttonText.replaceAll(" ", "-"));
    ret.textContent = buttonText;
    ret.addEventListener("click", callback);
    parent.appendChild(ret);
}

function clearPlaceList() {
    const mydiv = document.getElementById("logs");
    while(mydiv.firstChild) mydiv.removeChild(mydiv.lastChild);
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
        generateTag(item, () => {
            ftaglist.splice(ftaglist.indexOf(item), 1);
            reloadTags(tagsdiv, ftaglist);
            makePlaceList(placelist(), searchtaglist);
        }, tagsdiv);
    }
}
