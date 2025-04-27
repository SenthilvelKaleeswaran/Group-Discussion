export const formatTopicName = (input) => {
    // Split the input string by uppercase letters and join with spaces
    return input
      .replace(/([A-Z])/g, ' $1') // Add space before each uppercase letter
      .replace(/^./, (str) => str.toUpperCase()) // Capitalize the first letter
      .trim(); // Remove any leading or trailing spaces
  };

export function formatCapitializedText(input) {
    return input
        .toLowerCase()  // Convert to lowercase
        .replace(/_/g, " ") // Replace underscores with spaces
        .replace(/\s+/g, " ") // Replace multiple spaces with a single space
        .trim() // Remove leading/trailing spaces
        .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize first letter of each word
}
  
 
  