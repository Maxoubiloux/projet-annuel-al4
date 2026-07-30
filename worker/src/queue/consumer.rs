use crate::error::Result;
use futures::future::BoxFuture;
use futures::StreamExt;
use lapin::{
    options::{BasicAckOptions, BasicConsumeOptions, BasicNackOptions, BasicQosOptions},
    types::FieldTable,
    Channel,
};
use std::future::Future;
use tracing::{error, info, warn};

const PREFETCH: u16 = 1;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Outcome {
    Ack,
    DeadLetter,
}

pub async fn run<F>(
    channel: &Channel,
    queue: &str,
    handler: F,
    shutdown: impl Future<Output = ()> + Send,
) -> Result<()>
where
    F: Fn(Vec<u8>) -> BoxFuture<'static, Outcome> + Send + Sync,
{
    channel
        .basic_qos(PREFETCH, BasicQosOptions::default())
        .await?;

    let mut consumer = channel
        .basic_consume(
            queue,
            "moto-rental-worker",
            BasicConsumeOptions::default(),
            FieldTable::default(),
        )
        .await?;

    info!(queue, prefetch = PREFETCH, "Consumer started");

    tokio::pin!(shutdown);

    loop {
        tokio::select! {
            _ = &mut shutdown => {
                info!(queue, "Shutdown signal received, stopping consumer");
                break;
            }
            delivery = consumer.next() => {
                let Some(delivery) = delivery else {
                    warn!(queue, "Consumer stream ended (channel or connection closed)");
                    break;
                };

                match delivery {
                    Ok(delivery) => {
                        let outcome = handler(delivery.data.clone()).await;
                        let ack_result = match outcome {
                            Outcome::Ack => delivery.ack(BasicAckOptions::default()).await,
                            Outcome::DeadLetter => {
                                delivery
                                    .nack(BasicNackOptions {
                                        requeue: false,
                                        ..BasicNackOptions::default()
                                    })
                                    .await
                            }
                        };

                        if let Err(err) = ack_result {
                            error!(error = %err, ?outcome, "Failed to settle message");
                        }
                    }
                    Err(err) => {
                        error!(error = %err, queue, "Failed to receive message");
                        break;
                    }
                }
            }
        }
    }

    Ok(())
}
