export const unitData = {
  Length: {
    Meter: 1,
    Kilometer: 0.001,
    Centimeter: 100,
    Millimeter: 1000,
    Mile: 0.000621371,
    Yard: 1.09361,
    Foot: 3.28084,
    Inch: 39.3701,
  },
  Mass: {
    Kilogram: 1,
    Gram: 1000,
    Milligram: 1000000,
    Pound: 2.20462,
    Ounce: 35.274,
  },
  Volume: {
    Liter: 1,
    Milliliter: 1000,
    'US Gallon': 0.264172,
    'US Quart': 1.05669,
    'US Pint': 2.11338,
    'US Cup': 4.22675,
  },
  Temperature: {
    // Note: Temperature requires formula conversion, not factor multiplication
    Celsius: 'Celsius',
    Fahrenheit: 'Fahrenheit',
    Kelvin: 'Kelvin',
  },
};

// Special handling for temperature conversions
export const convertTemperature = (value, fromUnit, toUnit) => {
  if (fromUnit === toUnit) return value;
  let celsiusValue;

  // Convert input to Celsius first
  switch (fromUnit) {
    case 'Fahrenheit':
      celsiusValue = (value - 32) * 5 / 9;
      break;
    case 'Kelvin':
      celsiusValue = value - 273.15;
      break;
    default: // It's already Celsius
      celsiusValue = value;
      break;
  }

  // Convert from Celsius to the target unit
  switch (toUnit) {
    case 'Fahrenheit':
      return (celsiusValue * 9 / 5) + 32;
    case 'Kelvin':
      return celsiusValue + 273.15;
    default: // Target is Celsius
      return celsiusValue;
  }
};