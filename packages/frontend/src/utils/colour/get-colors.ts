export const getColors = (value) => {
    const valueColors = {
      Aligned: "#28b463", // Green
      Detached: "#ff5733", // Red
      Divergent: "#ffc300", // Yellow
      High: "#ff5733", // Vibrant red
      Medium: "#ffc300", // Vibrant yellow
      Low: "#28b463", // Red
      Neutral: "#ffc300", // Yellow
      Positive: "#28b463", // Green
      Negative: "#ff5733", // Red
    };

    const getPercentageValueColor = () => {
      if (value > 75) {
        return "#28b463"; // Green
      } else if (value <= 75 && value >= 50) {
        return "#ffc300"; // Yellow
      } else if (value < 50 && value >= 25) {
        return "#ff8c00"; // Orange
      } else if (value < 25 && value >= 0) {
        return "#ff5733"; // Red
      } else {
        return "#666666"; // Default gray
      }
    };

    return valueColors[value] || getPercentageValueColor();
  };
