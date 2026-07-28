use thiserror::Error;

#[derive(Error, Debug)]
pub enum WorkerError {
    #[error("RabbitMQ connection error: {0}")]
    RabbitMq(#[from] lapin::Error),

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("I/O error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Configuration error: {0}")]
    Config(String),

    #[error("Job execution failed: {0}")]
    JobFailed(String),

    #[error("Unknown error occurred")]
    Unknown,
}

pub type Result<T> = std::result::Result<T, WorkerError>;
