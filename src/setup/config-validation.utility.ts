import { validateSync } from "class-validator";

export const configValidationUtility = {
  validateConfig: (config: any) => {
    const errors = validateSync(config);
    if (errors.length > 0) {
      const sortedMessages = errors
        .map((error) => Object.values(error.constraints || {}).join(", "))
        .join("; ");
      throw new Error("Validation failed: " + sortedMessages);
    }
  },
  convertToBoolean(value: string) {
    const trimmedValue = value?.trim();
    if (trimmedValue === "true") return true;
    if (trimmedValue === "1") return true;
    if (trimmedValue === "enabled") return true;
    if (trimmedValue === "false") return false;
    if (trimmedValue === "0") return false;
    if (trimmedValue === "disabled") return false;

    return null;
  },
  convertToNumber(value: string) {
    if (value !== "0" && !value) {
      return null;
    }

    return Number(value);
  },
  getEnumValues<T extends Record<string, string>>(enumObj: T): string[] {
    return Object.values(enumObj);
  },
};
