import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import NavIcon from "./NavIcon";
import "./header.css";

const ANIMATION_MS = 280;

export default function Header({ links }) {
  const [items, setItems] = useState(() =>
    links.map((link) => ({ ...link, state: "visible" }))
  );

  useEffect(() => {
    setItems((current) => {
      const nextLocations = new Set(links.map((link) => link.location));

      const keptItems = current.map((item) =>
        nextLocations.has(item.location)
          ? { ...item, state: "visible" }
          : { ...item, state: "leaving" }
      );

      const newItems = links
        .filter(
          (link) => !current.some((item) => item.location === link.location)
        )
        .map((link) => ({ ...link, state: "entering" }));

      return [...keptItems, ...newItems];
    });

    const enterTimer = requestAnimationFrame(() => {
      setItems((current) =>
        current.map((item) =>
          item.state === "entering" ? { ...item, state: "visible" } : item
        )
      );
    });

    const cleanupTimer = setTimeout(() => {
      setItems((current) =>
        current.filter((item) => item.state !== "leaving")
      );
    }, ANIMATION_MS);

    return () => {
      cancelAnimationFrame(enterTimer);
      clearTimeout(cleanupTimer);
    };
  }, [links]);

  return (
    <header className="floatingHeader">
      <nav className="navBar">
        {items.map((link) => (
          <NavLink
            to={link.location}
            key={link.location}
            className={`navItem navItem-${link.state}`}
          >
            {({ isActive }) => (
              <NavIcon iconTitle={link.title} isActive={isActive} />
            )}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}