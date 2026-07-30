use moto_rental_worker::config::Config;
use moto_rental_worker::error::Result;
use moto_rental_worker::jobs::ContractJobHandler;
use moto_rental_worker::queue::producer::Producer;
use moto_rental_worker::queue::{self, consumer, topology};
use std::process::ExitCode;
use std::sync::Arc;
use tracing::{error, info};
use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() -> ExitCode {
    init_tracing();

    match run().await {
        Ok(()) => {
            info!("Worker stopped");
            ExitCode::SUCCESS
        }
        Err(err) => {
            error!(error = %err, "Worker stopped on error");
            ExitCode::FAILURE
        }
    }
}

async fn run() -> Result<()> {
    let config = Config::from_env()?;
    info!(config = %config.summary(), "Worker starting");

    std::fs::create_dir_all(&config.contracts_dir)?;

    let connection = queue::connect(&config).await?;
    let channel = connection.create_channel().await?;
    topology::declare(&channel, &config).await?;

    let producer = Arc::new(Producer::new(&connection, config.response_queue.clone()).await?);
    let handler = Arc::new(ContractJobHandler::new(producer, &config));

    consumer::run(
        &channel,
        &config.request_queue,
        move |raw| {
            let handler = handler.clone();
            Box::pin(async move { handler.handle(raw).await })
        },
        shutdown_signal(),
    )
    .await?;

    let _ = channel.close(0, "worker shutting down").await;
    let _ = connection.close(0, "worker shutting down").await;

    Ok(())
}

async fn shutdown_signal() {
    #[cfg(unix)]
    {
        use tokio::signal::unix::{signal, SignalKind};

        let mut terminate = match signal(SignalKind::terminate()) {
            Ok(signal) => signal,
            Err(err) => {
                error!(error = %err, "Cannot listen for SIGTERM");
                return;
            }
        };

        tokio::select! {
            _ = tokio::signal::ctrl_c() => {}
            _ = terminate.recv() => {}
        }
    }

    #[cfg(not(unix))]
    {
        let _ = tokio::signal::ctrl_c().await;
    }
}

fn init_tracing() {
    let filter = EnvFilter::try_from_default_env()
        .or_else(|_| EnvFilter::try_new(std::env::var("LOG_LEVEL").unwrap_or_default()))
        .unwrap_or_else(|_| EnvFilter::new("info"));

    tracing_subscriber::fmt()
        .json()
        .with_env_filter(filter)
        .with_current_span(false)
        .init();
}
