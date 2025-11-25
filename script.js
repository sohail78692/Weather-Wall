// ===================================
// CONFIGURATION
// ===================================
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY || '';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.weatherapi.com/v1';

// Check if API key is configured
if (!API_KEY) {
    console.error('API key not found! Please configure your API key in .env file');
    alert('Weather API key is missing! Please check your .env file.');
}

// ===================================
// STATE MANAGEMENT
// ===================================
let currentUnit = 'celsius';
let currentWeatherData = null;

// ===================================
// DOM ELEMENTS
// ===================================
const elements = {
    // UI Controls
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    locationBtn: document.getElementById('locationBtn'),
    unitToggle: document.getElementById('unitToggle'),
    bgGradient: document.getElementById('bgGradient'),

    // States
    loading: document.getElementById('loading'),
    error: document.getElementById('error'),
    weatherContent: document.getElementById('weatherContent'),
    errorTitle: document.getElementById('errorTitle'),
    errorMessage: document.getElementById('errorMessage'),

    // Current Weather
    cityName: document.getElementById('cityName'),
    dateTime: document.getElementById('dateTime'),
    weatherIconLarge: document.getElementById('weatherIconLarge'),
    temperature: document.getElementById('temperature'),
    feelsLike: document.getElementById('feelsLike'),
    condition: document.getElementById('condition'),
    tempRange: document.getElementById('tempRange'),

    // Weather Details
    humidity: document.getElementById('humidity'),
    windSpeed: document.getElementById('windSpeed'),
    pressure: document.getElementById('pressure'),
    visibility: document.getElementById('visibility'),
    sunrise: document.getElementById('sunrise'),
    sunset: document.getElementById('sunset'),

    // Forecasts
    hourlyForecast: document.getElementById('hourlyForecast'),
    dailyForecast: document.getElementById('dailyForecast')
};

// ===================================
// WEATHER ICON MAPPING
// ===================================
function getWeatherEmoji(code, isDay) {
    // WeatherAPI.com condition codes
    const iconMap = {
        1000: isDay ? '☀️' : '🌙',  // Sunny/Clear
        1003: '⛅',  // Partly cloudy
        1006: '☁️',  // Cloudy
        1009: '☁️',  // Overcast
        1030: '🌫️',  // Mist
        1063: '🌦️',  // Patchy rain possible
        1066: '🌨️',  // Patchy snow possible
        1069: '🌨️',  // Patchy sleet possible
        1072: '🌧️',  // Patchy freezing drizzle
        1087: '⛈️',  // Thundery outbreaks possible
        1114: '❄️',  // Blowing snow
        1117: '❄️',  // Blizzard
        1135: '🌫️',  // Fog
        1147: '🌫️',  // Freezing fog
        1150: '🌧️',  // Patchy light drizzle
        1153: '🌧️',  // Light drizzle
        1168: '🌧️',  // Freezing drizzle
        1171: '🌧️',  // Heavy freezing drizzle
        1180: '🌦️',  // Patchy light rain
        1183: '🌧️',  // Light rain
        1186: '🌧️',  // Moderate rain at times
        1189: '🌧️',  // Moderate rain
        1192: '🌧️',  // Heavy rain at times
        1195: '🌧️',  // Heavy rain
        1198: '🌧️',  // Light freezing rain
        1201: '🌧️',  // Moderate or heavy freezing rain
        1204: '🌨️',  // Light sleet
        1207: '🌨️',  // Moderate or heavy sleet
        1210: '🌨️',  // Patchy light snow
        1213: '❄️',  // Light snow
        1216: '❄️',  // Patchy moderate snow
        1219: '❄️',  // Moderate snow
        1222: '❄️',  // Patchy heavy snow
        1225: '❄️',  // Heavy snow
        1237: '🌨️',  // Ice pellets
        1240: '🌦️',  // Light rain shower
        1243: '🌧️',  // Moderate or heavy rain shower
        1246: '🌧️',  // Torrential rain shower
        1249: '🌨️',  // Light sleet showers
        1252: '🌨️',  // Moderate or heavy sleet showers
        1255: '🌨️',  // Light snow showers
        1258: '❄️',  // Moderate or heavy snow showers
        1261: '🌨️',  // Light showers of ice pellets
        1264: '🌨️',  // Moderate or heavy showers of ice pellets
        1273: '⛈️',  // Patchy light rain with thunder
        1276: '⛈️',  // Moderate or heavy rain with thunder
        1279: '⛈️',  // Patchy light snow with thunder
        1282: '⛈️'   // Moderate or heavy snow with thunder
    };

    return iconMap[code] || '🌡️';
}

