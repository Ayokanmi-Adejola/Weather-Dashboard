// API key for OpenWeatherMap
const API_KEY = "93449af13f0c44f7c9123a320d2665b0"; // Replace with your actual API key from OpenWeatherMap

// Global variables
let currentCity = '';
let currentWeatherData = null;
let currentUnit = 'metric'; // 'metric' for Celsius, 'imperial' for Fahrenheit
let map = null;
let currentMapLayer = null;
let autocompleteTimeout = null;
let favorites = JSON.parse(localStorage.getItem('weatherFavorites')) || [];

// DOM elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const favoritesBtn = document.getElementById('favorites-btn');
const cityNameElement = document.getElementById('city-name');
const addFavoriteBtn = document.getElementById('add-favorite');
const weatherIcon = document.getElementById('weather-icon');
const temperatureElement = document.getElementById('temperature');
const description = document.getElementById('description');
const feelsLike = document.getElementById('feels-like');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const pressure = document.getElementById('pressure');
const visibility = document.getElementById('visibility');
const sunrise = document.getElementById('sunrise');
const sunset = document.getElementById('sunset');
const weatherInfo = document.getElementById('weather-info');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');
const hourlyForecastContainer = document.getElementById('hourly-forecast');
const forecastContainer = document.getElementById('forecast');
const themeToggle = document.getElementById('theme-toggle');
const unitToggle = document.getElementById('unit-toggle');
const autocompleteList = document.getElementById('autocomplete-list');
const favoritesPanel = document.getElementById('favorites-panel');
const favoritesList = document.getElementById('favorites-list');
const mapContainer = document.getElementById('map-container');
const weatherMap = document.getElementById('weather-map');
const tempLayerBtn = document.getElementById('temp-layer');
const cloudsLayerBtn = document.getElementById('clouds-layer');
const precipitationLayerBtn = document.getElementById('precipitation-layer');

// Event listeners
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherData(city);
        autocompleteList.classList.add('hidden');
    }
});

cityInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            getWeatherData(city);
            autocompleteList.classList.add('hidden');
        }
    } else {
        // Handle autocomplete
        const query = cityInput.value.trim();
        if (query.length >= 3) {
            clearTimeout(autocompleteTimeout);
            autocompleteTimeout = setTimeout(() => {
                fetchCitySuggestions(query);
            }, 500);
        } else {
            autocompleteList.classList.add('hidden');
        }
    }
});

locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        showLoading();
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                getWeatherDataByCoords(latitude, longitude);
            },
            (error) => {
                hideLoading();
                showError("Unable to retrieve your location. Please search by city name.");
                console.error("Geolocation error:", error);
            }
        );
    } else {
        showError("Geolocation is not supported by your browser. Please search by city name.");
    }
});

// Theme toggle
themeToggle.addEventListener('click', () => {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    html.setAttribute('data-theme', newTheme);

    // Update icon
    const icon = themeToggle.querySelector('i');
    if (newTheme === 'dark') {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }

    // Save preference
    localStorage.setItem('weatherTheme', newTheme);
});

// Unit toggle
unitToggle.addEventListener('click', () => {
    currentUnit = currentUnit === 'metric' ? 'imperial' : 'metric';
    unitToggle.textContent = currentUnit === 'metric' ? '°C' : '°F';

    // Update displayed data if we have weather data
    if (currentWeatherData) {
        updateDisplayWithCurrentUnit();
    }

    // Save preference
    localStorage.setItem('weatherUnit', currentUnit);
});

// Favorites button
favoritesBtn.addEventListener('click', () => {
    favoritesPanel.classList.toggle('hidden');
    renderFavorites();
});

// Add to favorites
addFavoriteBtn.addEventListener('click', () => {
    if (currentCity) {
        toggleFavorite(currentCity);
    }
});

// Map layer buttons
tempLayerBtn.addEventListener('click', () => {
    setActiveMapLayer('temp');
});

cloudsLayerBtn.addEventListener('click', () => {
    setActiveMapLayer('clouds');
});

precipitationLayerBtn.addEventListener('click', () => {
    setActiveMapLayer('precipitation');
});

