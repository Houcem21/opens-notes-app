import { useLocation, NavLink } from "react-router-dom";
import NavIcon from "./NavIcon";
import "./header.css";

export default function Header({links}) {
  const location = useLocation();
  const locationName = location.pathname;
  
  return (
    <header className="floatingHeader">
      <nav className="navBar">
        {links.map((link) => 
          <NavLink to={link.location} className="navItem" key={link.title}>
            {({ isActive }) => (
              <NavIcon iconTitle={link.title} isActive={locationName === link.location} />
            )}
          </NavLink>
        )}
      </nav>
    </header>
  );
}