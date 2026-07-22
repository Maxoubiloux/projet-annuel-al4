pub mod generate_contract;
pub mod process_photos;
pub mod send_email;
pub mod validate_document;

use crate::error::Result;
use crate::queue::producer::Producer;
use crate::retry::RetryPolicy;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tracing::info;

#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "type", content = "payload")]
pub enum JobRequest {
    GenerateRentalContractPdf { reservation_id: String },
    ProcessCheckinPhotos { location_id: String, image_urls: Vec<String> },
    ValidateDocument { user_id: String, document_url: String },
    SendEmail { to: String, subject: String, body: String },
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "type", content = "payload")]
pub enum JobResponse {
    Success { job_type: String, result: serde_json::Value },
    Failure { job_type: String, error: String },
}

pub struct JobDispatcher {
    producer: Arc<Producer>,
    retry_policy: RetryPolicy,
}

impl JobDispatcher {
    pub fn new(producer: Arc<Producer>) -> Self {
        Self {
            producer,
            retry_policy: RetryPolicy::new(3, 1000),
        }
    }

    pub async fn dispatch(&self, raw_data: Vec<u8>) -> Result<()> {
        let request: JobRequest = match serde_json::from_slice(&raw_data) {
            Ok(req) => req,
            Err(e) => {
                tracing::error!("Failed to parse job request: {}", e);
                return Err(e.into());
            }
        };

        info!("Received job: {:?}", request);

        let producer = self.producer.clone();
        let job_type = match &request {
            JobRequest::GenerateRentalContractPdf { .. } => "GenerateRentalContractPdf",
            JobRequest::ProcessCheckinPhotos { .. } => "ProcessCheckinPhotos",
            JobRequest::ValidateDocument { .. } => "ValidateDocument",
            JobRequest::SendEmail { .. } => "SendEmail",
        };

        let result = self.retry_policy.execute(|| async {
            match &request {
                JobRequest::GenerateRentalContractPdf { reservation_id } => {
                     generate_contract::handle(reservation_id).await
                }
                JobRequest::ProcessCheckinPhotos { location_id, image_urls } => {
                     process_photos::handle(location_id, image_urls).await
                }
                JobRequest::ValidateDocument { user_id, document_url } => {
                     validate_document::handle(user_id, document_url).await
                }
                JobRequest::SendEmail { to, subject, body } => {
                     send_email::handle(to, subject, body).await
                }
            }
        }).await;

        let response = match result {
            Ok(res) => JobResponse::Success {
                job_type: job_type.to_string(),
                result: res,
            },
            Err(e) => JobResponse::Failure {
                job_type: job_type.to_string(),
                error: e.to_string(),
            },
        };

        producer.publish(&response).await?;
        Ok(())
    }
}
