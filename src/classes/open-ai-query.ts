/* eslint-disable @typescript-eslint/naming-convention */
import { Configuration, CreateCompletionRequest, OpenAIApi } from 'openai';
import { OpenAIQueryConfig } from '../interfaces/open-ai-query-config';
import { generateCompletionPrompt, getActiveLanguageId, getSelectedText } from '../utils';

export class OpenAIQuery extends OpenAIApi {
  constructor(config: OpenAIQueryConfig) {
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
        inputHeader: `${languageId} code`,
        outputHeader: `Commentated ${languageId} code`,
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

  private async sendRequest(prompt: string, model = 'code-davinci-002') {

    // Create a completion request for the OpenAI API
    const request: CreateCompletionRequest = {
      model: model,
      prompt: prompt,
      temperature: 0,
      max_tokens: 182,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      stop: ['###'],
      best_of: 1,
    };
  
    // Use the OpenAI API to request comments for the code
    const response = await this.createCompletion(request);
  
    // Extract the comments from the response
    return response.data.choices[0].text?.trim() || '';
  }
}
