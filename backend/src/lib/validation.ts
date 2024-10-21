
function isSQLInjection(input: string): boolean {
    const regex = /\b(SELECT|INSERT|DELETE|UPDATE|DROP|UNION|ALTER|CREATE|EXEC|SHOW|GRANT|REVOKE|TRUNCATE)\b|--|;|#|'|"|\bOR\b|\bAND\b|\/\*|\*\//i;
    return regex.test(input);
}

class ValidationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = this.constructor.name;
    }
  }
  
  class Schema<T> {
    protected defaultValue?: T;
    constructor(
      private readonly validateFn: (data: unknown) => T
    ) {
    }
  
    validate(data?: unknown): T  {
      return this.validateFn(data || this.defaultValue);
    }


  
    static string() {
      return new IsString();
    }
  
    static number() {
      return new IsNumber();
    }
    static boolean() {
      return new IsBoolean();
    }
    static array<T>() {
      return new IsArray<T>();
    }
    static object<T extends Record<string, any>>(schema: { [K in keyof T]: Schema<T[K]> }) {
      return new IsObject<T>(schema);
    }
    static enum<T>(enumData: T[]) {
      return new IsEnum<T>(enumData);
    }
  
    default(defaultValue: T): this {
      this.defaultValue = defaultValue;
      return this;
    }
  }
  
  
  
  class IsBoolean extends Schema<boolean> {
    private requiredData: boolean | undefined;
    private defaultData: boolean | undefined;
    private messageError: string | undefined;
  
    constructor() {
      super((data) => {
        if (!data && !this.defaultData && this.requiredData) {
         throw new ValidationError(this.messageError || "Value is required");
        }
        if (!data && this.defaultData) {
          data = this.defaultData;
        }
        if (typeof data !== "boolean") {
          throw new ValidationError("Value must be a boolean");
        }
        return data;
      });
    }
  
    required(message?: string): this {
      if (this.requiredData === false)
        throw new Error("Cannot set required to false after setting it to true");
      this.requiredData = true;
      if (message) this.messageError = message;
      return this;
    }
  
    optional(): this {
      if (this.requiredData === true)
        throw new ValidationError("Cannot set optional to true after setting it to false");
      this.requiredData = false;
      return this;
    }
  
    default(defaultValue: boolean): this {
      this.defaultData = defaultValue;
      return this;
    }
  }
  class IsNumber extends Schema<number> {
    private requiredData: boolean | undefined;
    private defaultData: number | undefined;
    private messageError: string | undefined;
    private minData: number | undefined;
    private maxData: number | undefined;
  
    constructor() {
      super((data) => {
       if (!data && !this.defaultData && this.requiredData) {
          throw new ValidationError(this.messageError || "Value is required");
        }
        if (!data && this.defaultData) {
         data = this.defaultData;
        }
        if (typeof data !== "number") {
          throw new ValidationError("Value must be a number");
        }
        if (this.minData && data < this.minData) {
          throw new ValidationError(this.messageError || `Value must be at least ${this.minData}`);
        }
        if (this.maxData && data > this.maxData) {
          throw new ValidationError(this.messageError || `Value must be at most ${this.maxData}`);
        }
        return data;
  
      });
    }
  
    min(min: number, message?: string): this {
      if (this.requiredData === false) return this;
      this.minData = min;
      if (message) this.messageError = message;
      return this;
    }
  
    max(max: number, message?: string): this {
      if (this.requiredData === false) return this;
      this.maxData = max;
      if (message) this.messageError = message;
      return this;
    }
   
    required(message?: string): this {
      if (this.requiredData === false)
        throw new Error("Cannot set required to false after setting it to true");
      this.requiredData = true;
      if (message) this.messageError = message;
      return this;
    }
  
    optional(): this {
      if (this.requiredData === true)
        throw new Error("Cannot set optional to true after setting it to false");
      this.requiredData = false;
      return this;
    }
  
    default(defaultValue: number): this {
      this.defaultData = defaultValue;
      return this;
    }
  }
  
  class IsObject<T extends Record<string, any>> extends Schema<T> {
    private requiredData: boolean = false;
    private defaultData: T | undefined;
    private messageError: string | undefined;
    private schema: { [K in keyof T]: Schema<T[K]> };
  
    constructor(schema: { [K in keyof T]: Schema<T[K]> }) {
      super((data) => {
        if (!data && this.defaultData) {
          data = this.defaultData;
        }
  
        if ((!data && !this.defaultData && this.requiredData) || typeof data !== "object") {
          throw new ValidationError(this.messageError || "Value must be an object");
        }
  
        const resultObj: Record<string, any> = {};
  
        for (const key in this.schema) {
          const value = (data as any)[key];
          const schema = this.schema[key];
          const result = schema.validate(value);
       
          resultObj[key] = result;
        }
  
        return resultObj as T;
      });
  
      this.schema = schema;
    }
  
    required(message?: string): this {
      this.requiredData = true;
      if (message) this.messageError = message;
      return this;
    }
  
    default(defaultValue: T): this {
      this.defaultData = defaultValue;
      return this;
    }
  }
  
  class IsEnum<T> extends Schema<T> {
  
    private requiredData: boolean = false;
    private defaultData: T | undefined;
    private messageError: string | undefined;
    private enumData: T[] | undefined;
  
    constructor(enumData: T[]) {
      super((data) => {
        if (!data && this.defaultData) {
          data = this.defaultData;
        }
        if ((!data && !this.defaultData && this.requiredData) || !this.enumData?.includes(data as T)) {
          throw new ValidationError(this.messageError || `Value must be one of ${this.enumData}`);
        }
        return data as T;
      });
      this.enumData = enumData;
    }
  
    required(message?: string): this {
      this.requiredData = true;
      if (message) this.messageError = message;
      return this;
    }
  
    default(defaultValue: T): this {
      this.defaultData = defaultValue;
      return this;
    }
  }
  class IsArray<T> extends Schema<T[]> {
    private requiredData: boolean = false;
    private defaultData: T[] | undefined;
    private messageError: string | undefined;
    private elementValidator: ((element: unknown) => boolean) | undefined;
  
    constructor() {
      super((data) => {
        if (!data && this.defaultData) {
          data = this.defaultData;
        }
        if ((!data && !this.defaultData && this.requiredData) || !Array.isArray(data)) {
          throw new ValidationError("Value must be an array");
        }
        if (this.elementValidator) {
          for (const item of data) {
            if (!this.elementValidator(item)) {
              throw new ValidationError(this.messageError || "Array contains invalid elements");
            }
          }
        }
        return data as T[];
      });
    }
    required(message?: string): this {
      this.requiredData = true;
      if (message) this.messageError = message;
      return this;
    }
  
    default(defaultValue: T[]): this {
      this.defaultData = defaultValue;
      return this;
    }
  
    elementValidatorFn(validator: (element: unknown) => boolean): this {
      this.elementValidator = validator;
      return this;
    }
  }
  class IsString extends Schema<string> {
    private maxLength: number | undefined;
    private minLength: number | undefined;
    private requiredData: boolean | undefined;
    private regexData: RegExp | undefined;
    private messageError: string | undefined;
    constructor() {
      super((data) => {
        if (typeof data !== "string" ) {
          throw new ValidationError("Value must be a string");
        }
        if (this.requiredData && !data) {
          throw new ValidationError(this.messageError || "Value is required");
        }
        if (this.minLength && data.length < this.minLength) {
          throw new ValidationError(this.messageError || `Value must be at least ${this.minLength} characters`);
        }
        if (this.maxLength && data.length > this.maxLength) {
          throw new ValidationError(this.messageError || `Value must be at most ${this.maxLength} characters`);
        }
        if (this.regexData && !this.regexData.test(data)) {
          throw new ValidationError(this.messageError || `Value must match regex ${this.regexData}`);
        }
        if (isSQLInjection(data)) {
          throw new ValidationError("Value must not contain SQL injection");
        }
        return data;
      }
    );
    }
  
    min(min: number, message?:string): this {
      if (this.requiredData === false)
        return this;
      this.minLength = min;
      if (message)
        this.messageError = message;
      return this;
    }
    max(max: number, message?:string): this {
      if (this.requiredData === false)
        return this;
      this.maxLength = max;
      if (message)
        this.messageError = message;
      return this;
    }
    required(message?:string): this {
      if (this.requiredData === false)
        throw new Error("Cannot set required to false after setting it to true");
      this.requiredData = true;
      if (message)
        this.messageError = message;
      return this;
    }
    regex(regex: RegExp, message: string): this {
      this.regexData = regex;
      return this;
    }
    optional(): this {
      if (this.requiredData === true)
        throw new Error("Cannot set optional to true after setting it to false");
      this.requiredData = false;
      return this;
    }
    email(): this {
      this.regexData = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return this;
    }
  }
  
export default  Schema;