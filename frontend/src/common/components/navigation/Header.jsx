import { NavLink } from "react-router-dom";
import { Home, BookOpen, Network, CheckSquare } from "lucide-react";
import "./header.css";

export default function Header() {
  return (
    <header className="floatingHeader">
      <nav className="navBar">
        <NavLink to="/" className="navItem">
          {({ isActive }) => (
            <Home className={isActive ? "icon active" : "icon"} />
          )}
        </NavLink>

        <NavLink to="/blog" className="navItem">
          {({ isActive }) => (
            <BookOpen className={isActive ? "icon active" : "icon"} />
          )}
        </NavLink>

        <NavLink to="/notes" className="navItem">
          {({ isActive }) => (
            <Network className={isActive ? "icon active" : "icon"} />
          )}
        </NavLink>

        <NavLink to="/tasks" className="navItem">
          {({ isActive }) => (
            <CheckSquare className={isActive ? "icon active" : "icon"} />
          )}
        </NavLink>
      </nav>
    </header>
  );
}