# TrueRefurb OS — REST API Specification

Base URL: `http://localhost:4000/api/v1`
Interactive Swagger Documentation: `http://localhost:4000/api/docs`

## Devices Endpoints

### 1. List Devices
- **GET** `/devices`
- **Query Params**:
  - `stage`: (Optional) `INTAKE` | `DIAGNOSTICS` | `REPAIR_BENCH` | `CLEANING_POLISH` | `QA_INSPECTION` | `READY_FOR_SALE`
- **Response**: Array of `DeviceItem`

### 2. Get Device by ID
- **GET** `/devices/:id`
- **Response**: `DeviceItem` object with diagnostics and repair history

### 3. Intake Device
- **POST** `/devices`
- **Body**:
```json
{
  "serialNumber": "C02GK7A8MD6R",
  "imei": "354892019482019",
  "make": "Apple",
  "model": "iPhone 15 Pro",
  "category": "SMARTPHONE",
  "storage": "256GB",
  "color": "Natural Titanium",
  "source": "CARRIER_TRADE_IN",
  "acquisitionCost": 550,
  "targetResalePrice": 850
}
```

### 4. Advance Pipeline Stage
- **PATCH** `/devices/:id/advance`
- **Response**: Updated `DeviceItem` with incremented stage and score
