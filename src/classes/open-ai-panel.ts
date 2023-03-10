import * as vscode from 'vscode';
import { getNonce } from '../utils';

export class OpenAIPanel {
  /**
	 * Track the currently panel. Only allow a single panel to exist at a time.
	 */
	public static currentPanel: OpenAIPanel | undefined;

	public static readonly viewType = 'openAIPanel';

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];

	public static createOrShow(extensionUri: vscode.Uri) {
		const column = vscode.ViewColumn.Beside;

		// If we already have a panel, show it.
		if (OpenAIPanel.currentPanel) {
			OpenAIPanel.currentPanel._panel.reveal(column);
			return;
		}

		// Otherwise, create a new panel.
		const panel = vscode.window.createWebviewPanel(
			OpenAIPanel.viewType,
			'Open AI Code Gen',
			column,
			{ enableScripts: true }
		);

		OpenAIPanel.currentPanel = new OpenAIPanel(panel, extensionUri);
	}

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		this._panel = panel;
		this._extensionUri = extensionUri;

		// Set the webview's initial html content
		this.update();

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programmatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Handle messages from the webview
		this._panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'alert':
						vscode.window.showErrorMessage(message.text);
						return;
				}
			},
			null,
			this._disposables
		);
	}

  public dispose() {
		OpenAIPanel.currentPanel = undefined;

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

  public update(message = 'Loading...') {
    const webview = this._panel.webview;
    this._updateForWebview(webview, message);
  }

  private _updateForWebview(webview: vscode.Webview, message: string) {
    this._panel.webview.html = this._getHtmlForWebview(webview, message);
  }

  private _getHtmlForWebview(webview: vscode.Webview, message: string) {
		const highlightJsPath = 'highlight';

    // Local path to main script run in the webview
		const scriptHighlightJsUri = webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, highlightJsPath, 'highlight.min.js')
		);

    // // Local path to css styles
    const styleHighlightJsUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, highlightJsPath, 'styles', 'default.min.css')
    );

    // Use a nonce to only allow specific scripts to be run
    const nonce = getNonce();

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}'; style-src ${webview.cspSource} 'unsafe-inline';">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleHighlightJsUri}" rel="stylesheet" />

        <title>Open AI</title>
      </head>
      <body>
				<pre><code>${message}</code></pre>

				<script nonce="${nonce}" src="${scriptHighlightJsUri}"></script>
      </body>
      </html>`;
  }
}