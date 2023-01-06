import * as vscode from 'vscode';
import { OpenAIQuery } from './classes/open-ai-query';
import { ICommandConfig } from './interfaces/command-config';
import { displayTextInNewTab, getApiKey } from './utils';

const OpenAICommands: ICommandConfig[] = [
  {
    command: 'openaicodegen.refactorCode',
    callback: refactorCode
  },
  {
    command: 'openaicodegen.addComments',
    callback: addComments
  },
  {
    command: 'openaicodegen.generateUnitTest',
    callback: generateUnitTest
  }
];

async function refactorCode(openAIQuery: OpenAIQuery) {
  const result = await openAIQuery.refactorSelectedCode();
  displayTextInNewTab(result);
}

async function addComments(openAIQuery: OpenAIQuery) {
  const result = await openAIQuery.addCommentsToSelectedCode();
  displayTextInNewTab(result);
}

async function generateUnitTest(openAIQuery: OpenAIQuery) {
  const result = await openAIQuery.generateUnitTestForSelectedCode();
  displayTextInNewTab(result);
}

export async function activate(context: vscode.ExtensionContext) {
  const apiKey = await getApiKey();

  const openAIQuery = new OpenAIQuery({ apiKey });
  const disposables = OpenAICommands.map(command => {
    return vscode.commands.registerCommand(command.command, command.callback.bind(null, openAIQuery));
  });

  context.subscriptions.push(...disposables);
}
