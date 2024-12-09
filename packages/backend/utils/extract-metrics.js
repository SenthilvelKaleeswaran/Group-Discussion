
// Function to handle incomplete or truncated JSON and extract properties
 function extractPropertiesFromJson(response) {
let jsonString = response.trim();

// Try parsing the JSON safely
try {
    // Parse the JSON string
    const parsedObject = JSON.parse(jsonString);

    // Check if all expected properties are present, if not, return placeholders
    const properties = {
        selfCorrectionRate: parsedObject["Self-Correction Rate"] || "N/A",
        constructiveness: parsedObject["Constructiveness"] || "N/A",
        empathyDetection: parsedObject["Empathy Detection"] || "N/A",
        intensityOfEmotion: parsedObject["Intensity of Emotion"] || "Unknown",
        polarity: parsedObject["Polarity"] || "Unknown",
        turnDominance: parsedObject["Turn Dominance"] || "N/A",
        topicRelevance: parsedObject["Topic Relevance"] || "Unknown",
    };

    return properties;
} catch (error) {
    // If parsing fails, handle incomplete JSON
    console.error("Error parsing JSON:", error);

    // Try extracting the properties manually from the string
    const incompleteProperties = {};

    // Regular expressions to extract properties from the raw text
    const regexPatterns = {
        selfCorrectionRate: /"Self-Correction Rate":\s*"([^"]*)"/,
        constructiveness: /"Constructiveness":\s*"([^"]*)"/,
        empathyDetection: /"Empathy Detection":\s*"([^"]*)"/,
        intensityOfEmotion: /"Intensity of Emotion":\s*"([^"]*)"/,
        polarity: /"Polarity":\s*"([^"]*)"/,
        turnDominance: /"Turn Dominance":\s*"([^"]*)"/,
        topicRelevance: /"Topic Relevance":\s*"([^"]*)"/,
    };

    // Extract each property using regex
    for (const [key, regex] of Object.entries(regexPatterns)) {
        const match = jsonString.match(regex);
        if (match && match[1]) {
            incompleteProperties[key] = match[1];
        } else {
            incompleteProperties[key] = "N/A";  // Default value if the property is missing
        }
    }

    return incompleteProperties;
}
}

// Call the function to process the response
module.exports = {
    extractPropertiesFromJson
}