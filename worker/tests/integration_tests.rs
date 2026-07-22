use moto_rental_worker::retry::RetryPolicy;
use moto_rental_worker::error::WorkerError;
use std::sync::atomic::{AtomicU32, Ordering};
use std::sync::Arc;
use tokio::time::Instant;

#[tokio::test]
async fn test_retry_policy_success_first_try() {
    let policy = RetryPolicy::new(3, 10);
    
    let result = policy.execute(|| async {
        Ok::<i32, WorkerError>(42)
    }).await;
    
    assert_eq!(result.unwrap(), 42);
}

#[tokio::test]
async fn test_retry_policy_success_after_retries() {
    let policy = RetryPolicy::new(3, 10);
    let attempts = Arc::new(AtomicU32::new(0));
    
    let attempts_clone = attempts.clone();
    let result = policy.execute(move || {
        let attempts_clone = attempts_clone.clone();
        async move {
            let attempt = attempts_clone.fetch_add(1, Ordering::SeqCst);
            if attempt < 2 {
                Err(WorkerError::JobFailed("Not yet".to_string()))
            } else {
                Ok::<i32, WorkerError>(42)
            }
        }
    }).await;
    
    assert_eq!(result.unwrap(), 42);
    assert_eq!(attempts.load(Ordering::SeqCst), 3);
}

#[tokio::test]
async fn test_retry_policy_failure() {
    let policy = RetryPolicy::new(2, 5);
    let attempts = Arc::new(AtomicU32::new(0));
    
    let attempts_clone = attempts.clone();
    let start = Instant::now();
    
    let result = policy.execute(move || {
        let attempts_clone = attempts_clone.clone();
        async move {
            attempts_clone.fetch_add(1, Ordering::SeqCst);
            Err::<i32, WorkerError>(WorkerError::JobFailed("Always fail".to_string()))
        }
    }).await;
    
    assert!(result.is_err());
    assert_eq!(attempts.load(Ordering::SeqCst), 3);
    
    let elapsed = start.elapsed();
    assert!(elapsed.as_millis() >= 15);
}
