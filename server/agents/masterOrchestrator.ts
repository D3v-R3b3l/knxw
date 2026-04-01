import { BaseAgent } from "./base.js";
import { TrendIntelligenceAgent } from "./trendIntelligence.js";
import { DigitalProductsAgent } from "./digitalProducts.js";
import { ShortFormVideoAgent } from "./shortFormVideo.js";

export class MasterOrchestrator extends BaseAgent {
  private agents: BaseAgent[];

  constructor() {
    super("master-orchestrator", "Master Orchestrator");
    this.agents = [
      new TrendIntelligenceAgent(),
      new DigitalProductsAgent(),
      new ShortFormVideoAgent(),
    ];
  }

  async run(): Promise<void> {
    this.info("Master Orchestrator initiating full pipeline execution...");
    this.info(`Pipeline has ${this.agents.length} agents to coordinate`);

    for (const agent of this.agents) {
      this.info(`Dispatching: ${agent.name}...`);
      try {
        await agent.execute();
        this.info(`${agent.name} completed successfully`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        this.warn(`${agent.name} failed: ${msg} — continuing pipeline`);
      }
    }

    this.success("Full pipeline execution complete");
  }
}
