// Define constants for the API key and the base URLs for the weather and geocoding APIs.
const apiKey = '9368ef969e8fe6501846dd717301c964';
const weatherBaseUrl = 'https://api.openweathermap.org/data/2.5/forecast';
const geocodingBaseUrl = 'https://api.openweathermap.org/geo/1.0/direct';

// Function to get the latitude and longitude for a given city name.
async function getCoordinatesForCity(cityName) {
    const url = `${geocodingBaseUrl}?q=${cityName}&limit=1&appid=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    return data[0];
}

// Function to get weather data for given coordinates.
async function getWeatherForCoordinates(lat, lon) {
    const url = `${weatherBaseUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`; // Using imperial units as an example.
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

// Helper function to create and append elements
function createElementWithContent(tagName, content, parentElement, classNames) {
    const elem = document.createElement(tagName);
    elem.textContent = content;
    if (classNames) {
        elem.className = classNames;
    }
    parentElement.appendChild(elem);
    return elem;
}

// Function to update the weather details in the DOM.
function updateWeatherDetails(weatherData) {
    // Clear the current weather details.
    const currentWeatherDiv = document.getElementById('current-weather-details');
    currentWeatherDiv.innerHTML = '';

    // Assuming the current weather data is the first entry in the list
    const currentWeather = weatherData.list[0];

    // Create and append elements to 'current-weather-details' based on 'currentWeather'
    createElementWithContent('h3', weatherData.city.name, currentWeatherDiv);
    createElementWithContent('p', new Date(currentWeather.dt_txt).toLocaleDateString(), currentWeatherDiv);
    createElementWithContent('p', `Temperature: ${currentWeather.main.temp.toFixed(1)}°F`, currentWeatherDiv);
    createElementWithContent('p', `Wind Speed: ${currentWeather.wind.speed.toFixed(1)} MPH`, currentWeatherDiv);
    createElementWithContent('p', `Humidity: ${currentWeather.main.humidity}%`, currentWeatherDiv);
    createElementWithContent('p', `Conditions: ${currentWeather.weather[0].description}`, currentWeatherDiv);
    


    // Clear the forecast cards.
    const forecastDiv = document.getElementById('forecast-cards-container');
    forecastDiv.innerHTML = '';

    const dailyForecasts = weatherData.list.filter((forecast) => forecast.dt_txt.endsWith('12:00:00'));

    // Loop through each daily forecast and create a card
    dailyForecasts.forEach(forecast => {
        // Create a card element for the forecast
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card'; // Add a class for styling

        // Create and append elements to the forecast card
        createElementWithContent('h5', new Date(forecast.dt_txt).toLocaleDateString(), forecastCard);
        createElementWithContent('p', `Temp: ${forecast.main.temp.toFixed(1)}°F`, forecastCard);
        createElementWithContent('p', `Wind: ${forecast.wind.speed.toFixed(1)} MPH`, forecastCard);
        createElementWithContent('p', `Humidity: ${forecast.main.humidity}%`, forecastCard);

        // Append the forecast card to the forecast container
        forecastDiv.appendChild(forecastCard);
})};

// Function to handle city search form submission.
async function handleCitySearch(cityOrEvent) {
    let cityName;
    if (typeof cityOrEvent === 'string') {
        cityName = cityOrEvent;
    } else {
        cityOrEvent.preventDefault();
        const cityInput = document.getElementById('city-input');
        cityName = cityInput.value.trim();
    }

    // Validate input
    if (!cityName) {
        
        // Make an error message element and display it
        const errorMessageDiv = document.getElementById('error-message');
        errorMessageDiv.textContent = "Please enter a city name.";
        errorMessageDiv.style.display = 'block'; 
        
        return; 
    }

    try {
        const coordinates = await getCoordinatesForCity(cityName);
        if (coordinates) {
            const weatherData = await getWeatherForCoordinates(coordinates.lat, coordinates.lon);
            updateWeatherDetails(weatherData);
            updateSearchHistory(cityName);

            // Reset any error state here
            if(errorMessageDiv) {
                errorMessageDiv.style.display = 'none';
            }
        } else {
            // Handle case where city is not found or other issues with geocoding
            console.error('City not found or geocoding API error');
        }
    } catch (error) {
        // Handle network error or other issues
        console.error('An error occurred while fetching weather data:', error);
    }
}

// Function to update the search history in the DOM and local storage.
function updateSearchHistory(cityName) {
    // Implement adding the city to the search history and local storage.
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

    // Check if the city is already in the history and remove it if present
    const existingIndex = searchHistory.indexOf(cityName);
    if (existingIndex !== -1) {
        searchHistory.splice(existingIndex, 1);
    }

    // Add the new city to the beginning of the array
    searchHistory.unshift(cityName);

    // Save back to local storage
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));

    // Update the search history in the DOM
    loadSearchHistory();
}

// Function to load and display search history from local storage on page load.
function loadSearchHistory() {
    // Retrieve search history from local storage.
    const searchHistoryList = document.getElementById('search-history-list');
    searchHistoryList.innerHTML = ''; // Clear existing list
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    searchHistory.forEach((city) => {
        const listItem = document.createElement('li');
        listItem.textContent = city;
        listItem.addEventListener('click', () => handleCitySearch(city));
        searchHistoryList.appendChild(listItem);
    });
}

// Set up event listeners on the city search form.
document.getElementById('city-search-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const cityInput = document.getElementById('city-input');
    const cityName = cityInput.value.trim();
    await handleCitySearch(cityName);
    
});

// Call the loadSearchHistory function to populate the search history on page load.
loadSearchHistory();

// Add event listeners to search history items (if applicable).