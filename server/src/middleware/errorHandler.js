export const notFoundHandler = (req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.originalUrl}`,
  });
};

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error?.code === 11000) {
    const fieldName = Object.keys(error.keyPattern || {})[0] || "value";
    return res.status(409).json({
      message: `${fieldName} already exists. Please use a different ${fieldName}.`,
    });
  }

  if (error?.name === "ValidationError") {
    const firstMessage = Object.values(error.errors || {})[0]?.message;
    return res.status(400).json({
      message: firstMessage || "Validation failed.",
    });
  }

  res.status(error.statusCode || 500).json({
    message: error.message || "Something went wrong.",
    stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
  });
};
