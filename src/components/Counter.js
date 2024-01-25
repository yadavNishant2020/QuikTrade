
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { increment, decrement } from "../redux/actions/counterActions";
import { selectCount } from "../redux/selectors/counterSelectors";

const Counter = () => {
  const count = useSelector(selectCount);
  const dispatch = useDispatch();

  const handleIncrement = () => {
    dispatch(increment());
  };

  const handleDecrement = () => {
    dispatch(decrement());
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={handleIncrement}>Increment</button>
      <button onClick={handleDecrement}>Decrement</button>
    </div>
  );
}

export default Counter;
