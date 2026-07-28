use crate::error::Result;
use serde_json::{json, Value};
use tokio::time::{sleep, Duration};
use tracing::info;

pub async fn handle(user_id: &str, document_url: &str) -> Result<Value> {
    info!("Validating document for user `{}`: {}", user_id, document_url);
    
    sleep(Duration::from_millis(1800)).await;
    
    info!("Successfully validated document for user `{}`", user_id);
    
    Ok(json!({
        "status": "success",
        "user_id": user_id,
        "is_valid": true,
        "confidence_score": 0.98
    }))
}
