use std::process::Command;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

pub struct AppState {
    pub debug: bool,
}

#[tauri::command]
fn set_brightness(output: &str, value: f32, app_state: tauri::State<AppState>) -> Result<String, String> {
    let output_str = output.to_string();
    let value_str = value.to_string();
    let debug = app_state.debug;

    let command_output = Command::new("xrandr")
        .arg("--output")
        .arg(&output_str)
        .arg("--brightness")
        .arg(&value_str)
        .output();

    match command_output {
        Ok(output) => {
            if output.status.success() {
                if debug {
                    println!("Command executed successfully: xrandr --output {} --brightness {}", output_str, value_str);
                    println!("Stdout: {}", String::from_utf8_lossy(&output.stdout));    
                }
                Ok(format!("Brightness set for {}: {}", output_str, value_str))
            } else {
                eprintln!("Command failed: xrandr --output {} --brightness {}", output_str, value_str);
                eprintln!("Stderr: {}", String::from_utf8_lossy(&output.stderr));
                Err(format!(
                    "Failed to set brightness: {}",
                    String::from_utf8_lossy(&output.stderr)
                ))
            }
        }
        Err(e) => {
            eprintln!("Failed to execute command: xrandr --output {} --brightness {}. Error: {}", output_str, value_str, e);
            Err(format!("Failed to execute command: {}", e))
        },
    }
}

#[tauri::command]
fn get_outputs() -> Result<Vec<String>, String> {
    let command_output = Command::new("xrandr")
        .arg("--query")
        .output();

    match command_output {
        Ok(output) => {
            if output.status.success() {
                let stdout = String::from_utf8_lossy(&output.stdout);
                let outputs: Vec<String> = stdout
                    .lines()
                    .filter_map(|line| {
                        if line.contains(" connected") {
                            line.split_whitespace().next().map(|s| s.to_string())
                        } else {
                            None
                        }
                    })
                    .collect();
                Ok(outputs)
            } else {
                Err(format!(
                    "Failed to get outputs: {}",
                    String::from_utf8_lossy(&output.stderr)
                ))
            }
        }
        Err(e) => Err(format!("Failed to execute command: {}", e)),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run_with_debug(debug: bool) {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, set_brightness, get_outputs])
        .manage(AppState { debug })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
