import { ICompletionPromptParameters } from "../interfaces/completion-prompt-parameters";

export class CompletionPrompt implements ICompletionPromptParameters {
  
  instruction: string;
  userInput: string;
  inputHeader: string;
  outputHeader: string;
  delimeter: string;

  constructor(parameters: ICompletionPromptParameters) {
    this.instruction = parameters.instruction;
    this.userInput = parameters.userInput;
    this.inputHeader = parameters.inputHeader;
    this.outputHeader = parameters.outputHeader;
    this.delimeter = parameters.delimeter;
  }

  get prompt(): string {
    return `##### ${this.instruction}\n\n${this.delimeter} ${this.inputHeader}\n${this.userInput}\n\n${this.delimeter} ${this.outputHeader}`;
  }
}