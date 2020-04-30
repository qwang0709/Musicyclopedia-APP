//prompt to authorize the spotify app
function authorizeSpotify()
{
    //link sends the user to the spotify authorization page. A url will be sent back that contains the access code in the hash.
     //you need to fill in the url yourself. look at the client_id=xxxxx and the redirect_uri=xxxx and the response_type=xxxx and state=xxx
    var client_id = "client_id=eea8321304c646a3be34c3943f70a94f";
    var redirect_uri = "redirect_uri=http://people.tamu.edu/~jasongilman/";
    var response_type = "response_type=token";
    var state = "state=123";
    location.href = "https://accounts.spotify.com/authorize?" + client_id + "&" + redirect_uri + "&" + response_type + "&" + state;
    
    //everytime you try to sign in to spotify, refresh the access_token
    sessionStorage.accessTokenSpotify = "";
}

//prompt to authorize genuis app
function authorizeGenius()
{
    var client_id = "client_id=DauEulZXLojdyG8l6CJV4w8EB0W2Q0OJXSRyhMWmG5GxuInX2O887dRdPXgYzUkN";
    var redirect_uri = "redirect_uri=http://people.tamu.edu/~jasongilman/";
    var scope = "scope=";
    var state = "state=123";
    var response_type = "response_type=token";
    location.href = "https://api.genius.com/oauth/authorize?" + client_id + "&" + redirect_uri + "&" + scope + "&" + state + "&" + response_type;

    //everytime you try to sign into genius, refresh the access_token
    sessionStorage.accessTokenGenius = "";
}

//checks to see if there already is an access_token saved. if not then it will capture one from the url.
function captureToken_spotify()
{
    if(sessionStorage.accessTokenSpotify == "")
    {
        if(location.search.substring(1,6) != "error")
        {
            var hash = location.hash.substring(1);
            var accessString = hash.indexOf("&");
            var at = hash.substring(13, accessString);
            var d = new Date();
            sessionStorage.spotify_expires_at = d.getTime() + 3600000;
            sessionStorage.accessTokenSpotify = at;
        }
    }
}

//check to see if there already is an access_token save. if not it will capture one from the url.
function captureToken_genius()
{
    if(sessionStorage.accessTokenGenius == "")
    {
        if(location.hash.substring(1, 6) != "error")
        {
            var hash = location.hash.substring(1);
            var accessString = hash.indexOf("&");
            var at = hash.substring(13, accessString);
            sessionStorage.accessTokenGenius = at;
        }
    }
}

//checks if the spotify access token is still active
function checkToken()
{
    var d = new Date();
    if(sessionStorage.spotify_expires_at < d.getTime())
    {
        $("#myModal_2").modal("show");
    }
}

