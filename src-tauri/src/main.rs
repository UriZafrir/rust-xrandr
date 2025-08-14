// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use clap::{Arg, Command, ArgAction};

fn main() {
    let matches = Command::new("Rust Xrandr")
        .version("1.0")
        .author("Your Name")
        .about("Controls display settings")
        .arg(
            Arg::new("debug")
                .short('d')
                .long("debug")
                .help("Prints debug information")
                .action(ArgAction::SetTrue),
        )
        .get_matches();

    let debug = matches.get_flag("debug");

    tauri_app_lib::run_with_debug(debug)
}
