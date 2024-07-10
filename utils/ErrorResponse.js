class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    // console.log(`${message}: ${this.statusCode} - From ErrorResponse`);
  }
}

module.exports = ErrorResponse;
