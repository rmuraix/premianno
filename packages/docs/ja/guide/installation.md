# インストール

このガイドでは、Adobe Premiere ProにPremiAnnoをインストールする詳細な手順を説明します。

## システム要件

- **Adobe Premiere Pro**: 25.6以降（UXPが公式サポートされた最初のバージョン）
- **オペレーティングシステム**: Windows 10/11またはmacOS 12以降

## インストール手順

### 方法1: CCXインストーラーを使用（推奨）

1. **PremiAnnoをダウンロード**
   - [リリースページ](https://github.com/rmuraix/premianno/releases)にアクセス
   - 最新の`.ccx`ファイルをダウンロード

2. **PremiAnnoをインストール**
   - ダウンロードした`.ccx`ファイルをダブルクリックし、Creative Cloudのプラグインインストーラーを起動
   - もしくは[ZXP/UXP Installer](https://aescripts.com/learn/zxp-installer/)を開き、`.ccx`ファイルをドラッグ＆ドロップ
   - インストールが完了するまで待つ

3. **Premiere Proを再起動**
   - 実行中の場合は、Adobe Premiere Proを閉じる
   - Premiere Proを起動

4. **PremiAnnoにアクセス**
   - Premiere Proで、**ウィンドウ > UXPプラグイン > PremiAnno**に移動
   - PremiAnnoパネルが表示されます

### 方法2: ソースから読み込む（上級者向け）

ソースから実行したい開発者や上級ユーザー向け：

1. **リポジトリをクローン**
   ```bash
   git clone https://github.com/rmuraix/premianno.git
   cd premianno
   ```

2. **依存関係をインストール**
   ```bash
   pnpm install
   ```

3. **プラグインをビルド**
   ```bash
   pnpm uxp build
   ```

4. **プラグインを読み込む**
   - Premiere Proの環境設定「プラグイン」で**開発者モード**を有効にする
   - [UXP Developer Tool（UDT）](https://developer.adobe.com/premiere-pro/uxp/introduction/essentials/dev-tools/)を開く
   - `packages/uxp/dist/manifest.json`を指定してプラグインを追加
   - **Load**をクリックし、**ウィンドウ > UXPプラグイン > PremiAnno**からパネルを開く

開発環境のセットアップの詳細については、[開発ガイド](/ja/guide/development)を参照してください。

## 検証

インストール後、PremiAnnoが正常に動作していることを確認します：

1. Adobe Premiere Proを開く
2. プロジェクトを作成または開く
3. **ウィンドウ > UXPプラグイン > PremiAnno**に移動
4. PremiAnnoパネルが表示され、動作することを確認

## トラブルシューティング

### プラグインが表示されない

- インストール後にPremiere Proを再起動したことを確認
- Premiere Pro 25.6以降を使用していることを確認
- プラグインを再インストールしてみる

### インストールが失敗する

- 正しいCCXリリースアセットをダウンロードしていることを確認
- インストール前にPremiere Proを一度は起動していることを確認
- システムに管理者権限があることを確認

### プラグインがクラッシュする

- [GitHub Issues](https://github.com/rmuraix/premianno/issues)で問題を報告

## 次のステップ

- [使い方ガイド](/ja/guide/usage) - PremiAnnoの使い方を学ぶ
- [クイックスタート](/ja/guide/getting-started) - クイックスタートガイド
