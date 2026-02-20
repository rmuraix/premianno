# 開発

このガイドでは、PremiAnnoの開発環境をセットアップし、プロジェクトに貢献する方法について説明します。

## 前提条件

始める前に、以下を確認してください：

- **Node.js**: v20以降
- **pnpm**: v10.18.3以降（ルートpackage.jsonの`packageManager`を参照）
- **Adobe Premiere Pro**: テスト用
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

### エクステンションをビルド

```bash
# エクステンションをビルド
pnpm lib build

# ウォッチモードでビルド（ホットリロード）
pnpm lib dev

# ZXPとしてビルド・パッケージ化
pnpm lib zxp
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

## CEP開発セットアップ

### 開発用エクステンションの読み込み

CEPエクステンションは、Adobeのエクステンションフォルダへのシンボリックリンクで開発環境に読み込めます。

1. `pnpm lib build`でエクステンションをビルド
2. エクステンションが自動的にCEPエクステンションフォルダにシンボリックリンクされます
3. Adobe Premiere Proを再起動
4. **ウィンドウ > エクステンション > PremiAnno**に移動

### デバッグ

CEPエクステンションはChromium DevToolsを使用してデバッグします：

1. エクステンションディレクトリに`.debug`ファイルを作成してデバッグモードを有効化
2. `cep.config.ts`でデバッグポートを設定（デフォルト: 8860）
3. Chromeを開き`http://localhost:8860`に移動
4. Console、Elements、Sourcesタブを使用してデバッグ

**注意**: 開発中により信頼性の高いホットリロードを実現するため、`pnpm lib dev`を組み込みのWebSocketリロードシステムで使用してください。

## プロジェクト構造

```
premianno/
├── packages/
│   ├── lib/              # メインCEPエクステンション
│   │   ├── src/
│   │   │   ├── js/       # Reactパネルアプリ + CEPブリッジ
│   │   │   ├── jsx/      # ExtendScriptホスト関数
│   │   │   └── shared/   # 共有型定義
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

### エクステンションアーキテクチャ

PremiAnnoは以下を使用して構築されています：

- **React 19**: UIフレームワーク
- **TypeScript**: 型安全な開発
- **Vite**: ビルドツールと開発サーバー
- **vite-cep-plugin**: CEP/ホスト連携とパッケージング
- **Adobe Premiere Pro CEP/ExtendScript**: ホスト連携

### 主要コンポーネント

- **ReactパネルUI**: スキャン/読み込み/ラベル/エクスポートの操作フロー
- **ホストブリッジ**: パネルからExtendScript関数を呼び出し
- **アノテーション保存層**: プロジェクト/シーケンス単位のローカルJSON保存
- **エクスポート層**: 下流処理向けTOMLシリアライズ

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

### ZXPパッケージの作成

```bash
# ビルドとパッケージ化
pnpm lib zxp
```

これにより、`packages/lib/dist/zxp/`に配布用アーティファクトが生成されます。

## リソース

- [Bolt CEP](https://github.com/hyperbrew/bolt-cep)

## ヘルプ

- [GitHub Issues](https://github.com/rmuraix/premianno/issues)
- [貢献ガイド](https://github.com/rmuraix/.github/blob/main/.github/CONTRIBUTING.md)