// ===================================
// UTILITY FUNCTIONS
// ===================================
function convertTemp(celsius) {
    return currentUnit === 'celsius' ? Math.round(celsius) : Math.round(celsius * 9 / 5 + 32);
}

function getUnitSymbol() {
    return currentUnit === 'celsius' ? '°C' : '°F';
}

function formatDateTime(dateStr) {
    const date = new Date(dateStr);
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    const dateFormatted = date.toLocaleDateString('en-US', options);
    const timeFormatted = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
    return `${dateFormatted} | ${timeFormatted}`;
}

function formatTime(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getDayName(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
    } else {
        return date.toLocaleDateString('en-US', { weekday: 'long' });
    }
}

function getBackgroundClass(conditionText, isDay) {
    const condition = conditionText.toLowerCase();

    if (!isDay) return 'bg-night';

    if (condition.includes('sunny') || condition.includes('clear')) {
        return 'bg-clear';
    } else if (condition.includes('cloud')) {
        return 'bg-clouds';
    } else if (condition.includes('rain') || condition.includes('drizzle')) {
        return 'bg-rain';
    } else if (condition.includes('thunder')) {
        return 'bg-thunderstorm';
    } else if (condition.includes('snow') || condition.includes('blizzard')) {
        return 'bg-snow';
    } else if (condition.includes('mist') || condition.includes('fog')) {
        return 'bg-mist';
    }

    return 'bg-clear';
}

// ===================================
// UI STATE MANAGEMENT
// ===================================
function showLoading() {
    elements.loading.classList.add('active');
    elements.error.classList.remove('active');
    elements.weatherContent.classList.remove('active');
}

function showError(title, message) {
    elements.loading.classList.remove('active');
    elements.error.classList.add('active');
    elements.weatherContent.classList.remove('active');
    elements.errorTitle.textContent = title;
    elements.errorMessage.textContent = message;
}

function showWeather() {
    elements.loading.classList.remove('active');
    elements.error.classList.remove('active');
    elements.weatherContent.classList.add('active');
}

