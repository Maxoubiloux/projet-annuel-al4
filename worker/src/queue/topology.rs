use crate::config::Config;
use crate::error::Result;
use lapin::{
    options::{ExchangeDeclareOptions, QueueBindOptions, QueueDeclareOptions},
    types::{AMQPValue, FieldTable, ShortString},
    Channel, ExchangeKind,
};
use tracing::info;

pub async fn declare(channel: &Channel, config: &Config) -> Result<()> {
    channel
        .exchange_declare(
            &config.dead_letter_exchange,
            ExchangeKind::Fanout,
            ExchangeDeclareOptions {
                durable: true,
                ..ExchangeDeclareOptions::default()
            },
            FieldTable::default(),
        )
        .await?;

    channel
        .queue_declare(
            &config.dead_letter_queue,
            durable_options(),
            FieldTable::default(),
        )
        .await?;

    channel
        .queue_bind(
            &config.dead_letter_queue,
            &config.dead_letter_exchange,
            "",
            QueueBindOptions::default(),
            FieldTable::default(),
        )
        .await?;

    for queue in [&config.request_queue, &config.response_queue] {
        channel
            .queue_declare(
                queue,
                durable_options(),
                dead_lettered_args(&config.dead_letter_exchange),
            )
            .await?;
    }

    info!(
        request_queue = %config.request_queue,
        response_queue = %config.response_queue,
        dead_letter_queue = %config.dead_letter_queue,
        "AMQP topology declared"
    );

    Ok(())
}

fn durable_options() -> QueueDeclareOptions {
    QueueDeclareOptions {
        durable: true,
        ..QueueDeclareOptions::default()
    }
}

fn dead_lettered_args(dead_letter_exchange: &str) -> FieldTable {
    let mut args = FieldTable::default();
    args.insert(
        ShortString::from("x-dead-letter-exchange"),
        AMQPValue::LongString(dead_letter_exchange.into()),
    );
    args
}
