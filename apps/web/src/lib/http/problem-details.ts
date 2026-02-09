export type ValidationErrors = Record<string, string[]>;

/**
 * Minimal RFC7807 Problem Details shape.
 * Compatible with ASP.NET Core `ProblemDetails` / `ValidationProblemDetails`.
 */
export type ProblemDetails = {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  traceId?: string;
  errors?: ValidationErrors;
  // allow backend-specific extensions
  [key: string]: unknown;
};
