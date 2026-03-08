function makePlaceList(placelist, displaytaglist = []){
    const mydiv = document.getElementById("logs");
    const placesuggestions = document.getElementById("suggestions");
    const tagsuggestions = document.getElementById("tag-suggest");
    placesuggestions.innerHTML = "";
    tagsuggestions.innerHTML = "";
    tagslist = ["Restaurant", "Country", "State", "City", "Breakfast", "Lunch", "Dinner", "Hotel", "Park"];
    // search objective: display places with certain tags, and display the full parent chain needed (though maybe ignore decriptions)
    const rootlist = [];
    const orphanlist = [];
    // linking
    placelist = JSON.parse(JSON.stringify(placelist)); // I guess we're just doing a fresh round of linking on each reload... not very efficient, but whatever i guess
    let displaylist = placelist;
    // TODO still have issue where the remove search tag button does not force and update of makePlaceList()
    if (displaytaglist.length !== 0) {
        displaylist = placelist.filter((element) => {
            if (!('taglist' in element)) return false;
            return element.taglist.some((element2) => {
                return displaytaglist.includes(element2);
            });
        }); // this thing is a monster than needs better testing TODO... seems to be failing anyway
    }
    console.log(displaylist);
    for (const place of displaylist) {
        if ('parentName' in place) {
            const searchParent = placelist.find((element) => element.name === place.parentName);
            // cases: can't find parent, can find parent but children not initialized as array, can find parent and children initialized
            if (searchParent === undefined) {
                orphanlist.push(place);
            } else if (!('child' in searchParent)) {
                searchParent.child = [place];
                place.parent = searchParent;
                if (displaytaglist.length !== 0) displaylist.push(searchParent);
            } else if (typeof searchParent.child.find((element) => element.name === place.name) === 'undefined'){
                searchParent.child.push(place);
                place.parent = searchParent;
                if (displaytaglist.length !== 0) displaylist.push(searchParent);
            }
        } else {
            rootlist.push(place);
        }
        placesuggestions.innerHTML += "<option value=\"" + place.name + "\">";
        if ('taglist' in place){
            for (tag of place.taglist) {
                if (!(tagslist.includes(tag))) {
                    tagslist.push(tag);
                }
            }
        }
    }
    console.log(displaylist);
    for (tag of tagslist){
        tagsuggestions.innerHTML += "<option value=\"" + tag + "\">";
    }
    function printPlace(place, container){
        // if place has no children and does not contain search criteria, don't print it
        // if place does not contain search criteria, don't print content
        // so: meets search --> print everything, regardless of children (children decide whether they print or not, basically always assume that the children know what they are doing)
        // does not meet search but has children --> print name and children only
        // does not meet search and no children --> print nothing
        // name prints with search or children
        // content and tags print with search only
        // children print always
        // TODO need better testing setup for search ... maybe do that after fixing this function
        // oh and TODO would be cool if the city/country etc names got stickied while scorlling
        let search;
        if (!('taglist' in place)) search = false;
        else search = place.taglist.some((element) => {
            console.log(element);
            console.log(displaytaglist.includes(element));
            return displaytaglist.includes(element);
        });
        search = search || displaytaglist.length === 0;
        console.log(place.name + " " + search);
        if (search || 'child' in place) container.innerHTML += "<h3>" + place.name + "</h3>";
        if (search) {
            if ('taglist' in place) {
                container.innerHTML += "Tags: "
                for (tag of place.taglist) {
                    container.innerHTML += "<span class=\"tag\">" + tag + "</span>";
                    if (tag !== place.taglist.at(-1)) container.innerHTML += ", ";
                }
            }
            container.innerHTML += "<p>" + place.content + "</p>";
        }
        if ('child' in place){
            container.innerHTML += "<div class=\"travel-children\" id=\""+place.name+"\"></div>";
            printPlaceList(place.child, document.getElementById(place.name));
        }
    }
    function printPlaceList(list, container){
        list.sort((a,b) => {
            const nameA = a.name.toUpperCase();
            const nameB = b.name.toUpperCase();
            if (nameA < nameB) return -1;
            if (nameA > nameB) return  1;
            return 0;
        });
        for (const item of list){
            printPlace(item, container);
        }
    }
    clearPlaceList();
    console.log(rootlist);
    printPlaceList(rootlist, mydiv);
    if (orphanlist.length !== 0){
        mydiv.innerHTML += "<h2>orphans</h2>"
        printPlaceList(orphanlist, mydiv)
    }
}

function clearPlaceList() {
    const mydiv = document.getElementById("logs");
    mydiv.innerHTML = "";
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
