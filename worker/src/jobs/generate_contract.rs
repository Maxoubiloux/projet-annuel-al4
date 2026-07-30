use crate::error::{Result, WorkerError};
use crate::jobs::messages::ContractJobRequest;
use chrono::{NaiveDate, Utc};
use printpdf::{
    BuiltinFont, IndirectFontRef, Line, Mm, PdfDocument, PdfDocumentReference, PdfLayerReference,
    Point,
};
use std::fs::{self, File};
use std::io::BufWriter;
use std::path::{Path, PathBuf};

const PAGE_WIDTH: f32 = 210.0;
const PAGE_HEIGHT: f32 = 297.0;
const MARGIN_LEFT: f32 = 20.0;
const MARGIN_RIGHT: f32 = 20.0;
const VALUE_COLUMN: f32 = 70.0;
const SIGNATURE_COLUMN: f32 = 120.0;

const MAX_ID_LEN: usize = 64;

pub fn generate(request: &ContractJobRequest, contracts_dir: &Path) -> Result<PathBuf> {
    let file_stem = safe_file_stem(&request.reservation_id)?;

    fs::create_dir_all(contracts_dir)?;

    let final_path = contracts_dir.join(format!("{file_stem}.pdf"));
    let temp_path = contracts_dir.join(format!(".{file_stem}.pdf.tmp"));

    let document = render(request)?;

    {
        let file = File::create(&temp_path)?;
        let mut writer = BufWriter::new(file);
        document
            .save(&mut writer)
            .map_err(|e| WorkerError::Pdf(e.to_string()))?;
    }

    if let Err(err) = fs::rename(&temp_path, &final_path) {
        let _ = fs::remove_file(&temp_path);
        return Err(err.into());
    }

    Ok(final_path)
}

fn safe_file_stem(reservation_id: &str) -> Result<&str> {
    let valid = !reservation_id.is_empty()
        && reservation_id.len() <= MAX_ID_LEN
        && reservation_id
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_');

    if valid {
        Ok(reservation_id)
    } else {
        Err(WorkerError::InvalidPayload(format!(
            "reservation_id invalide (identifiant alphanumérique de 1 à {MAX_ID_LEN} caractères attendu) : {reservation_id:?}"
        )))
    }
}

fn render(request: &ContractJobRequest) -> Result<PdfDocumentReference> {
    let data = &request.data;

    let (document, page, layer) = PdfDocument::new(
        "Contrat de location de moto",
        Mm(PAGE_WIDTH),
        Mm(PAGE_HEIGHT),
        "Contrat",
    );
    let layer = document.get_page(page).get_layer(layer);

    let regular = document
        .add_builtin_font(BuiltinFont::Helvetica)
        .map_err(|e| WorkerError::Pdf(e.to_string()))?;
    let bold = document
        .add_builtin_font(BuiltinFont::HelveticaBold)
        .map_err(|e| WorkerError::Pdf(e.to_string()))?;

    let shop_name = data
        .shop
        .as_ref()
        .map(|s| s.name.as_str())
        .unwrap_or("Plein Gaz Loc");
    let shop_city = data.shop.as_ref().map(|s| s.city.as_str()).unwrap_or("-");

    let mut y = PAGE_HEIGHT - 25.0;

    text(&layer, &bold, 18.0, MARGIN_LEFT, y, "CONTRAT DE LOCATION");
    y -= 7.0;
    text(
        &layer,
        &regular,
        11.0,
        MARGIN_LEFT,
        y,
        &format!("{shop_name} - {shop_city}"),
    );
    y -= 6.0;
    rule(&layer, y);
    y -= 8.0;

    text(
        &layer,
        &regular,
        9.0,
        MARGIN_LEFT,
        y,
        &format!(
            "Référence : {}          Établi le {}",
            request.reservation_id,
            Utc::now().format("%d/%m/%Y à %H:%M UTC")
        ),
    );
    y -= 12.0;

    y = section(&layer, &bold, y, "LOCATAIRE");
    match &data.customer {
        Some(customer) => {
            y = field(
                &layer,
                &regular,
                &bold,
                y,
                "Nom",
                &format!("{} {}", customer.first_name, customer.last_name),
            );
            y = field(&layer, &regular, &bold, y, "Email", &customer.email);
            y = field(&layer, &regular, &bold, y, "Téléphone", &customer.phone);
        }
        None => {
            y = field(
                &layer,
                &regular,
                &bold,
                y,
                "Identifiant client",
                &data.customer_id,
            );
        }
    }
    y -= 6.0;

    y = section(&layer, &bold, y, "VÉHICULE");
    match &data.moto {
        Some(moto) => {
            y = field(
                &layer,
                &regular,
                &bold,
                y,
                "Modèle",
                &format!("{} {}", moto.brand, moto.model),
            );
            y = field(&layer, &regular, &bold, y, "Immatriculation", &moto.plate);
            if let Some(category) = &moto.category {
                y = field(&layer, &regular, &bold, y, "Catégorie", category);
            }
        }
        None => {
            y = field(
                &layer,
                &regular,
                &bold,
                y,
                "Identifiant moto",
                &data.moto_id,
            );
        }
    }
    y -= 6.0;

    y = section(&layer, &bold, y, "LOCATION");
    y = field(
        &layer,
        &regular,
        &bold,
        y,
        "Date de départ",
        &format_date(&data.start_date),
    );
    y = field(
        &layer,
        &regular,
        &bold,
        y,
        "Date de retour",
        &format_date(&data.end_date),
    );
    y = field(
        &layer,
        &regular,
        &bold,
        y,
        "Durée",
        &format_duration(&data.start_date, &data.end_date),
    );
    y = field(
        &layer,
        &regular,
        &bold,
        y,
        "Montant total",
        &format_amount(data.total_amount),
    );
    y = field(
        &layer,
        &regular,
        &bold,
        y,
        "Caution",
        &format_amount(data.deposit_amount),
    );
    y -= 10.0;

    rule(&layer, y);
    y -= 7.0;
    for line in [
        "Le locataire déclare avoir pris connaissance des conditions générales de location,",
        "détenir un permis de conduire en cours de validité et restituer le véhicule dans",
        "l'état constaté au départ. La caution est restituée après vérification du véhicule.",
    ] {
        text(&layer, &regular, 9.0, MARGIN_LEFT, y, line);
        y -= 5.0;
    }
    y -= 12.0;

    text(&layer, &bold, 10.0, MARGIN_LEFT, y, "Le loueur");
    text(&layer, &bold, 10.0, SIGNATURE_COLUMN, y, "Le locataire");
    y -= 22.0;
    signature_line(&layer, MARGIN_LEFT, y);
    signature_line(&layer, SIGNATURE_COLUMN, y);

    Ok(document)
}

