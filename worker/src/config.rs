use crate::error::{Result, WorkerError};
use dotenv::dotenv;
use std::env;
use std::path::PathBuf;
use std::str::FromStr;

#[derive(Debug, Clone)]
pub struct Config {
    pub rabbitmq_url: String,
    pub request_queue: String,
    pub response_queue: String,
    pub dead_letter_queue: String,
    pub dead_letter_exchange: String,
    pub contracts_dir: PathBuf,
    pub public_base_url: String,
    pub max_retries: u32,
    pub retry_backoff_ms: u64,
}

impl Config {
    pub fn from_env() -> Result<Self> {
        dotenv().ok();

        Ok(Config {
            rabbitmq_url: var_or("RABBITMQ_URL", "amqp://guest:guest@localhost:5672"),
            request_queue: var_or("REQUEST_QUEUE", "worker_requests"),
            response_queue: var_or("RESPONSE_QUEUE", "worker_responses"),
            dead_letter_queue: var_or("DEAD_LETTER_QUEUE", "worker_dead_letters"),
            dead_letter_exchange: var_or("DEAD_LETTER_EXCHANGE", "worker_dlx"),
            contracts_dir: PathBuf::from(var_or("CONTRACTS_DIR", "/data/contracts")),
            public_base_url: var_or("PUBLIC_BASE_URL", "http://localhost:3000")
                .trim_end_matches('/')
                .to_string(),
            max_retries: parse_var("MAX_RETRIES", 3)?,
            retry_backoff_ms: parse_var("RETRY_BACKOFF_MS", 1_000)?,
        })
    }

    pub fn summary(&self) -> String {
        format!(
            "request_queue={} response_queue={} dead_letter_queue={} dead_letter_exchange={} \
             contracts_dir={} public_base_url={} max_retries={} retry_backoff_ms={}",
            self.request_queue,
            self.response_queue,
            self.dead_letter_queue,
            self.dead_letter_exchange,
            self.contracts_dir.display(),
            self.public_base_url,
            self.max_retries,
            self.retry_backoff_ms,
        )
    }
}

fn var_or(key: &str, default: &str) -> String {
    match env::var(key) {
        Ok(value) if !value.trim().is_empty() => value,
        _ => default.to_string(),
    }
}

fn parse_var<T: FromStr>(key: &str, default: T) -> Result<T> {
    match env::var(key) {
        Ok(value) if !value.trim().is_empty() => value
            .trim()
            .parse::<T>()
            .map_err(|_| WorkerError::Config(format!("{key} n'est pas un nombre valide: {value}"))),
        _ => Ok(default),
    }
}
