export class ApiSessionError extends Error {
  constructor(message, sessionType) {
    super(message);
    this.name = "ApiSessionError";
    this.sessionType = sessionType;
  }
}