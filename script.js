const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const API_BASE_URL = 'https://api.weatherapi.com/v1';

let currentUnit = 'celsius';
let currentWeatherData = null;

// DOM Elements
const elements = {
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    unitToggle: document.getElementById('unitToggle'),

    // Hero Section
    cityName: document.getElementById('cityName'),
    temperature: document.getElementById('temperature'),
    condition: document.getElementById('condition'),
    weatherIconLarge: document.getElementById('weatherIconLarge'),

    // Stats
    feelsLike: document.getElementById('feelsLike'),
    windSpeed: document.getElementById('windSpeed'),
    uvIndex: document.getElementById('uvIndex'),

    // Forecast
    dailyForecast: document.getElementById('dailyForecast'),

    // UI State
    loading: document.querySelector('.loading') || document.createElement('div'), // Fallback
    error: document.querySelector('.error') || document.createElement('div')      // Fallback
};

// ===================================
// WEATHER ICON MAPPING
// ===================================
function getWeatherEmoji(code, isDay) {
    const iconMap = {
        1000: isDay ? '☀️' : '🌙',
        1003: '⛅',
        1006: '☁️',
        1009: '☁️',
        1030: '🌫️',
        1063: '🌦️',
        1066: '🌨️',
        1069: '🌨️',
        1072: '🌧️',
        1087: '⛈️',
        1114: '❄️',
        1117: '❄️',
        1135: '🌫️',
        1147: '🌫️',
        1150: '🌧️',
        1153: '🌧️',
        1168: '🌧️',
        1171: '🌧️',
        1180: '🌦️',
        1183: '🌧️',
        1186: '🌧️',
        1189: '🌧️',
        1192: '🌧️',
        1195: '🌧️',
        1198: '🌧️',
        1201: '🌧️',
        1204: '🌨️',
        1207: '🌨️',
        1210: '🌨️',
        1213: '❄️',
        1216: '❄️',
        1219: '❄️',
        1222: '❄️',
        1225: '❄️',
        1237: '🌨️',
        1240: '🌦️',
        1243: '🌧️',
        1246: '🌧️',
        1249: '🌨️',
        1252: '🌨️',
        1255: '🌨️',
        1258: '❄️',
        1261: '🌨️',
        1264: '🌨️',
        1273: '⛈️',
        1276: '⛈️',
        1279: '⛈️',
        1282: '⛈️'
    };
    return iconMap[code] || '🌡️';
}

// ===================================
// UTILITY FUNCTIONS
// ===================================
function convertTemp(celsius) {
    return currentUnit === 'celsius' ? Math.round(celsius) : Math.round(celsius * 9 / 5 + 32);
}

function getDayName(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
}