//searches the spotify api to fill results.html
function searchSpotify()
{
    //pull the access_tokens and searchString from storage
    var access_tokenSpotify = sessionStorage.accessTokenSpotify;
    var searchString = sessionStorage.searchString;

    //get the element of the table on the result page
    const resultTable = document.getElementById("resultTable");

    //structure the request to the spotify api
    var req = new XMLHttpRequest();
    req.open("GET", "https://api.spotify.com/v1/search?q=" + searchString + "&type=artist,track,album&limit=15", true);
    req.setRequestHeader("Authorization", "Bearer " + access_tokenSpotify);
    req.onload = function() {

        if(req.status>=200 && req.status<400)
        {
            //get the JSON file that was returned from spotify api
            var data = JSON.parse(this.response);
            
            //get the artists and add them to the result listing
            if(data.artists.items.length > 0)
            {
                var i;
                for(i=0;i<1;i++)
                {
                    //set up row and cell elements
                    const tempRow = document.createElement('tr');
                    const tempType = document.createElement('td');
                    const tempName = document.createElement('td');
                    const temp = document.createElement('td');
                    tempRow.setAttribute("id", data.artists.items[i].id + "&noa_id&noa_name");
                    tempRow.setAttribute("onclick", "document.location.href='artistData.html#' + this.id");
                    tempType.textContent = "Artist";
                    tempName.textContent = data.artists.items[i].name;
                    tempName.setAttribute("id", "artistName");
                    resultTable.appendChild(tempRow);
                    tempRow.appendChild(tempType);
                    tempRow.appendChild(tempName);
                    tempRow.appendChild(temp);
                }
            }
            

            //get the album and add them to the result listing
            if(data.albums.items.length > 0)
            {
                for(i=0;i<5;i++)
                {
                    const tempRow = document.createElement('tr');
                    const tempType = document.createElement('td');
                    const tempName = document.createElement('td');
                    const tempArtist = document.createElement('td');
                
                    if(data.albums.items[i].album_type == "single")
                        tempType.textContent = "Single";
                    else if(data.albums.items[i].album_type == "album")
                        tempType.textContent = "Album";
                    else
                        tempType.textContent = "Compilation";

                    tempRow.setAttribute("id", data.albums.items[i].artists[0].id + "&" + data.albums.items[i].id + "&" + data.albums.items[i].name);
                    tempRow.setAttribute("onclick", "document.location.href='artistData.html#' + this.id");
                    tempName.textContent = data.albums.items[i].name;
                    tempArtist.textContent = "by " + data.albums.items[i].artists[0].name;

                    resultTable.appendChild(tempRow);
                    tempRow.appendChild(tempType);
                    tempRow.appendChild(tempName);
                    tempRow.appendChild(tempArtist);
                }
            }

            //get the songs and add them to the result listing
            if(data.tracks.items.length > 0)
            {
                for(i=0;i<5;i++)
                {
                    const tempRow = document.createElement('tr');
                    const tempType = document.createElement('td');
                    const tempName = document.createElement('td');
                    const tempArtist = document.createElement('td');
                    tempRow.setAttribute("id", data.tracks.items[i].id);
                    tempRow.setAttribute("onclick", "document.location.href='songData.html#' + this.id");
                    tempType.textContent = "Song";
                    tempName.textContent = data.tracks.items[i].name;
                    tempArtist.textContent = "by " + data.tracks.items[i].album.artists[0].name;

                    resultTable.appendChild(tempRow);
                    tempRow.appendChild(tempType);
                    tempRow.appendChild(tempName);
                    tempRow.appendChild(tempArtist);
                }
            }

        }
    }
    req.send();
}

//searches the genius api to fill results.html
function searchGenius()
{
    var searchString = sessionStorage.searchString;
    var access_tokenGenius = sessionStorage.accessTokenGenius;

    //get the element of the table on the result page
    const resultTable = document.getElementById("resultTable");

    //structure the request to the genuis api
    var req = new XMLHttpRequest();
    req.open("GET", "https://api.genius.com/search?q=" + searchString + "&access_token=" + access_tokenGenius, true);
    req.onload = function(){

        if(req.status>=200 && req.status<400)
        {
            //p.textContent = data.response.hits[0].result.full_title;
            
            //get the JSON file that was returned from spotify api
            var data = JSON.parse(this.response);

            //check if the response is a song, if it is then add it to the result page
            var i;
            for(i=0;i<10;i++)
            {
                if(data.response.hits[i].type == "song")
                {
                    const tempRow = document.createElement('tr');
                    const tempType = document.createElement('td');
                    const tempName = document.createElement('td');
                    const tempArtist = document.createElement('td');

                    tempRow.setAttribute("id", data.response.hits[i].result.id);
                    tempRow.setAttribute("onclick", "geniusToSpotify(this.id);");
                    tempType.textContent = "Song";
                    tempName.textContent = data.response.hits[i].result.title_with_featured;
                    tempArtist.textContent = "by " + data.response.hits[i].result.primary_artist.name;
                
                    resultTable.appendChild(tempRow);
                    tempRow.appendChild(tempType);
                    tempRow.appendChild(tempName);
                    tempRow.appendChild(tempArtist);
                }
            }
        }
    }
    req.send();
}

