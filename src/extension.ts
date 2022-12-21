import { OpenAIQuery } from './classes/open-ai-query';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	let apiKey: string | undefined = vscode.workspace.getConfiguration('openaicodegen').get('apiKey');
	if (!apiKey) {
		vscode.window.showInputBox({
			placeHolder: 'Enter your OpenAI API key',
			prompt: 'Enter your OpenAI API key'
		}).then((value) => {
			apiKey = value ? value : '';
			vscode.workspace.getConfiguration('openaicodegen').update('apiKey', apiKey, true);
		});
	}

  context.subscriptions.push(vscode.commands.registerCommand('openaicodegen.refactorCode', async () => {
    // Get the active text editor
    const textEditor = vscode.window.activeTextEditor;
    if (!textEditor) {
      return;
    }

    // Use the OpenAIQuery class to request a refactored version of the selected code
    const openAIQuery = new OpenAIQuery({
			apiKey: apiKey
		});
    openAIQuery.refactorSelectedCode(textEditor);
  }));

	context.subscriptions.push(vscode.commands.registerCommand('openaicodegen.showBugs', async () => {
		// Get the active text editor
		const textEditor = vscode.window.activeTextEditor;
		if (!textEditor) {
			return;
		}

		// Use the OpenAIQuery class to request a list of bugs in the selected code
		const openAIQuery = new OpenAIQuery({
			apiKey: apiKey
		});
		openAIQuery.showBugs(textEditor);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('openaicodegen.addComments', async () => {
		// Get the active text editor
		const textEditor = vscode.window.activeTextEditor;
		if (!textEditor) {
			return;
		}

		// Use the OpenAIQuery class to request comments for the selected code
		const openAIQuery = new OpenAIQuery({
			apiKey: apiKey
		});
		openAIQuery.addCommentsToSelectedCode(textEditor);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('openaicodegen.generateUnitTest', async () => {
		// Get the active text editor
		const textEditor = vscode.window.activeTextEditor;
		if (!textEditor) {
			return;
		}

		// Use the OpenAIQuery class to request comments for the selected code
		const openAIQuery = new OpenAIQuery({
			apiKey: apiKey
		});
		openAIQuery.generateUnitTestForSelectedCode(textEditor);
	}));
}
