use crate::error::Result;
use lapin::{
    options::{BasicPublishOptions, QueueDeclareOptions},
    types::FieldTable,
    BasicProperties, Connection, Channel
};
use serde::Serialize;
use tracing::info;

pub struct Producer {
    channel: Channel,
    queue_name: String,
}

impl Producer {
    pub async fn new(connection: &Connection, queue_name: String) -> Result<Self> {
        let channel = connection.create_channel().await?;

        channel
            .queue_declare(
                &queue_name,
                QueueDeclareOptions::default(),
                FieldTable::default(),
            )
            .await?;

        Ok(Self {
            channel,
            queue_name,
        })
    }

    pub async fn publish<T: Serialize>(&self, message: &T) -> Result<()> {
        let payload = serde_json::to_vec(message)?;

        self.channel
            .basic_publish(
                "",
                &self.queue_name,
                BasicPublishOptions::default(),
                &payload,
                BasicProperties::default(),
            )
            .await?;

        Ok(())
    }
}
