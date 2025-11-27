import { describe, it, expect } from "vitest";
import {
  extractVariables,
  replaceVariables,
  validateVariables,
  EMAIL_VARIABLES,
} from "../utils/emailVariables";

describe("Email Variables System", () => {
  describe("extractVariables", () => {
    it("should extract single variable from content", () => {
      const content = "Hello {{contact_name}}!";
      const variables = extractVariables(content);
      expect(variables).toEqual(["contact_name"]);
    });

    it("should extract multiple variables from content", () => {
      const content = "Hi {{contact_name}} from {{company_name}}!";
      const variables = extractVariables(content);
      expect(variables).toContain("contact_name");
      expect(variables).toContain("company_name");
      expect(variables).toHaveLength(2);
    });

    it("should handle variables with spaces", () => {
      const content = "Hello {{ contact_name }}!";
      const variables = extractVariables(content);
      expect(variables).toEqual(["contact_name"]);
    });

    it("should return empty array when no variables present", () => {
      const content = "Hello there!";
      const variables = extractVariables(content);
      expect(variables).toEqual([]);
    });

    it("should handle duplicate variables", () => {
      const content = "{{contact_name}} and {{contact_name}} again";
      const variables = extractVariables(content);
      expect(variables).toEqual(["contact_name"]);
    });
  });

  describe("replaceVariables", () => {
    it("should replace single variable with value", () => {
      const content = "Hello {{contact_name}}!";
      const values = { contact_name: "John Doe" };
      const result = replaceVariables(content, values);
      expect(result).toBe("Hello John Doe!");
    });

    it("should replace multiple variables", () => {
      const content = "Hi {{contact_name}} from {{company_name}}!";
      const values = {
        contact_name: "John Doe",
        company_name: "Acme Corp",
      };
      const result = replaceVariables(content, values);
      expect(result).toBe("Hi John Doe from Acme Corp!");
    });

    it("should use fallback for missing variables", () => {
      const content = "Hello {{contact_name}}!";
      const values = {};
      const result = replaceVariables(content, values, { fallback: "[Missing]" });
      expect(result).toBe("Hello [Missing]!");
    });

    it("should handle variables with spaces", () => {
      const content = "Hello {{ contact_name }}!";
      const values = { contact_name: "John Doe" };
      const result = replaceVariables(content, values);
      expect(result).toBe("Hello John Doe!");
    });

    it("should preserve content without variables", () => {
      const content = "Hello there!";
      const values = { contact_name: "John Doe" };
      const result = replaceVariables(content, values);
      expect(result).toBe("Hello there!");
    });
  });

  describe("validateVariables", () => {
    it("should validate when all variables are available", () => {
      const content = "Hi {{contact_name}} from {{company_name}}!";
      const values = {
        contact_name: "John Doe",
        company_name: "Acme Corp",
      };
      const validation = validateVariables(content, values);
      expect(validation.valid).toBe(true);
      expect(validation.missing).toEqual([]);
      expect(validation.unknown).toEqual([]);
    });

    it("should detect missing variables", () => {
      const content = "Hi {{contact_name}} from {{company_name}}!";
      const values = {
        contact_name: "John Doe",
      };
      const validation = validateVariables(content, values);
      expect(validation.valid).toBe(false);
      expect(validation.missing).toContain("company_name");
    });

    it("should detect unknown variables", () => {
      const content = "Hi {{unknown_var}}!";
      const values = {};
      const validation = validateVariables(content, values);
      expect(validation.valid).toBe(false);
      expect(validation.unknown).toContain("unknown_var");
    });

    it("should handle empty values as missing", () => {
      const content = "Hi {{contact_name}}!";
      const values = {
        contact_name: "",
      };
      const validation = validateVariables(content, values);
      expect(validation.valid).toBe(false);
      expect(validation.missing).toContain("contact_name");
    });
  });

  describe("EMAIL_VARIABLES", () => {
    it("should have contact variables defined", () => {
      expect(EMAIL_VARIABLES.contact_name).toBeDefined();
      expect(EMAIL_VARIABLES.contact_email).toBeDefined();
      expect(EMAIL_VARIABLES.contact_first_name).toBeDefined();
    });

    it("should have company variables defined", () => {
      expect(EMAIL_VARIABLES.company_name).toBeDefined();
      expect(EMAIL_VARIABLES.company_industry).toBeDefined();
    });

    it("should have sender variables defined", () => {
      expect(EMAIL_VARIABLES.sender_name).toBeDefined();
      expect(EMAIL_VARIABLES.sender_email).toBeDefined();
    });

    it("should have dynamic variables defined", () => {
      expect(EMAIL_VARIABLES.current_date).toBeDefined();
      expect(EMAIL_VARIABLES.current_day).toBeDefined();
      expect(EMAIL_VARIABLES.current_month).toBeDefined();
    });
  });
});
