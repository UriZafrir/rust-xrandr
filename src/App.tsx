import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [brightness, setBrightness] = useState<number | null>(null);
  const [output, setOutput] = useState("");
  const [outputs, setOutputs] = useState<string[]>([]);
  const [isInitialSetup, setIsInitialSetup] = useState(true);

  async function applyBrightness() {
    console.log("applyBrightness called with output:", output);
    if (!output || brightness === null) {
      console.warn("No output selected or brightness not set. Cannot apply brightness.");
      return;
    }
    try {
      const result = await invoke("set_brightness", { output, value: brightness });
      console.log(result);
    } catch (error) {
      console.error("Error setting brightness:", error);
    }
  }

  useEffect(() => {
    async function fetchOutputs() {
      try {
        console.log("Fetching outputs...");
        const result = await invoke("get_outputs");
        console.log("Fetched outputs:", result);
        
        if (!result || !(result as string[]).length) {
          console.log("No outputs found or result is invalid");
          setOutputs([]);
          setOutput("");
          return;
        }
        
        console.log("First output:", (result as string[])[0]);
        setOutputs(result as string[]);
        
        // On Boot set the first output
        const firstOutput = (result as string[])[0];
        console.log("Setting output to:", firstOutput);
        setOutput(firstOutput);
        
        // Fetch initial brightness for this output
        try {
          const brightnessResult = await invoke("get_brightness", { output: firstOutput });
          console.log("Fetched brightness:", brightnessResult);
          setBrightness(brightnessResult as number);
        } catch (brightnessError) {
          console.error("Error fetching brightness, using default:", brightnessError);
          // Keep default brightness of 1.0
        }
        
        // Initial setup is complete
        setIsInitialSetup(false);
      } catch (error) {
        console.error("Error fetching outputs:", error);
        setOutputs([]);
        setOutput("");
      }
    }
    fetchOutputs();
  }, []);

  useEffect(() => {
    console.log("Current output state in useEffect:", output);
    // Only apply brightness automatically if this is not the initial setup
    if (output && brightness !== null && !isInitialSetup) {
      console.log("useEffect calling applyBrightness with output:", output);
      applyBrightness();
    } else if (isInitialSetup) {
      console.log("Initial setup in progress, not applying brightness automatically");
    } else {
      console.log("useEffect not calling applyBrightness because output is empty or brightness is not set");
    }
  }, [brightness, output, isInitialSetup]);

  return (
    <main className="container">
      <h1>Xrandr Brightness Control</h1>

      <div className="row">
        <label htmlFor="output-select">Select Output:</label>
        <select
          id="output-select"
          value={output}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setOutput(e.currentTarget.value)}
        >
          {outputs.map((out) => (
            <option key={out} value={out}>
              {out}
            </option>
          ))}
        </select>
      </div>

      <div className="row">
        <label htmlFor="brightness-range">Brightness:</label>
        <input
          type="range"
          id="brightness-range"
          min="0.1"
          max="1.0"
          step="0.01"
          value={brightness !== null ? brightness : 1.0}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBrightness(parseFloat(e.currentTarget.value))}
          disabled={isInitialSetup}
        />
        <span>{brightness !== null ? brightness.toFixed(2) : "1.00"}</span>
      </div>

      <div className="row">
        <button onClick={applyBrightness}>Apply Brightness</button>
      </div>
    </main>
  );
}

export default App;

