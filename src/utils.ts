import * as vscode from 'vscode';
import { ICompletionPromptParameters } from './interfaces/completion-prompt-parameters';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setConfValue(key: string, value: any): Thenable<void> {
  return vscode.workspace.getConfiguration('openaicodegen').update(key, value, true);
}

export function getConfValue<T>(key: string): T {
  return vscode.workspace.getConfiguration('openaicodegen').get(key) as T;
}

export async function getApiKey(): Promise<string> {
  // Check if the API key is already set in the configuration
  let configApiKey = getConfValue<string>('apiKey');
  if (!configApiKey) {
    // If the API key is not set, ask the user to input it
    await vscode.window.showInputBox({
      placeHolder: 'Enter your OpenAI API key',
      prompt: 'Enter your OpenAI API key'
    }).then((value) => {
      configApiKey = value ? value : '';
      setConfValue('apiKey', configApiKey);
    });
  }

  return configApiKey;
}

export function getCodeModel(): string {
  return getConfValue<string>('codeModel');
}

export function getTextModel(): string {
  return getConfValue<string>('textModel');
}

export function getMaxTokens(): number {
  return getConfValue<number>('maxTokens');
}

export function getTemperature(): number {
  return getConfValue<number>('temperature');
}

export function getSelectedText(): string {
  const textEditor = vscode.window.activeTextEditor;
  return textEditor ? textEditor.document.getText(textEditor.selection) : '';
}

export function generateCompletionPrompt(parameters: ICompletionPromptParameters): string {
  return `##### ${parameters.instruction}\n\n${parameters.delimeter} ${parameters.inputHeader}\n${parameters.userInput}\n\n${parameters.delimeter} ${parameters.outputHeader}`;
}

export function createDiscreteProgressStatus(message = 'Fetching OpenAI results...'): vscode.StatusBarItem {
  const progressStatus = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
  progressStatus.text = `$(sync~spin) ${message}`;
  progressStatus.show();

  return progressStatus;
}

export function getNonce(): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}