fn text(layer: &PdfLayerReference, font: &IndirectFontRef, size: f32, x: f32, y: f32, value: &str) {
    layer.use_text(value, size, Mm(x), Mm(y), font);
}

fn section(layer: &PdfLayerReference, bold: &IndirectFontRef, y: f32, title: &str) -> f32 {
    text(layer, bold, 12.0, MARGIN_LEFT, y, title);
    rule(layer, y - 2.5);
    y - 9.0
}

fn field(
    layer: &PdfLayerReference,
    regular: &IndirectFontRef,
    bold: &IndirectFontRef,
    y: f32,
    label: &str,
    value: &str,
) -> f32 {
    text(layer, bold, 10.0, MARGIN_LEFT, y, label);
    text(layer, regular, 10.0, VALUE_COLUMN, y, value);
    y - 6.0
}

fn rule(layer: &PdfLayerReference, y: f32) {
    horizontal_line(layer, MARGIN_LEFT, PAGE_WIDTH - MARGIN_RIGHT, y);
}

fn signature_line(layer: &PdfLayerReference, x: f32, y: f32) {
    horizontal_line(layer, x, x + 60.0, y);
}

fn horizontal_line(layer: &PdfLayerReference, from_x: f32, to_x: f32, y: f32) {
    layer.add_line(Line {
        points: vec![
            (Point::new(Mm(from_x), Mm(y)), false),
            (Point::new(Mm(to_x), Mm(y)), false),
        ],
        is_closed: false,
    });
}

fn parse_date(value: &str) -> Option<NaiveDate> {
    NaiveDate::parse_from_str(value, "%Y-%m-%d").ok()
}

fn format_date(value: &str) -> String {
    parse_date(value)
        .map(|d| d.format("%d/%m/%Y").to_string())
        .unwrap_or_else(|| value.to_string())
}

fn format_duration(start: &str, end: &str) -> String {
    match (parse_date(start), parse_date(end)) {
        (Some(start), Some(end)) => format!("{} jour(s)", (end - start).num_days().max(0) + 1),
        _ => "-".to_string(),
    }
}

fn format_amount(amount: f64) -> String {
    format!("{amount:.2} EUR")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rejects_path_traversal_in_reservation_id() {
        assert!(safe_file_stem("../../etc/passwd").is_err());
        assert!(safe_file_stem("").is_err());
        assert!(safe_file_stem("res id").is_err());
        assert!(safe_file_stem(&"a".repeat(MAX_ID_LEN + 1)).is_err());
    }

    #[test]
    fn accepts_a_uuid() {
        let uuid = "550e8400-e29b-41d4-a716-446655440000";
        assert_eq!(safe_file_stem(uuid).unwrap(), uuid);
    }

    #[test]
    fn formats_dates_amounts_and_duration() {
        assert_eq!(format_date("2026-08-01"), "01/08/2026");
        assert_eq!(format_date("pas-une-date"), "pas-une-date");
        assert_eq!(format_duration("2026-08-01", "2026-08-05"), "5 jour(s)");
        assert_eq!(format_duration("2026-08-01", "2026-08-01"), "1 jour(s)");
        assert_eq!(format_duration("2026-08-01", "oups"), "-");
        assert_eq!(format_amount(340.0), "340.00 EUR");
    }
}
