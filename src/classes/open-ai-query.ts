/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import { Configuration, ConfigurationParameters, CreateCompletionRequest, OpenAIApi } from 'openai';
import { createDiscreteProgressStatus, generateCompletionPrompt, getActiveLanguageId, getCodeModel, getMaxTokens, getSelectedText, getTemperature, getTextModel } from '../utils';

export class OpenAIQuery extends OpenAIApi {
  constructor(config: ConfigurationParameters) {
    super(new Configuration(config));
  }

  public async refactorSelectedCode() {
    // Get the selected text in the provided text editor
    const languageId = getActiveLanguageId();

    // generate completion prompt
    const completionPrompt = generateCompletionPrompt({
        instruction: 'Refactor the code below',
        userInput: getSelectedText(),
        inputHeader: `Original ${languageId} code`,
        outputHeader: `Refactored ${languageId} code`,
        delimeter: '###'
    });

    // Use the OpenAI API to request a refactored version of the selected code
    return this.sendRequest(completionPrompt);
  }

  public async addCommentsToSelectedCode() {
    // Get the selected text in the provided text editor
    const languageId = getActiveLanguageId();

    // generate completion prompt
    const completionPrompt = generateCompletionPrompt({
        instruction: 'Add comments to the below code', 
        userInput: getSelectedText(),
        inputHeader: `Uncommented ${languageId} code`,
        outputHeader: `Commented ${languageId} code`,
        delimeter: '###'
    });
  
    // Use the OpenAI API to request comments for the selected code
    return this.sendRequest(completionPrompt);
  }

  public async generateUnitTestForSelectedCode() {
    // Get the selected text in the provided text editor
    const languageId = getActiveLanguageId();

    // generate completion prompt
    const completionPrompt = generateCompletionPrompt({
      instruction: 'Write a unit test for the below code',
      userInput: getSelectedText(),
      inputHeader: `${languageId} code block`,
      outputHeader: `Unit test for ${languageId} code block`,
      delimeter: '###'
    });

    // Use the OpenAI API to request unit tests for the selected code
    return this.sendRequest(completionPrompt);
  } 

  async sendRequest(prompt: string, codeCompletion = true) {
    // Create a completion request for the OpenAI API
    const request: CreateCompletionRequest = {
      model: codeCompletion ? getCodeModel() : getTextModel(),
      prompt: prompt,
      temperature: getTemperature(),
      max_tokens: getMaxTokens(),
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      stop: ['###'],
      best_of: 1,
    };

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
