import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/Home.tsx";
import TimerPage from "./pages/Timer.tsx";
import ScrollPage from "./pages/Scroll.tsx";
// import ScrollPage2 from "./pages/Scroll2.tsx";
import Navigation from "./Navigation.tsx";

// Custom hooks - користувацькі хуки
// Virtual DOM - віртуальний DOM

// useState \ useReducer - хук стану
// Custom components - користувацькі компоненти: props, state

// useEffect - хук ефектів
// useRef - хук посилання
// useMemo - хук мемоізації
// useCallback - хук зворотного виклику
// useContext - хук контексту

//Intersection Observer API
//https://picsum.photos/v2/list?page=4&limit=5

function App() {
  return (
    <BrowserRouter>
      <Navigation />

      <Routes>
        <Route path="/vite-react-ts-1/" element={<HomePage />} />

        <Route path="/vite-react-ts-1/timer" element={<TimerPage />} />

        <Route path="/vite-react-ts-1/scroll" element={<ScrollPage />} />

        {/* <Route path="/vite-react-ts-1/scroll2" element={<ScrollPage2 />} /> */}

        <Route path="*" element={<h2>404 Not Found</h2>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