// Function to get weather data by city name
async function getWeatherData(city) {
    showLoading();
    try {
        // Fetch current weather
        const currentWeatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${currentUnit}`
        );

        if (!currentWeatherResponse.ok) {
            throw new Error("City not found");
        }

        const weatherData = await currentWeatherResponse.json();
        currentWeatherData = weatherData;
        currentCity = `${weatherData.name}, ${weatherData.sys.country}`;

        // Fetch 5-day forecast
        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=${currentUnit}`
        );

        if (!forecastResponse.ok) {
            throw new Error("Forecast data not available");
        }

        const forecastData = await forecastResponse.json();

        // We'll use the 3-hour forecast data for hourly display
        const { lat, lon } = weatherData.coord;

        // Display the data
        displayWeatherData(weatherData);
        displayHourlyForecast(forecastData);
        displayForecast(forecastData);
        initMap(lat, lon);
        updateFavoriteButton();

        hideLoading();
        showWeatherInfo();
        mapContainer.classList.remove('hidden');
    } catch (error) {
        console.error("Error fetching weather data:", error);
        hideLoading();
        showError();
    }
}

// Function to get weather data by coordinates
async function getWeatherDataByCoords(lat, lon) {
    showLoading();
    try {
        // Fetch current weather
        const currentWeatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${currentUnit}`
        );

        if (!currentWeatherResponse.ok) {
            throw new Error("Weather data not available");
        }

        const weatherData = await currentWeatherResponse.json();
        currentWeatherData = weatherData;
        currentCity = `${weatherData.name}, ${weatherData.sys.country}`;

        // Fetch 5-day forecast
        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${currentUnit}`
        );

        if (!forecastResponse.ok) {
            throw new Error("Forecast data not available");
        }

        const forecastData = await forecastResponse.json();

        // We'll use the 3-hour forecast data for hourly display

        // Display the data
        displayWeatherData(weatherData);
        displayHourlyForecast(forecastData);
        displayForecast(forecastData);
        initMap(lat, lon);
        updateFavoriteButton();

        hideLoading();
        showWeatherInfo();
        mapContainer.classList.remove('hidden');
    } catch (error) {
        console.error("Error fetching weather data:", error);
        hideLoading();
        showError();
    }
}

