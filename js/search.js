let baseUrl = "https://frontend-take-home-service.fetch.com";

let sortDirection = "asc";  // Default sorting order is ascending
let breed = "";  
let nextUrl = null; // Store the next page URL
let prevUrl = null; // Store the previous page URL
let favorites = [];

// Run this code when the DOM is fully loaded

document.addEventListener("DOMContentLoaded", async () => {
    await fetchBreeds();
    document.getElementById("searchBtn").addEventListener("click", fetchDogs);
    document.getElementById("nextBtn").addEventListener("click", fetchNextPage); 
    document.getElementById("prevBtn").addEventListener("click", fetchPrevPage); 
    fetchDogs();
});

// Fetches the list of available dog breeds from the API

async function fetchBreeds() {
    try {
        const response = await fetch(`${baseUrl}/dogs/breeds`, { credentials: "include" });
        const breeds = await response.json();
        const breedFilter = document.getElementById("breedFilter");
        breeds.forEach(breed => {
            let option = document.createElement("option");
            option.value = breed;
            option.textContent = breed;
            breedFilter.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching breeds:", error);
    }
}
// Fetches the list of dogs based on selected breed and sorting order

async function fetchDogs() {
    const breed = document.getElementById("breedFilter").value;
    let url = `${baseUrl}/dogs/search?size=100`;
    if (breed) url += `&breeds=${encodeURIComponent(breed)}`;
    url += `&sort=name:${sortDirection}`;  
    try {
        const response = await fetch(url, { credentials: "include" });
        const data = await response.json();
        nextUrl = data.next ? `${baseUrl}` + data.next : null;
        prevUrl = data.prev ? `${baseUrl}` + data.prev : null;

        displayDogs(data.resultIds);
        updatePaginationButtons();

    } catch (error) {
        console.error("Error fetching dogs:", error);
    }
}
//  Fetches dog details using dog IDs and displays them on the page.

async function displayDogs(dogIds) {
    const response = await fetch(`${baseUrl}/dogs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dogIds),
        credentials: "include"
    });
    const dogs = await response.json();
    const resultsDiv = document.getElementById("dogResults");
    resultsDiv.innerHTML = "";

    dogs.forEach(dog => {
        const isFavorited = favorites.includes(dog.id);
        const dogCard = `
            <div class="col-xxl-3 col-lg-3 col-md-4 col-sm-6 mb-4">
                <div class="card dog-card">
                    <img src="${dog.img}" class="card-img-top dog-image" alt="${dog.name}">
                    <div class="card-body">
                        <h5 class="card-title">${dog.name}</h5>
                        <p class="card-text" >Breed: ${dog.breed}</p>
                        <p class="card-text" >Age: ${dog.age}</p>
                        <p class="card-text" >Zip Code: ${dog.zip_code}</p>
                        <button onclick="addToFavorites('${dog.id}')">
                          ${isFavorited ? "✅ Favorited" : "❤️ Favorite"}
                        </button>
                    </div>
                </div>
            </div>
        `;
        resultsDiv.innerHTML += dogCard;
    });
}

function updatePaginationButtons() {
    // Enable/Disable pagination buttons based on the availability of next/prev URLs
    document.getElementById("nextBtn").disabled = !nextUrl;
    document.getElementById("prevBtn").disabled = !prevUrl;
}

//  Fetches the next page and previous page of dogs

async function fetchNextPage() {
    if (nextUrl) {
        const response = await fetch(nextUrl, { credentials: "include" });
        const data = await response.json();
        
        nextUrl = data.next ? `${baseUrl}` + data.next : null;
        prevUrl = data.prev ? `${baseUrl}` + data.prev : null;

        displayDogs(data.resultIds);
        updatePaginationButtons();
    }
}

async function fetchPrevPage() {
    if (prevUrl) {
        const response = await fetch(prevUrl, { credentials: "include" });
        const data = await response.json();
        
        nextUrl = data.next ? `${baseUrl}` + data.next : null;
        prevUrl = data.prev ? `${baseUrl}` + data.prev : null;

        displayDogs(data.resultIds);
        updatePaginationButtons();
    }
}

// Adds or removes a dog from the favorites list and updates the button text

function addToFavorites(dogId) {
    const button = document.querySelector(`button[onclick="addToFavorites('${dogId}')"]`);

    if (!favorites.includes(dogId)) {
        favorites.push(dogId);
        button.textContent = "✅ Favorited";
    }
    else {
        const dogIndex = favorites.indexOf(dogId);
        favorites.splice(dogIndex,1);
        button.textContent = "❤️ Favorite";
    }

    console.log("Current Favorites:", favorites);
}

// Finds the best matching dog based on the user's favorite dogs

async function findMatch() {
    console.log(favorites);
    if (favorites.length === 0) {
        alert("No favorite dogs selected!");
        return;
    }

    const response = await fetch(`${baseUrl}/dogs/match`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(favorites)
    });

    const match = await response.json();
    const dogMatch = match.match;
    displayMatch(dogMatch);
}

//  Displays the matched dog on the UI

 async function displayMatch(dogMatch){
    const response1 = await fetch(`${baseUrl}/dogs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([dogMatch]),
        credentials: "include"
    });
    const matchDog = await response1.json();
    console.log(matchDog);
    const matchDiv = document.getElementById("matchResult");
    
    matchDiv.innerHTML = `
             <div class="col-xxl-12 mb-4">
                <div class="card dog-card">
                    <img src="${matchDog[0].img}" class="card-img-top dog-image" alt="${matchDog[0].name}">
                    <div class="card-body">
                        <h5 class="card-title">${matchDog[0].name}</h5>
                        <p class="card-text" >Breed: ${matchDog[0].breed}</p>
                        <p class="card-text" >Age: ${matchDog[0].age}</p>
                        <p class="card-text" >Zip Code: ${matchDog[0].zip_code}</p>
                    </div>
                </div>
            </div>
    `;
 }

// Event listener for sorting toggle button

document.getElementById("sortToggle").addEventListener("click", () => {
    sortDirection = sortDirection === "asc" ? "desc" : "asc";  // Toggle sorting
    document.getElementById("sortToggle").textContent = `Sort: ${sortDirection === "asc" ? "Ascending" : "Descending"}`;
    fetchDogs(); // Reload results with new sorting order
});


//   Logs out the user and redirects to the login page.
 
function logout() {
    fetch(`${baseUrl}/auth/logout`, { method: "POST", credentials: "include" })
        .then(() => {
            window.location.href = "index.html";
        })
        .catch(error => console.error("Error logging out:", error));
}