// ===================================
// API CALLS
// ===================================
async function fetchWeather(query) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(query)}&days=5&aqi=no&alerts=no`
        );

        if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 400) {
                throw new Error('City not found. Please check the spelling and try again.');
            } else if (response.status === 401 || response.status === 403) {
                throw new Error('API key error. Please check your API key configuration.');
            }
            throw new Error(errorData.error?.message || 'Failed to fetch weather data');
        }

        return await response.json();
    } catch (error) {
        if (error.message.includes('Failed to fetch')) {
            throw new Error('Network error. Please check your internet connection.');
        }
        throw error;
    }
}

// ===================================
// DISPLAY FUNCTIONS
// ===================================
function displayCurrentWeather(data) {
    currentWeatherData = data;

    const current = data.current;
    const location = data.location;

    // Location and Time
    elements.cityName.textContent = `${location.name}, ${location.country}`;
    elements.dateTime.textContent = formatDateTime(location.localtime);

    // Main Weather
    const icon = getWeatherEmoji(current.condition.code, current.is_day === 1);
    elements.weatherIconLarge.textContent = icon;
    elements.temperature.textContent = `${convertTemp(current.temp_c)}°`;
    elements.feelsLike.textContent = `Feels like ${convertTemp(current.feelslike_c)}°`;
    elements.condition.textContent = current.condition.text;

    // Get today's forecast for high/low
    const todayForecast = data.forecast.forecastday[0];
    elements.tempRange.textContent = `H: ${convertTemp(todayForecast.day.maxtemp_c)}° L: ${convertTemp(todayForecast.day.mintemp_c)}°`;

    // Weather Details
    elements.humidity.textContent = `${current.humidity}%`;
    elements.windSpeed.textContent = `${Math.round(current.wind_kph)} km/h`;
    elements.pressure.textContent = `${current.pressure_mb} hPa`;
    elements.visibility.textContent = `${current.vis_km} km`;

    // Sunrise/Sunset from forecast
    const astro = todayForecast.astro;
    elements.sunrise.textContent = astro.sunrise;
    elements.sunset.textContent = astro.sunset;

    // Update Background
    const bgClass = getBackgroundClass(current.condition.text, current.is_day === 1);
    elements.bgGradient.className = `background-gradient ${bgClass}`;

    showWeather();
}

function displayHourlyForecast(data) {
    elements.hourlyForecast.innerHTML = '';

    // Get hourly data for today and tomorrow
    const hourlyData = [];
    data.forecast.forecastday.slice(0, 2).forEach(day => {
        hourlyData.push(...day.hour);
    });

    // Find current hour index
    const now = new Date();
    const currentHourIndex = hourlyData.findIndex(hour => {
        const hourDate = new Date(hour.time);
        return hourDate >= now;
    });

    // Show next 24 hours (8 items with 3-hour intervals)
    const startIndex = currentHourIndex >= 0 ? currentHourIndex : 0;
    const selectedHours = [];
    for (let i = 0; i < 8 && (startIndex + i * 3) < hourlyData.length; i++) {
        selectedHours.push(hourlyData[startIndex + i * 3]);
    }

    selectedHours.forEach((hour, index) => {
        const hourlyDiv = document.createElement('div');
        hourlyDiv.className = 'hourly-item glass-card';
        hourlyDiv.style.animationDelay = `${0.7 + index * 0.05}s`;

        const hourDate = new Date(hour.time);
        const time = index === 0 ? 'Now' : hourDate.toLocaleTimeString('en-US', {
            hour: 'numeric'
        });
        const icon = getWeatherEmoji(hour.condition.code, hour.is_day === 1);
        const temp = convertTemp(hour.temp_c);

        hourlyDiv.innerHTML = `
            <p class="hourly-time">${time}</p>
            <div class="hourly-icon">${icon}</div>
            <p class="hourly-temp">${temp}°</p>
        `;

        elements.hourlyForecast.appendChild(hourlyDiv);
    });
}

function displayDailyForecast(data) {
    elements.dailyForecast.innerHTML = '';

    const forecastDays = data.forecast.forecastday;

    forecastDays.forEach((day, index) => {
        const dailyDiv = document.createElement('div');
        dailyDiv.className = 'daily-item glass-card';
        dailyDiv.style.animationDelay = `${0.7 + index * 0.1}s`;

        const dayName = getDayName(day.date);
        const icon = getWeatherEmoji(day.day.condition.code, 1);
        const high = convertTemp(day.day.maxtemp_c);
        const low = convertTemp(day.day.mintemp_c);

        dailyDiv.innerHTML = `
            <div>
                <p class="daily-day">${dayName}</p>
            </div>
            <div class="daily-icon">${icon}</div>
            <div class="daily-temps">
                <p class="daily-high">${high}°</p>
                <p class="daily-low">${low}°</p>
            </div>
        `;

        elements.dailyForecast.appendChild(dailyDiv);
    });
}

// ===================================
// MAIN WEATHER FETCH FUNCTION
// ===================================
async function getWeather(query) {
    showLoading();

    try {
        const data = await fetchWeather(query);

        displayCurrentWeather(data);
        displayHourlyForecast(data);
        displayDailyForecast(data);

    } catch (error) {
        console.error('Error fetching weather:', error);
        showError('Oops!', error.message || 'Failed to fetch weather data. Please try again.');
    }
}

// ===================================
// EVENT HANDLERS
// ===================================
function handleSearch() {
    const city = elements.searchInput.value.trim();

    if (!city) {
        showError('Invalid Input', 'Please enter a city name');
        return;
    }

    getWeather(city);
}

function handleLocationRequest() {
    if (!navigator.geolocation) {
        showError('Not Supported', 'Geolocation is not supported by your browser');
        return;
    }

    showLoading();

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const query = `${position.coords.latitude},${position.coords.longitude}`;
            getWeather(query);
        },
        (error) => {
            console.error('Geolocation error:', error);
            showError('Location Error', 'Unable to retrieve your location. Please search for a city instead.');
        }
    );
}

function handleUnitToggle(e) {
    if (e.target.classList.contains('unit-option')) {
        const unit = e.target.dataset.unit;

        if (unit === currentUnit) return;

        currentUnit = unit;

        // Update active state
        document.querySelectorAll('.unit-option').forEach(opt => {
            opt.classList.remove('active');
        });
        e.target.classList.add('active');

        // Re-display weather with new unit
        if (currentWeatherData) {
            displayCurrentWeather(currentWeatherData);
            displayHourlyForecast(currentWeatherData);
            displayDailyForecast(currentWeatherData);
        }
    }
}

// ===================================
// EVENT LISTENERS
// ===================================
elements.searchBtn.addEventListener('click', handleSearch);
elements.searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});
elements.locationBtn.addEventListener('click', handleLocationRequest);
elements.unitToggle.addEventListener('click', handleUnitToggle);

// ===================================
// INITIALIZATION
// ===================================
// Load default city on page load
window.addEventListener('load', () => {
    getWeather('London');
});
