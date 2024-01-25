import React, { useEffect, useState } from 'react'
import SwitchSelector from 'react-switch-selector';
const demo = () => {
const options = [
    {
        label: <span>Foo</span>,
        value: {
             foo: true
        },
        selectedBackgroundColor: "#0097e6",
    },
    {
        label: "Bar",
        value: "bar",
        selectedBackgroundColor: "#fbc531"
    }
 ];
 
 const onChange = (newValue) => {
     console.log(newValue);
 };
 
 const initialSelectedIndex = options.findIndex(({value}) => value === "bar");
 return (
    <div className="your-required-wrapper" style={{width: 100, height: 30}}>
       <SwitchSelector
  options={options}
  selectedOption={'Option 1'}
  onChange={(option) => {
    // Do something with the selected option
  }}
/>
    </div>
);
 
}
export default demo;