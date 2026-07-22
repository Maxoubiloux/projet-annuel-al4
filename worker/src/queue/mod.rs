pub mod consumer;
pub mod producer;

use lapin::{Connection, ConnectionProperties};
use crate::config::Config;
use crate::error::Result;

pub async fn connect(config: &Config) -> Result<Connection> {
    let connection = Connection::connect(&config.rabbitmq_url, ConnectionProperties::default()).await?;
    Ok(connection)
}
