use crate::error::{Result, WorkerError};
use lapin::{
    options::{BasicPublishOptions, ConfirmSelectOptions},
    types::ShortString,
    BasicProperties, Channel, Connection,
};
use serde::Serialize;
use tracing::debug;

const DELIVERY_MODE_PERSISTENT: u8 = 2;

pub struct Producer {
    channel: Channel,
    queue_name: String,
}

impl Producer {
    pub async fn new(connection: &Connection, queue_name: String) -> Result<Self> {
        let channel = connection.create_channel().await?;

        channel
            .confirm_select(ConfirmSelectOptions::default())
            .await?;

        Ok(Self {
            channel,
            queue_name,
        })
    }

    pub async fn publish<T: Serialize>(&self, message: &T, correlation_id: &str) -> Result<()> {
        let payload = serde_json::to_vec(message)?;

        let properties = BasicProperties::default()
            .with_delivery_mode(DELIVERY_MODE_PERSISTENT)
            .with_content_type(ShortString::from("application/json"))
            .with_correlation_id(ShortString::from(correlation_id.to_string()));

        let confirmation = self
            .channel
            .basic_publish(
                "",
                &self.queue_name,
                BasicPublishOptions::default(),
                &payload,
                properties,
            )
            .await?
            .await?;

        if confirmation.is_nack() {
            return Err(WorkerError::JobFailed(format!(
                "le broker a rejeté la réponse publiée sur {}",
                self.queue_name
            )));
        }

        debug!(queue = %self.queue_name, correlation_id, "Response published");

        Ok(())
    }
}
