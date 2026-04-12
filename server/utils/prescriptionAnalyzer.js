/**
 * Analyzes extracted text from a document to determine if it's a valid medical prescription
 * and extracts relevant information (disease, medicines, dosage).
 * 
 * @param {string} text - The extracted text from the document (usually via OCR)
 * @returns {Object} - Result in the specified JSON format
 */
const analyzePrescription = (text) => {
    if (!text || typeof text !== 'string') {
        return {
            is_prescription: false,
            message: "No text provided for analysis",
            disease: null,
            medicines: [],
            dosage: []
        };
    }

    const lowerText = text.toLowerCase();

    // 1. Validation - check for non-medical indicators
    const invalidKeywords = [
        "certificate", "course", "completion", "awarded", "issued by", 
        "university", "training", "diploma", "degree"
    ];

    for (const keyword of invalidKeywords) {
        if (lowerText.includes(keyword)) {
            return {
                is_prescription: false,
                message: "This document is not a valid medical prescription",
                disease: null,
                medicines: [],
                dosage: []
            };
        }
    }

    // 2. Validation - check for medical indicators
    const medicalIndicators = [
        "rx", "tablet", "tab", "syrup", "syp", "injection", "inj", 
        "mg", "ml", "dosage", "twice a day", "daily", "dr.", "doctor"
    ];

    const hasMedicalIndicator = medicalIndicators.some(indicator => lowerText.includes(indicator));
    
    // We also check for diagnosis or clinical notes patterns
    const hasDiagnosisPattern = /diagnosis|dx|history|complaints|symptoms/i.test(text);

    if (!hasMedicalIndicator && !hasDiagnosisPattern) {
        return {
            is_prescription: false,
            message: "This document is not a valid medical prescription",
            disease: null,
            medicines: [],
            dosage: []
        };
    }

    // 3. Extraction logic
    const medicines = [];
    const dosages = [];
    let disease = "Unknown";

    // Extracting medicines (basic pattern matching for demo)
    // In a real scenario, this would match against a database of medicine names
    const lines = text.split('\n');
    lines.forEach(line => {
        const lineLower = line.toLowerCase();
        // Look for lines that look like a medicine prescription
        // e.g., "Tab. Paracetamol 500mg" or "Rx Amoxicillin"
        const medMatch = line.match(/(?:tab|tablet|syp|syrup|inj|rx|cap|capsule)\.?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
        if (medMatch) {
            medicines.push(medMatch[1].trim());
            // Extract dosage from the same line or next line if available
            const dosageMatch = line.match(/\d+\s*(?:mg|ml|unit|tab|capsule)|(?:1-0-1|1-1-1|once|twice|thrice|daily)/i);
            if (dosageMatch) {
                dosages.push(dosageMatch[0]);
            }
        }
    });

    // Extracting disease/diagnosis
    const diagnosisMatch = text.match(/(?:Diagnosis|Dx|Impression|History|Symptoms):\s*([^\n.]+)/i);
    if (diagnosisMatch) {
        disease = diagnosisMatch[1].trim();
    } else {
        // Simple inference for common patterns
        if (lowerText.includes("fever") || lowerText.includes("pyrexia")) disease = "Fever";
        else if (lowerText.includes("cough") || lowerText.includes("cold")) disease = "Common Cold";
        else if (lowerText.includes("gastritis") || lowerText.includes("acidity")) disease = "Gastritis";
        else if (lowerText.includes("infection")) disease = "Infection";
        else if (lowerText.includes("hypertension") || lowerText.includes("bp")) disease = "Hypertension";
    }

    return {
        is_prescription: true,
        disease: disease,
        medicines: [...new Set(medicines)],
        dosage: [...new Set(dosages)]
    };
};

module.exports = { analyzePrescription };