//show the initial results of the api searches on results.html
function showResults()
{
    //pull the access_tokens and searchString from storage
    var access_tokenSpotify = sessionStorage.accessTokenSpotify;
    var access_tokenGenius = sessionStorage.accessTokenGenius;
    var searchString = sessionStorage.searchString;

    var d = new Date();
    if(sessionStorage.spotify_expires_at <= d.getTime())
    {
        document.location.href = "index.html";
    }
    else
    {
        document.getElementById("searchResult").innerHTML = "Current Search: " + searchString;
        const thePanel = document.getElementById("panel");
        const div_table_responsive = document.createElement("div");
        div_table_responsive.setAttribute("class", "table-resonsive-sm");
        thePanel.appendChild(div_table_responsive);
        const table_table_hover = document.createElement("table");
        table_table_hover.setAttribute("class", "table table-hover table-bordered");
        div_table_responsive.appendChild(table_table_hover);
        const tbody = document.createElement("tbody");
        tbody.setAttribute("id", "resultTable");
        table_table_hover.appendChild(tbody);

        searchSpotify();
        searchGenius();
    }
}

//gets the basic information of the artist and displays it on the artistData.html
function artist_basic(artistId, access_tokenSpotify, access_tokenGenius)
{
    var name;

    //structure a request for the artist to spotify
    var req = new XMLHttpRequest();
    req.open("GET", "https://api.spotify.com/v1/artists/" + artistId , true);
    req.setRequestHeader("Authorization", "Bearer " + access_tokenSpotify);
    req.onload = function() {

        if(req.status>=200 && req.status<400)
        {
            //get the JSON file that was returned from spotify api
            var data = JSON.parse(this.response);
            
            //extract the data I want from the response
            name = data.name;
            var popularity = data.popularity;
            var followers = data.followers.total;
            var genres = data.genres;
            var image = {url:data.images[2].url, height:data.images[2].height, width:data.images[2].width};
        
            document.getElementById("artistLabel").innerHTML = name;
            document.getElementById("popularity").innerHTML = popularity + "%" + " Popular";
            document.getElementById("followers").innerHTML = "Followers: " + followers;
            const picArea = document.getElementById("nameArea");
            const a_img = document.createElement("img");
            a_img.setAttribute("class", "img-circle");
            a_img.setAttribute("src", image.url);
            a_img.setAttribute("height", (image.height)*1.25);
            a_img.setAttribute("width", (image.width)*1.25);
            picArea.appendChild(a_img);
            const tagArea = document.getElementById("artistTags");
            var i;
            var limit = genres.length;
            if(limit > 0)
            {
                for(i=0;i<limit;i++)
                {
                    if(i == 0)
                        tagArea.textContent = genres[i];
                    else
                        tagArea.textContent += ", " + genres[i];
                }
            }
            else
                tagArea.textContent = "New Artist";

            //structure request for the artist to genius
            var req_2 = new XMLHttpRequest();
            req_2.open("GET", "https://api.genius.com/search?q=" + name + "&access_token=" + access_tokenGenius, true);
            req_2.onload = function() {

                if(req.status>=200 && req.status<400)
                {
                    //get the JSON file that was returned from genius api
                    var data = JSON.parse(this.response);

                    //I only want the artist ID from this search
                    var a_id = data.response.hits[0].result.primary_artist.id;
                    sessionStorage.a_id = a_id;
                    
                    //with the artist ID structure a new api call to get info about the artist
                    var req_3 = new XMLHttpRequest();
                    req_3.open("GET", "https://api.genius.com/artists/" + a_id + "?access_token=" + access_tokenGenius, true);
                    req_3.onload = function() {

                        if(req_3.status>=200 && req_3.status<400)
                        {
                            var data = JSON.parse(this.response);

                            //get the area of the description box, and create the text element
                            const dCont = document.getElementById("descriptionArea");
                            const dArea = document.createElement("div");
                            dArea.setAttribute("class", "well well-lg");
                            dArea.setAttribute("style", "background-color:#292929;color:#ccc;margin-top:50px;");
                            dCont.appendChild(dArea);
                            const head = document.createElement("h2");
                            head.textContent = "Description";
                            dArea.appendChild(head);
                            var descriptionText = "";

                            //create recursive search and element creation
                            const iterate = (obj) => {
                                Object.keys(obj).forEach(key => {
                                    
                                    //do what you need to do witht the key value pair
                                    var val = obj[key];
                                    
                                    //if the key is a number and the value is not an object, capture the text
                                    if(!(isNaN(key)) && val!=="object" && val!="[object Object]")
                                    {
                                        if(val == "")
                                        {
                                            //add paragraph to html
                                            const newP = document.createElement('p');
                                            newP.textContent = descriptionText;
                                            dArea.appendChild(newP);

                                            //create new line
                                            const newLine = document.createElement('br');
                                            dArea.appendChild(newLine);

                                            //refresh paragraph
                                            descriptionText = "";
                                        }
                                        else 
                                            descriptionText += val;
                                    }

                                    if(typeof obj[key] === 'object')
                                    {
                                        iterate(obj[key]);
                                    }
                                })
                            }
                            //call recursive function on neccisary data
                            iterate(data.response.artist.description.dom.children);

                            //add last bit of text to the html bc "" was not hit
                            const newP = document.createElement('p');
                            const newLine = document.createElement('br');
                            if(descriptionText == "?")
                            {
                                dCont.innerHTML = "";
                            }
                            else
                            {
                                newP.textContent = descriptionText;
                                dArea.appendChild(newP);
                                dArea.appendChild(newLine);
                            }
                        }
                    }
                    req_3.send();
                }
            }
            req_2.send();
        }
    }
    req.send();
}

