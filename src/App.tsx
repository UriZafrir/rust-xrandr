import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [brightness, setBrightness] = useState(1.0);
  const [output, setOutput] = useState("");
  const [outputs, setOutputs] = useState<string[]>([]);


  async function applyBrightness() {
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
        const result = await invoke("get_outputs");
        setOutputs(result as string[]);
        if ((result as string[]).length > 0) {
          setOutputs(result as string[]);
        }
        console.log("Fetched outputs:", result);
      } catch (error) {
        console.error("Error fetching outputs:", error);
      }
    }
    fetchOutputs();
  }, []);

  useEffect(() => {
    if (output) {
      applyBrightness();
    }
  }, [brightness, output]);

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
          step="0.05"
          value={brightness}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBrightness(parseFloat(e.currentTarget.value))}
        />
        <span>{brightness.toFixed(2)}</span>
      </div>

      <div className="row">
        <button onClick={applyBrightness}>Apply Brightness</button>
      </div>
    </main>
  );
}

export default App;

