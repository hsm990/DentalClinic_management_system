import rateLimit from "express-rate-limit";

const rateLimiter = (message: string) => {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: { message: message } },
  });
};

export default rateLimiter;
