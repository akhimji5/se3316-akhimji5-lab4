const searchField = document.getElementById('searchField');
const searchCategory = document.getElementById('searchCategory');
const searchAmt = document.getElementById('n')
const searchButton = document.getElementById('searchButton');
const clearButton = document.getElementById('clearButton');
const clearButton2 = document.getElementById('clearButton2');
const searchResults = document.getElementById('searchResults');

const newList = document.getElementById('newList');
const createListButton = document.getElementById('createListButton');
const listNames = document.getElementById('listNames');

const listSelect = document.getElementById('listSelect');
const getListButton = document.getElementById('getListButton');
const deleteListButton = document.getElementById('deleteListButton');

const sortCategory = document.getElementById('sortCategory');
const sortButton = document.getElementById('sortButton');

const searchResultsDiv = document.getElementById('searchResultsDiv');

const superheroSelect = document.getElementById('superheroAdd');
const listSelectForAdd = document.getElementById('listSelectForAdd');
const addSuperheroButton = document.getElementById('addSuperheroButton');

var searchResultsArray = []

searchResultsDiv.style.display = "none";

// Function to display results in an element
function displayResults(element, data) {
    element.innerHTML = '';

    if (data.length === 0) {
        element.innerHTML = '<p>No superheroes found.</p>';
        return;
    }

    data.forEach(superhero => {
        const superheroListElement = document.createElement('li');
        const superheroDiv = document.createElement('div');
        superheroDiv.classList.add('superhero-info');
        superheroDiv.innerHTML = `
            ID: ${superhero.id}<br>
            Name: ${superhero.name}<br>
            Gender: ${superhero.Gender}<br> 
            Eye color: ${superhero['Eye color']}<br>
            Race: ${superhero.Race}<br>
            Hair color: ${superhero['Hair color']}<br>
            Height: ${Array.isArray(superhero.Height) ? superhero.Height.join('/') : superhero.Height}<br>
            Publisher: ${superhero.Publisher}<br>
            Skin color: ${superhero['Skin color']}<br>
            Alignment: ${superhero.Alignment}<br> 
            Weight: ${Array.isArray(superhero.Weight) ? superhero.Weight.join('/') : superhero.Weight}<br> 
            Powers: ${Array.isArray(superhero.powers) ? superhero.powers.join(', ') : superhero.powers}<br>
        `;
        superheroListElement.appendChild(superheroDiv)
        element.appendChild(superheroListElement);
    });
}

// Search Superheroes
searchButton.addEventListener('click', () => {
    searchResultsArray = []
    const field = searchCategory.value;
    const keyword = searchField.value;
    const n = searchAmt.value;
    fetch(`/search?field=${field}&keyword=${keyword}&n=${n}`)
        .then(response => response.json())
        .then(ids => {
            const fetchPromises = ids.map(id => {
                const superheroPromise = fetch(`/superhero/${id}`).then(response => response.json());
                const powersPromise = fetch(`/superhero/${id}/powers`).then(response => response.json());
                
                return Promise.all([superheroPromise, powersPromise])
                    .then(data => {
                        const [superhero, powers] = data;
                        superhero.powers = powers; 
                        return superhero;
                    });
            });
            return Promise.all(fetchPromises);
        })
        .then(data => {
            searchResultsArray = data
            displayResults(searchResults, data);
            searchResultsDiv.style.display = "block";
        })
        .catch(error => console.error(error));
});

// Create a Favorite List
createListButton.addEventListener("click", () => {
    const listName = newList.value;

    if (!listName) {
        alert("List name is required");
        return;
    }

    fetch('/lists', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ listName }),
    })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            updateListsSelect(listSelect);
            updateListsSelect(listSelectForAdd)
            newList.innerHTML = '';
        })
        .catch(error => {
            console.error('Error:', error);
        });
});

// Add an event listener to the select element
listSelect.addEventListener("change", function () {
    // Check if the selected option has the "Select a List" value
    if (listSelect.value === "" || searchResults.childElementCount === 0) {
        searchResultsDiv.style.display = "none";
    } else {
        searchResultsDiv.style.display = "block";
    }
});

