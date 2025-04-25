# Weather Dashboard

A comprehensive, responsive weather dashboard built with vanilla HTML, CSS, and JavaScript. This application provides detailed weather information for any location worldwide with a clean, modern interface.

## Features

- **Current Weather Conditions**: Detailed display of current temperature, weather description, and feels-like temperature
- **Hourly Forecast**: Scrollable hourly weather forecast for the next 24 hours
- **5-Day Forecast**: Extended 5-day weather forecast with high/low temperatures
- **Weather Maps**: Interactive weather maps with temperature, clouds, and precipitation layers
- **Location Search**: Search for weather by city name with autocomplete suggestions
- **Current Location**: Get weather for your current location using geolocation
- **Favorites System**: Save and quickly access your favorite locations
- **Unit Toggle**: Switch between Celsius and Fahrenheit temperature units
- **Dark/Light Mode**: Toggle between dark and light themes for comfortable viewing
- **Responsive Design**: Fully responsive layout that works on all devices from mobile phones to large desktop screens
- **Touch-Optimized**: Enhanced touch controls for mobile devices

## How to Use

1. Clone or download this repository
2. Get an API key from [OpenWeatherMap](https://openweathermap.org/api)
3. Open `script.js` and replace the API key with your actual API key:
   ```javascript
   const API_KEY = "93449af13f0c44f7c9123a320d2665b0"; // Replace with your API key if needed
   ```
4. Add your profile picture by placing an image named `profile.jpg` in the `images` folder
5. Open `index.html` in your web browser

## Default Location

The dashboard is set to display weather for Magboro, Nigeria by default. You can change this by modifying the following line in `script.js`:

```javascript
getWeatherData('Magboro, Nigeria');
```

## API Used

This project uses the [OpenWeatherMap API](https://openweathermap.org/api) to fetch weather data:
- Current Weather Data API
- 5 Day / 3 Hour Forecast API
- Weather Maps API

## Technologies Used

- **HTML5**: Semantic markup for structure
- **CSS3**: Advanced styling with CSS variables, flexbox, and media queries
- **JavaScript (ES6+)**: Modern JavaScript with async/await for API calls
- **Leaflet.js**: For interactive weather maps
- **Font Awesome**: For icons throughout the interface
- **OpenWeatherMap API**: For all weather data

## Customization

The dashboard includes several customization options:
- **Theme**: Toggle between dark and light modes using the moon/sun icon
- **Units**: Switch between Celsius and Fahrenheit using the °C/°F button
- **Favorites**: Save your frequently accessed locations for quick access
- **Map Layers**: Choose between temperature, clouds, and precipitation map views

## Browser Compatibility

The Weather Dashboard works in all modern browsers:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Created By

This Weather Dashboard was created by AYOKANMI ADEJOLA.

## License

This project is open source and available under the [MIT License](LICENSE).
