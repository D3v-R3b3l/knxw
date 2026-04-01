import { broadcastLog, setAgentStatus } from "../db/logger.js";

export abstract class BaseAgent {
  constructor(
    public readonly id: string,
    public readonly name: string,
  ) {}

  protected log(level: string, message: string, data?: unknown) {
    broadcastLog(this.id, level, message, data);
  }

  protected info(message: string, data?: unknown) {
    this.log("info", message, data);
  }

  protected warn(message: string, data?: unknown) {
    this.log("warn", message, data);
  }

  protected error(message: string, data?: unknown) {
    this.log("error", message, data);
  }

  protected success(message: string, data?: unknown) {
    this.log("success", message, data);
  }

  async execute(): Promise<void> {
    setAgentStatus(this.id, "running");
    this.info(`${this.name} starting execution...`);
    try {
      await this.run();
      setAgentStatus(this.id, "idle");
      this.success(`${this.name} completed successfully`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.error(`${this.name} failed: ${msg}`);
      setAgentStatus(this.id, "error");
      throw err;
    }
  }

  abstract run(): Promise<void>;
}
