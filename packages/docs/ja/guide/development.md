# 開発

このガイドでは、PremiAnnoの開発環境をセットアップし、プロジェクトに貢献する方法について説明します。

## 前提条件

始める前に、以下を確認してください：

- **Node.js**: v20以降
- **pnpm**: v10.18.3以降（ルートpackage.jsonの`packageManager`を参照）
- **Adobe Premiere Pro**: テスト用
- **Adobe UXP Developer Tool**: デバッグ用
- **Git**: バージョン管理用

## セットアップ

### 1. リポジトリをクローン

```bash
git clone https://github.com/rmuraix/premianno.git
cd premianno
```

### 2. 依存関係をインストール

```bash
pnpm install
```

これにより、libパッケージとdocsパッケージの両方を含む、モノレポのすべての依存関係がインストールされます。

## 開発コマンド

### プラグインをビルド

```bash
# プラグインをビルド
pnpm lib build

# ウォッチモードでビルド（ホットリロード）
pnpm lib dev

# CCXファイルとしてパッケージ化
pnpm lib ccx

# 配布用zipを作成
pnpm lib zip
```

### ドキュメントを実行

```bash
# ドキュメント開発サーバーを起動
pnpm docs dev

# ドキュメントをビルド
pnpm docs build

# ビルドされたドキュメントをプレビュー
pnpm docs preview
```

### コード品質

```bash
# リンターを実行
pnpm biome check .

# リンティングの問題を修正
pnpm biome check . --fix
```

## UXP開発セットアップ

### Adobe UXP Developer Toolのインストール

1. Adobe Creative Cloudアプリを開く
2. Stock & Marketplaceセクションに移動
3. "UXP Developer Tool"を検索
4. バージョン2.0以降をインストール

### プラグインを読み込む

1. `pnpm lib build`でプラグインをビルド
2. Adobe UXP Developer Toolを開く
3. **Add Plugin**をクリック
4. `packages/lib/dist/manifest.json`を選択
5. **Load**をクリックしてプラグインを読み込む

### デバッグ

1. UXP Developer Toolで**Debug**ボタンをクリック
2. Chrome DevToolsが開きます
3. Console、Elements、Sourcesタブを使用してデバッグ

**注意**: UDTの"Load and Watch"機能の代わりに、`pnpm lib dev`を組み込みのWebSocketリロードシステムで使用すると、より信頼性の高いホットリロードが可能です。

## プロジェクト構造

```
premianno/
├── packages/
│   ├── lib/              # メインUXPプラグイン
│   │   ├── src/
│   │   │   ├── api/      # APIレイヤー
│   │   │   ├── lib/      # コアライブラリ
│   │   │   ├── types/    # TypeScript型
│   │   │   └── ...
│   │   ├── dist/         # ビルド出力
│   │   └── package.json
│   └── docs/             # VitePressドキュメント
│       ├── .vitepress/
│       ├── guide/
│       ├── api/
│       └── package.json
├── .github/
│   └── workflows/        # CI/CDワークフロー
├── biome.json           # Biome設定
├── pnpm-workspace.yaml  # pnpmワークスペース設定
└── package.json         # ルートpackage.json
```

## アーキテクチャ

### プラグインアーキテクチャ

PremiAnnoは以下を使用して構築されています：

- **React 19**: UIフレームワーク
- **TypeScript**: 型安全な開発
- **Vite**: ビルドツールと開発サーバー
- **Tailwind CSS**: スタイリング
- **Adobe UXP**: Premiere Pro統合

### 主要コンポーネント

- **APIレイヤー**: Premiere Pro APIとのインターフェース
- **UIコンポーネント**: Reactベースのユーザーインターフェース
- **状態管理**: Reactフックによるローカル状態
- **データエクスポート**: JSON/CSVエクスポート機能

## 貢献

### ワークフロー

1. リポジトリを**フォーク**
2. 機能ブランチを**作成**
3. 変更を**実施**
4. 徹底的に**テスト**
5. プルリクエストを**提出**

### コードスタイル

- 既存のコードスタイルに従う
- 型安全性のためにTypeScriptを使用
- 意味のあるコミットメッセージを書く
- 複雑なロジックにコメントを追加

### テスト

- Adobe Premiere Proで変更をテスト
- ホットリロード機能を確認
- エクスポート機能をテスト
- コンソールエラーを確認

### プルリクエストガイドライン

- 変更を明確に説明
- 関連するissueを参照
- UI変更のスクリーンショットを含める
- CIチェックが通過することを確認

## 配布用ビルド

### CCXパッケージの作成

```bash
# ビルドとパッケージ化
pnpm lib ccx
```

これにより、`packages/lib/dist/`にユーザーに配布できるCCXファイルが作成されます。

### 配布用zipの作成

```bash
# リリース用にCCXファイルをバンドル
pnpm lib zip
```

これにより、GitHubリリース用の`packages/lib/public-zip/`にzipファイルが作成されます。

## トラブルシューティング

### ビルドの失敗

- node_modulesをクリアして再インストール: `rm -rf node_modules && pnpm install`
- Node.jsバージョンを確認: `node --version`
- pnpmバージョンを確認: `pnpm --version`

### ホットリロードが機能しない

- UDTを再起動してプラグインをリロード
- コンソールでWebSocket接続を確認
- UDTのウォッチモードの代わりに`pnpm lib dev`を使用

### 型エラー

- TypeScript型を再ビルド: `pnpm lib build`
- tsconfig.json設定を確認
- Adobe UXP型がインストールされていることを確認

## リソース

- [Adobe UXPドキュメント](https://developer.adobe.com/photoshop/uxp/)
- [VitePressドキュメント](https://vitepress.dev/)
- [Reactドキュメント](https://react.dev/)
- [Bolt UXP](https://github.com/hyperbrew/bolt-uxp)

## ヘルプ

- [GitHub Issues](https://github.com/rmuraix/premianno/issues)
- [貢献ガイド](https://github.com/rmuraix/.github/blob/main/.github/CONTRIBUTING.md)
