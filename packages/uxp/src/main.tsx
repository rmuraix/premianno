import React, { useEffect, useState } from "react";

import boltUxpLogo from "./assets/bolt-uxp.png";
import viteLogo from "./assets/vite.png";
import tsLogo from "./assets/typescript.png";
import sassLogo from "./assets/sass.png";
import reactLogo from "./assets/react.png";

import { uxp, indesign, photoshop, premierepro, illustrator } from "./globals";
import { api } from "./api/api";

const id = uxp.entrypoints._pluginInfo.id;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "uxp-panel": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & { panelid?: string },
        HTMLElement
      >;
    }
  }
}

export const App = () => {
  const webviewUI = import.meta.env.VITE_BOLT_WEBVIEW_UI === "true";
  
  const [count, setCount] = useState(0);
  const increment = () => setCount((prev) => prev + 1);

  const hostName = (uxp.host.name as string).toLowerCase();

  //* Call Functions Conditionally by App
  if (hostName === "premierepro") {
    console.log("Hello from Premiere Pro", premierepro);
  }
  
  //* Or call the unified API object directly and the correct app function will be used
  const simpleAlert = () => {
    api.notify("Hello World");
  };
  return (
    <>
      {!webviewUI ? (
        <main>
          <div>
            <img className="logo-lg" src={boltUxpLogo} alt="" />
          </div>
          <div className="stack-icons">
            <img src={viteLogo} className="logo" alt="" />
            <span> + </span>
            <img src={reactLogo} className="logo" alt="" />
            <span> + </span>
            <img src={tsLogo} className="logo" alt="" />
            <span> + </span>
            <img src={sassLogo} className="logo" alt="" />
          </div>
          <div className="button-group">
            <button onClick={increment}>count is {count}</button>
            <button onClick={simpleAlert}>Alert</button>
            
          </div>
          <div className="stack-colors">
            <div
              style={{ backgroundColor: "var(--uxp-host-background-color)" }}
            ></div>
            <div
              style={{ backgroundColor: "var(--uxp-host-text-color)" }}
            ></div>
            <div
              style={{ backgroundColor: "var(--uxp-host-border-color)" }}
            ></div>
            <div
              style={{ backgroundColor: "var(--uxp-host-link-text-color)" }}
            ></div>
            <div
              style={{
                backgroundColor:
                  "var(--uxp-host-widget-hover-background-color)",
              }}
            ></div>
            <div
              style={{
                backgroundColor: "var(--uxp-host-widget-hover-text-color)",
              }}
            ></div>
            <div
              style={{
                backgroundColor: "var(--uxp-host-widget-hover-border-color)",
              }}
            ></div>
            <div
              style={{
                backgroundColor: "var(--uxp-host-text-color-secondary)",
              }}
            ></div>
            <div
              style={{
                backgroundColor: "var(--uxp-host-link-hover-text-color)",
              }}
            ></div>
            <div
              style={{ backgroundColor: "var(--uxp-host-label-text-color)" }}
            ></div>
          </div>
          <div>
            <p>
              Edit <span className="code">main.tsx</span> and save to test HMR
              updates.
            </p>
          </div>
          <div className="button-group">
            <a href="https://github.com/hyperbrew/bolt-uxp/">Bolt UXP Docs</a>
            <a href="https://svelte.dev">Svelte Docs</a>
            <a href="https://vitejs.dev/">Vite Docs</a>
          </div>
        </main>
      ) : (
        <></>
      )}

      {/* Example of a secondary panel entrypoint 
      <uxp-panel panelid={`${id}.settings`}>
        <h1>Settings Panel</h1>
        <p>count is: {count}</p>
      </uxp-panel>
      */}
    </>
  );
};
