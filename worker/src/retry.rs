use crate::error::Result;
use std::time::Duration;
use tokio::time::sleep;
use tracing::{error, warn};

const DEFAULT_MAX_DELAY_MS: u64 = 30_000;

pub struct RetryPolicy {
    max_retries: u32,
    base_delay_ms: u64,
    max_delay_ms: u64,
}

impl RetryPolicy {
    pub fn new(max_retries: u32, base_delay_ms: u64) -> Self {
        Self {
            max_retries,
            base_delay_ms,
            max_delay_ms: DEFAULT_MAX_DELAY_MS,
        }
    }

    pub fn with_max_delay(mut self, max_delay_ms: u64) -> Self {
        self.max_delay_ms = max_delay_ms;
        self
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
                    if !e.is_retryable() {
                        error!(error = %e, "Permanent failure, not retrying");
                        return Err(e);
                    }

                    if retries >= self.max_retries {
                        error!(
                            error = %e,
                            retries,
                            "Operation failed after exhausting retries"
                        );
                        return Err(e);
                    }

                    let delay = self
                        .base_delay_ms
                        .saturating_mul(2_u64.saturating_pow(retries))
                        .min(self.max_delay_ms);

                    warn!(
                        error = %e,
                        delay_ms = delay,
                        attempt = retries + 1,
                        max_retries = self.max_retries,
                        "Operation failed, retrying"
                    );

                    sleep(Duration::from_millis(delay)).await;
                    retries += 1;
                }
            }
        }
    }
}