//gets the albums from an artistID, and displays them in a carousel on artistData.html
function artist_albums(artistId, access_tokenSpotify)
{
    //get the elements that need to be used to append child elements
    const myOD = document.getElementById("myOD");
    const myIN = document.getElementById("myIN");

    //structure a request for the artist
    var req = new XMLHttpRequest();
    req.open("GET", "https://api.spotify.com/v1/artists/" + artistId + "/albums?market=US&country=US&include_groups=album,single", true);
    req.setRequestHeader("Authorization", "Bearer " + access_tokenSpotify);
    req.onload = function() {

        if(req.status>=200 && req.status<400)
        {
            //get the JSON file that was returned from spotify api
            var data = JSON.parse(this.response);
            
            var a_name;
            var a_type;
            const albumIds = [];
            var image;
            var i;
            var limit = data.items.length;
            for(i=0;i<limit;i++)
            {
                //extract the data I want from the response
                albumId = data.items[i].id;
                image = {url:data.items[i].images[1].url, height:data.items[i].images[1].height, width:data.items[i].images[1].width};
                a_name = data.items[i].name;

                //setup carousel
                const myLi = document.createElement("li");
                myLi.setAttribute("data-target", "#carousel");
                myLi.setAttribute("data-slide-to", i);
                if(i == 0)
                    myLi.setAttribute("class", "active");
                myOD.appendChild(myLi);
                const myItem = document.createElement("div");
                if(i == 0)
                    myItem.setAttribute("class", "item active");
                else
                    myItem.setAttribute("class", "item");
                const myLink = document.createElement("a");

                myLink.setAttribute("id", artistId + "&" + albumId + "&" + a_name );
                //myLink.setAttribute("onclick", "document.getElementById('smaller').scrollIntoView(true);artist_album_tracks(this.id.substring(0,this.id.indexOf('&')), this.id.substring(this.id.indexOf('&')+1))");
                myLink.setAttribute("onclick", "document.location.href='artistData.html#' + this.id;loadArtist();document.getElementById('smaller').scrollIntoView(true);");
                myLink.setAttribute("data-toggle", "tooltip");
                myLink.setAttribute("title", "Show Songs");
                const myImage = document.createElement("img");
                myImage.setAttribute("src", image.url);
                myImage.setAttribute("height", (image.height)*.8);
                myImage.setAttribute("width", (image.width)*.8);
                myImage.setAttribute("class", "img-circle");
                myLink.appendChild(myImage);
                myItem.appendChild(myLink);
                myIN.appendChild(myItem);
            }
        }
    }
    req.send();
}

