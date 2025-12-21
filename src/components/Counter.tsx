import { useState } from 'react'
import './Counter.css'

export function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div className="counter">
      <h2>Count: {count}</h2>
      <div className="button-group">
        <button onClick={() => setCount(count - 1)}>Decrement</button>
        <button onClick={() => setCount(0)}>Reset</button>
        <button onClick={() => setCount(count + 1)}>Increment</button>
      </div>
    </div>
  )
}
