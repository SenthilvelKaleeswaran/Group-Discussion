export const formatTopicName = (input) => {
    // Split the input string by uppercase letters and join with spaces
    return input
      .replace(/([A-Z])/g, ' $1') // Add space before each uppercase letter
      .replace(/^./, (str) => str.toUpperCase()) // Capitalize the first letter
      .trim(); // Remove any leading or trailing spaces
  };
  
 
  