//show an albus tracks when clicked on the album cover
function artist_album_tracks(album_id, album_name)
{
    const smaller = document.getElementById("smaller");
    var access_tokenSpotify = sessionStorage.accessTokenSpotify;
    //delete all children elements
    smaller.innerHTML = "";

    if(album_name.indexOf("%20") != -1)
        album_name = album_name.replace(/%20/g, " "); 
    
    
    const albumHeading = document.createElement("h2");
    smaller.appendChild(albumHeading);
    const div_table_responsive = document.createElement("div");
    div_table_responsive.setAttribute("class", "table-resonsive-sm");
    smaller.appendChild(div_table_responsive);
    const table_table_hover = document.createElement("table");
    table_table_hover.setAttribute("class", "table table-hover");
    div_table_responsive.appendChild(table_table_hover);
    const tbody = document.createElement("tbody");
    tbody.setAttribute("id", "resultTable");
    table_table_hover.appendChild(tbody);

    //structure request to get album from id to get data from album
    var req_2 = new XMLHttpRequest();
    req_2.open("GET", "https://api.spotify.com/v1/albums/" + album_id);
    req_2.setRequestHeader("Authorization", "Bearer " + access_tokenSpotify);
    req_2.onload = function() {

        if(req_2.status>=200 && req_2.status<400)
        {
            var data = JSON.parse(this.response);

            //create album name
            const albumHeading = document.createElement("h2");
            albumHeading.textContent = album_name;
            smaller.appendChild(albumHeading);

            //create album pic
            const myImage = document.createElement("img");
            myImage.setAttribute("src", data.images[1].url);
            myImage.setAttribute("height", (data.images[1].height)*.8);
            myImage.setAttribute("width", (data.images[1].width)*.8);
            myImage.setAttribute("class", "img-circle");
            myImage.setAttribute("style", "margin-top:30px;")
            smaller.appendChild(myImage);

            //I have the albumId now strucutre the request to get the tracks from it
            var req = new XMLHttpRequest();
            req.open("GET", "https://api.spotify.com/v1/albums/" + album_id + "/tracks?limit=50", true);
            req.setRequestHeader("Authorization", "Bearer " + access_tokenSpotify);
            req.onload = function() {

                if(req.status>=200 && req.status<400)
                {
                    var data = JSON.parse(this.response);

                    //set album name
                    const div_table_responsive = document.createElement("div");
                    div_table_responsive.setAttribute("class", "table-resonsive-sm");
                    div_table_responsive.setAttribute("style", "margin-top:30px;")
                    smaller.appendChild(div_table_responsive);
                    const table_table_hover = document.createElement("table");
                    table_table_hover.setAttribute("class", "table table-hover table-bordered");
                    table_table_hover.setAttribute("style", "background-color:#292929;color:#ccc;")
                    div_table_responsive.appendChild(table_table_hover);
                    const tbody = document.createElement("tbody");
                    tbody.setAttribute("id", "resultTable");
                    table_table_hover.appendChild(tbody);

                    //loop through and extract data for each song, add it to the table
                    var i;
                    var limit = data.items.length;
                    for(i=0;i<limit;i++)
                    {
                        const tempRow = document.createElement('tr');
                        const tempNum = document.createElement('td');
                        const tempName = document.createElement('td');
                        tempRow.setAttribute("id", data.items[i].id);
                        tempRow.setAttribute("onclick", "document.location.href='songData.html#' + this.id");
                        tempNum.textContent = i+1;
                        tempName.textContent = data.items[i].name;
                        tbody.appendChild(tempRow);
                        tempRow.appendChild(tempNum);
                        tempRow.appendChild(tempName);
                    }
                }
            }
            req.send();
        }
    }
    req_2.send();
}

