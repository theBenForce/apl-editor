import * as vscode from "vscode";

function isAplFile(document?: vscode.TextDocument): boolean {
  return document?.languageId === "json";
}

interface AplPreviewWebviewProps {
  context: vscode.ExtensionContext;
}

export class AplPreviewWebview {
  private static _instance: AplPreviewWebview;
  private _editor?: vscode.TextEditor;
  private panel: vscode.WebviewPanel;
  private _subscriptions: Array<vscode.Disposable> = [];
  private _document?: vscode.TextDocument;

  private set editor(editor: vscode.TextEditor | undefined) {
    this._editor = editor;
  }

  private set document(document: vscode.TextDocument) {
    console.info(`Text document changed!`);
    this._document = document;
    this.update();
  }

  static get instance(): AplPreviewWebview {
    return this._instance;
  }

  private update() {
    this.panel.webview.html = `<html><body><h1>${this._document?.getText()}</h1></body></html>`;
  }

  private constructor(private props: AplPreviewWebviewProps) {
    // Create and show a new webview
    this.panel = vscode.window.createWebviewPanel(
      "aplPreview", // Identifies the type of the webview. Used internally
      "APL Preview", // Title of the panel displayed to the user
      vscode.ViewColumn.Beside, // Editor column to show the new webview panel in.
      {} // Webview options. More on these later.
    );

    this.update();

    const onTextChanged = vscode.workspace.onDidChangeTextDocument(
      (event) => (this.document = event.document)
    );

    const onEditorChanged = vscode.window.onDidChangeActiveTextEditor(
      (selectedEditor) => (this.editor = selectedEditor)
    );

    props.context.subscriptions.push(onTextChanged, onEditorChanged);
    this._subscriptions.push(onTextChanged, onEditorChanged);
  }

  static register(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand(
      "apl-editor.preview",
      async () => {
        if (!this._instance) {
          AplPreviewWebview._instance = new AplPreviewWebview({
            context,
          });
        }
      }
    );

    context.subscriptions.push(disposable);
  }
}
