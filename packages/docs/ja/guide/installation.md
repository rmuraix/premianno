# インストール

このガイドでは、Adobe Premiere ProにPremiAnnoをインストールする詳細な手順を説明します。

## システム要件

- **Adobe Premiere Pro**: 2024以降（推奨）
- **オペレーティングシステム**: Windows 10/11またはmacOS 12以降
- **ZXP/UXP Installer**: プラグインのインストールに必要

## インストール手順

### 方法1: ZXP/UXP Installerを使用（推奨）

1. **PremiAnnoをダウンロード**
   - [リリースページ](https://github.com/rmuraix/premianno/releases)にアクセス
   - 最新の`.ccx`ファイルをダウンロード

2. **ZXP/UXP Installerをインストール**
   - [aescripts.com](https://aescripts.com/learn/zxp-installer/)からダウンロード
   - システムにアプリケーションをインストール

3. **PremiAnnoプラグインをインストール**
   - ZXP/UXP Installerを開く
   - PremiAnnoの`.ccx`ファイルをインストーラーウィンドウにドラッグ＆ドロップ
   - インストールが完了するまで待つ

4. **Premiere Proを再起動**
   - 実行中の場合は、Adobe Premiere Proを閉じる
   - Premiere Proを起動

5. **PremiAnnoにアクセス**
   - Premiere Proで、**ウィンドウ > 拡張機能 > PremiAnno**に移動
   - PremiAnnoパネルが表示されます

### 方法2: 手動インストール（上級者向け）

ソースからインストールしたい開発者や上級ユーザー向け：

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
   pnpm lib build
   ```

4. **Adobe UXP Developer Toolで読み込み**
   - Adobe CCからAdobe UXP Developer Toolをダウンロードしてインストール
   - UXP Developer Toolを開く
   - 「Add Plugin」をクリックし、`packages/lib/dist/manifest.json`を選択
   - 「Load」をクリックしてプラグインを読み込む

開発環境のセットアップの詳細については、[開発ガイド](/ja/guide/development)を参照してください。

## 検証

インストール後、PremiAnnoが正常に動作していることを確認します：

1. Adobe Premiere Proを開く
2. プロジェクトを作成または開く
3. **ウィンドウ > 拡張機能 > PremiAnno**に移動
4. PremiAnnoパネルが表示され、動作することを確認

## トラブルシューティング

### プラグインが表示されない

- インストール後にPremiere Proを再起動したことを確認
- 互換性のあるバージョンのPremiere Proを使用していることを確認
- プラグインを再インストールしてみる

### インストールが失敗する

- ZXP/UXP Installerが最新であることを確認
- OSに合った正しいCCXファイルを使用していることを確認
- システムに管理者権限があることを確認

### プラグインがクラッシュする

- Adobe UXPログでエラーメッセージを確認
- [GitHub Issues](https://github.com/rmuraix/premianno/issues)で問題を報告

## 次のステップ

- [使い方ガイド](/ja/guide/usage) - PremiAnnoの使い方を学ぶ
- [クイックスタート](/ja/guide/getting-started) - クイックスタートガイド
