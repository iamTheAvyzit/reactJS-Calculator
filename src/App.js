import { useReducer } from 'react';
import './App.css';
import DigitButton from './DigitButton';
import OperationButton from './OperationButton';

export const ACTION = {
  ADD_DIGIT: 'add-digit',
  CHOOSE_OPERATION: 'choose-operation',
  CLEAR: 'clear',
  DEL_DIGIT: 'del-digit',
  EVALUATE: 'evaluate'
}

const INT_FORMATTER = new Intl.NumberFormat("en-us", {                                              // formatting the input and output in International US format (commas seperated: 1, 000, 00)
  maximumFractionDigits: 0
})

function reducer(state, {type, payload}) {                                                          // destructuring action as type & payload
  switch(type) {                                                                                    // type is an action, dispatched by <DigitButton> or <OperationButton>
    case ACTION.ADD_DIGIT:
      if(state.overwrite) {                                                                         // everytime the result is evaluated, if the user clicks any digit, the currOperand is set to that particular digit
        return {
          ...state,
          currOperand: payload.digit,
          overwrite:false                                                                           // overwrite is the flag which is set true whenever ACTION.EVALUATE is dispatched
        }
      }
      if(payload.digit === "0" && state.currOperand === "0") {return state}                         // if user clicks "0" multiple times, it will render only once if the currOperand is 0
      if(payload.digit === "." && state.currOperand.includes(".")) {return state}                   // at all times, there will be only one decimal point "." in the string
      
      return {
        ...state,
        currOperand: `${state.currOperand || ""}${payload.digit}`                                   // once all the conditions are checked, we set currOperand to the digit that user enters or leave it blank if nothing is entered
      }
    
    case ACTION.CHOOSE_OPERATION:
      if(state.currOperand == null && state.prevOperand == null) {return state}                     //if nothing is typed out we don't want anything to happen, just return the same state

      if(state.currOperand == null) {                                                               // this lets user change the operator symbol, if pressed "*" and again pressed "+" our prevOperand will set to "+"
        return {
          ...state,
          operation: payload.operation
        }
      }

      if(state.prevOperand == null) {                                                               // if prevOperand is null
        return {
          ...state,                                                                                 // spread out state variables 
          operation: payload.operation,
          prevOperand: state.currOperand,                                                           // and change prevOperand to currOperand
          currOperand: null                                                                         // and set currOperand to null so that user can enter the second operand
        }
      }

      return {                                                                                      // what if user clicks "2" + "2" and again "+" then it will evaluate(2+2 = 4) and render "4+"" in the prevOperand
        ...state,
        prevOperand: evaluate(state),                                                               // set the return value of evaluate() prevOperand
        operation: payload.operation,                                                               // add operation button
        currOperand: null                                                                           // and set currOperand to null and let user add new value
      }
    
    case ACTION.CLEAR:
      return {}
    
    case ACTION.DEL_DIGIT:
      if (state.overwrite) {                                                                        // this also checks for the evaluted overwrite thing same as above and will set everything to null
        return {
          ...state,
          overwrite: false,
          currOperand: null
        }
      }
      if (state.currOperand == null) return state                                                   // if our currOperand is already null, then don't delete anything or do nothing
      if (state.currOperand.length === 1) {                                                         // if currOperand is a single digit then update the state by setting currOperand to null
        return { ...state, currOperand: null }
      }
      return {
        ...state,
        currOperand: state.currOperand.slice(0, -1)                                                 // else remove the last digit from the currOperand
      }
    
    case ACTION.EVALUATE:
      if(state.operation == null || state.currOperand == null || state.prevOperand == null ) return state         // check all operands are present
      return {
        ...state,
        overwrite: true,
        operation: null,
        prevOperand: null,
        currOperand: evaluate(state)
      }
  }
}

function evaluate({currOperand, prevOperand, operation}) {
  const prev = parseFloat(prevOperand)                                                              // convert string to float
  const curr = parseFloat(currOperand)
  if(isNaN(prev)||isNaN(curr)) return ""                                                            // if any of the operands is NaN, then do nothing
  let evaluated=""
  switch(operation) {
    case "+": evaluated= prev + curr; break;
    case "–": evaluated= prev - curr; break;
    case "✕": evaluated= prev * curr; break;
    case "÷": evaluated= prev / curr; break;
  }
  return evaluated.toString()                                                                       // send the result back to reducer
}

function formatOperand(operand) {
  if(operand == null) return                                                                        // don't format anything if the string is empty
  const [integer, decimal] = operand.split('.')                                                     // we don't want to format the digits after decimal, so split the whole string in two parts by "." it will give "integer" and everything after "." in the "decimal"
  if(decimal == null) return INT_FORMATTER.format(integer)
  return `${INT_FORMATTER.format(integer)}.${decimal}`                                              // call in-built format() to format the integer part and concatenate the decimal part to the result
}

function App() {
  const [{currOperand, prevOperand, operation}, dispatch] = useReducer(reducer, {})                             // here we are managing 3 states and dispatc
  return (
    <div className="calc-grid">
      <div className="output">
        <div className="prev-operand">{formatOperand(prevOperand)} {operation}</div>
        <div className="curr-operand">{formatOperand(currOperand)}</div>
      </div>
      <button className="span-two" onClick={() => dispatch({type: ACTION.CLEAR})}>AC</button>
      <button onClick={() => dispatch({type: ACTION.DEL_DIGIT})}>DEL</button>
      <OperationButton operation="÷" dispatch={dispatch}/>
      <DigitButton digit="7" dispatch={dispatch}/>
      <DigitButton digit="8" dispatch={dispatch}/>
      <DigitButton digit="9" dispatch={dispatch}/>
      <OperationButton operation="✕" dispatch={dispatch}/>
      <DigitButton digit="6" dispatch={dispatch}/>
      <DigitButton digit="5" dispatch={dispatch}/>
      <DigitButton digit="4" dispatch={dispatch}/>
      <OperationButton operation="–" dispatch={dispatch}/>
      <DigitButton digit="3" dispatch={dispatch}/>
      <DigitButton digit="2" dispatch={dispatch}/>
      <DigitButton digit="1" dispatch={dispatch}/>
      <OperationButton operation="+" dispatch={dispatch}/>
      <DigitButton digit="." dispatch={dispatch}/>
      <DigitButton digit="0" dispatch={dispatch}/>
      <button className="span-two" onClick={() => dispatch({type: ACTION.EVALUATE})}>=</button>
    </div>
  );
}

export default App;
