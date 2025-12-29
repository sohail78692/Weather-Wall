# ⛅ Weather Website

A beautiful, modern weather application with real-time weather data powered by WeatherAPI.com.

## 🚀 Quick Start

### Prerequisites
- Node.js installed on your system

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory and add your API key:
```
VITE_WEATHER_API_KEY=your_api_key_here
VITE_API_BASE_URL=https://api.weatherapi.com/v1
```

3. Run the development server:
```bash
npm run dev
```

4. Open your browser to the URL shown in the terminal (usually `http://localhost:5173`)

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` folder.

## 🔒 Security

**IMPORTANT**: Never commit your `.env` file to version control!
- The `.env` file contains your API key
- It's already added to `.gitignore`
- For production, use environment variables on your hosting platform

## ✨ Features

- Real-time weather data from WeatherAPI.com
- 5-day weather forecast
- Hourly predictions
- Current location detection
- Temperature unit toggle (°C/°F)
- Beautiful glassmorphic design
- Dynamic backgrounds based on weather conditions
- Smooth animations and transitions
- Fully responsive design

## 🛠️ Tech Stack

- **Vite** - Build tool and dev server
- **Vanilla JavaScript** - No framework needed
- **CSS3** - Modern styling with animations
- **WeatherAPI.com** - Weather data provider

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🌐 Browser Support

Works on all modern browsers:
- Chrome/Edge
- Firefox
- Safari
- Opera
