
//Error handler.
module.exports =  errorHandler = (handler) => {
    const handleError = (err) => {
      throw new Error("New error caught: ", err);
    };
  
    return (...args) => {
      try {
        const ret = handler.apply(this, args);
        if (ret && typeof ret.catch === "function") {
          ret.catch(handleError);
        }
      } catch (e) {
        handleError(e);
      }
    };
  };