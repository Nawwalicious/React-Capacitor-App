import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { unitData, convertTemperature } from '../utils/unitData';
import './UnitConverter.scss';

const PageHeader = ({ title }) => (
  <header className="page-header">
    <Link to="/" className="back-btn" aria-label="Go back to Dashboard">
      ‹
    </Link>
    <h1 className="page-title">{title}</h1>
  </header>
);

const UnitConverter = () => {
  const categories = Object.keys(unitData);
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  
  const [inputValue, setInputValue] = useState(1);
  const [fromUnit, setFromUnit] = useState(Object.keys(unitData[activeCategory])[0]);
  const [toUnit, setToUnit] = useState(Object.keys(unitData[activeCategory])[1]);
  const [outputValue, setOutputValue] = useState(0);

  useEffect(() => {
    const units = Object.keys(unitData[activeCategory]);
    setFromUnit(units[0]);
    setToUnit(units[1] || units[0]);
  }, [activeCategory]);

  useEffect(() => {
    const numValue = parseFloat(inputValue);
    if (isNaN(numValue)) {
      setOutputValue('');
      return;
    }

    if (activeCategory === 'Temperature') {
      const result = convertTemperature(numValue, fromUnit, toUnit);
      setOutputValue(Number(result.toFixed(4)));
    } else {
      const fromFactor = unitData[activeCategory][fromUnit];
      const toFactor = unitData[activeCategory][toUnit];
      const result = (numValue / fromFactor) * toFactor;
      setOutputValue(Number(result.toFixed(4)));
    }

  }, [inputValue, fromUnit, toUnit, activeCategory]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
      setInputValue(value);
    }
  };

  const handleSwap = () => {
    const currentFrom = fromUnit;
    const currentTo = toUnit;
    const currentInput = inputValue;
    const currentOutput = outputValue;
    setFromUnit(currentTo);
    setToUnit(currentFrom);
    setInputValue(currentOutput);
    setOutputValue(currentInput);
  };
  
  return (
    <div className="unit-converter-page">
      <PageHeader title="unit converter" />
      
      <div className="pivot-control">
        {categories.map(cat => (
          <button 
            key={cat}
            className={`pivot-item ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="converter-body">
        <div className="unit-panel">
          <select value={fromUnit} onChange={e => setFromUnit(e.target.value)}>
            {Object.keys(unitData[activeCategory]).map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
          <input 
            type="text" 
            inputMode="decimal"
            value={inputValue}
            onChange={handleInputChange} 
            className="unit-input"
          />
        </div>

        <button className="swap-btn" onClick={handleSwap}>⇄</button>
        
        <div className="unit-panel">
          <select value={toUnit} onChange={e => setToUnit(e.target.value)}>
            {Object.keys(unitData[activeCategory]).map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
          <input 
            type="text"
            value={outputValue}
            readOnly
            className="unit-input"
            aria-label="Converted value"
          />
        </div>
      </div>
    </div>
  );
};

export default UnitConverter;