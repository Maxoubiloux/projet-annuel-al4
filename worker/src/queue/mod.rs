pub mod consumer;
pub mod producer;
pub mod topology;

use crate::config::Config;
use crate::error::Result;
use lapin::{Connection, ConnectionProperties};
use std::time::Duration;
use tokio::time::sleep;
use tracing::warn;

const CONNECT_ATTEMPTS: u32 = 10;
const CONNECT_DELAY_MS: u64 = 2_000;

pub async fn connect(config: &Config) -> Result<Connection> {
    let mut last_error = None;

    for attempt in 1..=CONNECT_ATTEMPTS {
        match Connection::connect(&config.rabbitmq_url, ConnectionProperties::default()).await {
            Ok(connection) => return Ok(connection),
            Err(err) => {
                warn!(
                    error = %err,
                    attempt,
                    max_attempts = CONNECT_ATTEMPTS,
                    "RabbitMQ unreachable, retrying"
                );
                last_error = Some(err);
                sleep(Duration::from_millis(CONNECT_DELAY_MS)).await;
            }
        }
    }

    Err(last_error
        .expect("CONNECT_ATTEMPTS >= 1 garantit qu'une erreur a été capturée")
        .into())
}
