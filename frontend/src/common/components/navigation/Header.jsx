import { NavLink } from "react-router-dom";
import NavIcon from "./NavIcon";
import "./header.css";
import { orgGateApi } from "../../../api/orgGate";

export default function Header({links}) {
const activeOrg = orgGateApi.getActiveOrg();
  return (
    <>
      {activeOrg && (
        <span className="activeOrgBadge">
          {activeOrg.name}
        </span>
      )}
      <header className="floatingHeader">
        
        <nav className="navBar">
          {links.map((link) => 
            <NavLink to={link.location} className="navItem" key={link.title}>
              {({ isActive }) => (
                <NavIcon iconTitle={link.title} isActive={isActive} />
              )}
            </NavLink>
          )}
        </nav>
      </header>
    </>
  );
}