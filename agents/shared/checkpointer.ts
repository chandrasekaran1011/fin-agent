import { MemorySaver } from "@langchain/langgraph";

let checkpointer: MemorySaver | null = null;

export function getCheckpointer(): MemorySaver {
  if (!checkpointer) {
    checkpointer = new MemorySaver();
  }
  return checkpointer;
}
