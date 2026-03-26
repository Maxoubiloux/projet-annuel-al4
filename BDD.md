```json
    Moto
    {
    "id": "moto_001",
    "brand": "Yamaha",
    "model": "MT-07",
    "serialNumber": "123456789",
    "registration": "AB-123-CD",
    "category": "category_001",
    "status": "status_001",
    "currentKm": 15230,
    "pricePerDay": 85,
    "description": "Moto polyvalente, idéale pour la ville et les balades. Très maniable avec un excellent couple.",
    "createdAt": "2026-03-26T10:30:00.000Z"
    }

    Brand
    {
        "id": "brand_001",
        "name": "Yamaha",
        "createdAt": "2026-03-26T10:30:00.000Z"
    }

    Category
    {
        "id": "category_001",
        "name": "A2",
        "createdAt": "2026-03-26T10:30:00.000Z"
    }

    Status
    {
        "id": "status_001",
        "name": "PUBLISHED",
        "createdAt": "2026-03-26T10:30:00.000Z"
    }

    User
    {
        "id": "user_001",
        "name": "John Doe",
        "email": "mail.client@example.fr",
        "password": "password",
        "createdAt": "2026-03-26T10:30:00.000Z"
    }

    Booking
    {
        "id": "booking_001",
        "moto": "moto_001",
        "user": "user_001",
        "shop": "shop_001",
        "startDate": "2026-03-26T10:30:00.000Z",
        "endDate": "2026-03-26T10:30:00.000Z",
        "createdAt": "2026-03-26T10:30:00.000Z"
    }

    Image
    {
        "id": "image_001",
        "moto": "moto_001",
        "url": "https://example.com/image.jpg",
        "createdAt": "2026-03-26T10:30:00.000Z"
    }

    Shop
    {
        "id": "shop_001",
        "name": "Shop 1",
        "address": "123 Main St",
        "city": "Paris",
        "zipCode": "75001",
        "country": "France",
        "phone": "123456789",
        "email": "mail.pro@example.fr",
        "createdAt": "2026-03-26T10:30:00.000Z"
    }
```