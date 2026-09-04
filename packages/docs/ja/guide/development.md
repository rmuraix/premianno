# 開発

このガイドでは、PremiAnnoの開発環境をセットアップし、プロジェクトに貢献する方法について説明します。

## 前提条件

始める前に、以下を確認してください：

- **Node.js**: v20以降
- **pnpm**: ルートpackage.jsonの`packageManager`を参照
- **Adobe Premiere Pro**: 25.6以降（テスト用）
- **UXP Developer Tool（UDT）**: v2.2.1以降（プラグインの読み込みとデバッグ用）
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

これにより、uxpパッケージとdocsパッケージの両方を含む、モノレポのすべての依存関係がインストールされます。

## 開発コマンド

### プラグインをビルド

```bash
# プラグインをビルド
pnpm uxp build

# ウォッチモードでビルド
pnpm uxp dev

# CCXとしてビルド・パッケージ化（配布物）
pnpm uxp ccx

# CCXをZIPアーカイブで包む（リリース以外での受け渡し用）
pnpm uxp zip
```

### テストと型チェック

```bash
# ユニットテストを実行
pnpm uxp test

# カバレッジ付きでユニットテストを実行
pnpm uxp test:coverage

# 型チェックを実行
pnpm uxp typecheck
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

### 開発用プラグインの読み込み

1. Premiere Proの環境設定「プラグイン」で**開発者モード**を有効にする
2. `pnpm uxp dev`を実行し、`packages/uxp/dist`へのビルドとファイル監視を開始
3. UXP Developer Toolを開き、**Add Plugin**から`packages/uxp/dist/manifest.json`を選択
4. **Load**（再ビルドごとに読み込み直す場合は**Load & Watch**）をクリック
5. **ウィンドウ > UXPプラグイン > PremiAnno**からパネルを開く

### デバッグ

UXPプラグインはUXP Developer Tool経由でデバッグします：

1. UDTで読み込んだプラグインの**•••**メニューから**Debug**を選択
2. パネルに接続されたChrome DevToolsが開く
3. Console、Elements、Sourcesタブを使用してデバッグ

## プロジェクト構造

```
premianno/
├── packages/
│   ├── uxp/              # メインUXPプラグイン
│   │   ├── public/       # ビルドへコピーされる静的アセット（アイコン）
│   │   ├── src/
│   │   │   ├── api/      # UXPランタイム補助（テーマ、エラーハンドラ）
│   │   │   ├── lib/      # ホスト連携、保存層、アノテーションロジック
│   │   │   ├── shared/   # 共有型定義
│   │   │   ├── main.tsx  # ReactパネルUI
│   │   │   └── index.tsx # パネルのエントリーポイント
│   │   ├── tests/        # Vitestユニットテスト
│   │   ├── uxp.config.ts # UXPマニフェスト設定
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
- **Vite**: ビルドツール
- **vite-uxp-plugin**（[Bolt UXP](https://github.com/hyperbrew/bolt-uxp)）: UXPマニフェスト生成、ホットリロード、CCX/ZIPパッケージング
- **Adobe Premiere Pro UXP API**: `premierepro`モジュール経由のホスト連携

### 主要コンポーネント

- **ReactパネルUI**（`src/main.tsx`）: スキャン/読み込み/ラベル/エクスポートの操作フロー
- **ホストブリッジ**（`src/lib/host.ts`）: 非同期のPremiere Pro UXP APIでシーケンスとクリップ境界を取得
- **保存層**（`src/lib/storage.ts`）: UXPのプラグインデータフォルダーへの永続化とホストのファイルピッカー呼び出し
- **アノテーションロジック**（`src/lib/annotations.ts`、`src/lib/annotationStore.ts`）: TOMLシリアライズ、CSVパース、ラベルのマージ
- **テーマポリフィル**（`src/api/theme.ts`）: Premiere Proが提供しない`--uxp-host-*` CSS変数を補完

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

- `pnpm uxp test`を実行し、ユニットテストが通ることを確認
- Adobe Premiere Proで変更をテスト
- UDTでのリロード動作を確認
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
pnpm uxp ccx
```

これにより`packages/uxp/ccx/premianno.ccx`が生成されます。これがGitHubリリースに添付される配布物です。`pnpm uxp zip`は同じCCXをZIPで包むだけなので、リリースには含めません。

## リソース

- [Bolt UXP](https://github.com/hyperbrew/bolt-uxp)
- [Premiere Pro UXP API](https://developer.adobe.com/premiere-pro/uxp/)

## ヘルプ

- [GitHub Issues](https://github.com/rmuraix/premianno/issues)
- [貢献ガイド](https://github.com/rmuraix/.github/blob/main/.github/CONTRIBUTING.md)
