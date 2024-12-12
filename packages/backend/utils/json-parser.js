const jsonParser = async (data) => {
  const regex = /(\{.*\}|\[.*\])/s;

  const match = data.match(regex); 
  if (match) {
    try {
      const {  parse } = await import("partial-json");
      return data ? parse(match[0]) : {};
    } catch (error) {
      return null;
    }
  }
  return null;
};

module.exports = {
  jsonParser,
};