// Function to display current weather data
function displayWeatherData(data) {
    cityNameElement.textContent = `${data.name}, ${data.sys.country}`;

    // Temperature and basic info
    const tempUnit = currentUnit === 'metric' ? '°C' : '°F';
    const speedUnit = currentUnit === 'metric' ? 'm/s' : 'mph';

    temperatureElement.textContent = `${Math.round(data.main.temp)}${tempUnit}`;
    description.textContent = data.weather[0].description;
    feelsLike.textContent = `${Math.round(data.main.feels_like)}${tempUnit}`;
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${data.wind.speed} ${speedUnit}`;

    // Additional weather details
    pressure.textContent = `${data.main.pressure} hPa`;

    // Convert visibility from meters to kilometers or miles
    const visibilityValue = currentUnit === 'metric'
        ? (data.visibility / 1000).toFixed(1)
        : (data.visibility / 1609.34).toFixed(1);
    const visibilityUnit = currentUnit === 'metric' ? 'km' : 'mi';
    visibility.textContent = `${visibilityValue} ${visibilityUnit}`;

    // Format sunrise and sunset times
    const sunriseTime = new Date(data.sys.sunrise * 1000);
    const sunsetTime = new Date(data.sys.sunset * 1000);

    sunrise.textContent = sunriseTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    sunset.textContent = sunsetTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Set weather icon
    const iconCode = data.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherIcon.alt = data.weather[0].description;

    // Set weather background image based on weather condition
    const weatherBg = document.getElementById('weather-bg');
    const weatherCondition = data.weather[0].main.toLowerCase();

    // Set background color based on weather condition - using MSN Weather-like colors
    switch (weatherCondition) {
        case 'clear':
            weatherBg.style.background = "#ffcc33"; // Sunny yellow
            break;
        case 'clouds':
            weatherBg.style.background = "#5c99ce"; // Light blue
            break;
        case 'rain':
        case 'drizzle':
            weatherBg.style.background = "#4575b4"; // Darker blue
            break;
        case 'thunderstorm':
            weatherBg.style.background = "#2c3e50"; // Dark blue-gray
            break;
        case 'snow':
            weatherBg.style.background = "#b4c7dc"; // Light blue-gray
            break;
        case 'mist':
        case 'fog':
        case 'haze':
            weatherBg.style.background = "#94a3b8"; // Gray-blue
            break;
        default:
            weatherBg.style.background = "#5c99ce"; // Default blue
    }
}

// Function to display 5-day forecast
function displayForecast(data) {
    forecastContainer.innerHTML = '';

    // Get one forecast per day (data is in 3-hour intervals)
    const dailyForecasts = data.list.filter(forecast => forecast.dt_txt.includes('12:00:00'));

    // Limit to 5 days
    const fiveDayForecast = dailyForecasts.slice(0, 5);

    const tempUnit = currentUnit === 'metric' ? '°C' : '°F';

    fiveDayForecast.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const iconCode = forecast.weather[0].icon;
        const maxTemp = Math.round(forecast.main.temp_max);
        const minTemp = Math.round(forecast.main.temp_min);

        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item');
        forecastItem.innerHTML = `
            <h4>${dayName}</h4>
            <img src="https://openweathermap.org/img/wn/${iconCode}.png" alt="${forecast.weather[0].description}">
            <p>${maxTemp}${tempUnit}</p>
            <p class="min-temp">${minTemp}${tempUnit}</p>
        `;

        forecastContainer.appendChild(forecastItem);
    });
}

// Function to display hourly forecast
function displayHourlyForecast(data) {
    hourlyForecastContainer.innerHTML = '';

    // Get the hourly forecast data (3-hour intervals)
    const hourlyForecast = data.list.slice(0, 8); // Next 24 hours (8 x 3-hour intervals)

    const tempUnit = currentUnit === 'metric' ? '°C' : '°F';

    // Add current hour as "Now"
    const now = new Date();
    const currentHour = {
        dt: now.getTime() / 1000,
        main: {
            temp: data.list[0].main.temp
        },
        weather: [data.list[0].weather[0]]
    };

    // Combine current hour with forecast
    const combinedForecast = [currentHour, ...hourlyForecast];

    combinedForecast.forEach((hour, index) => {
        // Format the time
        const time = new Date(hour.dt * 1000);
        const hourString = time.getHours();
        const timeLabel = index === 0 ? 'Now' : `${hourString}:00`;

        // Create hourly forecast item
        const hourlyItem = document.createElement('div');
        hourlyItem.classList.add('hourly-item');

        const iconCode = hour.weather[0].icon;

        hourlyItem.innerHTML = `
            <h4>${timeLabel}</h4>
            <img src="https://openweathermap.org/img/wn/${iconCode}.png" alt="${hour.weather[0].description}">
            <p>${Math.round(hour.main.temp)}${tempUnit}</p>
        `;

        hourlyForecastContainer.appendChild(hourlyItem);
    });
}

// Function to update display with current temperature unit
function updateDisplayWithCurrentUnit() {
    if (!currentWeatherData) return;

    // Fetch data again with the new unit
    getWeatherData(currentWeatherData.name);
}

// UI state functions
function showLoading() {
    weatherInfo.classList.add('hidden');
    errorMessage.classList.add('hidden');
    mapContainer.classList.add('hidden');
    loading.classList.remove('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

function showWeatherInfo() {
    errorMessage.classList.add('hidden');
    weatherInfo.classList.remove('hidden');
}

function showError(message = "City not found. Please try again.") {
    weatherInfo.classList.add('hidden');
    mapContainer.classList.add('hidden');
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

// City autocomplete functions
async function fetchCitySuggestions(query) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`
        );

        if (!response.ok) {
            throw new Error("Failed to fetch city suggestions");
        }

        const cities = await response.json();
        displayCitySuggestions(cities);
    } catch (error) {
        console.error("Error fetching city suggestions:", error);
        autocompleteList.classList.add('hidden');
    }
}

function displayCitySuggestions(cities) {
    autocompleteList.innerHTML = '';

    if (cities.length === 0) {
        autocompleteList.classList.add('hidden');
        return;
    }

    cities.forEach(city => {
        const item = document.createElement('div');
        item.classList.add('autocomplete-item');
        item.textContent = `${city.name}, ${city.country}`;

        item.addEventListener('click', () => {
            cityInput.value = city.name;
            autocompleteList.classList.add('hidden');
            getWeatherData(city.name);
        });

        autocompleteList.appendChild(item);
    });

    autocompleteList.classList.remove('hidden');
}

