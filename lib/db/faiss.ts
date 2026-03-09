import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { Document } from "@langchain/core/documents";
import { getEmbeddings } from "@/lib/embeddings/provider";
import path from "path";
import fs from "fs";

export interface FAISSDocMetadata {
  id: string;
  category: string;
  title: string;
  sourceTable: string;
  sourceId: string;
  businessUnit?: string;
  period?: string;
}

export class FAISSManager {
  private static instance: FaissStore | null = null;
  private static readonly indexPath =
    process.env.FAISS_INDEX_PATH ?? "./data/faiss";

  static async getInstance(): Promise<FaissStore> {
    if (this.instance) return this.instance;

    const fullPath = path.resolve(this.indexPath);

    if (fs.existsSync(path.join(fullPath, "faiss.index"))) {
      this.instance = await FaissStore.load(fullPath, getEmbeddings());
    } else {
      this.instance = await FaissStore.fromDocuments([], getEmbeddings());
    }

    return this.instance;
  }

  static async addDocuments(docs: Document<FAISSDocMetadata>[]): Promise<void> {
    const store = await this.getInstance();
    await store.addDocuments(docs);
    await this.save();
  }

  static async search(
    query: string,
    k: number = 5
  ): Promise<Array<{ doc: Document<FAISSDocMetadata>; score: number }>> {
    const store = await this.getInstance();
    const results = await store.similaritySearchWithScore(query, k);
    return results.map(([doc, score]) => ({
      doc: doc as Document<FAISSDocMetadata>,
      score,
    }));
  }

  static async searchWithThreshold(
    query: string,
    k: number = 5,
    minScore: number = 0.7
  ): Promise<Array<{ doc: Document<FAISSDocMetadata>; score: number }>> {
    const results = await this.search(query, k);
    return results.filter((r) => r.score >= minScore);
  }

  static async save(): Promise<void> {
    if (!this.instance) return;
    const fullPath = path.resolve(this.indexPath);
    fs.mkdirSync(fullPath, { recursive: true });
    await this.instance.save(fullPath);
  }

  static async rebuild(docs: Document<FAISSDocMetadata>[]): Promise<void> {
    this.instance = await FaissStore.fromDocuments(docs, getEmbeddings());
    await this.save();
  }

  static reset(): void {
    this.instance = null;
  }
}
