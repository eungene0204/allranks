// The agent loop, written out by hand so we control budgets and the stop conditions (refusal, pause_turn, token cap).
// It talks to the Claude API through the beta namespace because refusal fallbacks are a beta feature.
import Anthropic from "@anthropic-ai/sdk";
import { TOOL_DEFS } from "./tools.mts";
import type { Toolbox } from "./tools.mts";

type BetaMessage = Anthropic.Beta.BetaMessage;
type BetaMessageParam = Anthropic.Beta.BetaMessageParam;
type BetaToolUnion = Anthropic.Beta.BetaToolUnion;
type BetaTextBlock = Anthropic.Beta.BetaTextBlock;
type BetaContentBlockParam = Anthropic.Beta.BetaContentBlockParam;
type BetaToolResultBlockParam = Anthropic.Beta.BetaToolResultBlockParam;
type StreamParams = Parameters<Anthropic["beta"]["messages"]["stream"]>[0];

export type LoopOptions = {
  model: string;
  effort: "low" | "medium" | "high" | "xhigh" | "max";
  system: string;
  task: string;
  toolbox: Toolbox;
  /** Hard ceiling on API round trips and on total (input + output) tokens, so a confused run cannot burn money. */
  maxTurns: number;
  maxTokens: number;
  /** Server-side tool allowances per request. */
  webUses: number;
  fallbacks: boolean;
  log?: (line: string) => void;
};

export type LoopResult = {
  stopReason: string;
  summary: string;
  usage: { inputTokens: number; outputTokens: number; cacheReadTokens: number; requests: number };
};

/** The one method of the SDK client the loop needs — lets tests substitute a scripted client. */
export type Client = { beta: { messages: { stream: (params: StreamParams) => { finalMessage: () => Promise<BetaMessage> } } } };

export async function runAgent(client: Client, o: LoopOptions): Promise<LoopResult> {
  const log = o.log ?? (() => {});
  const messages: BetaMessageParam[] = [{ role: "user", content: o.task }];
  const usage = { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, requests: 0 };
  const tools: BetaToolUnion[] = [
    { type: "web_search_20260209", name: "web_search", max_uses: o.webUses },
    { type: "web_fetch_20260209", name: "web_fetch", max_uses: o.webUses },
    ...TOOL_DEFS.map((t) => ({ ...t, eager_input_streaming: true })),
  ];
  let summary = "";

  for (let turn = 1; turn <= o.maxTurns; turn++) {
    const stream = client.beta.messages.stream({
      model: o.model,
      max_tokens: 64000,
      // Refusal fallbacks: if a safety classifier declines, the API reruns the request on a fallback model.
      ...(o.fallbacks ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const } : {}),
      cache_control: { type: "ephemeral" },
      output_config: { effort: o.effort },
      system: o.system,
      tools,
      messages,
    });
    const msg = await stream.finalMessage();
    usage.requests++;
    usage.inputTokens += msg.usage.input_tokens;
    usage.outputTokens += msg.usage.output_tokens;
    usage.cacheReadTokens += msg.usage.cache_read_input_tokens ?? 0;

    const text = msg.content.filter((b): b is BetaTextBlock => b.type === "text").map((b) => b.text).join("\n").trim();
    if (text) summary = text;
    messages.push({ role: "assistant", content: msg.content as BetaContentBlockParam[] });

    if (msg.stop_reason === "refusal") return { stopReason: `refusal${msg.stop_details?.category ? `:${msg.stop_details.category}` : ""}`, summary, usage };
    if (msg.stop_reason === "max_tokens") return { stopReason: "max_tokens", summary, usage };

    if (msg.stop_reason === "tool_use") {
      const results: BetaToolResultBlockParam[] = [];
      for (const block of msg.content) {
        if (block.type !== "tool_use") continue;
        const r = o.toolbox.run(block.name, block.input);
        log(`  ${r.isError ? "✗" : "·"} ${block.name}(${(block.input as { id?: string })?.id ?? ""}) ${r.text.split("\n")[0]}`);
        results.push({ type: "tool_result", tool_use_id: block.id, content: r.text, is_error: r.isError });
      }
      messages.push({ role: "user", content: results });
    } else if (msg.stop_reason !== "pause_turn") {
      return { stopReason: msg.stop_reason ?? "end_turn", summary, usage }; // end_turn
    } // pause_turn: a server tool needs more time — re-send as is, the assistant turn is already appended

    if (usage.inputTokens + usage.outputTokens > o.maxTokens) return { stopReason: "token_budget", summary, usage };
  }
  return { stopReason: "max_turns", summary, usage };
}
