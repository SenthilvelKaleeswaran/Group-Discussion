// Section.js
export const Section = ({ title, description, children }) => {
    return (
      <section className="border p-4 border-black rounded-md">
        <h2 className="text-2xl font-medium text-gray-700">{title}</h2>
        {description && (
          <p className="text-sm text-gray-500 mb-4">{description}</p>
        )}
        {children}
      </section>
    );
  };
  
  