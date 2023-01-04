/* eslint-disable @typescript-eslint/naming-convention */
import { Configuration, CreateCompletionRequest, OpenAIApi } from "openai";
import * as vscode from "vscode";
import { OpenAIQueryConfig } from "../interfaces/open-ai-query-config";
import { CompletionPrompt } from "./completion-prompt";

export class OpenAIQuery extends OpenAIApi {
  constructor(config: OpenAIQueryConfig) {
    super(new Configuration(config));
  }

  public async refactorSelectedCode(textEditor: vscode.TextEditor) {
    // Get the selected text in the provided text editor
    const selectedText = this.getSelectedText(textEditor);
    const languageId = textEditor.document.languageId;

    const completionPrompt = new CompletionPrompt({
      instruction: "Refactor the code below",
      userInput: selectedText,
      inputHeader: `Original ${languageId} code`,
      outputHeader: `Refactored ${languageId} code`,
      delimeter: "###"
    });

    // Use the OpenAI API to request a refactored version of the selected code
    const refactoredText = await this.createRequest(completionPrompt.prompt);

    // Replace the selected text with the refactored version
    this.displayTextInNewTab(refactoredText);
  }

  public async showBugs(textEditor: vscode.TextEditor) {
    // Get the selected text in the provided text editor
    const selectedText = this.getSelectedText(textEditor);
    const languageId = textEditor.document.languageId;

    const completionPrompt = new CompletionPrompt({
      instruction: "Fix bugs in the below code",
      userInput: selectedText,
      inputHeader: `Original ${languageId} code`,
      outputHeader: `Fixed ${languageId} code`,
      delimeter: "###"
    });

    // Use the OpenAI API to request a list of bugs in the selected code
    const bugs = await this.createRequest(completionPrompt.prompt);

    // Display the bugs to the user
    this.displayTextInNewTab(bugs);
  }

  public async addCommentsToSelectedCode(textEditor: vscode.TextEditor) {
    // Get the selected text in the provided text editor
    const selectedText = this.getSelectedText(textEditor);
    const languageId = textEditor.document.languageId;

    const completionPrompt = new CompletionPrompt({
      instruction: "Add comments to the below code",
      userInput: selectedText,
      inputHeader: `${languageId} code`,
      outputHeader: `Commentated ${languageId} code`,
      delimeter: "###"
    });
  
    // Use the OpenAI API to request comments for the selected code
    const comments = await this.createRequest(completionPrompt.prompt);
  
    this.displayTextInNewTab(comments);
  }

  public async generateUnitTestForSelectedCode(textEditor: vscode.TextEditor) {
    // Get the selected text in the provided text editor
    const selectedText = this.getSelectedText(textEditor);
    const languageId = textEditor.document.languageId;

    const completionPrompt = new CompletionPrompt({
      instruction: "Write a unit test for the below code",
      userInput: selectedText,
      inputHeader: `${languageId} code block`,
      outputHeader: `Unit test for ${languageId} code block`,
      delimeter: "###"
    });

    // Use the OpenAI API to request unit tests for the selected code
    const unitTests = await this.createRequest(completionPrompt.prompt);

    this.displayTextInNewTab(unitTests);
  } 

  private async createRequest(prompt: string, model: string = 'code-davinci-002') {

    // Create a completion request for the OpenAI API
    const request: CreateCompletionRequest = {
      model: model,
      prompt: prompt,
      temperature: 0,
      max_tokens: 182,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      stop: ["###"],
      best_of: 1,
    };
  
    // Use the OpenAI API to request comments for the code
    const response = await this.createCompletion(request);
  
    // Extract the comments from the response
    return response.data.choices[0].text?.trim() || '';
  }

  private async displayTextInNewTab(text: string) {
    // Create a new URI for the text document
    const newUri = vscode.Uri.parse('untitled:/text.txt');
  
    // Create a new text document
    const newDocument = await vscode.workspace.openTextDocument(newUri);
  
    // Update the content of the new text document
    const newText = new vscode.TextEdit(new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0)), text);
    const newEdits = [newText];
    const edit = new vscode.WorkspaceEdit();
    edit.set(newUri, newEdits);
    await vscode.workspace.applyEdit(edit);
  
    // Open the new text document in a new tab
    vscode.window.showTextDocument(newDocument, vscode.ViewColumn.Beside, true);
  }

  async displayDifferencesBetweenTexts(text1: string, text2: string) {
    const diff = vscode.TextEdit.replace(new vscode.Range(0, 0, 0, text1.length), text2);

    // show diff in new tab
    const newUri = vscode.Uri.parse('untitled:/text.txt');
    const newDocument =  await vscode.workspace.openTextDocument(newUri);
    const edit = new vscode.WorkspaceEdit();
    edit.set(newUri, [diff]);
    await vscode.workspace.applyEdit(edit);
    vscode.window.showTextDocument(newDocument, vscode.ViewColumn.Beside, true);
  }

  private getSelectedText(textEditor: vscode.TextEditor): string {
    return textEditor.document.getText(textEditor.selection);
  }
}
