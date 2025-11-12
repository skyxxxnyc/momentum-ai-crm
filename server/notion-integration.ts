import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Execute MCP CLI command
 */
async function executeMCP(command: string[]): Promise<any> {
  const cmd = `manus-mcp-cli ${command.join(" ")}`;
  console.log(`[Notion] Executing: ${cmd}`);

  try {
    const { stdout, stderr } = await execAsync(cmd);
    if (stderr) {
      console.error(`[Notion] stderr: ${stderr}`);
    }
    return JSON.parse(stdout);
  } catch (error: any) {
    console.error(`[Notion] Error executing MCP command:`, error);
    throw new Error(`Notion MCP error: ${error.message}`);
  }
}

/**
 * List available Notion tools
 */
export async function listNotionTools() {
  return executeMCP(["tool", "list", "--server", "notion"]);
}

/**
 * Create a Notion page in a database
 */
export async function createNotionPage(params: {
  databaseId: string;
  properties: Record<string, any>;
  children?: any[];
}) {
  const input = JSON.stringify(params);
  return executeMCP(["tool", "call", "create-page", "--server", "notion", "--input", input]);
}

/**
 * Update a Notion page
 */
export async function updateNotionPage(params: {
  pageId: string;
  properties: Record<string, any>;
}) {
  const input = JSON.stringify(params);
  return executeMCP(["tool", "call", "update-page", "--server", "notion", "--input", input]);
}

/**
 * Query a Notion database
 */
export async function queryNotionDatabase(params: {
  databaseId: string;
  filter?: any;
  sorts?: any[];
  pageSize?: number;
}) {
  const input = JSON.stringify(params);
  return executeMCP(["tool", "call", "query-database", "--server", "notion", "--input", input]);
}

/**
 * Search Notion
 */
export async function searchNotion(params: { query: string; filter?: any }) {
  const input = JSON.stringify(params);
  return executeMCP(["tool", "call", "search", "--server", "notion", "--input", input]);
}

/**
 * Sync a contact to Notion
 */
export async function syncContactToNotion(
  contact: any,
  databaseId: string
): Promise<{ success: boolean; pageId?: string; error?: string }> {
  try {
    const properties: Record<string, any> = {
      Name: {
        title: [{ text: { content: contact.name || "Unnamed Contact" } }],
      },
    };

    if (contact.email) {
      properties.Email = { email: contact.email };
    }

    if (contact.phone) {
      properties.Phone = { phone_number: contact.phone };
    }

    if (contact.company) {
      properties.Company = {
        rich_text: [{ text: { content: contact.company } }],
      };
    }

    if (contact.title) {
      properties.Title = {
        rich_text: [{ text: { content: contact.title } }],
      };
    }

    const result = await createNotionPage({
      databaseId,
      properties,
    });

    return { success: true, pageId: result.id };
  } catch (error: any) {
    console.error(`[Notion] Failed to sync contact:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Sync a company to Notion
 */
export async function syncCompanyToNotion(
  company: any,
  databaseId: string
): Promise<{ success: boolean; pageId?: string; error?: string }> {
  try {
    const properties: Record<string, any> = {
      Name: {
        title: [{ text: { content: company.name || "Unnamed Company" } }],
      },
    };

    if (company.website) {
      properties.Website = { url: company.website };
    }

    if (company.industry) {
      properties.Industry = {
        rich_text: [{ text: { content: company.industry } }],
      };
    }

    if (company.phone) {
      properties.Phone = { phone_number: company.phone };
    }

    if (company.address) {
      properties.Address = {
        rich_text: [{ text: { content: company.address } }],
      };
    }

    const result = await createNotionPage({
      databaseId,
      properties,
    });

    return { success: true, pageId: result.id };
  } catch (error: any) {
    console.error(`[Notion] Failed to sync company:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Sync a deal to Notion
 */
export async function syncDealToNotion(
  deal: any,
  databaseId: string
): Promise<{ success: boolean; pageId?: string; error?: string }> {
  try {
    const properties: Record<string, any> = {
      Name: {
        title: [{ text: { content: deal.name || "Unnamed Deal" } }],
      },
    };

    if (deal.value) {
      properties.Value = { number: deal.value };
    }

    if (deal.stage) {
      properties.Stage = {
        rich_text: [{ text: { content: deal.stage } }],
      };
    }

    if (deal.probability) {
      properties.Probability = { number: deal.probability };
    }

    if (deal.closeDate) {
      properties["Close Date"] = { date: { start: deal.closeDate } };
    }

    const result = await createNotionPage({
      databaseId,
      properties,
    });

    return { success: true, pageId: result.id };
  } catch (error: any) {
    console.error(`[Notion] Failed to sync deal:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Batch sync multiple records
 */
export async function batchSyncToNotion(
  records: any[],
  type: "contact" | "company" | "deal",
  databaseId: string
): Promise<{ success: number; failed: number; errors: string[] }> {
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const record of records) {
    try {
      let result;
      switch (type) {
        case "contact":
          result = await syncContactToNotion(record, databaseId);
          break;
        case "company":
          result = await syncCompanyToNotion(record, databaseId);
          break;
        case "deal":
          result = await syncDealToNotion(record, databaseId);
          break;
      }

      if (result.success) {
        success++;
      } else {
        failed++;
        errors.push(`${record.name}: ${result.error}`);
      }
    } catch (error: any) {
      failed++;
      errors.push(`${record.name}: ${error.message}`);
    }
  }

  return { success, failed, errors };
}
