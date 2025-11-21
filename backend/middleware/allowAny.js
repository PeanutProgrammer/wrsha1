const allowAny = (...middlewares) => {
  return async (req, res, next) => {
    console.log("allowAny triggered");
    for (const middleware of middlewares) {
      console.log("Running middleware:", middleware.name);
      let calledNext = false;

      const nextWrapper = () => {
        calledNext = true;
      };

      try {
        await middleware(req, res, nextWrapper);
      } catch (err) {
        // ignore errors
      }

      // If middleware already sent a response, STOP here.
      if (res.headersSent) {
        return;
      }

      // If next() was called inside middleware, allow request to proceed
      if (calledNext) {
        return next();
      }
    }

    // None passed → reject
    if (!res.headersSent) {
      return res
        .status(403)
        .json({ msg: "You are not authorized to access this route" });
    }
  };
};

module.exports = allowAny;
