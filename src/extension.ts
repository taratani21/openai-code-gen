/* eslint-disable no-case-declarations */
import * as vscode from 'vscode';
import { OpenAIPanel } from './classes/open-ai-panel';
import { OpenAIQuery } from './classes/open-ai-query';
import { OpenAICommands } from './enums/open-ai-commands.enum';
import { getApiKey } from './utils';

export async function activate(context: vscode.ExtensionContext) {
  const apiKey = await getApiKey();

  const openAIQuery = new OpenAIQuery({ apiKey });
  const disposables = Object.values(OpenAICommands).map((command) => {
    const handler = commandHandler.bind(null, openAIQuery, command, context.extensionUri);
    return vscode.commands.registerCommand(command, handler);
  });

  context.subscriptions.push(...disposables);
}

export function getUserPrompt() {
  return vscode.window.showInputBox({
    placeHolder: 'Enter your prompt',
    prompt: 'Enter your prompt for Open AI to complete',
  });
}

export async function commandHandler(query: OpenAIQuery, command: OpenAICommands, extensionUri: vscode.Uri) {
  OpenAIPanel.createOrShow(extensionUri);

  let response = '';
  switch (command) {
    case OpenAICommands.RefactorCode:
    case OpenAICommands.AddComments:
    case OpenAICommands.GenerateUnitTest:
      response = await query.executeCommand(command);
      break;

    case OpenAICommands.SendTextRequest:
      const prompt = await getUserPrompt() || '';
      const request = query.createRequest(command, false, prompt);
      response = await query.sendRequest(request);
      break;
  }

  OpenAIPanel.currentPanel?.update(response);
}
