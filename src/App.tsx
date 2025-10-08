import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Game from "./Tic.tsx";

// Custom hooks - користувацькі хуки
// Virtual DOM - віртуальний DOM

// useState \ useReducer - хук стану
// Custom components - користувацькі компоненти: props, state

// useEffect - хук ефектів
// useRef - хук посилання
// useMemo - хук мемоізації
// useCallback - хук зворотного виклику
// useContext - хук контексту

function App() {
  const [count, setCount] = useState(() => 0);

  // function f(a) {
  //   console.log(a);
  // }
  const test: string = "Test TS";
  console.log(test);

  let var1;

  const [name, setName] = useState("User");
  console.log("App render");

  return (
    <>
      <h2>Hello, {name}!</h2>
      <button
        onClick={() => {
          setName("New User");
        }}
      >
        Change Name
      </button>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>First test Vite + React 1.0</h1>
      <Game />
      <div className="card">
        <button onClick={() => setCount(count + 1)}>count is {count}</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
