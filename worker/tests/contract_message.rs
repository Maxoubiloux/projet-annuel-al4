use moto_rental_worker::jobs::messages::{ContractJobResponse, CONTRACT_JOB_TYPE};
use moto_rental_worker::jobs::parse_request;
use serde_json::{json, Value};

fn full_request() -> Vec<u8> {
    json!({
        "correlation_id": "3f2504e0-4f89-11d3-9a0c-0305e82c3301",
        "job_type": "GenerateRentalContractPdf",
        "reservation_id": "550e8400-e29b-41d4-a716-446655440000",
        "data": {
            "moto_id": "550e8400-e29b-41d4-a716-446655440001",
            "customer_id": "550e8400-e29b-41d4-a716-446655440002",
            "start_date": "2026-08-01",
            "end_date": "2026-08-05",
            "total_amount": 340,
            "deposit_amount": 500,
            "customer": {
                "first_name": "Camille",
                "last_name": "Durand",
                "email": "camille.durand@example.com",
                "phone": "+33600000000"
            },
            "moto": {
                "brand": "Yamaha",
                "model": "MT-07",
                "plate": "AB-123-CD",
                "category": "Roadster"
            },
            "shop": { "name": "Plein Gaz Loc", "city": "Paris" }
        }
    })
    .to_string()
    .into_bytes()
}

fn minimal_request() -> Vec<u8> {
    json!({
        "correlation_id": "corr-1",
        "job_type": "GenerateRentalContractPdf",
        "reservation_id": "res-1",
        "data": {
            "moto_id": "moto-1",
            "customer_id": "cust-1",
            "start_date": "2026-08-01",
            "end_date": "2026-08-05",
            "total_amount": 340,
            "deposit_amount": 500
        }
    })
    .to_string()
    .into_bytes()
}

#[test]
fn parses_the_enriched_backend_message() {
    let request = parse_request(&full_request()).expect("le message enrichi doit être accepté");

    assert_eq!(request.job_type, CONTRACT_JOB_TYPE);
    assert_eq!(
        request.reservation_id,
        "550e8400-e29b-41d4-a716-446655440000"
    );
    assert_eq!(
        request.correlation_id,
        "3f2504e0-4f89-11d3-9a0c-0305e82c3301"
    );
    assert_eq!(request.data.total_amount, 340.0);
    assert_eq!(request.data.deposit_amount, 500.0);

    let customer = request.data.customer.expect("bloc customer attendu");
    assert_eq!(customer.first_name, "Camille");
    assert_eq!(customer.email, "camille.durand@example.com");

    let moto = request.data.moto.expect("bloc moto attendu");
    assert_eq!(moto.brand, "Yamaha");
    assert_eq!(moto.plate, "AB-123-CD");
    assert_eq!(moto.category.as_deref(), Some("Roadster"));

    let shop = request.data.shop.expect("bloc shop attendu");
    assert_eq!(shop.name, "Plein Gaz Loc");
}

#[test]
fn parses_a_message_without_the_denormalized_blocks() {
    let request = parse_request(&minimal_request()).expect("le message minimal doit être accepté");

    assert!(request.data.customer.is_none());
    assert!(request.data.moto.is_none());
    assert!(request.data.shop.is_none());
    assert_eq!(request.data.customer_id, "cust-1");
}

#[test]
fn accepts_a_moto_without_category() {
    let raw = json!({
        "correlation_id": "corr-1",
        "job_type": "GenerateRentalContractPdf",
        "reservation_id": "res-1",
        "data": {
            "moto_id": "moto-1", "customer_id": "cust-1",
            "start_date": "2026-08-01", "end_date": "2026-08-05",
            "total_amount": 340, "deposit_amount": 500,
            "moto": { "brand": "Yamaha", "model": "MT-07", "plate": "AB-123-CD" }
        }
    })
    .to_string()
    .into_bytes();

    let request = parse_request(&raw).expect("la catégorie est optionnelle");
    assert!(request
        .data
        .moto
        .expect("bloc moto attendu")
        .category
        .is_none());
}

#[test]
fn rejects_an_unknown_job_type() {
    let raw = json!({
        "correlation_id": "corr-1",
        "job_type": "SendEmail",
        "reservation_id": "res-1",
        "data": {
            "moto_id": "moto-1", "customer_id": "cust-1",
            "start_date": "2026-08-01", "end_date": "2026-08-05",
            "total_amount": 340, "deposit_amount": 500
        }
    })
    .to_string()
    .into_bytes();

    assert!(parse_request(&raw).is_err());
}

#[test]
fn rejects_malformed_or_incomplete_messages() {
    assert!(parse_request(b"not json at all").is_err());
    assert!(parse_request(b"{}").is_err());

    let empty_reservation_id = json!({
        "correlation_id": "corr-1",
        "job_type": "GenerateRentalContractPdf",
        "reservation_id": "   ",
        "data": {
            "moto_id": "moto-1", "customer_id": "cust-1",
            "start_date": "2026-08-01", "end_date": "2026-08-05",
            "total_amount": 340, "deposit_amount": 500
        }
    })
    .to_string()
    .into_bytes();
    assert!(parse_request(&empty_reservation_id).is_err());
}

#[test]
fn success_response_matches_what_the_backend_accepts() {
    let response = ContractJobResponse::success(
        "corr-1",
        "res-1",
        "http://localhost:3000/api/v1/reservations/res-1/contract".to_string(),
    );
    let serialized: Value = serde_json::to_value(&response).expect("sérialisation");

    assert_eq!(serialized["correlation_id"], "corr-1");
    assert_eq!(serialized["reservation_id"], "res-1");
    assert_eq!(serialized["success"], true);
    assert_eq!(
        serialized["url"],
        "http://localhost:3000/api/v1/reservations/res-1/contract"
    );
    assert!(serialized.get("error").is_none());
}

#[test]
fn failure_response_matches_what_the_backend_accepts() {
    let response = ContractJobResponse::failure("corr-1", "res-1", "disque plein".to_string());
    let serialized: Value = serde_json::to_value(&response).expect("sérialisation");

    assert_eq!(serialized["success"], false);
    assert_eq!(serialized["error"], "disque plein");
    assert!(serialized.get("url").is_none());
}
