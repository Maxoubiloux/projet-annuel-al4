use moto_rental_worker::jobs::generate_contract;
use moto_rental_worker::jobs::messages::{
    ContractData, ContractJobRequest, CustomerData, MotoData, ShopData, CONTRACT_JOB_TYPE,
};
use std::fs;

fn request(reservation_id: &str, enriched: bool) -> ContractJobRequest {
    ContractJobRequest {
        correlation_id: "corr-1".to_string(),
        job_type: CONTRACT_JOB_TYPE.to_string(),
        reservation_id: reservation_id.to_string(),
        data: ContractData {
            moto_id: "moto-1".to_string(),
            customer_id: "cust-1".to_string(),
            start_date: "2026-08-01".to_string(),
            end_date: "2026-08-05".to_string(),
            total_amount: 340.0,
            deposit_amount: 500.0,
            customer: enriched.then(|| CustomerData {
                first_name: "Camille".to_string(),
                last_name: "Durand".to_string(),
                email: "camille.durand@example.com".to_string(),
                phone: "+33600000000".to_string(),
            }),
            moto: enriched.then(|| MotoData {
                brand: "Yamaha".to_string(),
                model: "MT-07".to_string(),
                plate: "AB-123-CD".to_string(),
                category: Some("Roadster".to_string()),
            }),
            shop: enriched.then(|| ShopData {
                name: "Plein Gaz Loc".to_string(),
                city: "Paris".to_string(),
            }),
        },
    }
}

#[test]
fn writes_a_valid_pdf_named_after_the_reservation() {
    let dir = tempfile::tempdir().expect("tempdir");
    let reservation_id = "550e8400-e29b-41d4-a716-446655440000";

    let path = generate_contract::generate(&request(reservation_id, true), dir.path())
        .expect("la génération doit aboutir");

    assert_eq!(
        path,
        dir.path().join(format!("{reservation_id}.pdf")),
        "le nom de fichier doit être dérivé de l'identifiant de réservation"
    );

    let bytes = fs::read(&path).expect("lecture du PDF");
    assert!(bytes.starts_with(b"%PDF-"), "en-tête PDF attendu");
    assert!(
        bytes.len() > 1024,
        "un contrat rendu pèse plus de 1 Ko, obtenu: {} octets",
        bytes.len()
    );
}

#[test]
fn creates_the_contracts_directory_when_missing() {
    let dir = tempfile::tempdir().expect("tempdir");
    let nested = dir.path().join("contracts");

    let path = generate_contract::generate(&request("res-1", true), &nested)
        .expect("le répertoire doit être créé à la volée");

    assert!(path.exists());
}

#[test]
fn still_generates_a_pdf_without_the_denormalized_blocks() {
    let dir = tempfile::tempdir().expect("tempdir");

    let path = generate_contract::generate(&request("res-2", false), dir.path())
        .expect("le contrat doit rester produit avec les seuls identifiants");

    assert!(fs::read(&path)
        .expect("lecture du PDF")
        .starts_with(b"%PDF-"));
}

#[test]
fn leaves_no_temporary_file_behind() {
    let dir = tempfile::tempdir().expect("tempdir");

    generate_contract::generate(&request("res-3", true), dir.path()).expect("génération");

    let leftovers: Vec<_> = fs::read_dir(dir.path())
        .expect("lecture du répertoire")
        .filter_map(|entry| entry.ok())
        .map(|entry| entry.file_name().to_string_lossy().to_string())
        .filter(|name| name.ends_with(".tmp"))
        .collect();

    assert!(
        leftovers.is_empty(),
        "fichiers temporaires restants: {leftovers:?}"
    );
}

#[test]
fn rejects_a_reservation_id_that_would_escape_the_contracts_directory() {
    let dir = tempfile::tempdir().expect("tempdir");

    let result = generate_contract::generate(&request("../../etc/passwd", true), dir.path());

    assert!(
        result.is_err(),
        "un identifiant contenant un chemin doit être refusé"
    );
}
