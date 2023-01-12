/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import { Configuration, ConfigurationParameters, CreateCompletionRequest, OpenAIApi } from 'openai';
import { createDiscreteProgressStatus, generateCompletionPrompt, getCodeModel, getMaxTokens, getSelectedText, getTemperature, getTextModel } from '../utils';
import { OpenAICommands } from '../enums/open-ai-commands.enum';

export class OpenAIQuery extends OpenAIApi {

  get languageId() {
    return vscode.window.activeTextEditor?.document.languageId || '';
  }

  constructor(config: ConfigurationParameters) {
    super(new Configuration(config));
  }
  
  public async executeCommand(command: OpenAICommands, codeCompletion = true) {
    const request = this.createRequest(command, codeCompletion);
    return this.sendRequest(request);
  }

  public createRequest(command: OpenAICommands, codeCompletion = true, prompt?: string) {
    // Create a completion request for the OpenAI API
    const request: CreateCompletionRequest = {
      model: codeCompletion ? getCodeModel() : getTextModel(),
      prompt: prompt || this.generatePrompt(command),
      temperature: getTemperature(),
      max_tokens: getMaxTokens(),
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      stop: ['###'],
      best_of: 1,
    };
    return request;
  }
  
  private generatePrompt(command: OpenAICommands) {
    const instructionMap: { [key: string]: string } = {
      [OpenAICommands.AddComments]: 'Add comments to the below code',
      [OpenAICommands.GenerateUnitTest]: 'Write a unit test for the below code',
      [OpenAICommands.RefactorCode]: 'Refactor the code below',
    };
    const inputHeaderMap: { [key: string]: string } = {
      [OpenAICommands.AddComments]: `${this.languageId} code without comments`,
      [OpenAICommands.GenerateUnitTest]: `${this.languageId} code block`,
      [OpenAICommands.RefactorCode]: `Original ${this.languageId} code`,
    };
    const outputHeaderMap: { [key: string]: string } = {
      [OpenAICommands.AddComments]: `${this.languageId} code with comments`,
      [OpenAICommands.GenerateUnitTest]: `Unit test for ${this.languageId} code block`,
      [OpenAICommands.RefactorCode]: `Refactored ${this.languageId} code`,
    };
  
    const instruction = instructionMap[command] || '';
    const inputHeader = inputHeaderMap[command] || '';
    const outputHeader = outputHeaderMap[command] || '';
  
    return generateCompletionPrompt({
      instruction,
      userInput: getSelectedText(),
      inputHeader,
      outputHeader,
      delimeter: '###'
    });
  }

  async sendRequest(request: CreateCompletionRequest) {
    const progressStatus = createDiscreteProgressStatus();
  
    // Use the OpenAI API to request comments for the code
    const response = await this.createCompletion(request)
      .catch((error) => {
        vscode.window.showErrorMessage(error.message);
      })
      .finally(() => progressStatus.dispose());
  
    // Extract the comments from the response
    return response?.data.choices[0].text?.trim() || '';
  }
}
