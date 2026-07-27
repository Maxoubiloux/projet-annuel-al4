use thiserror::Error;

#[derive(Error, Debug)]
pub enum WorkerError {
    #[error("RabbitMQ error: {0}")]
    RabbitMq(#[from] lapin::Error),

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("I/O error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Configuration error: {0}")]
    Config(String),

    #[error("Invalid job payload: {0}")]
    InvalidPayload(String),

    #[error("PDF generation failed: {0}")]
    Pdf(String),

    #[error("Job execution failed: {0}")]
    JobFailed(String),
}

pub type Result<T> = std::result::Result<T, WorkerError>;

impl WorkerError {
    pub fn is_retryable(&self) -> bool {
        match self {
            WorkerError::Io(_)
            | WorkerError::RabbitMq(_)
            | WorkerError::Pdf(_)
            | WorkerError::JobFailed(_) => true,

            WorkerError::Serialization(_)
            | WorkerError::InvalidPayload(_)
            | WorkerError::Config(_) => false,
        }
    }
}
