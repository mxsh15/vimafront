import type { ProblemDetails } from "./problem-details";

export class ApiError extends Error {
  public readonly status: number;
  public readonly url?: string;
  public readonly problem?: ProblemDetails;
  public readonly rawBody?: string;
  public readonly headers?: Headers;

  constructor(args: {
    message: string;
    status: number;
    url?: string;
    problem?: ProblemDetails;
    rawBody?: string;
    headers?: Headers;
  }) {
    super(args.message);
    this.name = "ApiError";
    this.status = args.status;
    this.url = args.url;
    this.problem = args.problem;
    this.rawBody = args.rawBody;
    this.headers = args.headers;
  }
}
