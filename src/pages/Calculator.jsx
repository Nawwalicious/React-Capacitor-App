import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Calculator.scss';

const PageHeader = ({ title }) => (
  <header className="page-header">
    <Link to="/" className="back-btn" aria-label="Go back to Dashboard">
      ‹
    </Link>
    <h1 className="page-title">{title}</h1>
  </header>
);

const Calculator = () => {
  const [input, setInput] = useState('0');
  const [firstOperand, setFirstOperand] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);
  const [angleMode, setAngleMode] = useState('deg');

  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDigitClick = (digit) => {
    if (waitingForSecondOperand) {
      setInput(String(digit));
      setWaitingForSecondOperand(false);
    } else {
      setInput(input === '0' ? String(digit) : input + digit);
    }
  };

  const handleDecimalClick = () => {
    if (!input.includes('.')) {
      setInput(input + '.');
      setWaitingForSecondOperand(false);
    }
  };

  const handleOperatorClick = (nextOperator) => {
    const inputValue = parseFloat(input);
    if (operator && !waitingForSecondOperand) {
      const result = calculate(firstOperand, inputValue, operator);
      setInput(String(result));
      setFirstOperand(result);
    } else {
      setFirstOperand(inputValue);
    }
    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
  };
  
  const calculate = (first, second, op) => {
    switch (op) {
      case '+': return first + second;
      case '-': return first - second;
      case '*': return first * second;
      case '/': return second === 0 ? 'Error' : first / second;
      case '^': return Math.pow(first, second);
      default: return second;
    }
  };

  const handleEqualsClick = () => {
    if (!operator || firstOperand === null) return;
    const secondOperand = parseFloat(input);
    const result = calculate(firstOperand, secondOperand, operator);
    setInput(String(result));
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
  };

  const handleClearClick = () => {
    setInput('0');
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
  };

  const handleBackspaceClick = () => {
    setInput(input.length > 1 ? input.slice(0, -1) : '0');
  };

  const handlePlusMinusClick = () => {
    setInput(String(parseFloat(input) * -1));
  };

  const handleScientificFunction = (func) => {
    const value = parseFloat(input);
    let result;

    const toRadians = (deg) => deg * (Math.PI / 180);
    const angleValue = angleMode === 'deg' ? toRadians(value) : value;

    switch (func) {
      case 'sin': result = Math.sin(angleValue); break;
      case 'cos': result = Math.cos(angleValue); break;
      case 'tan': result = Math.tan(angleValue); break;
      case 'log': result = Math.log10(value); break;
      case 'ln': result = Math.log(value); break;
      case 'sqrt': result = Math.sqrt(value); break;
      case 'sq': result = Math.pow(value, 2); break;
      case 'inv': result = 1 / value; break;
      case 'pi': result = Math.PI; break;
      case 'e': result = Math.E; break;
      default: result = value;
    }
    
    setInput(String(result));
    setWaitingForSecondOperand(false);
  };

  // Standard calculator layout (portrait)
  const renderStandardCalculator = () => (
    <>
      <div className="display">{input}</div>
      
      <button onClick={handleClearClick} className="btn-op">C</button>
      <button onClick={handlePlusMinusClick} className="btn-op">±</button>
      <button onClick={handleBackspaceClick} className="btn-op">⌫</button>
      <button onClick={() => handleOperatorClick('/')} className="btn-op">÷</button>

      <button onClick={() => handleDigitClick(7)}>7</button>
      <button onClick={() => handleDigitClick(8)}>8</button>
      <button onClick={() => handleDigitClick(9)}>9</button>
      <button onClick={() => handleOperatorClick('*')} className="btn-op">×</button>

      <button onClick={() => handleDigitClick(4)}>4</button>
      <button onClick={() => handleDigitClick(5)}>5</button>
      <button onClick={() => handleDigitClick(6)}>6</button>
      <button onClick={() => handleOperatorClick('-')} className="btn-op">-</button>

      <button onClick={() => handleDigitClick(1)}>1</button>
      <button onClick={() => handleDigitClick(2)}>2</button>
      <button onClick={() => handleDigitClick(3)}>3</button>
      <button onClick={() => handleOperatorClick('+')} className="btn-op">+</button>
      
      <button onClick={() => handleDigitClick(0)} className="btn-zero">0</button>
      <button onClick={handleDecimalClick}>.</button>
      <button onClick={handleEqualsClick} className="btn-equals">=</button>
    </>
  );

  // Scientific calculator layout (landscape)
  const renderScientificCalculator = () => (
    <>
      <div className="display">{input}</div>
      
      {/* Row 2: Scientific functions */}
      <button onClick={() => handleScientificFunction('sq')} className="btn-sci">x²</button>
      <button onClick={() => handleScientificFunction('sqrt')} className="btn-sci">√x</button>
      <button onClick={() => handleScientificFunction('inv')} className="btn-sci">1/x</button>
      <button onClick={() => handleOperatorClick('^')} className="btn-sci">xʸ</button>
      <button onClick={handleClearClick} className="btn-op">C</button>
      <button onClick={handlePlusMinusClick} className="btn-op">±</button>
      <button onClick={handleBackspaceClick} className="btn-op">⌫</button>
      <button onClick={() => handleOperatorClick('/')} className="btn-op">÷</button>

      {/* Row 3: More scientific functions */}
      <button onClick={() => handleScientificFunction('log')} className="btn-sci">log</button>
      <button onClick={() => handleScientificFunction('ln')} className="btn-sci">ln</button>
      <button onClick={() => handleScientificFunction('pi')} className="btn-sci">π</button>
      <button onClick={() => handleScientificFunction('e')} className="btn-sci">e</button>
      <button onClick={() => handleDigitClick(7)}>7</button>
      <button onClick={() => handleDigitClick(8)}>8</button>
      <button onClick={() => handleDigitClick(9)}>9</button>
      <button onClick={() => handleOperatorClick('*')} className="btn-op">×</button>

      {/* Row 4: Trigonometric functions */}
      <button onClick={() => handleScientificFunction('sin')} className="btn-sci">sin</button>
      <button onClick={() => handleScientificFunction('cos')} className="btn-sci">cos</button>
      <button onClick={() => handleScientificFunction('tan')} className="btn-sci">tan</button>
      <button onClick={() => setAngleMode(angleMode === 'deg' ? 'rad' : 'deg')} className="btn-sci btn-toggle">{angleMode}</button>
      <button onClick={() => handleDigitClick(4)}>4</button>
      <button onClick={() => handleDigitClick(5)}>5</button>
      <button onClick={() => handleDigitClick(6)}>6</button>
      <button onClick={() => handleOperatorClick('-')} className="btn-op">-</button>

      {/* Row 5: Numbers and operators */}
      <button onClick={() => handleDigitClick(1)}>1</button>
      <button onClick={() => handleDigitClick(2)}>2</button>
      <button onClick={() => handleDigitClick(3)}>3</button>
      <button onClick={() => handleOperatorClick('+')} className="btn-op">+</button>

      {/* Row 6: Bottom row */}
      <button onClick={() => handleDigitClick(0)} className="btn-zero">0</button>
      <button onClick={handleDecimalClick}>.</button>
      <button onClick={handleEqualsClick} className="btn-equals">=</button>
    </>
  );

  return (
    <div className="calculator-page">
      <PageHeader title="calculator" />
      <div className="calculator-container">
        <div className={`calculator-grid ${isLandscape ? 'scientific' : 'standard'}`}>
          {isLandscape ? renderScientificCalculator() : renderStandardCalculator()}
        </div>
      </div>
    </div>
  );
};

export default Calculator;