//gets the top songs from an artistID, and displays them in a table on artistData.hmtl
function artist_top_songs(artistId, access_tokenSpotify)
{
    //get the elements that need to be used to append child elements and setup the table
    const area = document.getElementById("topSongArea");
    const header = document.createElement("h3");
    header.textContent = "Top Songs";
    area.appendChild(header);
    const div_table_responsive = document.createElement("div");
    div_table_responsive.setAttribute("class", "table-resonsive-sm");
    area.appendChild(div_table_responsive);
    const table_table_hover = document.createElement("table");
    table_table_hover.setAttribute("class", "table table-hover");
    div_table_responsive.appendChild(table_table_hover);
    const tbody = document.createElement("tbody");
    tbody.setAttribute("id", "resultTable");
    table_table_hover.appendChild(tbody);

    //structure a request for the artist
    var req = new XMLHttpRequest();
    req.open("GET", "https://api.spotify.com/v1/artists/" + artistId + "/top-tracks?country=US", true);
    req.setRequestHeader("Authorization", "Bearer " + access_tokenSpotify);
    req.onload = function() {

        if(req.status>=200 && req.status<400)
        {
            //get the JSON file that was returned from spotify api
            var data = JSON.parse(this.response);

            var name;
            var songId;
            var i;
            var limit = data.tracks.length;
            if(limit>5)
                limit = 5;                
            for(i=0;i<limit;i++)
            {
                //fetch my desired variables from the returned JSON
                name = data.tracks[i].name;
                songId = data.tracks[i].id;
                
                //setup table elements
                const tempRow = document.createElement("tr");
                const tempNum = document.createElement("td");
                const tempName = document.createElement("td");
                tempRow.setAttribute("id", songId);
                tempRow.setAttribute("onclick", "document.location.href='songData.html#' + this.id");
                tempNum.textContent = i+1;
                tempName.textContent = name;
                tbody.appendChild(tempRow);
                tempRow.appendChild(tempNum);
                tempRow.appendChild(tempName);
            }
        }
    }
    req.send();
}

//set up the artistData page by calling several functions
function loadArtist()
{
    var d = new Date();
    if(sessionStorage.spotify_expires_at < d.getTime())
    {
        document.location.href = "index.html";
    }
    else
    {
        //remove all java script stuff from the page
        document.getElementById("artistLabel").innerHTML = "";
        document.getElementById("nameArea").innerHTML = "";
        document.getElementById("artistTags").innerHTML = "";
        document.getElementById("popularity").innerHTML = "";
        document.getElementById("followers").innerHTML = "";
        document.getElementById("myOD").innerHTML = "";
        document.getElementById("myIN").innerHTML = "";
        document.getElementById("topSongArea").innerHTML = "";
        document.getElementById("descriptionArea").innerHTML = "";

        //load artist ID and or the album id from hash, then pass into these functions
        var artistId = location.hash.substring(1,location.hash.indexOf("&"));
        var albumId = location.hash.substring(location.hash.indexOf("&")+1, location.hash.indexOf("&", location.hash.indexOf("&")+1));
        var albumName = location.hash.substring(location.hash.indexOf("&",location.hash.indexOf("&")+1)+1);
        var access_tokenSpotify = sessionStorage.accessTokenSpotify;
        var access_tokenGenius = sessionStorage.accessTokenGenius;

        artist_basic(artistId, access_tokenSpotify, access_tokenGenius);
        artist_albums(artistId, access_tokenSpotify);
        artist_top_songs(artistId, access_tokenSpotify);
        if(albumId != "noa_id")
            artist_album_tracks(albumId, albumName);
    }   
}

//transfers the genius searched songid to a spotify song id
function geniusToSpotify(geniusSongId)
{
    var access_tokenGenius = sessionStorage.accessTokenGenius;
    var access_tokenSpotify = sessionStorage.accessTokenSpotify;

    var req = new XMLHttpRequest();
    req.open("GET", "https://api.genius.com/songs/" + geniusSongId + "?access_token=" + access_tokenGenius);
    req.onload = function() {

        if(req.status>=200 && req.status<400)
        {
            var data = JSON.parse(this.response);

            var searchString = data.response.song.title + ", " + data.response.song.primary_artist.name;
            if(data.response.song.album != null)
                searchString += ", " + data.response.song.album.name;

            var req2 = new XMLHttpRequest();
            req2.open("GET", "https://api.spotify.com/v1/search?q=" + searchString + "&type=track", true);
            req2.setRequestHeader("Authorization", "Bearer " + access_tokenSpotify);
            req2.onload = function() {

                if(req2.status>=200 && req2.status<400)
                {
                    var data = JSON.parse(this.response);
                    if(data.tracks.items == 0)
                    {
                        //handle not being able to click on this request
                        $("#myModal").modal("show");
                        
                    }
                    else
                    {
                        document.location.href = "songData.html#" + data.tracks.items[0].id;
                    }   
                }
            }
            req2.send();
        }
    }
    req.send();
}

