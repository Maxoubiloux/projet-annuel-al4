use crate::error::Result;
use serde_json::{json, Value};
use tokio::time::{sleep, Duration};
use tracing::info;

pub async fn handle(to: &str, subject: &str, _body: &str) -> Result<Value> {
    info!("Sending email to `{}` with subject `{}`", to, subject);
    
    sleep(Duration::from_millis(500)).await;
    
    info!("Successfully sent email to `{}`", to);
    
    Ok(json!({
        "status": "success",
        "recipient": to,
        "delivered_at": chrono::Utc::now().to_rfc3339()
    }))
}
