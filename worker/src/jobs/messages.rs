use serde::{Deserialize, Serialize};

pub const CONTRACT_JOB_TYPE: &str = "GenerateRentalContractPdf";

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ContractJobRequest {
    #[serde(default)]
    pub correlation_id: String,
    pub job_type: String,
    pub reservation_id: String,
    pub data: ContractData,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ContractData {
    pub moto_id: String,
    pub customer_id: String,
    pub start_date: String,
    pub end_date: String,
    pub total_amount: f64,
    pub deposit_amount: f64,

    #[serde(default)]
    pub customer: Option<CustomerData>,
    #[serde(default)]
    pub moto: Option<MotoData>,
    #[serde(default)]
    pub shop: Option<ShopData>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct CustomerData {
    pub first_name: String,
    pub last_name: String,
    pub email: String,
    pub phone: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct MotoData {
    pub brand: String,
    pub model: String,
    pub plate: String,
    #[serde(default)]
    pub category: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ShopData {
    pub name: String,
    pub city: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ContractJobResponse {
    pub correlation_id: String,
    pub reservation_id: String,
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

impl ContractJobResponse {
    pub fn success(correlation_id: &str, reservation_id: &str, url: String) -> Self {
        Self {
            correlation_id: correlation_id.to_string(),
            reservation_id: reservation_id.to_string(),
            success: true,
            url: Some(url),
            error: None,
        }
    }

    pub fn failure(correlation_id: &str, reservation_id: &str, error: String) -> Self {
        Self {
            correlation_id: correlation_id.to_string(),
            reservation_id: reservation_id.to_string(),
            success: false,
            url: None,
            error: Some(error),
        }
    }
}