addSuperheroButton.addEventListener('click', () => {
    const selectedSuperheroId = superheroSelect.value;
    const selectedListName = listSelectForAdd.value;

    if (!selectedSuperheroId || !selectedListName) {
        alert('Please select a superhero and a list');
        return;
    }

    // Send a request to your server to add the superhero to the list
    fetch(`/lists/${selectedListName}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ superheroIds: [parseInt(selectedSuperheroId)] }),
    })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
        })
        .catch(error => {
            console.error('Error:', error);
        });
});

// Retrieve Lists
getListButton.addEventListener("click", () => {
    searchResultsArray = []
    const selectedList = listSelect.value;
    if (!selectedList) {
        alert("Please select a list");
        return;
    }

    fetch(`/lists/${selectedList}/superheroes/info`)
        .then(response => response.json())
        .then(data => {
            searchResults.innerHTML = '';

            if (data.length === 0) {
                searchResults.innerHTML = '<p>No superheroes found.</p>';
                return;
            }

            data.forEach(superhero => {
                searchResultsArray.push(superhero)
                const superheroListElement = document.createElement('li');
                const superheroDiv = document.createElement('div');
                superheroDiv.classList.add('superhero-info');
                superheroDiv.innerHTML = `
            ID: ${superhero.id}<br>
            Name: ${superhero.name}<br>
            Gender: ${superhero.Gender}<br> 
            Eye color: ${superhero['Eye color']}<br>
            Race: ${superhero.Race}<br>
            Hair color: ${superhero['Hair color']}<br>
            Height: ${Array.isArray(superhero.Height) ? superhero.Height.join('/') : superhero.Height}<br>
            Publisher: ${superhero.Publisher}<br>
            Skin color: ${superhero['Skin color']}<br>
            Alignment: ${superhero.Alignment}<br> 
            Weight: ${Array.isArray(superhero.Weight) ? superhero.Weight.join('/') : superhero.Weight}<br> 
            Powers: ${Array.isArray(superhero.powers) ? superhero.powers.join(', ') : superhero.powers}<br>
        `;
                superheroListElement.appendChild(superheroDiv);
                searchResults.appendChild(superheroListElement)
            });
        });
    searchResultsDiv.style.display = "block";
});

// Delete a List
deleteListButton.addEventListener("click", () => {
    searchResultsArray = []
    const selectedList = listSelect.value;
    if (!selectedList) {
        alert("Please select a list to delete");
        return;
    }

    fetch(`/lists/${selectedList}`, {
        method: "DELETE",
    })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            updateListsSelect(listSelect);
            updateListsSelect(listSelectForAdd)
            searchResults.innerHTML = '';
            searchResultsDiv.style.display = "none";
        });
});

// Update the lists dropdown
updateListsSelect(listSelect);
updateListsSelect(listSelectForAdd)

function updateListsSelect(select) {
    // Fetch the available lists from the backend
    fetch("/lists")
        .then(response => response.json())
        .then(data => {
            select.innerHTML = `<option value="" disabled selected>Select a List</option>`;
            for (const listName in data) {
                if (Array.isArray(data[listName])) {
                    const option = document.createElement("option");
                    option.value = listName;
                    option.text = listName;
                    select.appendChild(option);
                }
            }
        })
        .catch(error => {
            console.error('Error: ', error);
        });
}


// Clear Search Results
clearButton.addEventListener('click', () => {
    searchResults.innerHTML = '';
    searchResultsDiv.style.display = "none";
});

// Clear Search Results
clearButton2.addEventListener('click', () => {
    searchResults.innerHTML = '';
    searchResultsDiv.style.display = "none";
});

// Sort Data
sortButton.addEventListener('click', () => {
    const sortCategoryValue = sortCategory.value;
    if (sortCategoryValue === 'power') {
        searchResultsArray.sort((a, b) => {
            const numPowersA = a.powers ? a.powers.length : 0;
            const numPowersB = b.powers ? b.powers.length : 0;
            return numPowersB - numPowersA;
        });
    }
    else{
        searchResultsArray.sort((a, b) => {
            const fieldA = a[sortCategoryValue].toString().toLowerCase();
            const fieldB = b[sortCategoryValue].toString().toLowerCase();
            return fieldA.localeCompare(fieldB);
        });
    }
    // Display the sorted data
    displayResults(searchResults, searchResultsArray);
    searchResultsDiv.style.display = "block";
});