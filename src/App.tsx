import './App.css'
import { Counter } from './components/Counter'

function App() {
  return (
    <>
      <div>
        <h1>Boelslund PlanWell Finance</h1>
        <p>A modern financial planning application built with React, Firebase, and TDD</p>
      </div>
      <Counter />
      <div className="info">
        <p>
          This is a demonstration of test-driven development.
        </p>
        <p>
          Check <code>src/components/Counter.test.tsx</code> to see the tests.
        </p>
      </div>
    </>
  )
}

export default App
