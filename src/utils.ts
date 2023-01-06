import * as vscode from 'vscode';
import { ICompletionPromptParameters } from './interfaces/completion-prompt-parameters';

export async function displayTextInNewTab(text: string) {
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

export async function displayDifferencesBetweenTexts(text1: string, text2: string) {
  const diff = vscode.TextEdit.replace(new vscode.Range(0, 0, 0, text1.length), text2);

  // show diff in new tab
  const newUri = vscode.Uri.parse('untitled:/text.txt');
  const newDocument =  await vscode.workspace.openTextDocument(newUri);
  const edit = new vscode.WorkspaceEdit();
  edit.set(newUri, [diff]);
  await vscode.workspace.applyEdit(edit);
  vscode.window.showTextDocument(newDocument, vscode.ViewColumn.Beside, true);
}

export function getSelectedText(): string {
  const textEditor = vscode.window.activeTextEditor;
  return textEditor ? textEditor.document.getText(textEditor.selection) : '';
}

export function getActiveLanguageId(): string {
  const textEditor = vscode.window.activeTextEditor;
  return textEditor ? textEditor.document.languageId : '';
}

export function generateCompletionPrompt(parameters: ICompletionPromptParameters): string {
  return `##### ${parameters.instruction}\n\n${parameters.delimeter} ${parameters.inputHeader}\n${parameters.userInput}\n\n${parameters.delimeter} ${parameters.outputHeader}`;
}