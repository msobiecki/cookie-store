import { type ComponentType, useCallback } from "react";
import { CookieProvider, useCookie } from "@msobiecki/cookie-store";

import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import "./App.css";

function App() {
  const [theme, setTheme, removeTheme] = useCookie("theme", {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  });

  const handleThemeChange = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  const handleThemeRemove = useCallback(() => {
    removeTheme();
  }, [removeTheme]);

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button className="highlight" onClick={handleThemeChange}>
          Theme is {theme || "not set"}
        </button>

        <button className="highlight" onClick={handleThemeRemove}>
          Remove theme
        </button>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  );
}

const withCookieStore = <P extends object>(Component: ComponentType<P>) => {
  return function WrappedComponent(properties: P) {
    return (
      <CookieProvider>
        <Component {...properties} />
      </CookieProvider>
    );
  };
};

export default withCookieStore(App);
