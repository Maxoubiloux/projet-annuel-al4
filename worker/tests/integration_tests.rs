use moto_rental_worker::error::WorkerError;
use moto_rental_worker::retry::RetryPolicy;
use std::sync::atomic::{AtomicU32, Ordering};
use std::sync::Arc;
use tokio::time::Instant;

#[tokio::test]
async fn test_retry_policy_success_first_try() {
    let policy = RetryPolicy::new(3, 10);

    let result = policy
        .execute(|| async { Ok::<i32, WorkerError>(42) })
        .await;

    assert_eq!(result.unwrap(), 42);
}

#[tokio::test]
async fn test_retry_policy_success_after_retries() {
    let policy = RetryPolicy::new(3, 10);
    let attempts = Arc::new(AtomicU32::new(0));

    let attempts_clone = attempts.clone();
    let result = policy
        .execute(move || {
            let attempts_clone = attempts_clone.clone();
            async move {
                let attempt = attempts_clone.fetch_add(1, Ordering::SeqCst);
                if attempt < 2 {
                    Err(WorkerError::JobFailed("Not yet".to_string()))
                } else {
                    Ok::<i32, WorkerError>(42)
                }
            }
        })
        .await;

    assert_eq!(result.unwrap(), 42);
    assert_eq!(attempts.load(Ordering::SeqCst), 3);
}

#[tokio::test]
async fn test_retry_policy_failure() {
    let policy = RetryPolicy::new(2, 5);
    let attempts = Arc::new(AtomicU32::new(0));

    let attempts_clone = attempts.clone();
    let start = Instant::now();

    let result = policy
        .execute(move || {
            let attempts_clone = attempts_clone.clone();
            async move {
                attempts_clone.fetch_add(1, Ordering::SeqCst);
                Err::<i32, WorkerError>(WorkerError::JobFailed("Always fail".to_string()))
            }
        })
        .await;

    assert!(result.is_err());
    assert_eq!(attempts.load(Ordering::SeqCst), 3);

    let elapsed = start.elapsed();
    assert!(elapsed.as_millis() >= 15);
}

#[tokio::test]
async fn test_retry_policy_short_circuits_permanent_errors() {
    let policy = RetryPolicy::new(5, 1_000);
    let attempts = Arc::new(AtomicU32::new(0));

    let attempts_clone = attempts.clone();
    let start = Instant::now();

    let result = policy
        .execute(move || {
            let attempts_clone = attempts_clone.clone();
            async move {
                attempts_clone.fetch_add(1, Ordering::SeqCst);
                Err::<i32, WorkerError>(WorkerError::InvalidPayload("corrompu".to_string()))
            }
        })
        .await;

    assert!(result.is_err());
    assert_eq!(attempts.load(Ordering::SeqCst), 1);
    assert!(
        start.elapsed().as_millis() < 500,
        "aucun backoff ne doit être appliqué à une erreur permanente"
    );
}

#[tokio::test]
async fn test_retry_policy_preserves_the_last_error() {
    let policy = RetryPolicy::new(1, 1);

    let result = policy
        .execute(|| async {
            Err::<i32, WorkerError>(WorkerError::Pdf("rendu impossible".to_string()))
        })
        .await;

    match result {
        Err(WorkerError::Pdf(message)) => assert_eq!(message, "rendu impossible"),
        other => panic!("erreur d'origine attendue, obtenu: {other:?}"),
    }
}

#[tokio::test]
async fn test_retry_policy_caps_the_backoff() {
    let policy = RetryPolicy::new(3, 1_000).with_max_delay(10);
    let start = Instant::now();

    let result = policy
        .execute(|| async { Err::<i32, WorkerError>(WorkerError::JobFailed("boom".to_string())) })
        .await;

    assert!(result.is_err());
    assert!(
        start.elapsed().as_millis() < 500,
        "sans plafond, 1s + 2s + 4s se seraient écoulées"
    );
}
