use crate::error::Result;
use futures::StreamExt;
use lapin::{
    options::{BasicAckOptions, BasicConsumeOptions, BasicNackOptions, QueueDeclareOptions},
    types::{FieldTable, AMQPValue, ShortString},
    Channel, Connection,
};
use tracing::{error, info, warn};

pub async fn start_consumer(
    connection: &Connection,
    queue_name: &str,
    handler: impl Fn(Vec<u8>) -> futures::future::BoxFuture<'static, Result<()>> + Send + Sync + 'static,
) -> Result<()> {
    let channel = connection.create_channel().await?;

    let dlq_name = format!("{}_dlq", queue_name);

    channel
        .queue_declare(
            &dlq_name,
            QueueDeclareOptions::default(),
            FieldTable::default(),
        )
        .await?;

    info!("Declared Dead Letter Queue: {}", dlq_name);

    // Configure the main queue to route rejected messages (nack with requeue=false) to the DLQ
    let mut q_args = FieldTable::default();
    q_args.insert(
        ShortString::from("x-dead-letter-exchange"),
        AMQPValue::LongString("".into()),
    );
    q_args.insert(
        ShortString::from("x-dead-letter-routing-key"),
        AMQPValue::LongString(dlq_name.into()),
    );

    channel
        .queue_declare(
            queue_name,
            QueueDeclareOptions::default(),
            q_args,
        )
        .await?;

    let mut consumer = channel
        .basic_consume(
            queue_name,
            "worker_consumer",
            BasicConsumeOptions::default(),
            FieldTable::default(),
        )
        .await?;

    info!("Started consumer on queue: {}", queue_name);

    tokio::spawn(async move {
        while let Some(delivery_result) = consumer.next().await {
            match delivery_result {
                Ok(delivery) => {
                    let data = delivery.data.clone();
                    match handler(data).await {
                        Ok(_) => {
                            if let Err(e) = delivery.ack(BasicAckOptions::default()).await {
                                error!("Failed to ack message: {}", e);
                            }
                        }
                        Err(e) => {
                            error!("Error processing message: {}", e);
                            // Reject the message (could add requeue logic or dead letter queue)
                            if let Err(ack_err) = delivery.nack(BasicNackOptions::default()).await {
                                error!("Failed to nack message: {}", ack_err);
                            }
                        }
                    }
                }
                Err(e) => {
                    warn!("Error receiving message from queue: {}", e);
                }
            }
        }
    });

    Ok(())
}
