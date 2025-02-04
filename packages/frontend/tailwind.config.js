module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"], // Update with your project paths
  theme: {
    extend: {
      // Add custom animations
      keyframes: {
        drop: {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        drop: "drop 0.5s ease-out", // Define the animation
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities(
        {
          ".rotate-y-180": {
            transform: "rotateY(180deg)",
            transition: "transform 0.5s ease",
          },
          ".backface-hidden": {
            backfaceVisibility: "hidden",
          },
        },
        ["responsive", "group-hover"]
      );
    },
  ],
};