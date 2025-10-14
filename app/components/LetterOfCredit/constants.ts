export const EXPORT_TYPES = [
  "Cashew Nuts",
  "Cocoa Beans", 
  "Sesame Seeds",
  "Ginger",
  "Hibiscus Flowers",
  "Shea Butter",
  "Palm Oil",
  "Yam",
  "Cassava"
];

export const COUNTRIES = [
  "Germany",
  "Netherlands", 
  "United Kingdom",
  "United States",
  "Turkey",
  "India",
  "China",
  "Vietnam"
];

export const DELIVERY_OPTIONS = [
  "FOB (Free on Board)",
  "CIF (Cost, Insurance, Freight)",
  "CFR (Cost and Freight)", 
  "EXW (Ex Works)"
];

export const QUALITY_STANDARDS: Record<string, string> = {
  'Cashew Nuts': 'W-320 Premium Grade, Moisture: Max 8%, Foreign Matter: Max 1%, Broken: Max 5%',
  'Cocoa Beans': 'Grade A Quality, Moisture: Max 7.5%, Bean Count: 100 beans/100g, Defective: Max 3%',
  'Sesame Seeds': 'Purity: Min 98%, Moisture: Max 6%, Oil Content: Min 50%, Foreign Matter: Max 2%',
  'Ginger': 'Moisture: Max 12%, Ash Content: Max 7%, Volatile Oil: Min 1.5%',
  'Hibiscus Flowers': 'Moisture: Max 12%, Foreign Matter: Max 2%, Color: Deep Red',
  'Shea Butter': 'Moisture: Max 0.05%, Free Fatty Acid: Max 3%, Iodine Value: 53-66',
  'Palm Oil': 'Free Fatty Acid: Max 5%, Moisture: Max 0.1%, Iodine Value: 50-55',
  'Yam': 'Moisture: Max 70%, Starch Content: Min 20%, No Pest Damage',
  'Cassava': 'Moisture: Max 14%, Starch Content: Min 25%, Cyanide: Max 10ppm'
};

export const FEES = {
  LOC_FEE_PERCENTAGE: 0.005, // 0.5%
  INSPECTION_FEE: 150,
  KYC_FEE: 25,
  TRACKING_FEE: 20
};