// Favorites functions
function toggleFavorite(cityName) {
    const index = favorites.findIndex(city => city === cityName);

    if (index === -1) {
        // Add to favorites
        favorites.push(cityName);
        addFavoriteBtn.innerHTML = '<i class="fas fa-heart"></i>';
    } else {
        // Remove from favorites
        favorites.splice(index, 1);
        addFavoriteBtn.innerHTML = '<i class="far fa-heart"></i>';
    }

    // Save to localStorage
    localStorage.setItem('weatherFavorites', JSON.stringify(favorites));

    // Update favorites panel if open
    if (!favoritesPanel.classList.contains('hidden')) {
        renderFavorites();
    }
}

function updateFavoriteButton() {
    const isFavorite = favorites.includes(currentCity);

    if (isFavorite) {
        addFavoriteBtn.innerHTML = '<i class="fas fa-heart"></i>';
    } else {
        addFavoriteBtn.innerHTML = '<i class="far fa-heart"></i>';
    }
}

function renderFavorites() {
    favoritesList.innerHTML = '';

    if (favorites.length === 0) {
        document.querySelector('.favorites-empty').classList.remove('hidden');
        return;
    }

    document.querySelector('.favorites-empty').classList.add('hidden');

    favorites.forEach(city => {
        const item = document.createElement('div');
        item.classList.add('favorite-item');

        const cityText = document.createElement('p');
        cityText.textContent = city;

        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(city);
        });

        item.appendChild(cityText);
        item.appendChild(removeBtn);

        item.addEventListener('click', () => {
            // Extract just the city name from "City, Country" format
            const cityName = city.split(',')[0].trim();
            getWeatherData(cityName);
            favoritesPanel.classList.add('hidden');
        });

        favoritesList.appendChild(item);
    });
}

// Weather map functions
function initMap(lat, lon) {
    // If map already exists, remove it and create a new one
    if (map) {
        map.remove();
    }

    // Create map centered at the city's coordinates
    map = L.map('weather-map').setView([lat, lon], 10);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add marker for the city
    L.marker([lat, lon]).addTo(map)
        .bindPopup(currentCity)
        .openPopup();

    // Set default weather layer (temperature)
    setActiveMapLayer('temp');
}

function setActiveMapLayer(layerType) {
    // Remove current layer if exists
    if (currentMapLayer) {
        map.removeLayer(currentMapLayer);
    }

    // Reset active button state
    document.querySelectorAll('.map-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    let layerUrl = '';
    let layerBtn = null;

    switch (layerType) {
        case 'temp':
            layerUrl = `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${API_KEY}`;
            layerBtn = tempLayerBtn;
            break;
        case 'clouds':
            layerUrl = `https://tile.openweathermap.org/map/clouds/{z}/{x}/{y}.png?appid=${API_KEY}`;
            layerBtn = cloudsLayerBtn;
            break;
        case 'precipitation':
            layerUrl = `https://tile.openweathermap.org/map/precipitation/{z}/{x}/{y}.png?appid=${API_KEY}`;
            layerBtn = precipitationLayerBtn;
            break;
    }

    // Add the selected layer
    currentMapLayer = L.tileLayer(layerUrl, {
        attribution: 'Map data &copy; OpenWeatherMap',
        maxZoom: 18,
        opacity: 0.6
    }).addTo(map);

    // Set active button
    layerBtn.classList.add('active');
}

// Load saved preferences
function loadSavedPreferences() {
    // Load theme preference
    const savedTheme = localStorage.getItem('weatherTheme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);

        // Update theme toggle icon
        const icon = themeToggle.querySelector('i');
        if (savedTheme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    }

    // Load unit preference
    const savedUnit = localStorage.getItem('weatherUnit');
    if (savedUnit) {
        currentUnit = savedUnit;
        unitToggle.textContent = currentUnit === 'metric' ? '°C' : '°F';
    }
}

// Initialize with a default city and load preferences
window.addEventListener('load', () => {
    loadSavedPreferences();
    getWeatherData('Magboro, Nigeria');
});
