import type React from "react";
import { useState } from "react";
import { api } from "./api/api";
import { indesign, uxp } from "./globals";

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
  const [count, setCount] = useState(0);
  const increment = () => setCount((prev) => prev + 1);

  const hostName = (uxp.host.name as string).toLowerCase();

  //* Call Functions Conditionally by App
  if (hostName === "premierepro") {
    console.log("Hello from Premiere Pro", indesign);
  }

  //* Or call the unified API object directly and the correct app function will be used
  const helloWorld = () => {
    api.notify("Hello World");
  };
  return (
    <>
      <main className="flex flex-col justify-center items-center [&>*]:mt-4">
        <div className="flex justify-center items-center [&>*]:mr-2">
          <button type="button" onClick={increment}>
            count is {count}
          </button>
          <button type="button" onClick={helloWorld}>
            Hello World
          </button>
        </div>
        <div>
          <p>
            Edit <span className="font-mono mx-1">main.tsx</span> and save to
            test HMR updates.
          </p>
        </div>
      </main>
      {/* Example of a secondary panel entrypoint 
      <uxp-panel panelid="bolt.uxp.plugin.settings">
        <h1>Settings Panel</h1>
        <p>count is: {count}</p>
      </uxp-panel>
      */}
    </>
  );
};