// ===================================
// API CALLS
// ===================================
async function fetchWeather(query) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(query)}&days=7&aqi=no&alerts=no`
        );
        if (!response.ok) throw new Error('City not found');
        return await response.json();
    } catch (error) {
        console.error(error);
        alert('Failed to fetch weather data');
    }
}

// ===================================
// DISPLAY FUNCTIONS
// ===================================
function displayCurrentWeather(data) {
    if (!data) return;
    currentWeatherData = data;
    const current = data.current;
    const location = data.location;

    // Hero Section
    elements.cityName.textContent = `${location.name}, ${location.country}`;
    elements.condition.textContent = current.condition.text;
    elements.temperature.textContent = `${convertTemp(current.temp_c)}°${currentUnit === 'celsius' ? 'C' : 'F'}`;

    const isDay = current.is_day === 1;
    elements.weatherIconLarge.textContent = getWeatherEmoji(current.condition.code, isDay);

    // Stats
    elements.feelsLike.textContent = `${convertTemp(current.feelslike_c)}°`;
    elements.windSpeed.textContent = `${current.wind_kph} km/h`;
    elements.uvIndex.textContent = current.uv;

    // Update Radar Map
    const radarFrame = document.getElementById('radarFrame');
    if (radarFrame) {
        const lat = location.lat;
        const lon = location.lon;
        radarFrame.src = `https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&detailLat=${lat}&detailLon=${lon}&width=650&height=450&zoom=5&level=surface&overlay=rain&product=ecmwf&menu=&message=&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1`;
    }

    // Update Save Button State
    updateSaveButtonState();
}

function displayDailyForecast(data) {
    if (!data) return;
    elements.dailyForecast.innerHTML = '';
    const forecastDays = data.forecast.forecastday;

    forecastDays.forEach((day) => {
        const dayName = getDayName(day.date);
        const icon = getWeatherEmoji(day.day.condition.code, 1);
        const maxTemp = convertTemp(day.day.maxtemp_c);
        const minTemp = convertTemp(day.day.mintemp_c);

        // Random width for the "bar" visual to simulate range
        const width = Math.floor(Math.random() * 40) + 30;
        const left = Math.floor(Math.random() * 20);

        const item = document.createElement('div');
        item.className = 'forecast-item';
        item.innerHTML = `
            <div class="f-day">${dayName}</div>
            <div class="f-icon">${icon}</div>
            <div class="f-bar">
                <div class="f-bar-fill" style="width: ${width}%; left: ${left}%"></div>
            </div>
            <div class="f-temp">${maxTemp}° / ${minTemp}°</div>
        `;
        elements.dailyForecast.appendChild(item);
    });
}

async function getWeather(query) {
    const data = await fetchWeather(query);
    displayCurrentWeather(data);
    displayDailyForecast(data);
}

// ===================================
// EVENT HANDLERS
// ===================================
function handleSearch() {
    const city = elements.searchInput.value.trim();
    if (city) getWeather(city);
}

function handleUnitToggle(e) {
    if (e.target.classList.contains('unit-btn')) {
        const unit = e.target.dataset.unit;
        if (unit === currentUnit) return;
        currentUnit = unit;

        // Update all unit toggles (desktop and mobile)
        document.querySelectorAll('.unit-btn').forEach(btn => {
            if (btn.dataset.unit === unit) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        if (currentWeatherData) {
            displayCurrentWeather(currentWeatherData);
            displayDailyForecast(currentWeatherData);
        }
    }
}

// ===================================
// SAVED LOCATIONS LOGIC
// ===================================
let savedLocations = JSON.parse(localStorage.getItem('savedLocations')) || [];

function isLocationSaved(cityName) {
    return savedLocations.some(loc => loc.name.toLowerCase() === cityName.toLowerCase());
}

function toggleSaveLocation() {
    if (!currentWeatherData) return;

    const location = currentWeatherData.location;
    const current = currentWeatherData.current;
    const cityName = location.name;

    if (isLocationSaved(cityName)) {
        // Remove
        savedLocations = savedLocations.filter(loc => loc.name.toLowerCase() !== cityName.toLowerCase());
    } else {
        // Add
        savedLocations.push({
            name: location.name,
            country: location.country,
            temp_c: current.temp_c,
            condition: current.condition.text
        });
    }

    localStorage.setItem('savedLocations', JSON.stringify(savedLocations));
    updateSaveButtonState();
    renderSavedLocations();
}

function updateSaveButtonState() {
    const btn = document.getElementById('saveLocationBtn');
    if (!btn || !currentWeatherData) return;

    const cityName = currentWeatherData.location.name;
    const icon = btn.querySelector('ion-icon');

    if (isLocationSaved(cityName)) {
        btn.classList.add('saved');
        icon.setAttribute('name', 'bookmark');
    } else {
        btn.classList.remove('saved');
        icon.setAttribute('name', 'bookmark-outline');
    }
}

function renderSavedLocations() {
    const desktopList = document.getElementById('savedLocationsList');
    const mobileList = document.getElementById('mobileSavedLocationsList');

    const generateHTML = () => {
        if (savedLocations.length === 0) {
            return '<div style="text-align: center; color: var(--text-muted); padding: 20px;">No saved locations</div>';
        }

        return savedLocations.map(loc => `
            <div class="location-card" data-city="${loc.name}">
                <div>
                    <div class="loc-name">${loc.name}</div>
                    <div class="loc-desc">${loc.condition}</div>
                </div>
                <div class="loc-temp">${Math.round(loc.temp_c)}°</div>
            </div>
        `).join('');
    };

    const html = generateHTML();
    if (desktopList) desktopList.innerHTML = html;
    if (mobileList) mobileList.innerHTML = html;

    // Add click handlers to new elements
    const attachListeners = (container) => {
        if (!container) return;
        container.querySelectorAll('.location-card').forEach(card => {
            const cityName = card.dataset.city;
            if (cityName) {
                card.addEventListener('click', () => {
                    getWeather(cityName);
                    // Close overlays if on mobile
                    if (window.innerWidth <= 768) {
                        closeAllOverlays();
                    }
                });
            }
        });
    };

    attachListeners(desktopList);
    attachListeners(mobileList);
}

// ===================================
// MOBILE LOGIC
// ===================================
const mobileElements = {
    // Overlays
    searchOverlay: document.getElementById('mobileSearchOverlay'),
    savedOverlay: document.getElementById('mobileSavedOverlay'),
    settingsOverlay: document.getElementById('mobileSettingsOverlay'),

    // Inputs & Buttons
    searchInput: document.getElementById('mobileSearchInput'),
    searchBtn: document.getElementById('mobileSearchBtn'),

    // Close Buttons
    closeSearchBtn: document.getElementById('closeSearchBtn'),
    closeSavedBtn: document.getElementById('closeSavedBtn'),
    closeSettingsBtn: document.getElementById('closeSettingsBtn'),

    // Nav Items
    navItems: document.querySelectorAll('.nav-item'),
    navHome: document.getElementById('navHome'),
    navSearch: document.getElementById('navSearch'),
    navSaved: document.getElementById('navSaved'),
    navSettings: document.getElementById('navSettings'),

    // Settings
    mobileUnitToggle: document.getElementById('mobileUnitToggle'),
    mobileThemeToggle: document.getElementById('mobileThemeToggle')
};

// Desktop Theme Toggle
const desktopThemeToggle = document.getElementById('themeToggle');

let currentTheme = localStorage.getItem('theme') || 'dark';

function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    const isDark = theme === 'dark';

    // Update Desktop Button
    if (desktopThemeToggle) {
        desktopThemeToggle.innerHTML = isDark
            ? '<ion-icon name="moon-outline"></ion-icon><span>Dark Mode</span>'
            : '<ion-icon name="sunny-outline"></ion-icon><span>Light Mode</span>';
    }

    // Update Mobile Button
    if (mobileElements.mobileThemeToggle) {
        mobileElements.mobileThemeToggle.innerHTML = isDark
            ? '<div style="display: flex; align-items: center; gap: 10px;"><ion-icon name="moon-outline"></ion-icon><span>Dark Mode</span></div><ion-icon name="chevron-forward-outline"></ion-icon>'
            : '<div style="display: flex; align-items: center; gap: 10px;"><ion-icon name="sunny-outline"></ion-icon><span>Light Mode</span></div><ion-icon name="chevron-forward-outline"></ion-icon>';
    }
}

function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', currentTheme);
    applyTheme(currentTheme);
}

function closeAllOverlays() {
    document.querySelectorAll('.mobile-overlay').forEach(el => el.classList.remove('active'));
}

function toggleOverlay(overlay, show) {
    if (show) {
        closeAllOverlays();
        overlay.classList.add('active');
        if (overlay === mobileElements.searchOverlay) {
            mobileElements.searchInput.focus();
        }
    } else {
        overlay.classList.remove('active');
    }
}

function handleMobileSearch() {
    const city = mobileElements.searchInput.value.trim();
    if (city) {
        getWeather(city);
        toggleOverlay(mobileElements.searchOverlay, false);
        mobileElements.searchInput.value = '';
    }
}

// Mobile Event Listeners
if (mobileElements.navSearch) {
    mobileElements.navSearch.addEventListener('click', () => toggleOverlay(mobileElements.searchOverlay, true));
}

if (mobileElements.navSaved) {
    mobileElements.navSaved.addEventListener('click', () => toggleOverlay(mobileElements.savedOverlay, true));
}

if (mobileElements.navSettings) {
    mobileElements.navSettings.addEventListener('click', () => toggleOverlay(mobileElements.settingsOverlay, true));
}

// Close Buttons
if (mobileElements.closeSearchBtn) mobileElements.closeSearchBtn.addEventListener('click', () => toggleOverlay(mobileElements.searchOverlay, false));
if (mobileElements.closeSavedBtn) mobileElements.closeSavedBtn.addEventListener('click', () => toggleOverlay(mobileElements.savedOverlay, false));
if (mobileElements.closeSettingsBtn) mobileElements.closeSettingsBtn.addEventListener('click', () => toggleOverlay(mobileElements.settingsOverlay, false));

// Search Logic
if (mobileElements.searchBtn) {
    mobileElements.searchBtn.addEventListener('click', handleMobileSearch);
}

if (mobileElements.searchInput) {
    mobileElements.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleMobileSearch();
    });
}

// Home Nav
if (mobileElements.navHome) {
    mobileElements.navHome.addEventListener('click', () => {
        closeAllOverlays();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setActiveNav(mobileElements.navHome);
    });
}

// Mobile Unit Toggle
if (mobileElements.mobileUnitToggle) {
    mobileElements.mobileUnitToggle.addEventListener('click', handleUnitToggle);
}

// Theme Toggles
if (desktopThemeToggle) {
    desktopThemeToggle.addEventListener('click', toggleTheme);
}

if (mobileElements.mobileThemeToggle) {
    mobileElements.mobileThemeToggle.addEventListener('click', toggleTheme);
}

// Handle Nav Selection
mobileElements.navItems.forEach(item => {
    item.addEventListener('click', () => {
        // Don't set active state for overlays that close immediately or are modal-like
        // But for this design, let's keep the visual feedback
        setActiveNav(item);
    });
});

function setActiveNav(selectedItem) {
    mobileElements.navItems.forEach(item => item.classList.remove('active'));
    selectedItem.classList.add('active');
}

// ===================================
// INIT
// ===================================
elements.searchBtn.addEventListener('click', handleSearch);
elements.searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});
elements.unitToggle.addEventListener('click', handleUnitToggle);

// Save Button Listener
const saveBtn = document.getElementById('saveLocationBtn');
if (saveBtn) {
    saveBtn.addEventListener('click', toggleSaveLocation);
}

window.addEventListener('load', () => {
    applyTheme(currentTheme);
    renderSavedLocations();
    getWeather('London');
});
