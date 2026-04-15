use serde::{Deserialize, Serialize};
use std::fs;
use tauri::command;

// 全局唯一的游戏配置
#[derive(Serialize, Deserialize, Debug)]
pub struct GameConfig {
    pub game_path: String,
}

// 保存游戏目录（覆盖式，全局唯一）
#[tauri::command]
pub async fn save_game_directory(game_path: String) -> Result<bool, String> {
    let config_path = "./project-data/Gamefile.json";

    // 确保文件夹存在
    fs::create_dir_all("./project-data")
        .map_err(|_| "创建项目目录失败")?;

    // 构造配置（永远只有一个）
    let config = GameConfig { game_path };

    // 写入（覆盖式，确保只有一个）
    let json = serde_json::to_string_pretty(&config)
        .map_err(|_| "配置序列化失败")?;

    fs::write(config_path, json)
        .map_err(|_| "写入游戏目录配置失败")?;

    Ok(true)
}

// 读取游戏目录（判断是否已设置）
#[tauri::command]
pub async fn load_game_directory() -> Result<Option<String>, String> {
    let config_path = "./project-data/Gamefile.json";

    if !fs::exists(config_path).map_err(|e| e.to_string())? {
        return Ok(None); // 未设置
    }

    let content = fs::read_to_string(config_path)
        .map_err(|_| "读取配置失败")?;

    let config: GameConfig = serde_json::from_str(&content)
        .map_err(|_| "配置格式错误")?;

    Ok(Some(config.game_path))
}