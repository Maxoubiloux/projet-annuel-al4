use crate::error::{Result, WorkerError};
use std::time::Duration;
use tokio::time::sleep;
use tracing::{warn, error};

pub struct RetryPolicy {
    max_retries: u32,
    base_delay_ms: u64,
}

impl RetryPolicy {
    pub fn new(max_retries: u32, base_delay_ms: u64) -> Self {
        Self {
            max_retries,
            base_delay_ms,
        }
    }

    pub async fn execute<F, Fut, T>(&self, mut operation: F) -> Result<T>
    where
        F: FnMut() -> Fut,
        Fut: std::future::Future<Output = Result<T>>,
    {
        let mut retries = 0;
        loop {
            match operation().await {
                Ok(value) => return Ok(value),
                Err(e) => {
                    if retries >= self.max_retries {
                        error!("Operation failed after {} retries. Last error: {}", retries, e);
                        return Err(WorkerError::JobFailed(format!("Exceeded max retries: {}", e)));
                    }

                    let delay = self.base_delay_ms * (2_u64.pow(retries));
                    warn!("Operation failed: {}. Retrying in {} ms (attempt {}/{})", e, delay, retries + 1, self.max_retries);
                    
                    sleep(Duration::from_millis(delay)).await;
                    retries += 1;
                }
            }
        }
    }
}