//plot the desired data and put it on songData.html
function song_graph(songId, access_tokenSpotify)
{
    //structure request to spotify to get track features
    var req = new XMLHttpRequest();
    req.open("GET", "https://api.spotify.com/v1/audio-features/" + songId, true);
    req.setRequestHeader("Authorization", "Bearer " + access_tokenSpotify);
    req.onload = function() {

        if(req.status>=200 && req.status<400)
        {
            var data = JSON.parse(this.response);

            var valence = (data.valence)*100;
            var danceability = (data.danceability)*100;
            var energy = (data.energy)*100;
            var key = data.key;
            var tempo = data.tempo;

            switch(key)
            {
                case 0: key="C";
                        break;
                case 1: key="C#/Db";
                        break;
                case 2: key="D";
                        break;
                case 3: key="D#/Eb";
                        break;
                case 4: key="E";
                        break;
                case 5: key="F";
                        break;
                case 6: key="F#/Gb";
                        break;
                case 7: key="G";
                        break;
                case 8: key="G#/Ab";
                        break;
                case 9: key="A";
                        break;
                case 10: key="A#/Bb";
                        break;
                case 11: key="B";
                        break;
                case -1: key="Undetectable Key"
                        break;                  
            }

            document.getElementById("tempo").textContent = tempo + " BPM";
            document.getElementById("key").textContent = "In the key of " + key;

            const area_1 = document.getElementById("area_1");
            var ctx_1 = document.createElement("canvas");
            ctx_1.setAttribute("style", "margin-top:25px;height:200px;")
            area_1.appendChild(ctx_1);

            var myChart_1 = new Chart(ctx_1, {
                type: "doughnut",
                data: {
                    labels: ["Energetic", "Unenergetic"],
                    datasets: [{
                    label: "Acousticness",
                    data: [energy,100-energy],
                    backgroundColor: ["#BFDFDF", "#004040"],
                    borderColor: ["#BFDFDF", "#004040"],
                    borderWidth: 1
                    }]
                    },
                    options: {
                        legend: {
                            display: true,
                            labels: {
                                fontColor: "#292929",
                                fontSize: 15
                            }
                        }
                    }
            });

            const area_2 = document.getElementById("area_2");
            var ctx_2 = document.createElement("canvas");
            ctx_2.setAttribute("style", "margin-top:75px;height:200px;")
            area_2.appendChild(ctx_2);

            var myChart_2 = new Chart(ctx_2, {
                type: "doughnut",
                data: {
                    labels: ["Danceability", "Non-Dancability"],
                    datasets: [{
                    label: "Acousticness",
                    data: [danceability,100-danceability],
                    backgroundColor: ["#BFDFDF", "#004040"],
                    borderColor: ["#BFDFDF", "#004040"],
                    borderWidth: 1
                    }]
                    },
                    options: {
                        legend: {
                            display: true,
                            labels: {
                                fontColor: "#292929",
                                fontSize: 15
                            }
                        }
                    }
            });

            const area_3 = document.getElementById("area_3");
            var ctx_3 = document.createElement("canvas");
            ctx_3.setAttribute("style", "margin-top:75px;margin-bottom:50px;height:200px;")
            area_3.appendChild(ctx_3);

            var myChart_3 = new Chart(ctx_3, {
                type: "doughnut",
                data: {
                    labels: ["Postitive Vibe", "Negative Vibe"],
                    datasets: [{
                    label: "Acousticness",
                    data: [valence,100-valence],
                    backgroundColor: ["#BFDFDF", "#004040"],
                    borderColor: ["#BFDFDF", "#004040"],
                    borderWidth: 1
                    }]
                    },
                    options: {
                        legend: {
                            display: true,
                            labels: {
                                fontColor: "#292929",
                                fontSize: 15
                            }
                        }
                    }
            });
        }
    }
    req.send();


    
}

