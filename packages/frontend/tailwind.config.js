module.exports = {
  theme: {
    extend: {
      // Optional: Add custom animations or transformations here
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities(
        {
          '.rotate-y-180': {
            transform: 'rotateY(180deg)',
            transition: 'transform 0.5s ease',
          },
          '.backface-hidden': {
            backfaceVisibility: 'hidden',
          },
        },
        ['responsive', 'group-hover'] 
      );
    },
  ],
};
