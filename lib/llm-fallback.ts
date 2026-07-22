import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject, generateText } from "ai";
import { type ZodType } from "zod";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_API_KEY,
});

/**
 * Ordered chain of valid Google Gemini models to attempt.
 * If the primary model fails due to high demand, rate limits, or transient errors,
 * the failover mechanism automatically tries the next model in sequence.
 */
export const DEFAULT_GEMINI_FALLBACK_CHAIN = [
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
];

export interface FallbackOptions {
  models?: string[];
  onFallback?: (
    failedModel: string,
    nextModel: string,
    error: unknown,
  ) => void | Promise<void>;
}

/**
 * Helper to call generateObject with multi-model failover.
 */
export async function generateObjectWithFallback<T>({
  schema,
  prompt,
  options,
}: {
  schema: ZodType<T>;
  prompt: string;
  options?: FallbackOptions;
}) {
  const models = options?.models ?? DEFAULT_GEMINI_FALLBACK_CHAIN;
  const errors: { model: string; error: unknown }[] = [];

  for (let i = 0; i < models.length; i++) {
    const modelName = models[i];
    const startTime = Date.now();

    console.log(
      `[LLM:Gemini] Calling generateObject — attempt ${i + 1}/${models.length} with model: ${modelName}, prompt length: ${prompt.length} chars`,
    );

    try {
      const result = await generateObject({
        model: google(modelName),
        schema,
        prompt,
        maxRetries: 1, // Fail fast to try the next model in our fallback chain
      });

      const duration = Date.now() - startTime;
      console.log(
        `[LLM:Gemini] ✅ generateObject succeeded in ${duration}ms using model: ${modelName}`,
      );
      console.log(
        `[LLM:Gemini] 📊 Token usage — input: ${result.usage?.inputTokens ?? "N/A"}, output: ${result.usage?.outputTokens ?? "N/A"}, total: ${result.usage?.totalTokens ?? "N/A"}`,
      );

      return {
        ...result,
        usedModel: modelName,
      };
    } catch (err: any) {
      const duration = Date.now() - startTime;
      errors.push({ model: modelName, error: err });

      const errorMsg = err?.message || String(err);
      console.warn(
        `[LLM:Gemini] ⚠️ generateObject failed on model "${modelName}" after ${duration}ms: ${errorMsg}`,
      );

      if (i < models.length - 1) {
        const nextModel = models[i + 1];
        console.log(
          `[LLM:Gemini] 🔄 Failing over to next model in chain: ${nextModel}`,
        );
        if (options?.onFallback) {
          try {
            await options.onFallback(modelName, nextModel, err);
          } catch {
            // Ignore callback errors
          }
        }
      }
    }
  }

  // All models failed
  console.error(
    `[LLM:Gemini] ❌ All models in fallback chain failed (${models.join(", ")})`,
  );
  const primaryError = errors[0]?.error;
  throw (
    primaryError ||
    new Error(`All LLM fallback models failed: ${models.join(", ")}`)
  );
}

/**
 * Helper to call generateText with multi-model failover.
 */
export async function generateTextWithFallback({
  prompt,
  options,
}: {
  prompt: string;
  options?: FallbackOptions;
}) {
  const models = options?.models ?? DEFAULT_GEMINI_FALLBACK_CHAIN;
  const errors: { model: string; error: unknown }[] = [];

  for (let i = 0; i < models.length; i++) {
    const modelName = models[i];
    const startTime = Date.now();

    console.log(
      `[LLM:Gemini] Calling generateText — attempt ${i + 1}/${models.length} with model: ${modelName}, prompt length: ${prompt.length} chars`,
    );

    try {
      const result = await generateText({
        model: google(modelName),
        prompt,
        maxRetries: 1, // Fail fast to try the next model in our fallback chain
      });

      const duration = Date.now() - startTime;
      console.log(
        `[LLM:Gemini] ✅ generateText succeeded in ${duration}ms using model: ${modelName}`,
      );
      console.log(
        `[LLM:Gemini] 📊 Token usage — input: ${result.usage?.inputTokens ?? "N/A"}, output: ${result.usage?.outputTokens ?? "N/A"}, total: ${result.usage?.totalTokens ?? "N/A"}`,
      );

      return {
        ...result,
        usedModel: modelName,
      };
    } catch (err: any) {
      const duration = Date.now() - startTime;
      errors.push({ model: modelName, error: err });

      const errorMsg = err?.message || String(err);
      console.warn(
        `[LLM:Gemini] ⚠️ generateText failed on model "${modelName}" after ${duration}ms: ${errorMsg}`,
      );

      if (i < models.length - 1) {
        const nextModel = models[i + 1];
        console.log(
          `[LLM:Gemini] 🔄 Failing over to next model in chain: ${nextModel}`,
        );
        if (options?.onFallback) {
          try {
            await options.onFallback(modelName, nextModel, err);
          } catch {
            // Ignore callback errors
          }
        }
      }
    }
  }

  // All models failed
  console.error(
    `[LLM:Gemini] ❌ All models in fallback chain failed (${models.join(", ")})`,
  );
  const primaryError = errors[0]?.error;
  throw (
    primaryError ||
    new Error(`All LLM fallback models failed: ${models.join(", ")}`)
  );
}
