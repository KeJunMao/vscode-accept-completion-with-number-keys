import * as vscode from 'vscode'

export function activate(context: vscode.ExtensionContext) {
  const numExt = new NumExt()

  function registerCommandNice(
    commandId: string,
    run: (...args: any[]) => void,
  ): void {
    context.subscriptions.push(vscode.commands.registerCommand(commandId, run))
  }
  function registerNumberKeyBinding(): void {
    for (let num = 0; num < 10; num++) {
      const key = String(num)
      registerCommandNice(`num.${key}`, () => {
        if (!vscode.window.activeTextEditor)
          return
        numExt.type(key)
      })
    }
  }

  registerNumberKeyBinding()
}

export function deactivate() {}

class NumExt {
  async type(key: string) {
    const number = key === '0' ? 9 : parseInt(key) - 1
    const editor = vscode.window.activeTextEditor
    if (!editor)
      return
    const completions = await vscode.commands.executeCommand<vscode.CompletionList>(
      'vscode.executeCompletionItemProvider',
      editor.document.uri,
      editor.selection.active,
      undefined,
      10,
    )
    const item = completions.items[number]
    if (!item)
      return
    const range = item.range instanceof vscode.Range ? item.range : item.range?.replacing
    const text = typeof item.insertText === 'string' ? item.insertText : item.insertText?.value
    const selection = editor.selection

    if (range && text)
      await editor.edit(eb => eb.replace(selection.isEmpty ? range : selection, text))
  }
}