//put the basic song data on the songData.html page
function song_basic(songId, access_tokenSpotify)
{
    var req = new XMLHttpRequest();
    req.open("GET", "https://api.spotify.com/v1/tracks/" + songId);
    req.setRequestHeader("Authorization", "Bearer " + access_tokenSpotify);
    req.onload = function() {

        if(req.status>=200 && req.status<400)
        {
            var data = JSON.parse(this.response);

            var songLabel = data.name;
            var artistLabel = data.artists[0].name;
            var artistId = data.artists[0].id;
            var albumLabel = data.album.name;
            var albumId = data.album.id;
            var albumImg = data.album.images[1];
            var popularity = data.popularity;
            var duration = data.duration_ms;
            var duration_min = Math.floor(duration/60000);
            var duration_sec = ((duration%60000)/1000).toFixed(0);
            duration = (duration_sec == 60 ? (duration_min+1) + ":00" : duration_min + ":" + (duration_sec < 10 ? "0" : "") + duration_sec);

            searchYoutube(songLabel, artistLabel);

            document.getElementById("songLabel").textContent = songLabel;
            document.getElementById("artistLabel").textContent = "by " + artistLabel;

            document.getElementById("popularity").textContent = popularity + "% Popular";
            document.getElementById("duration").textContent = "Duration: " + duration;

            const myLink = document.createElement("a")
            myLink.setAttribute("id", artistId + "&" + albumId + "&" + albumLabel);
            myLink.setAttribute("onclick", "document.location.href='artistData.html#' + this.id");
            myLink.setAttribute("data-toggle", "tooltip");
            myLink.setAttribute("title", "Show Album");
            myLink.setAttribute("style", "cursor:pointer;text-decoration:none;color:#292929;");
            const a_img = document.createElement("img");
            const myDiv = document.createElement("div");
            myDiv.setAttribute("style", "display:flex;justify-content:center;");
            a_img.setAttribute("src", albumImg.url);
            a_img.setAttribute("height", (albumImg.height)*.8);
            a_img.setAttribute("width", (albumImg.width)*.8);
            a_img.setAttribute("class", "img-circle");
            myDiv.appendChild(a_img);
            myLink.appendChild(myDiv);
            document.getElementById("col2").appendChild(myLink);
            const a_label = document.createElement("h2");
            a_label.setAttribute("style", "display:flex;justify-content:center;");
            a_label.textContent = albumLabel;
            myLink.appendChild(a_label);
            document.getElementById("col2").appendChild(myLink);
        }
    }
    req.send();
}

//setup the songData page
function loadSong()
{
    var d = new Date();
    if(sessionStorage.spotify_expires_at < d.getTime())
    {
        document.location.href = "index.html";
    }
    else
    {
        //fetch songId and access_token
        var songId = location.hash.substring(1);
        var access_tokenSpotify = sessionStorage.accessTokenSpotify;

        //fill in basic info, song data, video, and graphs
        song_graph(songId, access_tokenSpotify);
        song_basic(songId, access_tokenSpotify);

        //embed a song player
        const songPlayer = document.getElementById("songPlayer");
        songPlayer.setAttribute("src","https://open.spotify.com/embed/track/" + songId);
        songPlayer.setAttribute("style", "height:52%;width:95%;")
        songPlayer.setAttribute("frameborder", "0");
        songPlayer.setAttribute("allowtransparency", "true");
        songPlayer.setAttribute("allow", "encrypted-media");
    }
}

//searches youtube for the video to go along with the song
function searchYoutube(songName, artistName)
{
    var part = "part=snippet";
    var order = "order=relevance";
    var q = "q=" + songName + " " + artistName + " Music Video";
    var type = "type=video";
    var videoEmbeddable = "videoEmbeddable=true";
    var api_key = "key=AIzaSyB5-2e31PdG_3MJ9SHHT5F4WgWIQ-BK-h0";

    var req = new XMLHttpRequest();
    req.open("GET", "https://www.googleapis.com/youtube/v3/search?" + part + "&" + order + "&" + q + "&" + type + "&" + videoEmbeddable + "&" + api_key);
    req.onload = function(){

        if(req.status>=200 && req.status<400)
        {
            var data = JSON.parse(this.response);
            var youtubeVid = data.items[0].id.videoId;
            document.getElementById("vid").src = "https://www.youtube.com/embed/" + youtubeVid;
        }
    }
    req.send();
}
