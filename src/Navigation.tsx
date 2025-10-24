import { NavLink } from "react-router-dom";

export default function Navigation() {
  return (
    <nav>
      <ul>
        <li>
          <NavLink
            to="/vite-react-ts-1/"
            end
            className={({ isActive }) => (isActive ? "active" : undefined)}
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/vite-react-ts-1/timer">My timer</NavLink>
        </li>
        <li>
          <NavLink to="/vite-react-ts-1/scroll">Infinite Scroll</NavLink>
        </li>
        {/* <li>
          <NavLink to="/vite-react-ts-1/scroll2">Infinite Scroll v2</NavLink>
        </li> */}
      </ul>
    </nav>
  );
}
