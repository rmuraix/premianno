# APIリファレンス

PremiAnno APIは、アノテーションデータと機能へのプログラマティックなアクセスを提供します。

## 概要

PremiAnnoは、外部ツールやスクリプトで利用できる標準的なエクスポート形式を通じてデータを公開します。このセクションでは、データ構造とエクスポート形式について説明します。

## エクスポート形式

### JSON形式

JSONエクスポートは、すべてのアノテーションの構造化された表現を提供します：

```json
{
  "version": "1.0.0",
  "project": {
    "name": "My Project",
    "sequence": "Main Sequence",
    "duration": 120.5
  },
  "annotations": [
    {
      "id": "unique-id",
      "timestamp": 10.5,
      "duration": 5.0,
      "tags": ["action", "important"],
      "notes": "Key scene begins",
      "metadata": {
        "custom_field": "value"
      }
    }
  ]
}
```

### CSV形式

CSVエクスポートは、スプレッドシートアプリケーションに適したフラットな表現を提供します：

```csv
id,timestamp,duration,tags,notes
unique-id,10.5,5.0,"action,important","Key scene begins"
```

## データ構造

### Annotationオブジェクト

| フィールド | 型 | 説明 |
|-------|------|-------------|
| `id` | string | アノテーションの一意の識別子 |
| `timestamp` | number | 開始時刻（秒） |
| `duration` | number | 期間（秒）（ポイントアノテーションの場合は0） |
| `tags` | string[] | タグラベルの配列 |
| `notes` | string | 自由形式のノート |
| `metadata` | object | カスタムメタデータフィールド |

### Projectオブジェクト

| フィールド | 型 | 説明 |
|-------|------|-------------|
| `name` | string | プロジェクト名 |
| `sequence` | string | アクティブなシーケンス名 |
| `duration` | number | 合計時間（秒） |

## 統合例

### Python

```python
import json

# アノテーションを読み込む
with open('annotations.json', 'r') as f:
    data = json.load(f)

# アノテーションを処理
for annotation in data['annotations']:
    timestamp = annotation['timestamp']
    tags = annotation['tags']
    print(f"Annotation at {timestamp}s: {tags}")
```

### JavaScript/Node.js

```javascript
import fs from 'fs'

// アノテーションを読み込む
const data = JSON.parse(fs.readFileSync('annotations.json', 'utf8'))

// タグでフィルタリング
const actionAnnotations = data.annotations.filter(a => 
  a.tags.includes('action')
)

console.log(`Found ${actionAnnotations.length} action annotations`)
```

### pandas (Python)

```python
import pandas as pd

# CSVを読み込む
df = pd.read_csv('annotations.csv')

# タイミングを分析
print(f"Total annotations: {len(df)}")
print(f"Average duration: {df['duration'].mean()}")

# 時間範囲でフィルタリング
early_annotations = df[df['timestamp'] < 60]
```

## ユースケース

### 機械学習パイプライン

1. PremiAnnoからアノテーションを**エクスポート**
2. パイプラインでJSONデータを**解析**
3. アノテーションされたタイムスタンプでビデオフレームを**抽出**
4. ラベル付きデータを使用してモデルを**トレーニング**

### ビデオ分析

1. 分析のためにCSVに**エクスポート**
2. スプレッドシートまたはデータベースに**インポート**
3. アノテーションパターンを**可視化**
4. レポートと統計を**生成**

### カスタムツール

1. JSONエクスポートを**解析**
2. ユースケースに合わせてデータを**変換**
3. 既存のワークフローと**統合**
4. 処理パイプラインを**自動化**

## 将来のAPI計画

::: warning 作業中
以下の機能は将来のリリースで計画されています：
:::

- リアルタイムアノテーションアクセスのためのREST API
- ライブアップデート用のWebSocketサポート
- カスタム拡張機能用のプラグインSDK
- 一括インポート機能

## 貢献

追加のAPI機能が必要な場合や提案がある場合：

- [Issueを開く](https://github.com/rmuraix/premianno/issues)
- [プルリクエストを提出](https://github.com/rmuraix/premianno/pulls)
- [開発ガイド](/ja/guide/development)を確認
