import { OpenAIQuery } from './classes/open-ai-query';
import * as vscode from 'vscode';
import { ICommandConfig } from './interfaces/command-config';
import { displayTextInNewTab } from './utils';

const OpenAICommands: ICommandConfig[] = [
	{
		command: 'openaicodegen.refactorCode',
		callback: refactorCodeCallback
	},
	{
		command: 'openaicodegen.showBugs',
		callback: showBugsCallback
	},
	{
		command: 'openaicodegen.addComments',
		callback: addCommentsCallback
	},
	{
		command: 'openaicodegen.generateUnitTest',
		callback: generateUnitTestCallback
	}
];


async function refactorCodeCallback(openAIQuery: OpenAIQuery) {
	const result = await openAIQuery.refactorSelectedCode();
	displayTextInNewTab(result);
}

async function showBugsCallback(openAIQuery: OpenAIQuery) {
	const result = await openAIQuery.showBugsForSelectedCode();
	displayTextInNewTab(result);
}

async function addCommentsCallback(openAIQuery: OpenAIQuery) {
	const result = await openAIQuery.addCommentsToSelectedCode();
	displayTextInNewTab(result);
}

async function generateUnitTestCallback(openAIQuery: OpenAIQuery) {	
	const result = await openAIQuery.generateUnitTestForSelectedCode();
	displayTextInNewTab(result);
}

export function activate(context: vscode.ExtensionContext) {
	// Declare a variable to store the API key
  let apiKey: string | undefined;

  // Check if the API key is already set in the configuration
  const configApiKey = vscode.workspace.getConfiguration('openaicodegen').get('apiKey') as string | undefined;
  if (configApiKey) {
    apiKey = configApiKey;
  } else {
    // If the API key is not set, ask the user to input it
    vscode.window.showInputBox({
      placeHolder: 'Enter your OpenAI API key',
      prompt: 'Enter your OpenAI API key'
    }).then((value) => {
      apiKey = value ? value : '';
      vscode.workspace.getConfiguration('openaicodegen').update('apiKey', apiKey, true);
    });
  }

	OpenAICommands.forEach((command) => {
		const disposable = vscode.commands.registerCommand(command.command, () => {
			const openAIQuery = new OpenAIQuery({ apiKey });
			command.callback(openAIQuery);
		});
		context.subscriptions.push(disposable);
	});
}
