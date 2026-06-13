import { Link } from "react-router-dom";
import HomeMouseGlow from "../components/HomeMouseGlow";

import "../styles/home.css";

export default function Home() {
  return (
    <main className="homePage">
      <HomeMouseGlow />
      <section className="homeHero">
        <p className="homeEyebrow">Internal CRM</p>
        <h1>Team Knowledge & Onboarding Hub</h1>
        <p>
          A way to centralize all our info and streamline contributions.
        </p>
      </section>

      <section className="homeGrid">
        <Link className="homeCard" to="/blog">
          <span>01</span>
          <h2>Docs</h2>
          <p>Onboarding for new Devs; Introducing the workflow.</p>
        </Link>

        <Link className="homeCard" to="/graph">
          <span>02</span>
          <h2>Graphs</h2>
          <p>Visual of the project's structure and its components.</p>
        </Link>

        <Link className="homeCard" to="/tasks">
          <span>03</span>
          <h2>Tasks</h2>
          <p>All to-dos and our current progress.</p>
        </Link>
      </section>
    </main>
  );
}