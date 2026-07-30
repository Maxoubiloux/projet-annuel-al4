pub mod generate_contract;
pub mod messages;

use crate::config::Config;
use crate::error::{Result, WorkerError};
use crate::jobs::messages::{ContractJobRequest, ContractJobResponse, CONTRACT_JOB_TYPE};
use crate::queue::consumer::Outcome;
use crate::queue::producer::Producer;
use crate::retry::RetryPolicy;
use std::path::PathBuf;
use std::sync::Arc;
use std::time::Instant;
use tracing::{error, info, warn};

pub struct ContractJobHandler {
    producer: Arc<Producer>,
    retry_policy: RetryPolicy,
    contracts_dir: PathBuf,
    public_base_url: String,
}

impl ContractJobHandler {
    pub fn new(producer: Arc<Producer>, config: &Config) -> Self {
        Self {
            producer,
            retry_policy: RetryPolicy::new(config.max_retries, config.retry_backoff_ms),
            contracts_dir: config.contracts_dir.clone(),
            public_base_url: config.public_base_url.clone(),
        }
    }

    pub async fn handle(&self, raw: Vec<u8>) -> Outcome {
        let request = match parse_request(&raw) {
            Ok(request) => request,
            Err(err) => {
                warn!(error = %err, "Unprocessable message, dead-lettering");
                return Outcome::DeadLetter;
            }
        };

        let started = Instant::now();
        info!(
            correlation_id = %request.correlation_id,
            reservation_id = %request.reservation_id,
            job_type = %request.job_type,
            "Job received"
        );

        let result = self
            .retry_policy
            .execute(|| async { self.run_job(&request).await })
            .await;

        let duration_ms = started.elapsed().as_millis();

        let response = match result {
            Ok(url) => {
                info!(
                    correlation_id = %request.correlation_id,
                    reservation_id = %request.reservation_id,
                    duration_ms,
                    url = %url,
                    "Contract generated"
                );
                ContractJobResponse::success(&request.correlation_id, &request.reservation_id, url)
            }
            Err(err) => {
                error!(
                    correlation_id = %request.correlation_id,
                    reservation_id = %request.reservation_id,
                    duration_ms,
                    error = %err,
                    "Contract generation failed definitively"
                );
                ContractJobResponse::failure(
                    &request.correlation_id,
                    &request.reservation_id,
                    err.to_string(),
                )
            }
        };

        match self
            .producer
            .publish(&response, &request.correlation_id)
            .await
        {
            Ok(()) => Outcome::Ack,
            Err(err) => {
                error!(
                    correlation_id = %request.correlation_id,
                    error = %err,
                    "Failed to publish response, dead-lettering the request"
                );
                Outcome::DeadLetter
            }
        }
    }

    async fn run_job(&self, request: &ContractJobRequest) -> Result<String> {
        let reservation_id = request.reservation_id.clone();
        let request = request.clone();
        let contracts_dir = self.contracts_dir.clone();

        tokio::task::spawn_blocking(move || generate_contract::generate(&request, &contracts_dir))
            .await
            .map_err(|e| {
                WorkerError::JobFailed(format!("tâche de génération interrompue: {e}"))
            })??;

        // Route authentifiée du backend, et non le répertoire statique public :
        // le contrat contient des données personnelles.
        Ok(format!(
            "{}/api/v1/reservations/{}/contract",
            self.public_base_url, reservation_id
        ))
    }
}

pub fn parse_request(raw: &[u8]) -> Result<ContractJobRequest> {
    let request: ContractJobRequest = serde_json::from_slice(raw)?;

    if request.job_type != CONTRACT_JOB_TYPE {
        return Err(WorkerError::InvalidPayload(format!(
            "job_type inconnu: {} (attendu: {CONTRACT_JOB_TYPE})",
            request.job_type
        )));
    }

    if request.reservation_id.trim().is_empty() {
        return Err(WorkerError::InvalidPayload(
            "reservation_id manquant".to_string(),
        ));
    }

    Ok(request)
}
